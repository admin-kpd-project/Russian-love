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
} from "react-native";
import AudioRecorderPlayer from "react-native-audio-recorder-player";
import { launchImageLibrary } from "react-native-image-picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { getMessages, sendTextMessage, sendMediaMessage, type MessageResponse } from "../api/messagesApi";
import { presignAuth, putFileToPresignedUrl, createChatWebSocket } from "../api/uploadApi";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Chat">;

const audioPlayer = new AudioRecorderPlayer();

function audioContentTypeForPath(p: string): string {
  const low = p.toLowerCase();
  if (low.endsWith(".m4a")) return "audio/m4a";
  if (low.endsWith(".aac")) return "audio/aac";
  if (low.endsWith(".mp3")) return "audio/mpeg";
  if (low.endsWith(".mp4") || low.endsWith(".3gp")) return "audio/mp4";
  return "audio/mpeg";
}

export function ChatScreen({ route, navigation }: Props) {
  const { conversationId, title } = route.params;
  const [rows, setRows] = useState<MessageResponse[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const recordPathRef = useRef<string | null>(null);
  const durSecRef = useRef(0);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    navigation.setOptions({ title: title || "Чат" });
  }, [navigation, title]);

  const load = useCallback(async () => {
    setErr(null);
    setLoading(true);
    const r = await getMessages(conversationId, 1, 100);
    setLoading(false);
    if (r.error) {
      setErr(r.error);
      return;
    }
    setRows((r.data ?? []).slice().reverse());
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

  const startVoice = async () => {
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

  return (
    <View style={styles.root}>
      {err ? <Text style={styles.errB}>{err}</Text> : null}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          inverted
          data={rows}
          keyExtractor={(m) => m.id}
          renderItem={({ item: m }) => {
            return (
              <View style={[styles.bub, m.sender === "me" ? styles.me : styles.them]}>
                {m.text ? <Text style={styles.t}>{m.text}</Text> : null}
                {m.type === "image" && m.mediaUrl ? (
                  <Image source={{ uri: m.mediaUrl }} style={styles.img} resizeMode="cover" />
                ) : null}
                {m.type === "voice" && m.mediaUrl ? (
                  <Pressable onPress={() => void Linking.openURL(m.mediaUrl!)} style={styles.voiceL}>
                    <Text style={styles.voiceLtxt}>▶ {m.duration || "аудио"}</Text>
                  </Pressable>
                ) : null}
                {m.type === "video" && m.mediaUrl ? (
                  <Text style={styles.t}>Видео: откройте ссылку</Text>
                ) : null}
                <Text style={styles.time}>{m.time}</Text>
              </View>
            );
          }}
        />
      )}
      <View style={styles.bar}>
        <TextInput
          style={styles.inp}
          value={text}
          onChangeText={setText}
          placeholder="Сообщение…"
          editable={!sending}
        />
        <Pressable onPress={sendText} style={styles.iconBtn} disabled={sending}>
          <Text style={styles.iTxt}>➤</Text>
        </Pressable>
        <Pressable onPress={sendImage} style={styles.iconBtn} disabled={sending || recording}>
          <Text style={styles.iTxt}>🖼</Text>
        </Pressable>
        {!recording ? (
          <Pressable onPress={startVoice} style={styles.iconBtn} disabled={sending}>
            <Text style={styles.iTxt}>🎤</Text>
          </Pressable>
        ) : (
          <View style={styles.voiceRow}>
            <Pressable onPress={() => void stopVoice(true)} style={styles.iconBtn}>
              <Text>✕</Text>
            </Pressable>
            <Pressable onPress={() => void stopVoice(false)} style={styles.voiceSend}>
              <Text style={styles.voiceSendT}>Отпр.</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f5f5f4" },
  errB: { backgroundColor: "#fee2e2", color: "#b91c1c", padding: 8, textAlign: "center" },
  bub: { maxWidth: "86%", marginHorizontal: 10, marginVertical: 4, padding: 10, borderRadius: 14 },
  me: { alignSelf: "flex-end", backgroundColor: "#fecdd3" },
  them: { alignSelf: "flex-start", backgroundColor: "#fff" },
  t: { color: "#1c1917" },
  time: { fontSize: 10, color: "#78716c", marginTop: 4 },
  img: { width: 200, height: 200, borderRadius: 8, marginTop: 4 },
  bar: { flexDirection: "row", alignItems: "center", padding: 8, gap: 4, backgroundColor: "#fff", borderTopWidth: 1, borderColor: "#e7e5e4" },
  inp: { flex: 1, maxHeight: 100, borderWidth: 1, borderColor: "#d6d3d1", borderRadius: 10, padding: 8 },
  iconBtn: { padding: 8 },
  iTxt: { fontSize: 18 },
  voiceRow: { flexDirection: "row", alignItems: "center" },
  voiceSend: { backgroundColor: "#16a34a", paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  voiceSendT: { color: "#fff", fontWeight: "600" },
  voiceL: { marginTop: 4 },
  voiceLtxt: { color: "#1d4ed8", textDecorationLine: "underline" },
});
