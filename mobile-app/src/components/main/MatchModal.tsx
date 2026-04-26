import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Image, ScrollView } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { X, Heart, MessageCircle, ChevronRight, UserPlus, Calendar } from "lucide-react-native";

import type { UserProfile } from "../../utils/compatibilityAI";
import { EventsPickerModal } from "./EventsPickerModal";
import { LoopingView, ScalePressable } from "../ui/Motion";
import { GradientButton } from "../ui/GradientButton";
import { brandGradients } from "../../theme/designTokens";
import { MotionModal } from "../ui/MotionModal";

type Props = {
  visible: boolean;
  profile: UserProfile | null;
  compatibility: number;
  isMatch?: boolean;
  onClose: () => void;
  onWrite: () => void;
  onRecommend?: () => void;
  /** Совместимость — как на вебе: открыть детали / покупку */
  onCompatPress?: () => void;
  /** После выбора события: открыть чат с предзаполненным текстом */
  onEventInvite?: (prefilledMessage: string) => void;
};

export function MatchModal({
  visible,
  profile,
  compatibility,
  isMatch = true,
  onClose,
  onWrite,
  onRecommend,
  onCompatPress,
  onEventInvite,
}: Props) {
  const [eventsOpen, setEventsOpen] = useState(false);

  if (!profile) return null;

  return (
    <>
      <MotionModal visible={visible} onClose={onClose} sheetStyle={styles.sheet}>
            <ScalePressable style={styles.closeX} onPress={onClose}>
              <X size={20} color="#78716c" />
            </ScalePressable>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.heartWrap}>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <LoopingView key={i} kind="float" duration={1400 + i * 120} style={[styles.orbitHeart, orbitStyles[i]]}>
                    <Heart size={16} color="#ef4444" fill="#ef4444" />
                  </LoopingView>
                ))}
                <LoopingView kind="pulse">
                  <LinearGradient colors={[...brandGradients.primary]} style={styles.heartCircle}>
                    <Heart size={48} color="#fff" fill="#fff" />
                  </LinearGradient>
                </LoopingView>
              </View>
              <Text style={styles.title}>{isMatch ? "Это Match!" : "Вы понравились друг другу"}</Text>
              <Text style={styles.sub}>Вы и {profile.name} понравились друг другу</Text>

              <Pressable
                onPress={() => onCompatPress?.()}
                disabled={!onCompatPress}
                style={[styles.compatOuter, !onCompatPress && { opacity: 0.95 }]}
              >
                <LinearGradient colors={[...brandGradients.featureCard]} style={styles.compatBox}>
                  <Text style={styles.compatNum}>{compatibility}%</Text>
                  <View style={styles.compatHintRow}>
                    <Text style={styles.compatHint}>Совместимость по AI-алгоритму</Text>
                    {onCompatPress ? <ChevronRight size={16} color="#a8a29e" /> : null}
                  </View>
                </LinearGradient>
              </Pressable>

              <View style={styles.preview}>
                {profile.photo ? (
                  <Image source={{ uri: profile.photo }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarPh]} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.pname}>
                    {profile.name}, {profile.age}
                  </Text>
                  <Text style={styles.ploc}>{profile.location}</Text>
                </View>
              </View>

              <View style={styles.col}>
                <View style={styles.actions}>
                  <ScalePressable style={styles.outline} onPress={onClose}>
                    <Text style={styles.outlineT}>Продолжить поиск</Text>
                  </ScalePressable>
                  <GradientButton title="Написать" onPress={onWrite} left={<MessageCircle size={18} color="#fff" />} style={styles.primaryBtn} textStyle={styles.primaryT} />
                </View>

                <ScalePressable style={styles.fullOutlineAm} onPress={() => setEventsOpen(true)}>
                  <Calendar size={18} color="#d97706" />
                  <Text style={styles.fullOutlineAmT}>Куда сходить вместе</Text>
                </ScalePressable>

                {onRecommend ? (
                  <ScalePressable style={styles.fullOutlineRed} onPress={onRecommend}>
                    <UserPlus size={18} color="#dc2626" />
                    <Text style={styles.fullOutlineRedT}>Рекомендовать друзьям</Text>
                  </ScalePressable>
                ) : null}
              </View>
            </ScrollView>
      </MotionModal>

      <EventsPickerModal
        visible={eventsOpen}
        profileName={profile.name}
        onClose={() => setEventsOpen(false)}
        onPick={(_title, description) => {
          setEventsOpen(false);
          onClose();
          onEventInvite?.(description);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    maxHeight: "90%",
  },
  closeX: { position: "absolute", top: 12, right: 12, zIndex: 2, padding: 8 },
  heartWrap: { alignItems: "center", justifyContent: "center", marginBottom: 16, height: 112 },
  orbitHeart: { position: "absolute" },
  heartCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
    color: "#dc2626",
  },
  sub: { textAlign: "center", color: "#57534e", marginBottom: 16 },
  compatOuter: { marginBottom: 16 },
  compatBox: { borderRadius: 16, padding: 16, alignItems: "center" },
  compatNum: { fontSize: 36, fontWeight: "800", color: "#dc2626" },
  compatHintRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  compatHint: { fontSize: 13, color: "#57534e" },
  preview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    backgroundColor: "#f5f5f4",
    borderRadius: 16,
    marginBottom: 16,
  },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  avatarPh: { backgroundColor: "#d6d3d1" },
  pname: { fontWeight: "700", fontSize: 17, color: "#1c1917" },
  ploc: { color: "#57534e", fontSize: 13, marginTop: 2 },
  col: { gap: 10 },
  actions: { flexDirection: "row", gap: 10 },
  outline: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#e7e5e4",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  outlineT: { fontWeight: "600", color: "#44403c" },
  primaryBtn: {
    flex: 1,
  },
  primaryT: { color: "#fff", fontWeight: "700", fontSize: 15 },
  fullOutlineAm: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: "#fde68a",
    borderRadius: 999,
    paddingVertical: 12,
    backgroundColor: "#fffbeb",
  },
  fullOutlineAmT: { fontWeight: "600", color: "#d97706", fontSize: 15 },
  fullOutlineRed: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: "#fecaca",
    borderRadius: 999,
    paddingVertical: 12,
    backgroundColor: "#fef2f2",
  },
  fullOutlineRedT: { fontWeight: "600", color: "#dc2626", fontSize: 15 },
});

const orbitStyles = [
  { top: 4, left: "24%" },
  { top: 18, right: "20%" },
  { bottom: 14, left: "18%" },
  { bottom: 6, right: "26%" },
  { top: 42, left: "8%" },
  { top: 48, right: "8%" },
] as const;
