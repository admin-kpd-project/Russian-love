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
import { Heart, Sparkles } from "lucide-react-native";

import type { RootStackParamList } from "../navigation/types";
import { getUserById } from "../api/usersApi";
import { mapApiProfileToUserProfile } from "../utils/mapApiProfile";
import type { UserProfile } from "../utils/compatibilityAI";

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
      const res = await getUserById(inviterId);
      if (c) return;
      setLoading(false);
      if (res.error || !res.data) {
        setErr(res.error || "Профиль пригласившего недоступен");
        return;
      }
      setInviter(mapApiProfileToUserProfile(res.data));
    })();
    return () => {
      c = true;
    };
  }, [inviterId]);

  if (loading) {
    return (
      <LinearGradient colors={["#fef2f2", "#fffbeb", "#fefce8"]} style={styles.page}>
        <View style={[styles.center, { paddingTop: insets.top + 40 }]}>
          <ActivityIndicator size="large" color="#ef4444" />
        </View>
      </LinearGradient>
    );
  }

  if (err || !inviter) {
    return (
      <LinearGradient colors={["#fef2f2", "#fffbeb", "#fefce8"]} style={styles.page}>
        <View style={[styles.center, { paddingTop: insets.top + 24, paddingHorizontal: 24 }]}>
          <Text style={styles.err}>{err || "Не удалось загрузить приглашение"}</Text>
          <Pressable onPress={() => navigation.replace("Landing")} style={styles.btnWrap}>
            <LinearGradient colors={["#ef4444", "#f59e0b"]} style={styles.btn}>
              <Text style={styles.btnT}>На главную</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#fef2f2", "#fffbeb", "#fefce8"]} style={styles.page}>
      <View style={[styles.body, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.spark}>
          <Sparkles size={32} color="#f59e0b" />
        </View>
        <Text style={styles.h1}>Приглашение</Text>
        <Text style={styles.lead}>
          {inviter.name} хочет узнать вашу совместимость в «Любить по-russки»
        </Text>

        <LinearGradient colors={["#fef2f2", "#fffbeb"]} style={styles.card}>
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

        <Pressable
          onPress={() => navigation.navigate("Register", { inviterId })}
          style={styles.btnWrap}
        >
          <LinearGradient colors={["#ef4444", "#f59e0b"]} style={styles.btn}>
            <Heart size={22} color="#fff" fill="#fff" />
            <Text style={styles.btnT}>Зарегистрироваться</Text>
          </LinearGradient>
        </Pressable>

        <Pressable onPress={() => navigation.navigate("Login")} style={styles.link}>
          <Text style={styles.linkT}>Уже есть аккаунт — войти</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  body: { flex: 1, paddingHorizontal: 22, alignItems: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  spark: { marginBottom: 12 },
  h1: { fontSize: 26, fontWeight: "900", color: "#1c1917", marginBottom: 10, textAlign: "center" },
  lead: { fontSize: 15, color: "#57534e", textAlign: "center", lineHeight: 22, marginBottom: 22 },
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
