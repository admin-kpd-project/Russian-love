import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  Linking,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AudioRecorderPlayer from "react-native-audio-recorder-player";
import { launchImageLibrary } from "react-native-image-picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { X, Send, Mic, Image as ImageIcon, Smile, Gift, Video } from "lucide-react-native";

import { getMessages, sendTextMessage, sendMediaMessage, type MessageResponse } from "../api/messagesApi";
import { presignAuth, putFileToPresignedUrl, createChatWebSocket } from "../api/uploadApi";
import { getPaymentsStatus, initTbankPayment } from "../api/paymentsApi";
import { getApiBaseUrl } from "../api/apiBase";
import { resolveMediaUrl } from "../utils/mediaUrl";
import { brandGradients, tw } from "../theme/designTokens";
import type { RootStackParamList } from "../navigation/types";
import { ScalePressable } from "../components/ui/Motion";
import { MotionModal } from "../components/ui/MotionModal";

type Props = NativeStackScreenProps<RootStackParamList, "Chat">;

const audioPlayer = new AudioRecorderPlayer();

const CHAT_EMOJIS = [
  "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂",
  "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰",
  "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜",
  "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏",
  "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍",
  "💋", "💕", "💞", "💓", "💗", "💖", "💘", "💝",
  "👍", "👎", "👏", "🙌", "👐", "🤝", "🙏", "✨",
  "🔥", "💯", "⭐", "🌟", "✅", "🎉", "🎊", "🎁",
];

const CHAT_GIFTS = [
  { id: 1, name: "Роза", emoji: "🌹", price: 50 },
  { id: 2, name: "Букет роз", emoji: "💐", price: 150 },
  { id: 3, name: "Мишка", emoji: "🧸", price: 200 },
  { id: 4, name: "Сердце", emoji: "❤️", price: 100 },
  { id: 5, name: "Кольцо", emoji: "💍", price: 500 },
  { id: 6, name: "Шампанское", emoji: "🍾", price: 300 },
  { id: 7, name: "Торт", emoji: "🎂", price: 250 },
  { id: 8, name: "Бриллиант", emoji: "💎", price: 1000 },
] as const;

function audioContentTypeForPath(p: string): string {
  const low = p.toLowerCase();
  if (low.endsWith(".m4a")) return "audio/m4a";
  if (low.endsWith(".aac")) return "audio/aac";
  if (low.endsWith(".mp3")) return "audio/mpeg";
  if (low.endsWith(".mp4") || low.endsWith(".3gp")) return "audio/mp4";
  return "audio/mpeg";
}

