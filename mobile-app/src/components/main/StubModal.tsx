import React from "react";
import { Modal, Text, Pressable, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";

type Props = {
  visible: boolean;
  title: string;
  body: string;
  onClose: () => void;
};

/** Заглушка под QR / подписку / магазин суперлайков — тот же визуальный язык, что на вебе */
export function StubModal({ visible, title, body, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.back} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <LinearGradient colors={["#ef4444", "#f59e0b"]} style={styles.head}>
            <Text style={styles.title}>{title}</Text>
          </LinearGradient>
          <Text style={styles.body}>{body}</Text>
          <Pressable onPress={onClose}>
            <LinearGradient colors={["#ef4444", "#f59e0b"]} style={styles.btn}>
              <Text style={styles.btnT}>Закрыть</Text>
            </LinearGradient>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  back: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  sheet: { backgroundColor: "#fff", borderRadius: 20, overflow: "hidden" },
  head: { padding: 18 },
  title: { color: "#fff", fontSize: 20, fontWeight: "800", textAlign: "center" },
  body: { padding: 20, fontSize: 15, color: "#57534e", lineHeight: 22 },
  btn: { margin: 16, marginTop: 0, borderRadius: 999, paddingVertical: 14, alignItems: "center" },
  btnT: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
