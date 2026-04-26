import React, { useEffect, useState } from "react";
import { Modal, View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import { X, Star, Sparkles } from "lucide-react-native";
import { brandGradients } from "../../theme/designTokens";

type Props = {
  visible: boolean;
  profileName: string;
  profileAge: number;
  compatibility: number;
  onClose: () => void;
};

export function DetailedAnalysisModal({ visible, profileName, profileAge, compatibility, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<"astrology" | "numerology">("astrology");
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState({ astrology: "", numerology: "" });

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    const t = setTimeout(() => {
      setAnalysis({
        astrology: generateAstrologyAnalysis(profileName, profileAge, compatibility),
        numerology: generateNumerologyAnalysis(profileName, profileAge, compatibility),
      });
      setLoading(false);
    }, 1200);
    return () => clearTimeout(t);
  }, [visible, profileName, profileAge, compatibility]);

  const paragraphs = (tab === "astrology" ? analysis.astrology : analysis.numerology).split("\n\n");

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.back} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <LinearGradient colors={[...brandGradients.premium]} style={styles.head}>
            <Pressable style={styles.x} onPress={onClose}>
              <X size={22} color="#fff" />
            </Pressable>
            <View style={styles.headRow}>
              <Sparkles size={26} color="#fff" />
              <View>
                <Text style={styles.headT}>Детальный анализ</Text>
                <Text style={styles.headS}>Совместимость с {profileName}</Text>
              </View>
            </View>
            <View style={styles.barOut}>
              <View style={[styles.barIn, { width: `${compatibility}%` }]} />
            </View>
            <Text style={styles.pct}>{compatibility}%</Text>
          </LinearGradient>

          <View style={styles.tabs}>
            <Pressable style={[styles.tab, tab === "astrology" && styles.tabOn]} onPress={() => setTab("astrology")}>
              <Star size={18} color={tab === "astrology" ? "#9333ea" : "#78716c"} />
              <Text style={[styles.tabT, tab === "astrology" && styles.tabTon]}>Астрология</Text>
            </Pressable>
            <Pressable style={[styles.tab, tab === "numerology" && styles.tabOn]} onPress={() => setTab("numerology")}>
              <Sparkles size={18} color={tab === "numerology" ? "#9333ea" : "#78716c"} />
              <Text style={[styles.tabT, tab === "numerology" && styles.tabTon]}>Нумерология</Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentIn}
          >
            {loading ? (
              <View style={styles.load}>
                <ActivityIndicator size="large" color="#a855f7" />
                <Text style={styles.loadT}>Анализируем совместимость...</Text>
              </View>
            ) : (
              paragraphs.map((p, i) => (
                <View key={i} style={styles.pCard}>
                  <Text style={styles.p}>{p}</Text>
                </View>
              ))
            )}
          </ScrollView>

          <View style={[styles.foot, { paddingBottom: 12 + insets.bottom }]}>
            <Sparkles size={14} color="#a8a29e" />
            <Text style={styles.footT}>Анализ создан с помощью ИИ</Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function generateAstrologyAnalysis(name: string, age: number, compatibility: number): string {
  const zodiacSigns = ["Овна", "Тельца", "Близнецов", "Рака", "Льва", "Девы", "Весов", "Скорпиона", "Стрельца", "Козерога", "Водолея", "Рыб"];
  const yourSign = zodiacSigns[Math.floor(Math.random() * zodiacSigns.length)];
  const theirSign = zodiacSigns[Math.floor(Math.random() * zodiacSigns.length)];
  void name;
  void age;
  if (compatibility >= 80) {
    return `🌟 Астрологическая совместимость: ${yourSign} и ${theirSign}

Ваше сочетание знаков представляет собой гармоничное астрологическое соединение. Энергии ваших знаков прекрасно дополняют друг друга, создавая атмосферу взаимопонимания и поддержки.

Планетарные аспекты указывают на сильное эмоциональное влечение и интеллектуальную совместимость.`;
  }
  if (compatibility >= 60) {
    return `⭐ Астрологическая совместимость: ${yourSign} и ${theirSign}

Ваша астрологическая совместимость показывает интересное сочетание элементов. Есть как гармоничные, так и напряженные аспекты, которые создают динамичные отношения.`;
  }
  return `💫 Астрологическая совместимость: ${yourSign} и ${theirSign}

Ваше астрологическое сочетание представляет собой вызов, который может стать возможностью для роста.`;
}

function generateNumerologyAnalysis(name: string, age: number, compatibility: number): string {
  const yourNumber = Math.floor(Math.random() * 9) + 1;
  const theirNumber = Math.floor(Math.random() * 9) + 1;
  const destinyNumber = (yourNumber + theirNumber) % 9 || 9;
  void name;
  void age;
  if (compatibility >= 80) {
    return `🔢 Нумерологический анализ: Число ${yourNumber} и Число ${theirNumber}

Ваши числа судьбы находятся в гармоничной вибрации. Число совместимости ${destinyNumber} указывает на сильную связь и естественное притяжение между вами.`;
  }
  if (compatibility >= 60) {
    return `🔢 Нумерологический анализ: Число ${yourNumber} и Число ${theirNumber}

Ваши числа показывают интересную комбинацию вибраций. Число совместимости ${destinyNumber} говорит о потенциале для развития отношений при осознанном подходе.`;
  }
  return `🔢 Нумерологический анализ: Число ${yourNumber} и Число ${theirNumber}

Ваши числа находятся в конфликтующих вибрациях. Число совместимости ${destinyNumber} показывает вызовы, которые потребуют сознательных усилий для преодоления.`;
}

const styles = StyleSheet.create({
  back: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "92%",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.12, shadowRadius: 8 },
      android: { elevation: 12 },
    }),
  },
  head: { padding: 18, paddingTop: 44 },
  x: { position: "absolute", top: 10, right: 10, padding: 8, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.25)" },
  headRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  headT: { fontSize: 22, fontWeight: "800", color: "#fff" },
  headS: { fontSize: 13, color: "rgba(255,255,255,0.9)" },
  barOut: { height: 8, backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 4, overflow: "hidden" },
  barIn: { height: 8, backgroundColor: "#fff", borderRadius: 4 },
  pct: { fontSize: 18, fontWeight: "800", color: "#fff", marginTop: 8, textAlign: "right" },
  tabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e7e5e4" },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 14 },
  tabOn: { borderBottomWidth: 2, borderBottomColor: "#9333ea" },
  tabT: { fontSize: 15, fontWeight: "600", color: "#78716c" },
  tabTon: { color: "#9333ea" },
  content: { maxHeight: 420 },
  contentIn: { padding: 16, paddingBottom: 8 },
  load: { alignItems: "center", paddingVertical: 40 },
  loadT: { marginTop: 12, color: "#78716c" },
  pCard: {
    backgroundColor: "#fafaf9",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e7e5e4",
  },
  p: { fontSize: 15, color: "#44403c", lineHeight: 24 },
  foot: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, padding: 12, backgroundColor: "#fafaf9", borderTopWidth: 1, borderTopColor: "#e7e5e4" },
  footT: { fontSize: 11, color: "#78716c" },
});
