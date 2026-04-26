import React, { useEffect, useState } from "react";
import { Modal, View, Text, Pressable, StyleSheet, Share, Platform, Alert } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import QRCode from "react-native-qrcode-svg";
import { X, Share2, Copy } from "lucide-react-native";

import { getApiBaseUrl } from "../../api/apiBase";

type Props = { visible: boolean; userId: string | undefined; onClose: () => void };

function originFromApiBase(base: string): string {
  try {
    const u = new URL(base);
    return u.origin;
  } catch {
    return base.replace(/\/$/, "");
  }
}

export function QRShareModal({ visible, userId, onClose }: Props) {
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    if (!visible) return;
    void (async () => {
      const base = await getApiBaseUrl();
      const origin = base ? originFromApiBase(base) : "https://forruss.ru";
      setQrUrl(userId ? `${origin}/scan/${userId}` : origin);
    })();
  }, [visible, userId]);

  const share = async () => {
    try {
      await Share.share({
        title: "Любить по-russки",
        message: `Отсканируй мой QR-код и узнай нашу совместимость! ${qrUrl}`,
        url: Platform.OS === "ios" ? qrUrl : undefined,
      });
    } catch {
      /* empty */
    }
  };

  const copy = () => {
    Alert.alert("Ссылка для QR", qrUrl, [{ text: "OK" }]);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.back} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <LinearGradient colors={["#ef4444", "#f59e0b"]} style={styles.head}>
            <Pressable style={styles.x} onPress={onClose}>
              <X size={24} color="#fff" />
            </Pressable>
            <Text style={styles.headT}>Ваш QR-код</Text>
            <Text style={styles.headS}>Поделитесь профилем с друзьями</Text>
          </LinearGradient>
          <View style={styles.body}>
            {qrUrl ? (
              <View style={styles.qrBox}>
                <QRCode value={qrUrl} size={200} backgroundColor="#fff" color="#1c1917" />
              </View>
            ) : null}
            <Text style={styles.url} numberOfLines={2}>
              {qrUrl}
            </Text>
            <View style={styles.row}>
              <Pressable style={styles.btn} onPress={share}>
                <Share2 size={20} color="#fff" />
                <Text style={styles.btnT}>Поделиться</Text>
              </Pressable>
              <Pressable style={styles.btnOut} onPress={copy}>
                <Copy size={20} color="#44403c" />
                <Text style={styles.btnOutT}>Показать ссылку</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  back: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  sheet: { backgroundColor: "#fff", borderRadius: 24, overflow: "hidden" },
  head: { padding: 20, paddingTop: 48 },
  x: { position: "absolute", top: 14, right: 14, padding: 8, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.2)" },
  headT: { fontSize: 22, fontWeight: "800", color: "#fff" },
  headS: { fontSize: 14, color: "rgba(255,255,255,0.9)", marginTop: 4 },
  body: { padding: 20, alignItems: "center" },
  qrBox: { padding: 16, backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#e7e5e4", marginBottom: 12 },
  url: { fontSize: 12, color: "#78716c", textAlign: "center", marginBottom: 16 },
  row: { flexDirection: "row", gap: 10, width: "100%" },
  btn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#ea580c",
    paddingVertical: 14,
    borderRadius: 14,
  },
  btnT: { color: "#fff", fontWeight: "700", fontSize: 15 },
  btnOut: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: "#e7e5e4",
    paddingVertical: 14,
    borderRadius: 14,
  },
  btnOutT: { color: "#44403c", fontWeight: "700", fontSize: 15 },
});
