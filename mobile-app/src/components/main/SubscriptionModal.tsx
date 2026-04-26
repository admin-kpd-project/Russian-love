import React, { useState } from "react";
import { Modal, View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator, Linking, Alert } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { X, Flame, Check, Crown } from "lucide-react-native";

import { getPaymentsStatus, initTbankPayment } from "../../api/paymentsApi";

type Props = { visible: boolean; remainingSuperLikes: number; onClose: () => void; onSubscribed?: () => void };

export function SubscriptionModal({ visible, remainingSuperLikes, onClose, onSubscribed }: Props) {
  const [busy, setBusy] = useState(false);

  const pay = async (plan: "1m" | "3m" | "6m") => {
    setBusy(true);
    const st = await getPaymentsStatus();
    if (!st.data?.paymentsEnabled) {
      setBusy(false);
      Alert.alert("Премиум", "Оплата на сервере отключена. В демо-режиме премиум недоступен.");
      return;
    }
    const amountMinor = plan === "1m" ? 99000 : plan === "3m" ? 199000 : 299000;
    const r = await initTbankPayment("subscription", amountMinor, { plan });
    setBusy(false);
    if (r.error || !r.data?.paymentUrl) {
      Alert.alert("Оплата", r.error || "Не удалось создать платёж");
      return;
    }
    await Linking.openURL(r.data.paymentUrl);
    onSubscribed?.();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.back} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <LinearGradient colors={["#ef4444", "#f59e0b", "#facc15"]} style={styles.head}>
            <Pressable style={styles.x} onPress={onClose}>
              <X size={24} color="#fff" />
            </Pressable>
            <View style={styles.crown}>
              <Crown size={40} color="#fff" fill="#fff" />
            </View>
            <Text style={styles.headT}>Премиум подписка</Text>
            <Text style={styles.headS}>Любить без ограничений</Text>
          </LinearGradient>

          <ScrollView style={styles.body}>
            <View style={styles.status}>
              <LinearGradient colors={["#ef4444", "#f59e0b"]} style={styles.fl}>
                <Flame size={26} color="#fff" />
              </LinearGradient>
              <View>
                <Text style={styles.stL}>Осталось огоньков</Text>
                <Text style={styles.stN}>
                  {remainingSuperLikes} / 5
                </Text>
              </View>
            </View>

            <Text style={styles.featH}>Преимущества премиум:</Text>
            {[
              ["Неограниченные огоньки", "Ставьте супер-лайки без ограничений"],
              ["Приоритет в показе", "Ваш профиль видят в первую очередь"],
              ["Безлимитные лайки", "Лайкайте сколько угодно профилей"],
              ["Кто вас лайкнул", "Смотрите, кому вы понравились"],
            ].map(([t, d]) => (
              <View key={t} style={styles.featRow}>
                <View style={styles.chk}>
                  <Check size={14} color="#16a34a" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featT}>{t}</Text>
                  <Text style={styles.featD}>{d}</Text>
                </View>
              </View>
            ))}

            <Pressable style={styles.planHot} onPress={() => void pay("1m")} disabled={busy}>
              <View style={styles.popTag}>
                <Text style={styles.popTagT}>ПОПУЛЯРНО</Text>
              </View>
              <LinearGradient colors={["#ef4444", "#f59e0b"]} style={styles.planHotGrad}>
                <Text style={styles.planHotSub}>1 месяц</Text>
                <Text style={styles.planHotP}>990 ₽</Text>
                <Text style={styles.planHotHint}>~33 ₽ в день</Text>
              </LinearGradient>
            </Pressable>
            <Pressable style={styles.plan} onPress={() => void pay("3m")} disabled={busy}>
              <Text style={styles.planSub}>3 месяца</Text>
              <Text style={styles.planP}>1990 ₽</Text>
              <Text style={styles.planHint}>~22 ₽ в день • экономия 33%</Text>
            </Pressable>
            <Pressable style={styles.plan} onPress={() => void pay("6m")} disabled={busy}>
              <Text style={styles.planSub}>6 месяцев</Text>
              <Text style={styles.planP}>2990 ₽</Text>
              <Text style={styles.planHint}>~16 ₽ в день • экономия 50%</Text>
            </Pressable>

            {busy ? <ActivityIndicator style={{ marginVertical: 12 }} /> : null}
            <LinearGradient colors={["#ef4444", "#f59e0b"]} style={styles.cta}>
              <Pressable onPress={() => void pay("1m")} disabled={busy}>
                <Text style={styles.ctaT}>Оформить подписку</Text>
              </Pressable>
            </LinearGradient>
            <Text style={styles.small}>Автоматическое продление. Отменить можно в любой момент</Text>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  back: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#fffbeb", borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "94%" },
  head: { padding: 24, paddingTop: 48, alignItems: "center" },
  x: { position: "absolute", top: 14, right: 14, padding: 8, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.2)" },
  crown: { width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  headT: { fontSize: 26, fontWeight: "800", color: "#fff" },
  headS: { fontSize: 15, color: "rgba(255,255,255,0.92)" },
  body: { padding: 18, paddingBottom: 28 },
  status: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#fff", borderRadius: 16, padding: 14, borderWidth: 2, borderColor: "#fecaca", marginBottom: 18 },
  fl: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  stL: { fontSize: 13, color: "#78716c" },
  stN: { fontSize: 22, fontWeight: "800", color: "#292524" },
  featH: { fontWeight: "800", fontSize: 17, color: "#292524", marginBottom: 10 },
  featRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  chk: { marginTop: 2 },
  featT: { fontWeight: "700", color: "#292524" },
  featD: { fontSize: 13, color: "#57534e" },
  planHot: {
    borderRadius: 16,
    borderWidth: 4,
    borderColor: "#fcd34d",
    marginBottom: 10,
    overflow: "hidden",
  },
  planHotGrad: { borderRadius: 12, padding: 16 },
  popTag: { position: "absolute", top: 8, right: 8, zIndex: 2, backgroundColor: "#facc15", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  popTagT: { fontSize: 10, fontWeight: "800", color: "#b91c1c" },
  planHotSub: { fontSize: 13, color: "rgba(255,255,255,0.9)" },
  planHotP: { fontSize: 28, fontWeight: "800", color: "#fff" },
  planHotHint: { fontSize: 13, color: "rgba(255,255,255,0.85)" },
  plan: { backgroundColor: "#fff", borderWidth: 2, borderColor: "#e7e5e4", borderRadius: 16, padding: 14, marginBottom: 10 },
  planSub: { fontSize: 13, color: "#78716c" },
  planP: { fontSize: 22, fontWeight: "800", color: "#292524" },
  planHint: { fontSize: 13, color: "#57534e" },
  cta: { borderRadius: 16, marginTop: 8, overflow: "hidden" },
  ctaT: { textAlign: "center", color: "#fff", fontWeight: "800", fontSize: 18, paddingVertical: 16 },
  small: { textAlign: "center", fontSize: 11, color: "#78716c", marginTop: 12 },
});
