import { motion, AnimatePresence } from "motion/react";
import { X, Send, Image, Smile, Heart, Mic, Video, MoreVertical, Flag, Trash2, Play, Pause, Gift, Eraser } from "lucide-react";
import { useState, useRef, useEffect } from "react";

import { getMessages, sendTextMessage, sendMediaMessage } from "../services/messagesService";
import { uploadFile } from "../services/uploadService";
import { createChatWebSocket } from "../services/socialService";
import { initTbankPayment } from "../services/paymentsService";

interface ChatModalProps {
  onClose: () => void;
  /** Required for server-side chat. */
  conversationId?: string;
  userName: string;
  userAvatar: string;
  prefilledMessage?: string;
}

interface Message {
  id: string;
  text?: string;
  type: "text" | "image" | "voice" | "video";
  sender: "me" | "other";
  time: string;
  mediaUrl?: string;
  duration?: string;
}

function mapApiMessage(m: import("../services/messagesService").MessageResponse): Message {
  let mt: Message["type"] = "text";
  if (m.type === "image" || m.type === "voice" || m.type === "video") mt = m.type;
  else if (m.mediaUrl) mt = "image";
  return {
    id: m.id,
    text: m.text ?? undefined,
    type: mt,
    sender: m.sender,
    time: m.time,
    mediaUrl: m.mediaUrl ?? undefined,
    duration: m.duration ?? undefined,
  };
}

