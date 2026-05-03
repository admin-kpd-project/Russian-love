import { motion, AnimatePresence } from "motion/react";
import { X, Send, Image, Smile, Heart, Mic, Video, Gift } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

import { useAuth } from "../contexts/AuthContext";
import { getMessages, sendTextMessage, sendMediaMessage } from "../services/messagesService";
import type { MessageResponse } from "../services/messagesService";
import { markConversationRead } from "../services/conversationsService";
import { uploadFile } from "../services/uploadService";
import { createChatWebSocket } from "../services/socialService";
import { getPaymentsStatus, initTbankPayment } from "../services/paymentsService";
import { getUserById } from "../services/usersService";
import { ModalShell } from "./ui/modal-shell";
import { formatPeerPresenceLabel } from "../utils/presenceLabel";
import { normalizeAssetUrlForHttps } from "../utils/mediaUrl";

interface ChatModalProps {
  onClose: () => void;
  /** Required for server-side chat. */
  conversationId?: string;
  userName: string;
  userAvatar: string;
  prefilledMessage?: string;
  /** Для статуса «онлайн» / «был в сети» и опроса профиля. */
  peerUserId?: string;
  peerLastSeenAt?: string | null;
}

interface Message {
  id: string;
  text?: string;
  type: "text" | "image" | "voice" | "video";
  sender: "me" | "other";
  /** Сырой id отправителя с API — для корректной стороны при WS (там раньше всем приходило sender: other). */
  senderUserId?: string;
  time: string;
  mediaUrl?: string;
  duration?: string;
}

function mapApiMessage(m: MessageResponse, selfUserId: string | null | undefined): Message {
  let mt: Message["type"] = "text";
  if (m.type === "image" || m.type === "voice" || m.type === "video") mt = m.type;
  else if (m.mediaUrl) mt = "image";
  const sender: "me" | "other" =
    selfUserId && m.senderUserId
      ? m.senderUserId === selfUserId
        ? "me"
        : "other"
      : m.sender;
  return {
    id: m.id,
    text: m.text ?? undefined,
    type: mt,
    sender,
    senderUserId: m.senderUserId,
    time: m.time,
    mediaUrl: m.mediaUrl ?? undefined,
    duration: m.duration ?? undefined,
  };
}

/** Одно сообщение по id: обновляет существующую строку или добавляет в конец. */
function upsertMessageById(prev: Message[], incoming: Message): Message[] {
  const i = prev.findIndex((x) => x.id === incoming.id);
  if (i === -1) return [...prev, incoming];
  const next = [...prev];
  next[i] = incoming;
  return next;
}

/**
 * getUserMedia: на http:// (кроме localhost) в Chrome `navigator.mediaDevices` часто `undefined` —
 * не обращаемся к getUserMedia без проверки; пробуем legacy-API, иначе явная ошибка.
 */
function requestMediaStream(constraints: MediaStreamConstraints): Promise<MediaStream> {
  if (typeof navigator === "undefined") {
    return Promise.reject(new Error("Нет API браузера"));
  }
  const md = navigator.mediaDevices;
  if (md?.getUserMedia) {
    return md.getUserMedia(constraints);
  }
  type LegacyNav = Navigator & {
    getUserMedia?: (c: MediaStreamConstraints, ok: (s: MediaStream) => void, err: (e: Error) => void) => void;
    webkitGetUserMedia?: (c: MediaStreamConstraints, ok: (s: MediaStream) => void, err: (e: Error) => void) => void;
    mozGetUserMedia?: (c: MediaStreamConstraints, ok: (s: MediaStream) => void, err: (e: Error) => void) => void;
  };
  const n = navigator as LegacyNav;
  const legacy = n.getUserMedia ?? n.webkitGetUserMedia ?? n.mozGetUserMedia;
  if (typeof legacy === "function") {
    return new Promise<MediaStream>((resolve, reject) => {
      legacy.call(n, constraints, resolve, reject);
    });
  }
  return Promise.reject(
    new Error(
      "Микрофон/камера: в Chrome и других браузерах на HTTP (не localhost) доступ к getUserMedia отключён. Откройте сайт по HTTPS или пользуйтесь приложением."
    )
  );
}

