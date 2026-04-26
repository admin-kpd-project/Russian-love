import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, StyleSheet, Pressable } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { Heart, MapPin, Sparkles, AlertTriangle, Star, Briefcase } from "lucide-react-native";
import type { UserProfile } from "../../utils/compatibilityAI";
import { getCompatibilityLabel } from "../../utils/compatibilityAI";
import { brandGradients, tw } from "../../theme/designTokens";
import { ScalePressable } from "../ui/Motion";

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
        {/* Веб: `bg-gradient-to-t from-black/60 via-transparent` — затемнение снизу для читаемости */}
        <LinearGradient
          colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0.12)", "transparent"]}
          locations={[0, 0.45, 1]}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0 }}
          style={styles.photoGrad}
        />

        <View style={styles.statsCol}>
          <LinearGradient colors={["#3b82f6", tw.blue600]} style={styles.statPill}>
            <Star size={16} color="#fff" fill="#fff" />
            <Text style={styles.statTxt}>{superLikesRemaining}</Text>
          </LinearGradient>
          <LinearGradient colors={["#ef4444", "#ec4899"]} style={styles.statPill}>
            <Heart size={16} color="#fff" fill="#fff" />
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
          <Text style={styles.name} numberOfLines={2}>
            {profile.name}, {profile.age}
          </Text>
          <View style={styles.locRow}>
            <MapPin size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.loc}>{profile.location || "—"}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.info} contentContainerStyle={styles.infoIn} showsVerticalScrollIndicator={false}>
        <Text style={styles.bio} numberOfLines={3}>
          {profile.bio}
        </Text>
        <View style={styles.compatRow}>
          <LinearGradient colors={[...brandGradients.featureCard]} style={styles.compatLabel}>
            <Heart size={18} color="#ef4444" />
            <Text style={styles.compatLabelT}>{getCompatibilityLabel(compatibility)}</Text>
          </LinearGradient>
          {onOpenDetailedAnalysis ? (
            <ScalePressable onPress={onOpenDetailedAnalysis}>
              <LinearGradient colors={[...brandGradients.detailCta]} style={styles.detailBtn}>
                <Sparkles size={16} color="#fff" />
                <Text style={styles.detailBtnT}>Детально</Text>
              </LinearGradient>
            </ScalePressable>
          ) : null}
        </View>
        <View style={styles.intHRow}>
          <Briefcase size={14} color={tw.gray500} />
          <Text style={styles.intH}>Интересы</Text>
        </View>
        <View style={styles.tags}>
          {(profile.interests || []).map((t, i) => (
            <LinearGradient key={`${t}-${i}`} colors={[...brandGradients.interestTag]} style={styles.tag}>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
  photoWrap: { flex: 1, minHeight: 220, position: "relative" },
  photo: { ...StyleSheet.absoluteFillObject },
  photoPh: { backgroundColor: tw.gray100 },
  photoGrad: { ...StyleSheet.absoluteFillObject },
  statsCol: { position: "absolute", bottom: 12, right: 12, gap: 8, alignItems: "flex-end" },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statTxt: { color: "#fff", fontWeight: "800", fontSize: 12 },
  compatWrap: { position: "absolute", top: 12, right: 12 },
  compatInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  compatPct: { color: "#fff", fontSize: 24, fontWeight: "800" },
  compatSub: { color: "rgba(255,255,255,0.9)", fontSize: 10 },
  /** зона не заезжает на колонку счётчиков (веб: имя + локация снизу с `left-3`/`right-3`) */
  nameBlock: { position: "absolute", bottom: 12, left: 12, maxWidth: "68%" },
  name: { color: "#fff", fontSize: tw.text3xl, fontWeight: "800" },
  locRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  loc: { color: "rgba(255,255,255,0.9)", fontSize: 14 },
  info: { maxHeight: "40%" },
  infoIn: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24 },
  bio: { color: tw.gray700, fontSize: 15, lineHeight: 22, marginBottom: 12 },
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
  compatLabelT: { color: tw.gray700, fontSize: 13, fontWeight: "600", flex: 1 },
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
  intH: { fontSize: 12, fontWeight: "600", color: tw.gray500, marginLeft: 2 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  tagT: { color: "#b91c1c", fontSize: 12, fontWeight: "600" },
});
