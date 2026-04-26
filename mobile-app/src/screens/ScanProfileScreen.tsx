import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, Platform } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ArrowLeft, Heart, Sparkles, MapPin, User } from "lucide-react-native";

import type { RootStackParamList } from "../navigation/types";
import { getCurrentUser, getUserById } from "../api/usersApi";
import { getApiBaseUrl } from "../api/apiBase";
import { mapApiProfileToUserProfile } from "../utils/mapApiProfile";
import { calculateCompatibility, type UserProfile } from "../utils/compatibilityAI";
import { MatreshkaLogo } from "../components/MatreshkaLogo";
import { FadeInView, LoopingView, ScalePressable } from "../components/ui/Motion";
import { GradientButton } from "../components/ui/GradientButton";
import { brandGradients } from "../theme/designTokens";

type Props = NativeStackScreenProps<RootStackParamList, "ScanProfile">;

export function ScanProfileScreen({ route, navigation }: Props) {
  const { userId } = route.params;
  const insets = useSafeAreaInsets();
  const [scannedUser, setScannedUser] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [compatibility, setCompatibility] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let c = false;
    void (async () => {
      const base = await getApiBaseUrl();
      const [meRes, scannedRes] = await Promise.all([getCurrentUser(), getUserById(userId)]);
      if (c) return;
      if (!meRes.data || !scannedRes.data) {
        setLoading(false);
        return;
      }
      const me = mapApiProfileToUserProfile(meRes.data, base);
      const scanned = mapApiProfileToUserProfile(scannedRes.data, base);
      setCurrentUser(me);
      setScannedUser(scanned);
      setCompatibility(calculateCompatibility(me, scanned));
      setLoading(false);
    })();
    return () => {
      c = true;
    };
  }, [userId]);

  if (loading) {
    return (
      <LinearGradient colors={[...brandGradients.page]} style={styles.page}>
        <View style={[styles.center, { paddingTop: insets.top + 24 }]}>
          <LoopingView kind="rotate">
            <MatreshkaLogo size={72} variant="onGradient" />
          </LoopingView>
          <Text style={styles.loadT}>Загрузка профиля...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!scannedUser || !currentUser) {
    return (
      <LinearGradient colors={[...brandGradients.page]} style={styles.page}>
        <View style={[styles.center, { paddingTop: insets.top + 24, paddingHorizontal: 20 }]}>
          <View style={styles.icoWrap}>
            <User size={40} color="#ef4444" />
          </View>
          <Text style={styles.errH}>Пользователь не найден</Text>
          <Text style={styles.errS}>К сожалению, этот профиль недоступен</Text>
          <GradientButton title="В приложение" onPress={() => navigation.replace("Main")} style={styles.btnWrap} />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[...brandGradients.page]} style={styles.page}>
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <ScalePressable onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.replace("Main")} style={styles.backHit}>
          <ArrowLeft size={24} color="#44403c" />
        </ScalePressable>
      </View>

      <FadeInView style={styles.card}>
        <LoopingView kind="pulse">
          <LinearGradient colors={[...brandGradients.primary]} style={styles.ring}>
            <Text style={styles.pct}>{compatibility}%</Text>
          </LinearGradient>
        </LoopingView>
        <Text style={styles.h1}>Совместимость</Text>
        <Text style={styles.sub}>По AI-алгоритму с {scannedUser.name}</Text>

        <View style={styles.row}>
          {scannedUser.photo ? (
            <Image source={{ uri: scannedUser.photo }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPh]} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>
              {scannedUser.name}, {scannedUser.age}
            </Text>
            <View style={styles.locRow}>
              <MapPin size={14} color="#78716c" />
              <Text style={styles.loc}>{scannedUser.location}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <GradientButton title="В ленту" onPress={() => navigation.replace("Main")} left={<Heart size={20} color="#fff" fill="#fff" />} style={styles.btnWrap} />
        </View>
      </FadeInView>

      <View style={styles.hint}>
        <Sparkles size={16} color="#d97706" />
        <Text style={styles.hintT}>Отсканирован профиль — как на forruss.ru/scan</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadT: { marginTop: 16, color: "#57534e", fontSize: 16 },
  top: { paddingHorizontal: 12, paddingBottom: 8 },
  backHit: { padding: 8, alignSelf: "flex-start" },
  card: {
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 22,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 },
      android: { elevation: 4 },
    }),
  },
  ring: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  pct: { fontSize: 28, fontWeight: "900", color: "#fff" },
  h1: { fontSize: 22, fontWeight: "800", color: "#1c1917", textAlign: "center" },
  sub: { fontSize: 14, color: "#57534e", textAlign: "center", marginBottom: 18 },
  row: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 20 },
  avatar: { width: 72, height: 72, borderRadius: 36 },
  avatarPh: { backgroundColor: "#fecaca" },
  name: { fontSize: 18, fontWeight: "800", color: "#292524" },
  locRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  loc: { fontSize: 13, color: "#78716c", flex: 1 },
  actions: { marginTop: 4 },
  btnWrap: { borderRadius: 999, overflow: "hidden" },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  btnT: { color: "#fff", fontWeight: "800", fontSize: 16 },
  hint: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, marginTop: 20 },
  hintT: { flex: 1, fontSize: 12, color: "#78716c" },
  icoWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  errH: { fontSize: 20, fontWeight: "800", color: "#292524", marginBottom: 8, textAlign: "center" },
  errS: { fontSize: 14, color: "#57534e", textAlign: "center", marginBottom: 20 },
});