function isInsecureForMediaDevices(): boolean {
  if (typeof window === "undefined") return true;
  if (window.isSecureContext) return false;
  const h = window.location.hostname;
  return h !== "localhost" && h !== "127.0.0.1";
}

export function ChatModal({
  onClose,
  conversationId,
  userName,
  userAvatar,
  prefilledMessage,
  peerUserId,
  peerLastSeenAt: peerLastSeenAtInitial,
}: ChatModalProps) {
  const { user } = useAuth();
  const selfUserId = user?.id ?? null;
  const selfUserIdRef = useRef<string | null>(null);
  selfUserIdRef.current = selfUserId;
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState(prefilledMessage || "");
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [recorderError, setRecorderError] = useState<string | null>(null);
  const [paymentsEnabled, setPaymentsEnabled] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordChunksRef = useRef<Blob[]>([]);
  const recordKindRef = useRef<"voice" | "video" | null>(null);
  const durationSecRef = useRef(0);
  const recordCancelledRef = useRef(false);
  const [peerLastSeenAt, setPeerLastSeenAt] = useState<string | null | undefined>(peerLastSeenAtInitial);

  useEffect(() => {
    setPeerLastSeenAt(peerLastSeenAtInitial);
  }, [peerLastSeenAtInitial, peerUserId]);

  useEffect(() => {
    if (!peerUserId) return;
    let cancelled = false;
    const poll = async () => {
      const res = await getUserById(peerUserId);
      if (cancelled || res.error || !res.data) return;
      const iso = res.data.lastSeenAt ?? null;
      setPeerLastSeenAt(iso);
    };
    void poll();
    if (typeof window === "undefined") return () => { cancelled = true; };
    const id = window.setInterval(() => void poll(), 25_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [peerUserId]);

  useEffect(() => {
    if (prefilledMessage) setInputText((prev) => (prev.trim() ? prev : prefilledMessage));
  }, [prefilledMessage]);

  const toUiMessage = useCallback((m: MessageResponse) => mapApiMessage(m, selfUserId), [selfUserId]);

  useEffect(() => {
    void (async () => {
      const r = await getPaymentsStatus();
      if (r.data) setPaymentsEnabled(r.data.paymentsEnabled);
      else setPaymentsEnabled(false);
    })();
  }, []);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setMessagesLoading(false);
      setMessagesError("Нет идентификатора беседы");
      return;
    }
    let cancelled = false;
    (async () => {
      setMessagesLoading(true);
      setMessagesError(null);
      const res = await getMessages(conversationId);
      if (cancelled) return;
      setMessagesLoading(false);
      if (res.error) {
        setMessagesError(res.error);
        setMessages([]);
        return;
      }
      setMessages((res.data ?? []).map((row) => mapApiMessage(row, selfUserIdRef.current)));
    })();
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  /** Когда профиль догрузился после истории — пересчитать сторону по senderUserId. */
  useEffect(() => {
    if (!selfUserId) return;
    setMessages((prev) =>
      prev.map((m) => {
        if (!m.senderUserId) return m;
        const sender: "me" | "other" = m.senderUserId === selfUserId ? "me" : "other";
        return m.sender === sender ? m : { ...m, sender };
      })
    );
  }, [selfUserId]);

  useEffect(() => {
    if (!conversationId) return;
    void (async () => {
      const r = await markConversationRead(conversationId);
      if (r.error) {
        console.warn("markConversationRead", r.error);
      }
    })();
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    const ws = createChatWebSocket(conversationId);
    wsRef.current = ws;
    if (!ws) return;
    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed?.event === "message" && parsed?.message) {
          const incoming = mapApiMessage(parsed.message as MessageResponse, selfUserIdRef.current);
          setMessages((prev) => upsertMessageById(prev, incoming));
        }
      } catch (err) {
        console.warn("WS parse error", err);
      }
    };
    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [conversationId]);

  const gifts = [
    { id: 1, name: "Роза", emoji: "🌹", price: 50 },
    { id: 2, name: "Букет роз", emoji: "💐", price: 150 },
    { id: 3, name: "Мишка", emoji: "🧸", price: 200 },
    { id: 4, name: "Сердце", emoji: "❤️", price: 100 },
    { id: 5, name: "Кольцо", emoji: "💍", price: 500 },
    { id: 6, name: "Шампанское", emoji: "🍾", price: 300 },
    { id: 7, name: "Торт", emoji: "🎂", price: 250 },
    { id: 8, name: "Бриллиант", emoji: "💎", price: 1000 },
  ];

  const emojis = [
    "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂",
    "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰",
    "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜",
    "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏",
    "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍",
    "💋", "💕", "💞", "💓", "💗", "💖", "💘", "💝",
    "👍", "👎", "👏", "🙌", "👐", "🤝", "🙏", "✨",
    "🔥", "💯", "⭐", "🌟", "✅", "🎉", "🎊", "🎁",
  ];

  const handleEmojiSelect = (emoji: string) => {
    setInputText(inputText + emoji);
    setShowEmojiPicker(false);
  };

  const handleSendGift = (gift: typeof gifts[0]) => {
    void (async () => {
      const res = await initTbankPayment("gift", gift.price * 100, { giftId: gift.id, giftName: gift.name });
      if (res.error || !res.data) {
        alert(res.error || "Не удалось создать платеж");
        return;
      }
      setShowGiftModal(false);
      window.open(res.data.paymentUrl, "_blank", "noopener,noreferrer");
    })();
  };

  const sendQuick = async (text: string) => {
    if (!conversationId) return;
    setSending(true);
    const res = await sendTextMessage(conversationId, text);
    setSending(false);
    if (res.error) alert(res.error);
    else if (res.data) setMessages((prev) => upsertMessageById(prev, toUiMessage(res.data)));
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    if (!conversationId) return;
    setSending(true);
    const text = inputText.trim();
    setInputText("");
    const res = await sendTextMessage(conversationId, text);
    setSending(false);
    if (res.error) {
      setInputText(text);
      alert(res.error);
      return;
    }
    if (res.data) setMessages((prev) => upsertMessageById(prev, toUiMessage(res.data)));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!conversationId) return;
    setSending(true);
    const upload = await uploadFile(file);
    if (!upload.url) {
      setSending(false);
      alert(upload.error || "Не удалось загрузить файл");
      return;
    }
    const res = await sendMediaMessage(conversationId, upload.url, "image");
    setSending(false);
    setShowAttachMenu(false);
    if (res.error) {
      alert(res.error);
      return;
    }
    if (res.data) setMessages((prev) => upsertMessageById(prev, toUiMessage(res.data)));
  };

  const cleanupRecording = () => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    mediaRecorderRef.current = null;
    recordChunksRef.current = [];
    recordKindRef.current = null;
    durationSecRef.current = 0;
  };

  const runUploadRecorded = async (opts: {
    kind: "voice" | "video";
    chunks: Blob[];
    mime: string;
    totalSec: number;
  }) => {
    const { kind, chunks, mime, totalSec } = opts;
    if (!conversationId || chunks.length === 0) return;
    const kindMime =
      kind === "voice"
        ? mime && mime.startsWith("audio/")
          ? mime
          : "audio/webm"
        : mime && mime.startsWith("video/")
          ? mime
          : "video/webm";
    const blob = new Blob(chunks, { type: kindMime });
    if (blob.size < 32) {
      setRecorderError("Слишком короткая запись");
      return;
    }
    const ext = kind === "voice" ? (kindMime.includes("webm") ? "webm" : "ogg") : "webm";
    const file = new File([blob], `record.${ext}`, { type: kindMime });
    setSending(true);
    setRecorderError(null);
    const upload = await uploadFile(file);
    if (!upload.url) {
      setSending(false);
      setRecorderError(upload.error || "Не удалось загрузить запись");
      return;
    }
    const res = await sendMediaMessage(
      conversationId,
      upload.url,
      kind === "voice" ? "voice" : "video",
      totalSec
    );
    setSending(false);
    if (res.error) {
      setRecorderError(res.error);
      return;
    }
    if (res.data) setMessages((prev) => upsertMessageById(prev, toUiMessage(res.data)));
  };

  const startRecording = async (type: "voice" | "video") => {
    if (!conversationId) return;
    setShowAttachMenu(false);
    setRecorderError(null);
    if (typeof window === "undefined" || !window.MediaRecorder) {
      setRecorderError("Запись в этом браузере не поддерживается");
      return;
    }
    if (isInsecureForMediaDevices()) {
      setRecorderError(
        "Голос и видео: браузер разрешает запись с микрофона/камеры только на HTTPS. Откройте сайт по https://… или снимите голос в мобильном приложении."
      );
      return;
    }
    try {
      const stream = await requestMediaStream(
        type === "voice" ? { audio: true } : { audio: true, video: { facingMode: "user" } }
      );
      mediaStreamRef.current = stream;
      const o: MediaRecorderOptions = {};
      if (type === "voice") {
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) o.mimeType = "audio/webm;codecs=opus";
        else if (MediaRecorder.isTypeSupported("audio/webm")) o.mimeType = "audio/webm";
      } else {
        if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")) o.mimeType = "video/webm;codecs=vp8,opus";
        else if (MediaRecorder.isTypeSupported("video/webm")) o.mimeType = "video/webm";
      }
      const mr = new MediaRecorder(stream, Object.keys(o).length ? o : undefined);
      mediaRecorderRef.current = mr;
      recordChunksRef.current = [];
      recordKindRef.current = type;
      recordCancelledRef.current = false;
      durationSecRef.current = 0;
      mr.ondataavailable = (e) => {
        if (e.data.size) recordChunksRef.current.push(e.data);
      };
      const mrLocal = mr;
      mr.addEventListener(
        "stop",
        () => {
          void (async () => {
            if (recordCancelledRef.current) {
              recordCancelledRef.current = false;
              cleanupRecording();
              setIsRecordingVoice(false);
              setIsRecordingVideo(false);
              setRecordingDuration(0);
              return;
            }
            const k = recordKindRef.current;
            const chunks = [...recordChunksRef.current];
            const totalSec = durationSecRef.current;
            const mime = mrLocal.mimeType;
            if (recordingIntervalRef.current) {
              clearInterval(recordingIntervalRef.current);
              recordingIntervalRef.current = null;
            }
            if (mediaStreamRef.current) {
              mediaStreamRef.current.getTracks().forEach((t) => t.stop());
              mediaStreamRef.current = null;
            }
            recordKindRef.current = null;
            recordChunksRef.current = [];
            durationSecRef.current = 0;
            setIsRecordingVoice(false);
            setIsRecordingVideo(false);
            setRecordingDuration(0);
            mediaRecorderRef.current = null;
            if (k) await runUploadRecorded({ kind: k, chunks, mime, totalSec: totalSec });
          })();
        },
        { once: true }
      );
      mr.start(200);
      setIsRecordingVoice(type === "voice");
      setIsRecordingVideo(type === "video");
      setRecordingDuration(0);
      durationSecRef.current = 0;
      recordingIntervalRef.current = setInterval(() => {
        durationSecRef.current += 1;
        setRecordingDuration((d) => d + 1);
      }, 1000);
    } catch (err) {
      setRecorderError(err instanceof Error ? err.message : "Нет доступа к микрофону или камере");
    }
  };

  const stopRecordingSend = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.requestData();
        mediaRecorderRef.current.stop();
      } catch {
        /* empty */
      }
    } else {
      cleanupRecording();
      setIsRecordingVoice(false);
      setIsRecordingVideo(false);
      setRecordingDuration(0);
    }
  };

  const cancelRecording = () => {
    recordCancelledRef.current = true;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        /* empty */
      }
    } else {
      cleanupRecording();
      setIsRecordingVoice(false);
      setIsRecordingVideo(false);
      setRecordingDuration(0);
    }
  };

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <ModalShell onClose={onClose} ariaLabel={`Чат с ${userName}`} hideCloseButton>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-amber-500 px-4 sm:px-5 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={normalizeAssetUrlForHttps(userAvatar)}
              alt={userName}
              className="size-10 rounded-full object-cover border-2 border-white flex-shrink-0"
            />
            <div className="min-w-0">
              <h2 className="font-bold text-white truncate">{userName}</h2>
              <p className="text-xs text-white/80">{formatPeerPresenceLabel(peerLastSeenAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={onClose}
              aria-label="Закрыть"
              className="w-9 h-9 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-br from-red-50/30 to-amber-50/30">
          {messagesLoading && (
            <p className="text-center text-sm text-gray-500 py-4">Загрузка сообщений…</p>
          )}
          {messagesError && !messagesLoading && (
            <p className="text-center text-sm text-red-600 py-4">{messagesError}</p>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "me" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-2xl ${
                  message.type === "image" ? "p-1" : "px-4 py-2"
                } ${
                  message.sender === "me"
                    ? "bg-gradient-to-r from-red-600 to-amber-500 text-white"
                    : "bg-white border border-gray-200 text-gray-800"
                }`}
              >
                {message.type === "text" && (
                  <>
                    <p className="text-sm leading-relaxed break-words">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === "me" ? "text-white/70" : "text-gray-400"
                      }`}
                    >
                      {message.time}
                    </p>
                  </>
                )}

                {message.type === "image" && (
                  <div>
                    <img
                      src={normalizeAssetUrlForHttps(message.mediaUrl)}
                      alt="Shared"
                      className="rounded-xl max-w-full h-auto"
                    />
                    <p
                      className={`text-xs mt-1 px-3 pb-2 ${
                        message.sender === "me" ? "text-white/70" : "text-gray-400"
                      }`}
                    >
                      {message.time}
                    </p>
                  </div>
                )}

                {message.type === "voice" && message.mediaUrl && (
                  <div className="min-w-[200px] max-w-full">
                    <audio
                      src={normalizeAssetUrlForHttps(message.mediaUrl)}
                      controls
                      className="w-full max-w-[280px] h-9 [color-scheme:light]"
                      preload="metadata"
                    />
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === "me" ? "text-white/80" : "text-gray-400"
                      }`}
                    >
                      {message.time}
                      {message.duration ? ` · ${message.duration}` : ""}
                    </p>
                  </div>
                )}

                {message.type === "video" && message.mediaUrl && (
                  <div>
                    <video
                      src={normalizeAssetUrlForHttps(message.mediaUrl)}
                      controls
                      className="rounded-xl max-w-full max-h-64 w-full"
                      playsInline
                    />
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === "me" ? "text-white/80" : "text-gray-400"
                      }`}
                    >
                      {message.time}
                      {message.duration ? ` · ${message.duration}` : ""}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Recording Indicator */}
        {(isRecordingVoice || isRecordingVideo) && (
          <div className="px-4 py-3 bg-red-50 border-t border-red-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm text-gray-700">
                  {isRecordingVoice ? "Запись голоса" : "Запись видео"}
                </span>
                <span className="text-sm font-mono text-gray-600">
                  {Math.floor(recordingDuration / 60)}:{String(recordingDuration % 60).padStart(2, "0")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={cancelRecording}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={stopRecordingSend}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-amber-500 text-white rounded-full text-sm font-medium hover:shadow-md transition-shadow"
                >
                  Отправить
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        {!isRecordingVoice && !isRecordingVideo && (
          <div className="p-4 bg-white border-t border-gray-100">
            {recorderError && (
              <p className="text-red-600 text-xs mb-2" role="alert">
                {recorderError}
              </p>
            )}
            {/* Top Row: Input Field + Send Button */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2">
                <textarea
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    setShowAttachMenu(false);
                    setShowEmojiPicker(false);
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Напишите сообщение..."
                  rows={2}
                  className="w-full bg-transparent outline-none text-base text-gray-800 placeholder-gray-400 resize-none"
                  disabled={sending || messagesLoading}
                  readOnly={false}
                  autoComplete="off"
                  spellCheck="true"
                />
              </div>

              {/* Send Button or Voice Recording Button */}
              {inputText.trim() ? (
                <button
                  type="button"
                  onClick={() => void handleSend()}
                  disabled={sending || messagesLoading}
                  className="p-3 rounded-full transition-all bg-gradient-to-r from-red-600 to-amber-500 text-white hover:shadow-lg flex-shrink-0 disabled:opacity-50"
                >
                  <Send className="size-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void startRecording("voice")}
                  className="p-3 rounded-full transition-all bg-gradient-to-r from-red-600 to-amber-500 text-white hover:shadow-lg flex-shrink-0"
                >
                  <Mic className="size-5" />
                </button>
              )}
            </div>

            {/* Bottom Row: Quick Reactions + Action Icons */}
            <div className="flex items-center justify-between gap-2">
              {/* Quick Reactions - Left */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    void sendQuick("👋 Привет");
                  }}
                  className="px-3 py-1 bg-gradient-to-r from-red-100 to-amber-100 text-red-600 rounded-full text-xs hover:shadow-sm transition-shadow"
                >
                  👋 Привет
                </button>
                <button
                  onClick={() => {
                    void sendQuick("❤️ Нравится");
                  }}
                  className="px-3 py-1 bg-gradient-to-r from-red-100 to-amber-100 text-red-600 rounded-full text-xs hover:shadow-sm transition-shadow flex items-center gap-1"
                >
                  <Heart className="size-3" /> Нравится
                </button>
              </div>

              {/* Action Icons - Right */}
              <div className="flex items-center gap-0">
                {/* Attach Menu Button */}
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => {
                      setShowAttachMenu(!showAttachMenu);
                      setShowEmojiPicker(false);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors px-[2px] py-[6px]"
                  >
                    <Image className="size-6" />
                  </button>

                  {/* Attach Menu */}
                  <AnimatePresence>
                    {showAttachMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="absolute bottom-12 right-0 bg-white rounded-2xl shadow-xl p-2 w-48 z-10"
                      >
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 rounded-xl transition-colors text-left"
                        >
                          <Image className="size-5 text-red-500" />
                          <span className="text-sm text-gray-700">Фото</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => void startRecording("video")}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 rounded-xl transition-colors text-left"
                        >
                          <Video className="size-5 text-red-500" />
                          <span className="text-sm text-gray-700">Видео кружочек</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => void startRecording("voice")}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 rounded-xl transition-colors text-left"
                        >
                          <Mic className="size-5 text-red-500" />
                          <span className="text-sm text-gray-700">Голосовое</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {/* Emoji Picker Button */}
                <div className="relative flex-shrink-0">
                  <button 
                    onClick={() => {
                      setShowEmojiPicker(!showEmojiPicker);
                      setShowAttachMenu(false);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors px-[2px] py-[6px]"
                  >
                    <Smile className="size-6" />
                  </button>

                  {/* Emoji Picker */}
                  <AnimatePresence>
                    {showEmojiPicker && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="absolute bottom-12 right-0 bg-white rounded-2xl shadow-xl p-3 w-64 z-10"
                      >
                        <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto">
                          {emojis.map((emoji, index) => (
                            <button
                              key={index}
                              onClick={() => handleEmojiSelect(emoji)}
                              className="text-2xl hover:bg-red-50 rounded-lg p-1 transition-colors"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Gift Button */}
                <button
                  type="button"
                  title={
                    paymentsEnabled === false
                      ? "Подарки и оплата отключены на сервере (нет T-Bank)"
                      : "Подарки"
                  }
                  onClick={() => {
                    if (paymentsEnabled === false) return;
                    setShowGiftModal(true);
                    setShowAttachMenu(false);
                    setShowEmojiPicker(false);
                  }}
                  disabled={paymentsEnabled === false}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 p-[2px] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-gray-400"
                >
                  <Gift className="size-6" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Gift Modal */}
      <AnimatePresence>
        {showGiftModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowGiftModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowGiftModal(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              <div className="text-center mb-4">
                <div className="bg-red-100 rounded-full p-4 w-fit mx-auto mb-4">
                  <Gift className="size-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Подарки</h3>
                <p className="text-sm text-gray-600">
                  Выберите подарок для {userName}:
                </p>
                {paymentsEnabled === false && (
                  <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2 mt-3 text-left">
                    Онлайн-оплата сейчас недоступна: на сервере не настроен платёжный шлюз. Подарки отключены до
                    подключения T-Bank.
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {gifts.map((gift) => (
                  <button
                    key={gift.id}
                    type="button"
                    disabled={paymentsEnabled === false}
                    onClick={() => handleSendGift(gift)}
                    className="flex flex-col items-center px-4 py-3 bg-gradient-to-r from-red-100 to-amber-100 text-red-600 rounded-2xl font-medium hover:shadow-sm transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-2xl">{gift.emoji}</span>
                    <span className="text-sm">{gift.name}</span>
                    <span className="text-xs text-gray-500">({gift.price} ₽)</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalShell>
  );
}