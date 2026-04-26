import React, { useEffect, useState } from "react";
import { Modal, View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator, Linking, Alert } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { X, Flame, Check, Sparkles } from "lucide-react-native";

import { getPaymentsStatus, initTbankPayment } from "../../api/paymentsApi";

type Pkg = { amount: number; price: string; pricePerUnit: string; popular?: boolean; icon: string; discount?: string };

const PACKAGES: Pkg[] = [
  { amount: 5, price: "99₽", pricePerUnit: "~20₽/шт", icon: "🔥" },
  { amount: 10, price: "169₽", pricePerUnit: "~17₽/шт", popular: true, icon: "🔥🔥", discount: "Выгодно!" },
  { amount: 50, price: "599₽", pricePerUnit: "~12₽/шт", icon: "🔥🔥🔥", discount: "Скидка 40%" },
];

type Props = {
  visible: boolean;
  currentAmount: number;
  onClose: () => void;
  /** Мгновенное зачисление как на вебе при отключённых платежах */
  onPurchase: (amount: number) => void;
};

export function SuperLikeShopModal({ visible, currentAmount, onClose, onPurchase }: Props) {
  const [payEnabled, setPayEnabled] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!visible) return;
    void (async () => {
      const r = await getPaymentsStatus();
      setPayEnabled(r.data?.paymentsEnabled ?? false);
    })();
  }, [visible]);

  const buy = async (pkg: Pkg) => {
    if (payEnabled === false) {
      onPurchase(pkg.amount);
      onClose();
      return;
    }
    setBusy(true);
    const amountMinor = pkg.amount === 5 ? 9900 : pkg.amount === 10 ? 16900 : 59900;
    const r = await initTbankPayment("superlike_pack", amountMinor, { packAmount: pkg.amount });
    setBusy(false);
    if (r.error || !r.data?.paymentUrl) {
      Alert.alert("Оплата", r.error || "Не удалось создать платёж");
      return;
    }
    await Linking.openURL(r.data.paymentUrl);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.back} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <LinearGradient colors={["#f97316", "#ef4444", "#ec4899"]} style={styles.head}>
            <Pressable style={styles.x} onPress={onClose}>
              <X size={24} color="#fff" />
            </Pressable>
            <View style={styles.flameRing}>
              <Flame size={36} color="#fff" />
            </View>
            <Text style={styles.headT}>Суперлайки</Text>
            <Text style={styles.headS}>Гарантированный мэтч с любым пользователем!</Text>
            <View style={styles.balance}>
              <Text style={styles.balanceL}>У вас сейчас:</Text>
              <Text style={styles.balanceN}>
                {currentAmount} 🔥
              </Text>
            </View>
          </LinearGradient>

          <ScrollView style={styles.body}>
            <Text style={styles.subH}>Выберите пакет</Text>
            <Text style={styles.subP}>Чем больше, тем выгоднее!</Text>
            {busy ? <ActivityIndicator style={{ marginVertical: 16 }} /> : null}
            {PACKAGES.map((pkg) => (
              <Pressable key={pkg.amount} style={[styles.card, pkg.popular && styles.cardPop]} onPress={() => void buy(pkg)}>
                {pkg.popular ? (
                  <LinearGradient colors={["#f97316", "#ef4444"]} style={styles.badge}>
                    <Sparkles size={12} color="#fff" />
                    <Text style={styles.badgeT}> ПОПУЛЯРНОЕ</Text>
                  </LinearGradient>
                ) : null}
                {pkg.discount && !pkg.popular ? (
                  <View style={styles.disc}>
                    <Text style={styles.discT}>{pkg.discount}</Text>
                  </View>
                ) : null}
                <View style={styles.row}>
                  <Text style={styles.ico}>{pkg.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.amt}>
                      {pkg.amount} <Text style={styles.amtS}>суперлайков</Text>
                    </Text>
                    <Text style={styles.ppu}>{pkg.pricePerUnit}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.price}>{pkg.price}</Text>
                    <LinearGradient colors={["#f97316", "#ef4444"]} style={styles.buyMini}>
                      <Text style={styles.buyMiniT}>Купить</Text>
                    </LinearGradient>
                  </View>
                </View>
                {pkg.popular ? (
                  <View style={styles.popFoot}>
                    <Check size={14} color="#16a34a" />
                    <Text style={styles.popFootT}>Лучшее соотношение цены и качества</Text>
                  </View>
                ) : null}
              </Pressable>
            ))}
            <View style={styles.info}>
              <LinearGradient colors={["#f97316", "#ef4444"]} style={styles.infoIco}>
                <Flame size={18} color="#fff" />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoH}>Что даёт суперлайк?</Text>
                <Text style={styles.infoLi}>• Гарантированный мэтч с пользователем</Text>
                <Text style={styles.infoLi}>• Ваш профиль показывается первым</Text>
                <Text style={styles.infoLi}>• Особое уведомление о вашем интересе</Text>
              </View>
            </View>
            <Text style={styles.footN}>После покупки суперлайки будут зачислены моментально</Text>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  back: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "92%" },
  head: { padding: 22, paddingTop: 48, alignItems: "center" },
  x: { position: "absolute", top: 14, right: 14, padding: 8, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.15)" },
  flameRing: { width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  headT: { fontSize: 22, fontWeight: "800", color: "#fff" },
  headS: { fontSize: 14, color: "rgba(255,255,255,0.92)", textAlign: "center", marginTop: 4 },
  balance: { marginTop: 12, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 12, paddingVertical: 8, paddingHorizontal: 16, alignItems: "center" },
  balanceL: { fontSize: 12, color: "rgba(255,255,255,0.85)" },
  balanceN: { fontSize: 24, fontWeight: "800", color: "#fff" },
  body: { padding: 18 },
  subH: { fontSize: 17, fontWeight: "800", color: "#292524", textAlign: "center" },
  subP: { fontSize: 14, color: "#78716c", textAlign: "center", marginBottom: 14 },
  card: {
    borderWidth: 2,
    borderColor: "#e7e5e4",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  cardPop: { borderColor: "#f97316", backgroundColor: "#fff7ed" },
  badge: {
    position: "absolute",
    top: -10,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeT: { color: "#fff", fontSize: 11, fontWeight: "800" },
  disc: { position: "absolute", top: -8, right: 12, backgroundColor: "#22c55e", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  discT: { color: "#fff", fontSize: 10, fontWeight: "800" },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  ico: { fontSize: 28 },
  amt: { fontSize: 20, fontWeight: "800", color: "#292524" },
  amtS: { fontSize: 14, fontWeight: "600", color: "#57534e" },
  ppu: { fontSize: 12, color: "#78716c" },
  price: { fontSize: 20, fontWeight: "800", color: "#ea580c" },
  buyMini: { marginTop: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  buyMiniT: { color: "#fff", fontWeight: "700", fontSize: 12 },
  popFoot: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#fed7aa" },
  popFootT: { fontSize: 12, color: "#57534e", flex: 1 },
  info: { flexDirection: "row", gap: 10, backgroundColor: "#fafaf9", borderRadius: 14, padding: 12, marginTop: 8 },
  infoIco: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  infoH: { fontWeight: "800", color: "#292524", marginBottom: 4, fontSize: 14 },
  infoLi: { fontSize: 12, color: "#57534e" },
  footN: { fontSize: 11, color: "#a8a29e", textAlign: "center", marginTop: 12, marginBottom: 20 },
});
