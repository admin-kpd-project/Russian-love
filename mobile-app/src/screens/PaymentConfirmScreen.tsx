import { useMemo, useEffect, useState } from "react";
import { View, Text, StyleSheet, Linking, Platform } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CheckCircle2 } from "lucide-react-native";

import type { RootStackParamList } from "../navigation/types";
import { FadeInView, LoopingView } from "../components/ui/Motion";
import { GradientButton } from "../components/ui/GradientButton";
import { brandGradients } from "../theme/designTokens";

type Props = NativeStackScreenProps<RootStackParamList, "PaymentConfirm">;

function orderIdFromUrl(url: string | null): string | undefined {
  if (!url) return;
  const q = url.split("?")[1];
  if (!q) return;
  const params = new URLSearchParams(q);
  const v = params.get("orderId");
  return v || undefined;
}

export function PaymentConfirmScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const fromRoute = route.params?.orderId;
  const [fromUrl, setFromUrl] = useState<string | undefined>();

  useEffect(() => {
    void Linking.getInitialURL().then((u) => setFromUrl(orderIdFromUrl(u)));
    const sub = Linking.addEventListener("url", ({ url }) => setFromUrl(orderIdFromUrl(url)));
    return () => sub.remove();
  }, []);

  const orderId = fromRoute ?? fromUrl;

  const shortOrderId = useMemo(() => {
    if (!orderId) return "";
    return orderId.length > 12 ? `${orderId.slice(0, 12)}…` : orderId;
  }, [orderId]);

  return (
    <LinearGradient colors={[...brandGradients.page]} style={styles.page}>
      <FadeInView style={[styles.box, { marginTop: insets.top + 40, marginBottom: insets.bottom + 24 }]}>
        <LoopingView kind="pulse" style={styles.ico}>
          <CheckCircle2 size={48} color="#16a34a" />
        </LoopingView>
        <Text style={styles.h1}>Платеж создан</Text>
        <Text style={styles.p}>
          Заказ передан в обработку. Статус обновится автоматически после ответа платёжного провайдера.
        </Text>
        {shortOrderId ? <Text style={styles.order}>Order ID: {shortOrderId}</Text> : null}
        <GradientButton title="Вернуться в приложение" onPress={() => navigation.replace("Main")} style={styles.btnWrap} />
      </FadeInView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, paddingHorizontal: 20, justifyContent: "center" },
  box: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    maxWidth: 400,
    alignSelf: "center",
    width: "100%",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.12, shadowRadius: 24 },
      android: { elevation: 8 },
    }),
  },
  ico: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  h1: { fontSize: 22, fontWeight: "800", color: "#171717", marginBottom: 10, textAlign: "center" },
  p: { fontSize: 15, color: "#57534e", textAlign: "center", lineHeight: 22, marginBottom: 8 },
  order: { fontSize: 12, color: "#78716c", marginBottom: 22 },
  btnWrap: { width: "100%" },
});