function dedupeMessagesById(msgs: MessageResponse[]): MessageResponse[] {
  const seen = new Set<string>();
  return msgs.filter((m) => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
}

export function ChatScreen({ route, navigation }: Props) {
  const { conversationId, title, avatarUrl, prefilledMessage } = route.params;
  const insets = useSafeAreaInsets();
  const [resolvedAvatar, setResolvedAvatar] = useState<string | undefined>(avatarUrl);
  const [rows, setRows] = useState<MessageResponse[]>([]);
  const [text, setText] = useState(prefilledMessage ?? "");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const recordPathRef = useRef<string | null>(null);
  const durSecRef = useRef(0);
  const wsRef = useRef<WebSocket | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [paymentsEnabled, setPaymentsEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    void (async () => {
      const r = await getPaymentsStatus();
      setPaymentsEnabled(r.data?.paymentsEnabled ?? false);
    })();
  }, []);

  useEffect(() => {
    if (!avatarUrl) {
      setResolvedAvatar(undefined);
      return;
    }
    if (/^https?:\/\//i.test(avatarUrl)) {
      setResolvedAvatar(avatarUrl);
      return;
    }
    void (async () => {
      const b = await getApiBaseUrl();
      if (b) {
        setResolvedAvatar(resolveMediaUrl(avatarUrl, b) || avatarUrl);
        return;
      }
      setResolvedAvatar(avatarUrl);
    })();
  }, [avatarUrl]);

  useEffect(() => {
    if (prefilledMessage) setText((prev) => (prev.trim() ? prev : prefilledMessage));
  }, [prefilledMessage]);

  const load = useCallback(async () => {
    setErr(null);
    setLoading(true);
    const r = await getMessages(conversationId, 1, 100);
    setLoading(false);
    if (r.error) {
      setErr(r.error);
      return;
    }
    setRows(dedupeMessagesById((r.data ?? []).slice().reverse()));
  }, [conversationId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void (async () => {
      const ws = await createChatWebSocket(conversationId);
      if (!ws) return;
      wsRef.current = ws;
      ws.onmessage = (ev) => {
        try {
          const p = JSON.parse(String(ev.data)) as { event?: string; message?: MessageResponse };
          if (p?.event === "message" && p?.message) {
            const m = p.message;
            setRows((prev) => (prev.some((x) => x.id === m.id) ? prev : [m, ...prev]));
          }
        } catch {
          /* empty */
        }
      };
    })();
    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [conversationId]);

  const sendQuick = async (msg: string) => {
    setSending(true);
    const r = await sendTextMessage(conversationId, msg);
    setSending(false);
    if (r.error || !r.data) {
      setErr(r.error || "Ошибка отправки");
      return;
    }
    setRows((prev) => [r.data!, ...prev]);
  };

  const sendText = async () => {
    const t = text.trim();
    if (!t) return;
    setText("");
    setSending(true);
    const r = await sendTextMessage(conversationId, t);
    setSending(false);
    if (r.error || !r.data) {
      setText(t);
      setErr(r.error || "Ошибка отправки");
      return;
    }
    setRows((prev) => [r.data!, ...prev]);
  };

  const sendImage = () => {
    setShowAttachMenu(false);
    void launchImageLibrary({ mediaType: "photo" }, (res) => {
      void (async () => {
        const a = res.assets?.[0];
        if (!a?.uri) return;
        setSending(true);
        const ct = a.type || "image/jpeg";
        const size = a.fileSize ?? 800_000;
        const p = await presignAuth(ct, size);
        if (p.error || !p.data) {
          setSending(false);
          setErr(p.error ?? "presign");
          return;
        }
        const up = await putFileToPresignedUrl(p.data.uploadUrl, a.uri, ct);
        if (!up.ok) {
          setSending(false);
          setErr(up.error ?? "upload");
          return;
        }
        const sm = await sendMediaMessage(conversationId, p.data.fileUrl, "image");
        setSending(false);
        if (sm.data) setRows((prev) => [sm.data!, ...prev]);
      })();
    });
  };

  const ensureMic = async () => {
    if (Platform.OS === "android") {
      const g = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      return g === "granted";
    }
    return true;
  };

  const sendGiftPayment = async (gift: (typeof CHAT_GIFTS)[number]) => {
    const r = await initTbankPayment("gift", gift.price * 100, { giftId: gift.id, giftName: gift.name });
    if (r.error || !r.data?.paymentUrl) {
      Alert.alert("Оплата", r.error || "Не удалось создать платёж");
      return;
    }
    setShowGiftModal(false);
    await Linking.openURL(r.data.paymentUrl);
  };

  const startVoice = async () => {
    setShowAttachMenu(false);
    const ok = await ensureMic();
    if (!ok) {
      setErr("Нет разрешения на микрофон");
      return;
    }
    setErr(null);
    const path = await audioPlayer.startRecorder();
    recordPathRef.current = path;
    durSecRef.current = 0;
    audioPlayer.addRecordBackListener((e) => {
      const sec = Math.floor((e.currentPosition ?? 0) / 1000);
      durSecRef.current = sec;
    });
    setRecording(true);
  };

  const stopVoice = async (cancel: boolean) => {
    if (!recording) return;
    setRecording(false);
    const path = await audioPlayer.stopRecorder();
    audioPlayer.removeRecordBackListener();
    const local = recordPathRef.current || path;
    recordPathRef.current = null;
    if (cancel || !local) return;
    setSending(true);
    const fileUri = local.startsWith("file://") ? local : `file://${local}`;
    const head = await fetch(fileUri);
    const blob = await head.blob();
    const size = blob.size || 50_000;
    const ct = audioContentTypeForPath(fileUri);
    const ps = await presignAuth(ct, size);
    if (ps.error || !ps.data) {
      setSending(false);
      setErr(ps.error ?? "presign voice");
      return;
    }
    const up = await putFileToPresignedUrl(ps.data.uploadUrl, fileUri, ct);
    if (!up.ok) {
      setSending(false);
      setErr(up.error ?? "upload");
      return;
    }
    const d = Math.max(1, durSecRef.current);
    const sm = await sendMediaMessage(conversationId, ps.data.fileUrl, "voice", d);
    setSending(false);
    if (sm.data) setRows((prev) => [sm.data!, ...prev]);
  };

  const hasText = text.trim().length > 0;

  return (
    <View style={styles.shell}>
      <LinearGradient colors={[...brandGradients.primary]} style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <View style={styles.topRow}>
          <View style={styles.peer}>
            {resolvedAvatar ? (
              <Image source={{ uri: resolvedAvatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPh]} />
            )}
            <View>
              <Text style={styles.peerName}>{title || "Чат"}</Text>
              <Text style={styles.peerSub}>онлайн</Text>
            </View>
          </View>
          <ScalePressable onPress={() => navigation.goBack()} style={styles.closeHit}>
            <X size={26} color="#fff" />
          </ScalePressable>
        </View>
      </LinearGradient>

      {err ? <Text style={styles.errB}>{err}</Text> : null}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
      >
        {loading ? (
          <ActivityIndicator style={{ marginTop: 24 }} color="#78716c" />
        ) : (
          <FlatList
            style={styles.list}
            contentContainerStyle={styles.listContent}
            inverted
            data={rows}
            keyExtractor={(m, index) => `${m.id}__${index}`}
            renderItem={({ item: m }) => {
              const mine = m.sender === "me";
              const bubble = (
                <View style={[styles.bubIn, m.type === "image" ? styles.bubImg : null]}>
                  {m.text ? (
                    <Text style={[styles.t, mine && styles.tMine]}>{m.text}</Text>
                  ) : null}
                  {m.type === "image" && m.mediaUrl ? (
                    <Image source={{ uri: m.mediaUrl }} style={styles.img} resizeMode="cover" />
                  ) : null}
                  {m.type === "voice" && m.mediaUrl ? (
                    <ScalePressable onPress={() => void Linking.openURL(m.mediaUrl!)} style={styles.voiceL}>
                      <Text style={[styles.voiceLtxt, mine && styles.tMine]}>▶ {m.duration || "аудио"}</Text>
                    </ScalePressable>
                  ) : null}
                  {m.type === "video" && m.mediaUrl ? (
                    <Text style={[styles.t, mine && styles.tMine]}>Видео: откройте ссылку</Text>
                  ) : null}
                  <Text style={[styles.time, mine ? styles.timeMine : styles.timeThem]}>{m.time}</Text>
                </View>
              );
              return (
                <View style={[styles.row, mine ? styles.rowMe : styles.rowThem]}>
                  {mine ? (
                    <LinearGradient colors={[...brandGradients.primary]} style={[styles.bub, styles.bubMe]}>
                      {bubble}
                    </LinearGradient>
                  ) : (
                    <View style={[styles.bub, styles.bubThem]}>{bubble}</View>
                  )}
                </View>
              );
            }}
          />
        )}

        {recording ? (
          <View style={styles.recBar}>
            <View style={styles.recDot} />
            <Text style={styles.recTxt}>Запись голоса</Text>
            <ScalePressable onPress={() => void stopVoice(true)} style={styles.recCancel}>
              <Text style={styles.recCancelT}>Отмена</Text>
            </ScalePressable>
            <ScalePressable onPress={() => void stopVoice(false)} style={styles.recSend}>
              <Text style={styles.recSendT}>Отправить</Text>
            </ScalePressable>
          </View>
        ) : null}

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          <View style={styles.quickRow}>
            <ScalePressable onPress={() => void sendQuick("👋 Привет")} style={styles.quickPill} disabled={sending}>
              <Text style={styles.quickPillT}>👋 Привет</Text>
            </ScalePressable>
            <ScalePressable onPress={() => void sendQuick("❤️ Нравится")} style={styles.quickPill} disabled={sending}>
              <Text style={styles.quickPillT}>❤️ Нравится</Text>
            </ScalePressable>
          </View>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inp}
              value={text}
              onChangeText={setText}
              placeholder="Напишите сообщение..."
              placeholderTextColor="#a8a29e"
              multiline
              editable={!sending}
            />
            {hasText ? (
              <ScalePressable onPress={() => void sendText()} style={styles.sendHit} disabled={sending}>
                <LinearGradient colors={[...brandGradients.primary]} style={styles.sendGrad}>
                  <Send size={22} color="#fff" />
                </LinearGradient>
              </ScalePressable>
            ) : (
              <ScalePressable onPress={() => void startVoice()} style={styles.sendHit} disabled={sending}>
                <LinearGradient colors={[...brandGradients.primary]} style={styles.sendGrad}>
                  <Mic size={22} color="#fff" />
                </LinearGradient>
              </ScalePressable>
            )}
          </View>
          <View style={styles.toolRow}>
            <View style={styles.toolRel}>
              <ScalePressable
                onPress={() => {
                  setShowAttachMenu((v) => !v);
                  setShowEmojiPicker(false);
                }}
                style={styles.toolHit}
                disabled={sending || recording}
              >
                <ImageIcon size={22} color="#78716c" />
              </ScalePressable>
              {showAttachMenu ? (
                <View style={styles.attachPop}>
                  <ScalePressable
                    style={styles.attachRow}
                    onPress={() => void sendImage()}
                    disabled={sending || recording}
                  >
                    <ImageIcon size={18} color="#ef4444" />
                    <Text style={styles.attachTxt}>Фото</Text>
                  </ScalePressable>
                  <ScalePressable
                    style={styles.attachRow}
                    onPress={() => {
                      setShowAttachMenu(false);
                      Alert.alert("Видео", "Запись видео-кружка в мобильном клиенте появится в следующей версии.");
                    }}
                  >
                    <Video size={18} color="#ef4444" />
                    <Text style={styles.attachTxt}>Видео кружочек</Text>
                  </ScalePressable>
                  <ScalePressable style={styles.attachRow} onPress={() => void startVoice()} disabled={sending || recording}>
                    <Mic size={18} color="#ef4444" />
                    <Text style={styles.attachTxt}>Голосовое</Text>
                  </ScalePressable>
                </View>
              ) : null}
            </View>
            <ScalePressable
              onPress={() => {
                setShowEmojiPicker((v) => !v);
                setShowAttachMenu(false);
              }}
              style={styles.toolHit}
              disabled={sending || recording}
            >
              <Smile size={22} color="#78716c" />
            </ScalePressable>
            <ScalePressable
              onPress={() => {
                if (paymentsEnabled === false) return;
                setShowGiftModal(true);
                setShowAttachMenu(false);
                setShowEmojiPicker(false);
              }}
              style={[styles.toolHit, paymentsEnabled === false && { opacity: 0.4 }]}
              disabled={paymentsEnabled === false || sending || recording}
            >
              <Gift size={22} color="#78716c" />
            </ScalePressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      <MotionModal visible={showEmojiPicker} onClose={() => setShowEmojiPicker(false)} sheetStyle={styles.emojiSheet}>
            <Text style={styles.emojiH}>Эмодзи</Text>
            <ScrollView contentContainerStyle={styles.emojiGrid}>
              {CHAT_EMOJIS.map((em) => (
                <ScalePressable
                  key={em}
                  style={styles.emojiCell}
                  onPress={() => {
                    setText((prev) => prev + em);
                    setShowEmojiPicker(false);
                  }}
                >
                  <Text style={styles.emojiChar}>{em}</Text>
                </ScalePressable>
              ))}
            </ScrollView>
      </MotionModal>

      <MotionModal visible={showGiftModal} onClose={() => setShowGiftModal(false)} sheetStyle={styles.giftSheet}>
            <ScalePressable style={styles.giftX} onPress={() => setShowGiftModal(false)}>
              <X size={20} color="#78716c" />
            </ScalePressable>
            <View style={styles.giftIco}>
              <Gift size={32} color="#ef4444" />
            </View>
            <Text style={styles.giftH}>Подарки</Text>
            <Text style={styles.giftSub}>Выберите подарок для {title || "собеседника"}:</Text>
            {paymentsEnabled === false ? (
              <Text style={styles.giftWarn}>
                Онлайн-оплата сейчас недоступна: на сервере не настроен платёжный шлюз. Подарки отключены до подключения
                T-Bank.
              </Text>
            ) : null}
            <View style={styles.giftGrid}>
              {CHAT_GIFTS.map((gift) => (
                <ScalePressable
                  key={gift.id}
                  style={styles.giftCard}
                  disabled={paymentsEnabled === false}
                  onPress={() => void sendGiftPayment(gift)}
                >
                  <Text style={styles.giftEm}>{gift.emoji}</Text>
                  <Text style={styles.giftName}>{gift.name}</Text>
                  <Text style={styles.giftPrice}>({gift.price} ₽)</Text>
                </ScalePressable>
              ))}
            </View>
      </MotionModal>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: "#fffefb" },
  flex: { flex: 1 },
  topBar: { paddingHorizontal: 16, paddingBottom: 14 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  peer: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: "#fff" },
  avatarPh: { backgroundColor: "rgba(255,255,255,0.35)" },
  peerName: { fontSize: tw.textLg, fontWeight: "800", color: "#fff" },
  peerSub: { fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 2 },
  closeHit: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.22)", alignItems: "center", justifyContent: "center" },
  errB: { backgroundColor: "#fee2e2", color: "#b91c1c", padding: 8, textAlign: "center" },
  list: { flex: 1, backgroundColor: "rgba(254, 242, 242, 0.35)" },
  listContent: { paddingVertical: 12, paddingHorizontal: 8, flexGrow: 1 },
  row: { marginVertical: 4, flexDirection: "row" },
  rowMe: { justifyContent: "flex-end" },
  rowThem: { justifyContent: "flex-start" },
  bub: { maxWidth: "78%", borderRadius: 16, overflow: "hidden" },
  bubMe: { padding: 0 },
  bubThem: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e7e5e4",
    padding: 0,
  },
  bubIn: { paddingHorizontal: 14, paddingVertical: 10 },
  bubImg: { padding: 4 },
  t: { color: "#292524", fontSize: 15, lineHeight: 21 },
  tMine: { color: "#fff" },
  time: { fontSize: 11, marginTop: 6 },
  timeMine: { color: "rgba(255,255,255,0.75)" },
  timeThem: { color: "#a8a29e" },
  img: { width: 220, height: 220, borderRadius: 12, marginTop: 4 },
  recBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#fef2f2",
    borderTopWidth: 1,
    borderTopColor: "#fecaca",
  },
  recDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#ef4444" },
  recTxt: { flex: 1, fontSize: 14, color: "#44403c" },
  recCancel: { paddingVertical: 8, paddingHorizontal: 8 },
  recCancelT: { color: "#57534e", fontSize: 14 },
  recSend: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#ea580c",
  },
  recSendT: { color: "#fff", fontWeight: "700", fontSize: 14 },
  footer: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f5f5f4",
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  quickRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  quickPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#ffedd5",
  },
  quickPillT: { fontSize: 12, fontWeight: "600", color: "#c2410c" },
  inputRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 8 },
  inp: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: "#f5f5f4",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1c1917",
  },
  sendHit: {},
  sendGrad: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  toolRow: { flexDirection: "row", alignItems: "center", paddingBottom: 2, gap: 4 },
  toolRel: { position: "relative" },
  toolHit: { padding: 8 },
  attachPop: {
    position: "absolute",
    bottom: "100%",
    left: 0,
    marginBottom: 8,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 6,
    minWidth: 200,
    borderWidth: 1,
    borderColor: "#e7e5e4",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 10 },
      android: { elevation: 6 },
    }),
  },
  attachRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
  attachTxt: { fontSize: 14, color: "#44403c" },
  emojiBack: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  emojiSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: "46%",
  },
  emojiH: { fontWeight: "800", fontSize: 16, marginBottom: 10, color: "#1c1917" },
  emojiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 4, paddingBottom: 12, justifyContent: "center" },
  emojiCell: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  emojiChar: { fontSize: 26 },
  giftBack: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  giftSheet: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 22,
    position: "relative",
  },
  giftX: { position: "absolute", top: 12, right: 12, padding: 8, zIndex: 2 },
  giftIco: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 12,
  },
  giftH: { fontSize: 20, fontWeight: "800", color: "#1c1917", textAlign: "center" },
  giftSub: { fontSize: 13, color: "#57534e", textAlign: "center", marginTop: 6, marginBottom: 10 },
  giftWarn: {
    fontSize: 12,
    color: "#92400e",
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  giftGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" },
  giftCard: {
    width: "47%",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#ffedd5",
  },
  giftEm: { fontSize: 28, marginBottom: 4 },
  giftName: { fontSize: 13, fontWeight: "700", color: "#c2410c", textAlign: "center" },
  giftPrice: { fontSize: 11, color: "#78716c", marginTop: 2 },
  voiceL: { marginTop: 4 },
  voiceLtxt: { color: "#1d4ed8", textDecorationLine: "underline", fontSize: 14 },
});
