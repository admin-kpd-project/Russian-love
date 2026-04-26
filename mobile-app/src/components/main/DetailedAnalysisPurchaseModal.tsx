import React, { useState } from "react";
import { Modal, View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { X, Sparkles, Star, Check } from "lucide-react-native";

type Props = {
  visible: boolean;
  profileName: string;
  onClose: () => void;
  onPurchase: (type: "single" | "unlimited") => void;
};

export function DetailedAnalysisPurchaseModal({ visible, profileName, onClose, onPurchase }: Props) {
  const [opt, setOpt] = useState<"single" | "unlimited">("single");

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.back} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <LinearGradient colors={["#a855f7", "#ec4899", "#ef4444"]} style={styles.head}>
            <Pressable style={styles.x} onPress={onClose}>
              <X size={22} color="#fff" />
            </Pressable>
            <View style={styles.headRow}>
              <Sparkles size={28} color="#fff" />
              <View>
                <Text style={styles.headT}>Детальный анализ</Text>
                <Text style={styles.headS}>Узнайте больше о совместимости</Text>
              </View>
            </View>
          </LinearGradient>

          <ScrollView style={styles.body}>
            <Text style={styles.intro}>
              Получите детальный астрологический и нумерологический анализ совместимости с {profileName}
            </Text>

            <Pressable style={[styles.card, opt === "single" && styles.cardOn]} onPress={() => setOpt("single")}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <View style={styles.row}>
                    <Star size={20} color="#9333ea" />
                    <Text style={styles.cardH}>Один анализ</Text>
                  </View>
                  <Text style={styles.cardD}>Детальный анализ с текущим профилем</Text>
                  <Text style={styles.price}>₽99</Text>
                  <Text style={styles.sub}>разовая покупка</Text>
                </View>
                {opt === "single" ? (
                  <View style={styles.chk}>
                    <Check size={16} color="#fff" />
                  </View>
                ) : null}
              </View>
            </Pressable>

            <Pressable style={[styles.card, opt === "unlimited" && styles.cardOn]} onPress={() => setOpt("unlimited")}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <View style={styles.row}>
                    <Sparkles size={20} color="#9333ea" />
                    <Text style={styles.cardH}>Безлимит анализов</Text>
                  </View>
                  <Text style={styles.cardD}>Неограниченное число детальных отчётов</Text>
                  <Text style={styles.price}>₽499</Text>
                  <Text style={styles.sub}>на месяц</Text>
                </View>
                {opt === "unlimited" ? (
                  <View style={styles.chk}>
                    <Check size={16} color="#fff" />
                  </View>
                ) : null}
              </View>
            </Pressable>

            <Pressable
              style={styles.cta}
              onPress={() => {
                onPurchase(opt);
                onClose();
              }}
            >
              <Text style={styles.ctaT}>Продолжить</Text>
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  back: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "90%" },
  head: { padding: 20, paddingTop: 44 },
  x: { position: "absolute", top: 12, right: 12, padding: 8, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.25)" },
  headRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  headT: { fontSize: 22, fontWeight: "800", color: "#fff" },
  headS: { fontSize: 13, color: "rgba(255,255,255,0.9)", marginTop: 4 },
  body: { padding: 18, paddingBottom: 28 },
  intro: { textAlign: "center", color: "#57534e", marginBottom: 18, lineHeight: 22 },
  card: { borderWidth: 2, borderColor: "#e7e5e4", borderRadius: 16, padding: 14, marginBottom: 12 },
  cardOn: { borderColor: "#9333ea", backgroundColor: "#faf5ff" },
  cardTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  cardH: { fontSize: 17, fontWeight: "800", color: "#171717" },
  cardD: { fontSize: 13, color: "#57534e", marginBottom: 8 },
  price: { fontSize: 24, fontWeight: "800", color: "#171717" },
  sub: { fontSize: 12, color: "#78716c" },
  chk: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#9333ea", alignItems: "center", justifyContent: "center" },
  cta: { backgroundColor: "#9333ea", paddingVertical: 16, borderRadius: 14, marginTop: 8 },
  ctaT: { color: "#fff", fontWeight: "800", fontSize: 17, textAlign: "center" },
});
