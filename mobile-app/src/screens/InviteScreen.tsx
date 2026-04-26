import { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Heart, MessageCircle, Shield, Sparkles, UsersRound } from "lucide-react-native";

import type { RootStackParamList } from "../navigation/types";
import { getUserById } from "../api/usersApi";
import { getApiBaseUrl } from "../api/apiBase";
import { mapApiProfileToUserProfile } from "../utils/mapApiProfile";
import type { UserProfile } from "../utils/compatibilityAI";
import { FadeInView, LoopingView, ScalePressable } from "../components/ui/Motion";
import { GradientButton } from "../components/ui/GradientButton";
import { GradientText } from "../components/ui/GradientText";
import { brandGradients } from "../theme/designTokens";

type Props = NativeStackScreenProps<RootStackParamList, "Invite">;

export function InviteScreen({ route, navigation }: Props) {
  const { inviterId } = route.params;
  const insets = useSafeAreaInsets();
  const [inviter, setInviter] = useState<UserProfile | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let c = false;
    void (async () => {
      const base = await getApiBaseUrl();
      const res = await getUserById(inviterId);
      if (c) return;
      setLoading(false);
      if (res.error || !res.data) {
        setErr(res.error || "Профиль пригласившего недоступен");
        return;
      }
      setInviter(mapApiProfileToUserProfile(res.data, base));
    })();
    return () => {
      c = true;
    };
  }, [inviterId]);

  if (loading) {
    return (
      <LinearGradient colors={[...brandGradients.page]} style={styles.page}>
        <View style={[styles.center, { paddingTop: insets.top + 40 }]}>
          <ActivityIndicator size="large" color="#ef4444" />
        </View>
      </LinearGradient>
    );
  }

  if (err || !inviter) {
    return (
      <LinearGradient colors={[...brandGradients.page]} style={styles.page}>
        <View style={[styles.center, { paddingTop: insets.top + 24, paddingHorizontal: 24 }]}>
          <Text style={styles.err}>{err || "Не удалось загрузить приглашение"}</Text>
          <GradientButton title="На главную" onPress={() => navigation.replace("Landing")} style={styles.wideBtn} />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[...brandGradients.page]} style={styles.page}>
      <View style={[styles.body, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
        <FadeInView style={styles.cardShell}>
          <LinearGradient colors={[...brandGradients.primary]} style={styles.heroBand}>
            <LoopingView kind="float" style={styles.spark}>
              <Sparkles size={34} color="#fff" />
            </LoopingView>
            <Text style={styles.heroKicker}>Приглашение от {inviter.name}</Text>
            <Text style={styles.heroTitle}>Узнайте вашу совместимость</Text>
          </LinearGradient>
          <View style={styles.whiteBody}>
            <GradientText text="Любить по-russки" width={220} height={34} fontSize={24} center />
        <Text style={styles.lead}>
          {inviter.name} хочет узнать вашу совместимость в «Любить по-russки»
        </Text>

        <LinearGradient colors={[...brandGradients.featureCard]} style={styles.card}>
          {inviter.photo ? (
            <Image source={{ uri: inviter.photo }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPh]} />
          )}
          <Text style={styles.name}>
            {inviter.name}, {inviter.age}
          </Text>
          <Text style={styles.loc}>{inviter.location}</Text>
        </LinearGradient>

        <View style={styles.featureRows}>
          {[
            { Icon: Heart, text: "Сравним интересы и ценности" },
            { Icon: MessageCircle, text: "Откроем чат после взаимной симпатии" },
            { Icon: Shield, text: "Безопасная регистрация и приватность" },
          ].map((row) => (
            <View key={row.text} style={styles.featureRow}>
              <row.Icon size={18} color="#dc2626" />
              <Text style={styles.featureText}>{row.text}</Text>
            </View>
          ))}
        </View>

        <GradientButton
          title="Зарегистрироваться"
          onPress={() => navigation.navigate("Register", { inviterId })}
          left={<UsersRound size={20} color="#fff" />}
          style={styles.wideBtn}
        />

        <ScalePressable onPress={() => navigation.navigate("Login")} style={styles.link}>
          <Text style={styles.linkT}>Уже есть аккаунт — войти</Text>
        </ScalePressable>
          </View>
        </FadeInView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  body: { flex: 1, paddingHorizontal: 18, justifyContent: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  cardShell: { borderRadius: 24, overflow: "hidden", backgroundColor: "#fff" },
  heroBand: { paddingVertical: 28, paddingHorizontal: 20, alignItems: "center" },
  whiteBody: { padding: 20, alignItems: "center" },
  spark: { marginBottom: 10 },
  heroKicker: { color: "rgba(255,255,255,0.9)", fontSize: 14, fontWeight: "700", marginBottom: 6 },
  heroTitle: { fontSize: 24, fontWeight: "900", color: "#fff", marginBottom: 2, textAlign: "center" },
  lead: { fontSize: 15, color: "#57534e", textAlign: "center", lineHeight: 22, marginBottom: 18 },
  card: {
    width: "100%",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fecaca",
    marginBottom: 24,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  avatar: { width: 88, height: 88, borderRadius: 44, marginBottom: 12 },
  avatarPh: { backgroundColor: "#fecaca" },
  name: { fontSize: 20, fontWeight: "800", color: "#292524" },
  loc: { fontSize: 13, color: "#78716c", marginTop: 4 },
  featureRows: { width: "100%", gap: 8, marginBottom: 18 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#fff7ed", borderRadius: 14, padding: 12 },
  featureText: { flex: 1, color: "#44403c", fontSize: 14, fontWeight: "600" },
  wideBtn: { width: "100%", marginBottom: 16 },
  btnWrap: { width: "100%", borderRadius: 999, overflow: "hidden", marginBottom: 16 },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
  },
  btnT: { color: "#fff", fontWeight: "800", fontSize: 17 },
  link: { padding: 12 },
  linkT: { color: "#b45309", fontWeight: "700", fontSize: 15 },
  err: { color: "#b91c1c", textAlign: "center", marginBottom: 20, fontSize: 15 },
});
