import React from "react";
import { Modal, View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { X, Brain, Heart, MapPin, Calendar, Sparkles } from "lucide-react-native";

import type { CompatibilityDetails } from "../../utils/compatibilityAI";

const traitLabels: Record<string, string> = {
  extroversion: "Экстраверсия",
  openness: "Открытость",
  conscientiousness: "Добросовестность",
  agreeableness: "Доброжелательность",
  emotionalStability: "Эмоциональная стабильность",
};

type Props = {
  visible: boolean;
  details: CompatibilityDetails | null;
  userName: string;
  compatibility: number;
  onClose: () => void;
  onOpenDetailedAnalysis?: () => void;
};

export function CompatibilityDetailsModal({ visible, details, userName, compatibility, onClose, onOpenDetailedAnalysis }: Props) {
  if (!details) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.back} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <LinearGradient colors={["#ef4444", "#f59e0b"]} style={styles.head}>
            <Pressable style={styles.x} onPress={onClose}>
              <X size={22} color="#fff" />
            </Pressable>
            <Text style={styles.headT}>Анализ совместимости</Text>
            <Text style={styles.headS}>Детальный расчёт AI</Text>
          </LinearGradient>

          <ScrollView style={styles.scroll}>
            <View style={styles.total}>
              <LinearGradient colors={["#fee2e2", "#fef3c7"]} style={styles.totalRing}>
                <Text style={styles.totalN}>{compatibility}%</Text>
              </LinearGradient>
              <Text style={styles.totalL}>Общая совместимость с {userName}</Text>
              {onOpenDetailedAnalysis ? (
                <Pressable onPress={onOpenDetailedAnalysis} style={styles.purpleBtn}>
                  <Sparkles size={18} color="#fff" />
                  <Text style={styles.purpleBtnT}>Получить детальный анализ</Text>
                </Pressable>
              ) : null}
            </View>

            <Section icon={Brain} title="Личность" subtitle={`Вес: ${details.personality.weight}%`} score={details.personality.score} iconBg="#f3e8ff" iconColor="#7c3aed">
              {Object.entries(details.personality.traits).map(([key, value]) => (
                <View key={key} style={styles.trait}>
                  <View style={styles.traitTop}>
                    <Text style={styles.traitL}>{traitLabels[key] ?? key}</Text>
                    <Text style={styles.traitN}>{Math.round(value.match)}%</Text>
                  </View>
                  <View style={styles.barBg}>
                    <View style={[styles.barFi, { width: `${Math.min(100, value.match)}%` }]} />
                  </View>
                </View>
              ))}
            </Section>

            <Section icon={Heart} title="Интересы" subtitle={`Общие: ${details.interests.shared.join(", ") || "—"}`} score={details.interests.score} iconBg="#fce7f3" iconColor="#db2777" />

            <Row icon={Calendar} title="Возраст" text={`Разница ${details.age.difference} лет`} score={details.age.score} />
            <Row icon={MapPin} title="Локация" text={details.location.same ? "Один город" : "Разные города"} score={details.location.score} />

            <View style={styles.box}>
              <Text style={styles.boxH}>Астрология</Text>
              <Text style={styles.boxT}>{details.astrology.details}</Text>
            </View>
            <View style={styles.box}>
              <Text style={styles.boxH}>Нумерология</Text>
              <Text style={styles.boxT}>{details.numerology.details}</Text>
            </View>
            <View style={{ height: 24 }} />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Section({
  icon: Icon,
  title,
  subtitle,
  score,
  iconBg,
  iconColor,
  children,
}: {
  icon: React.ComponentType<Record<string, unknown>>;
  title: string;
  subtitle: string;
  score: number;
  iconBg: string;
  iconColor: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.sec}>
      <View style={styles.secHead}>
        <View style={[styles.secIco, { backgroundColor: iconBg }]}>
          <Icon size={20} color={iconColor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.secT}>{title}</Text>
          <Text style={styles.secS}>{subtitle}</Text>
        </View>
        <Text style={styles.secN}>{score}%</Text>
      </View>
      {children}
    </View>
  );
}

function Row({
  icon: Icon,
  title,
  text,
  score,
}: {
  icon: React.ComponentType<Record<string, unknown>>;
  title: string;
  text: string;
  score: number;
}) {
  return (
    <View style={styles.row}>
      <Icon size={18} color="#57534e" />
      <View style={{ flex: 1 }}>
        <Text style={styles.rowT}>{title}</Text>
        <Text style={styles.rowD}>{text}</Text>
      </View>
      <Text style={styles.rowN}>{score}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  back: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 14 },
  sheet: { backgroundColor: "#fff", borderRadius: 24, maxHeight: "90%", overflow: "hidden" },
  head: { padding: 18, paddingTop: 44 },
  x: { position: "absolute", top: 10, right: 10, padding: 8, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.25)" },
  headT: { fontSize: 20, fontWeight: "800", color: "#fff" },
  headS: { fontSize: 13, color: "rgba(255,255,255,0.9)", marginTop: 4 },
  scroll: { paddingHorizontal: 16, paddingTop: 12 },
  total: { alignItems: "center", paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#f5f5f4", marginBottom: 12 },
  totalRing: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  totalN: { fontSize: 32, fontWeight: "800", color: "#dc2626" },
  totalL: { fontSize: 13, color: "#78716c", marginBottom: 10, textAlign: "center" },
  purpleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#9333ea",
  },
  purpleBtnT: { color: "#fff", fontWeight: "800", fontSize: 14 },
  sec: { marginBottom: 16 },
  secHead: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  secIco: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  secT: { fontWeight: "800", color: "#292524" },
  secS: { fontSize: 11, color: "#78716c" },
  secN: { fontSize: 18, fontWeight: "800", color: "#7c3aed" },
  trait: { marginLeft: 8, marginBottom: 8 },
  traitTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  traitL: { fontSize: 13, color: "#57534e" },
  traitN: { fontSize: 13, fontWeight: "700", color: "#292524" },
  barBg: { height: 8, backgroundColor: "#e7e5e4", borderRadius: 4, overflow: "hidden" },
  barFi: { height: 8, backgroundColor: "#a855f7", borderRadius: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f5f5f4" },
  rowT: { fontWeight: "700", color: "#292524" },
  rowD: { fontSize: 12, color: "#78716c" },
  rowN: { fontWeight: "800", color: "#ea580c" },
  box: { backgroundColor: "#fafaf9", borderRadius: 14, padding: 12, marginBottom: 10 },
  boxH: { fontWeight: "800", marginBottom: 6, color: "#292524" },
  boxT: { fontSize: 14, color: "#57534e", lineHeight: 20 },
});