export function ChatModal({
  onClose,
  conversationId,
  userName,
  userAvatar,
  prefilledMessage,
}: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState(prefilledMessage || "");
  const [showMenu, setShowMenu] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showClearHistoryDialog, setShowClearHistoryDialog] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [voiceProgress, setVoiceProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (prefilledMessage) setInputText((prev) => (prev.trim() ? prev : prefilledMessage));
  }, [prefilledMessage]);

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
      setMessages((res.data ?? []).map(mapApiMessage));
    })();
    return () => {
      cancelled = true;
    };
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
          const incoming = mapApiMessage(parsed.message);
          setMessages((prev) => {
            if (prev.some((m) => m.id === incoming.id)) return prev;
            return [...prev, incoming];
          });
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
    else if (res.data) setMessages((prev) => [...prev, mapApiMessage(res.data)]);
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
    if (res.data) setMessages((prev) => [...prev, mapApiMessage(res.data)]);
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
    if (res.data) setMessages((prev) => [...prev, mapApiMessage(res.data)]);
  };

  const startRecording = (type: "voice" | "video") => {
    alert("Голосовые и видео сообщения будут добавлены позже.");
    setShowAttachMenu(false);
    return;
  };

  const stopRecording = (type: "voice" | "video") => {
    void type;
    setIsRecordingVoice(false);
    setIsRecordingVideo(false);
    setRecordingDuration(0);
  };

  const cancelRecording = () => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    setIsRecordingVoice(false);
    setIsRecordingVideo(false);
    setRecordingDuration(0);
  };

  // Handle voice message playback
  const handleVoicePlayback = (messageId: string, durationString: string = "0:15") => {
    // Parse duration string (e.g., "0:15" -> 15 seconds)
    const [minutes, seconds] = durationString.split(":").map(Number);
    const totalSeconds = minutes * 60 + seconds;

    if (playingVoiceId === messageId) {
      // Stop playback
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
      }
      setPlayingVoiceId(null);
      setVoiceProgress((prev) => ({ ...prev, [messageId]: 0 }));
    } else {
      // Start playback
      setPlayingVoiceId(messageId);
      setVoiceProgress((prev) => ({ ...prev, [messageId]: 0 }));

      let elapsed = 0;
      audioIntervalRef.current = setInterval(() => {
        elapsed += 0.1;
        const progress = Math.min((elapsed / totalSeconds) * 100, 100);
        setVoiceProgress((prev) => ({ ...prev, [messageId]: progress }));

        if (progress >= 100) {
          if (audioIntervalRef.current) {
            clearInterval(audioIntervalRef.current);
          }
          setPlayingVoiceId(null);
          setTimeout(() => {
            setVoiceProgress((prev) => ({ ...prev, [messageId]: 0 }));
          }, 500);
        }
      }, 100);
    }
  };

  const handleReport = () => {
    setShowReportDialog(false);
    setShowMenu(false);
    alert("Жалоба отправлена. Мы рассмотрим её в ближайшее время.");
  };

  const handleDeleteChat = () => {
    setShowDeleteDialog(false);
    setShowMenu(false);
    alert("Чат удалён");
    onClose();
  };

  const handleClearHistory = () => {
    setShowClearHistoryDialog(false);
    setShowMenu(false);
    alert("История хранится на сервере; очистка из приложения пока не реализована.");
  };
  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
      }
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-white rounded-3xl max-w-md w-full h-[600px] overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-amber-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={userAvatar}
              alt={userName}
              className="size-10 rounded-full object-cover border-2 border-white"
            />
            <div>
              <h2 className="font-bold text-white">{userName}</h2>
              <p className="text-xs text-white/80">онлайн</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Menu Button */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
              >
                <MoreVertical className="w-6 h-6 text-white" />
              </button>
              
              {/* Dropdown Menu */}
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl overflow-hidden z-10"
                  >
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowReportDialog(true);
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 transition-colors text-left"
                    >
                      <Flag className="size-4 text-red-500" />
                      <span className="text-sm text-gray-700">Пожаловаться</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowDeleteDialog(true);
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 transition-colors text-left"
                    >
                      <Trash2 className="size-4 text-red-500" />
                      <span className="text-sm text-gray-700">Удалить чат</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowClearHistoryDialog(true);
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 transition-colors text-left"
                    >
                      <Eraser className="size-4 text-red-500" />
                      <span className="text-sm text-gray-700">Очистить историю</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
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
                    ? "bg-gradient-to-r from-red-500 to-amber-500 text-white"
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
                      src={message.mediaUrl}
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

                {message.type === "voice" && (
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <button
                      onClick={() => handleVoicePlayback(message.id, message.duration)}
                      className={`p-2 rounded-full transition-transform hover:scale-110 ${ 
                        message.sender === "me" ? "bg-white/20" : "bg-red-50"
                      }`}
                    >
                      {playingVoiceId === message.id ? (
                        <Pause className={`size-4 ${ 
                          message.sender === "me" ? "text-white" : "text-red-500"
                        }`} />
                      ) : (
                        <Play className={`size-4 ${ 
                          message.sender === "me" ? "text-white" : "text-red-500"
                        }`} />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className={`h-1 rounded-full ${ 
                        message.sender === "me" ? "bg-white/30" : "bg-gray-200"
                      }`}>
                        <div
                          className={`h-1 rounded-full transition-all duration-100 ${ 
                            message.sender === "me" ? "bg-white" : "bg-red-500"
                          }`}
                          style={{ width: `${voiceProgress[message.id] || 0}%` }}
                        />
                      </div>
                    </div>
                    <span className={`text-xs ${ 
                      message.sender === "me" ? "text-white/70" : "text-gray-500"
                    }`}>
                      {message.duration}
                    </span>
                  </div>
                )}

                {message.type === "video" && (
                  <div className="relative">
                    <div className="w-48 h-48 bg-gray-900 rounded-xl flex items-center justify-center">
                      <Play className="size-12 text-white" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                      {message.duration}
                    </div>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === "me" ? "text-white/70" : "text-gray-400"
                      }`}
                    >
                      {message.time}
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
                  onClick={() => stopRecording(isRecordingVoice ? "voice" : "video")}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-full text-sm font-medium hover:shadow-md transition-shadow"
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
                  className="p-3 rounded-full transition-all bg-gradient-to-r from-red-500 to-amber-500 text-white hover:shadow-lg flex-shrink-0 disabled:opacity-50"
                >
                  <Send className="size-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => startRecording("voice")}
                  className="p-3 rounded-full transition-all bg-gradient-to-r from-red-500 to-amber-500 text-white hover:shadow-lg flex-shrink-0"
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
                          onClick={() => startRecording("video")}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 rounded-xl transition-colors text-left"
                        >
                          <Video className="size-5 text-red-500" />
                          <span className="text-sm text-gray-700">Видео кружочек</span>
                        </button>
                        <button
                          onClick={() => startRecording("voice")}
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
                  onClick={() => {
                    setShowGiftModal(true);
                    setShowAttachMenu(false);
                    setShowEmojiPicker(false);
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 p-[2px]"
                >
                  <Gift className="size-6" />
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Report Dialog */}
      <AnimatePresence>
        {showReportDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setShowReportDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <div className="bg-red-100 rounded-full p-4 w-fit mx-auto mb-4">
                  <Flag className="size-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Пожаловаться</h3>
                <p className="text-sm text-gray-600">
                  Вы уверены, что хотите пожаловаться на этот контент?
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReportDialog(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-2xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleReport}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-2xl font-medium hover:shadow-lg transition-shadow"
                >
                  Отправить
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Dialog */}
      <AnimatePresence>
        {showDeleteDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setShowDeleteDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <div className="bg-red-100 rounded-full p-4 w-fit mx-auto mb-4">
                  <Trash2 className="size-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Удалить чат</h3>
                <p className="text-sm text-gray-600">
                  Вы уверены, что хотите удалить этот чат? Это действие нельзя отменить.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-2xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleDeleteChat}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-2xl font-medium hover:shadow-lg transition-shadow"
                >
                  Удалить
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear History Dialog */}
      <AnimatePresence>
        {showClearHistoryDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setShowClearHistoryDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <div className="bg-red-100 rounded-full p-4 w-fit mx-auto mb-4">
                  <Eraser className="size-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Очистить историю</h3>
                <p className="text-sm text-gray-600">
                  Вы уверены, что хотите очистить историю чата? Это действие нельзя отменить.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearHistoryDialog(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-2xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleClearHistory}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-2xl font-medium hover:shadow-lg transition-shadow"
                >
                  Очистить
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gift Modal */}
      <AnimatePresence>
        {showGiftModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
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
              </div>
              <div className="grid grid-cols-2 gap-3">
                {gifts.map((gift) => (
                  <button
                    key={gift.id}
                    onClick={() => handleSendGift(gift)}
                    className="flex flex-col items-center px-4 py-3 bg-gradient-to-r from-red-100 to-amber-100 text-red-600 rounded-2xl font-medium hover:shadow-sm transition-shadow"
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
    </motion.div>
  );
}