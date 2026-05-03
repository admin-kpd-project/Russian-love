import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ArrowLeft, Headphones } from "lucide-react-native";

import type { RootStackParamList } from "../navigation/types";
import { createSupportTicket, listMySupportTickets, type SupportTicket } from "../api/supportApi";
import { colors, radius, cardShadow } from "../theme/theme";
import { ScalePressable } from "../components/ui/Motion";
import { GradientButton } from "../components/ui/GradientButton";
import { brandGradients } from "../theme/designTokens";

type Props = NativeStackScreenProps<RootStackParamList, "Support">;

export function SupportScreen({ navigation }: Props) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const r = await listMySupportTickets();
    setLoading(false);
    if (r.data) setTickets(r.data);
  };

  useEffect(() => {
    void load();
  }, []);

  const onSubmit = async () => {
    setErr(null);
    if (!subject.trim() || !message.trim()) {
      setErr("Заполните тему и сообщение");
      return;
    }
    setSending(true);
    const r = await createSupportTicket(subject.trim(), message.trim());
    setSending(false);
    if (r.error) {
      setErr(r.error);
      return;
    }
    setSubject("");
    setMessage("");
    void load();
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrap}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient colors={[...brandGradients.page]} style={StyleSheet.absoluteFill} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient colors={[...brandGradients.primary]} style={styles.hero}>
          <ScalePressable style={styles.back} onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color="#fff" />
          </ScalePressable>
          <View style={styles.heroTitleRow}>
            <Headphones size={36} color="#fff" />
            <Text style={styles.title}>Поддержка</Text>
          </View>
          <Text style={styles.sub}>Опишите проблему — команда ответит в рамках обращения в админ-панели.</Text>
        </LinearGradient>

        <View style={[styles.card, cardShadow()]}>
          {err ? <Text style={styles.err}>{err}</Text> : null}
          <Text style={styles.lbl}>Тема</Text>
          <TextInput
            style={styles.input}
            value={subject}
            onChangeText={setSubject}
            placeholder="Кратко"
            placeholderTextColor="#a8a29e"
            editable={!sending}
          />
          <Text style={styles.lbl}>Сообщение</Text>
          <TextInput
            style={[styles.input, styles.area]}
            value={message}
            onChangeText={setMessage}
            placeholder="Подробности"
            placeholderTextColor="#a8a29e"
            multiline
            editable={!sending}
          />
          <GradientButton title="Отправить" onPress={onSubmit} loading={sending} disabled={sending} />

          <Text style={styles.sec}>Мои обращения</Text>
          {loading ? (
            <Text style={styles.muted}>Загрузка…</Text>
          ) : tickets.length === 0 ? (
            <Text style={styles.muted}>Пока нет обращений.</Text>
          ) : (
            tickets.map((t) => (
              <View key={t.id} style={styles.ticket}>
                <View style={styles.ticketHead}>
                  <Text style={styles.ticketSubj}>{t.subject}</Text>
                  <Text style={styles.status}>{t.status}</Text>
                </View>
                <Text style={styles.ticketMsg}>{t.message}</Text>
                {t.staffReply ? (
                  <Text style={styles.reply}>Ответ: {t.staffReply}</Text>
                ) : null}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.pageBg },
  scroll: { paddingBottom: 40 },
  hero: {
    paddingTop: 48,
    paddingBottom: 28,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  back: {
    position: "absolute",
    top: 14,
    left: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitleRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8, marginTop: 8 },
  title: { fontSize: 24, fontWeight: "800", color: "#fff" },
  sub: { color: "rgba(255,255,255,0.92)", fontSize: 14, textAlign: "center" },
  card: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: -16,
    borderRadius: radius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.stone200,
  },
  err: { color: colors.error, marginBottom: 10, textAlign: "center" },
  lbl: { fontSize: 13, fontWeight: "600", color: colors.stone600, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.stone200,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    fontSize: 16,
    color: colors.stone900,
  },
  area: { minHeight: 100, textAlignVertical: "top" },
  sec: { marginTop: 20, marginBottom: 10, fontWeight: "700", fontSize: 16, color: colors.stone900 },
  muted: { color: colors.stone500, fontSize: 14 },
  ticket: {
    borderWidth: 1,
    borderColor: colors.stone200,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#fafaf9",
  },
  ticketHead: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  ticketSubj: { flex: 1, fontWeight: "700", color: colors.stone900 },
  status: { fontSize: 11, color: colors.stone500, textTransform: "uppercase" },
  ticketMsg: { marginTop: 6, fontSize: 14, color: colors.stone600 },
  reply: { marginTop: 8, fontSize: 14, color: "#166534", backgroundColor: "#f0fdf4", padding: 8, borderRadius: 8 },
});
