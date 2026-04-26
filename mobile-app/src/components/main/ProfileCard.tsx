import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, StyleSheet, Pressable } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { Heart, MapPin, Sparkles, AlertTriangle, Star, Briefcase } from "lucide-react-native";
import type { UserProfile } from "../../utils/compatibilityAI";
import { getCompatibilityLabel } from "../../utils/compatibilityAI";
import { tw } from "../../theme/designTokens";

type Props = {
  profile: UserProfile;
  compatibility: number;
  superLikesRemaining: number;
  likesCount: number;
  onOpenDetailedAnalysis?: () => void;
};

function compatColors(pct: number): [string, string] {
  if (pct >= 85) return ["#ef4444", "#f59e0b"];
  if (pct >= 75) return ["#f87171", "#f97316"];
  if (pct >= 65) return ["#f97316", "#eab308"];
  return ["#f59e0b", "#fde047"];
}

export function ProfileCard({ profile, compatibility, superLikesRemaining, likesCount, onOpenDetailedAnalysis }: Props) {
  const [c1, c2] = compatColors(compatibility);
  const photoUri = profile.photo || undefined;
  const [imgErr, setImgErr] = useState(false);

  useEffect(() => {
    setImgErr(false);
  }, [profile.id, profile.photo]);

  return (
    <View style={styles.card}>
      <View style={styles.photoWrap}>
        {photoUri && !imgErr ? (
          <Image
            source={{ uri: photoUri }}
            style={styles.photo}
            resizeMode="cover"
            onError={() => setImgErr(true)}
          />
        ) : (
          <View style={[styles.photo, styles.photoPh]} />
        )}
        <LinearGradient colors={["transparent", "rgba(0,0,0,0.65)"]} style={styles.photoGrad} />

        <View style={styles.statsCol}>
          <LinearGradient colors={["#3b82f6", "#2563eb"]} style={styles.statPill}>
            <Star size={14} color="#fff" fill="#fff" />
            <Text style={styles.statTxt}>{superLikesRemaining}</Text>
          </LinearGradient>
          <LinearGradient colors={["#ef4444", "#ec4899"]} style={styles.statPill}>
            <Heart size={14} color="#fff" fill="#fff" />
            <Text style={styles.statTxt}>{likesCount}</Text>
          </LinearGradient>
        </View>

        <View style={styles.compatWrap}>
          <LinearGradient colors={[c1, c2]} style={styles.compatInner}>
            {compatibility >= 50 ? <Sparkles size={18} color="#fff" /> : <AlertTriangle size={18} color="#fff" />}
            <View>
              <Text style={styles.compatPct}>{compatibility}%</Text>
              <Text style={styles.compatSub}>
                {compatibility >= 50 ? "совместимость" : "низкая совместимость"}
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.nameBlock}>
          <Text style={styles.name}>
            {profile.name}, {profile.age}
          </Text>
          <View style={styles.locRow}>
            <MapPin size={14} color="rgba(255,255,255,0.9)" />
            <Text style={styles.loc}>{profile.location || "—"}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.info} contentContainerStyle={styles.infoIn} showsVerticalScrollIndicator={false}>
        <Text style={styles.bio} numberOfLines={3}>
          {profile.bio}
        </Text>
        <View style={styles.compatRow}>
          <LinearGradient colors={["#fef2f2", "#fffbeb"]} style={styles.compatLabel}>
            <Heart size={18} color="#ef4444" />
            <Text style={styles.compatLabelT}>{getCompatibilityLabel(compatibility)}</Text>
          </LinearGradient>
          {onOpenDetailedAnalysis ? (
            <Pressable onPress={onOpenDetailedAnalysis}>
              <LinearGradient colors={["#a855f7", "#9333ea"]} style={styles.detailBtn}>
                <Sparkles size={16} color="#fff" />
                <Text style={styles.detailBtnT}>Детально</Text>
              </LinearGradient>
            </Pressable>
          ) : null}
        </View>
        <View style={styles.intHRow}>
          <Briefcase size={14} color="#78716c" />
          <Text style={styles.intH}> Интересы</Text>
        </View>
        <View style={styles.tags}>
          {(profile.interests || []).map((t, i) => (
            <LinearGradient key={`${t}-${i}`} colors={["#fee2e2", "#fef3c7"]} style={styles.tag}>
              <Text style={styles.tagT}>{t}</Text>
            </LinearGradient>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e7e5e4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  photoWrap: { flex: 1, minHeight: 220, position: "relative" },
  photo: { ...StyleSheet.absoluteFillObject },
  photoPh: { backgroundColor: "#e7e5e4" },
  photoGrad: { ...StyleSheet.absoluteFillObject },
  statsCol: { position: "absolute", bottom: 12, right: 12, gap: 8, alignItems: "flex-end" },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statTxt: { color: "#fff", fontWeight: "800", fontSize: 13 },
  compatWrap: { position: "absolute", top: 12, right: 12 },
  compatInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  compatPct: { color: "#fff", fontSize: 22, fontWeight: "800" },
  compatSub: { color: "rgba(255,255,255,0.92)", fontSize: 10 },
  nameBlock: { position: "absolute", bottom: 12, left: 12, right: 72 },
  name: { color: "#fff", fontSize: tw.text3xl, fontWeight: "800" },
  locRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  loc: { color: "rgba(255,255,255,0.9)", fontSize: 13 },
  info: { maxHeight: "40%" },
  infoIn: { padding: tw.p4, paddingBottom: 24 },
  bio: { color: "#44403c", fontSize: tw.textBase, lineHeight: 24, marginBottom: 12 },
  compatRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  compatLabel: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  compatLabelT: { color: "#44403c", fontSize: 13, fontWeight: "600", flex: 1 },
  detailBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  detailBtnT: { color: "#fff", fontWeight: "700", fontSize: 12 },
  intHRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 },
  intH: { fontSize: 12, fontWeight: "700", color: "#78716c" },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  tagT: { color: "#b91c1c", fontSize: 12, fontWeight: "600" },
});
