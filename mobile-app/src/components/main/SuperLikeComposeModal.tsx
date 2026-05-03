import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import { X, Star, Send } from "lucide-react-native";
import type { UserProfile } from "../../utils/compatibilityAI";
import { brandGradients, tw } from "../../theme/designTokens";

const MAX = 500;

type Props = {
  visible: boolean;
  profile: UserProfile | null;
  onClose: () => void;
  onSend: (message: string | undefined) => void;
};

/** Визуал и копии как `web/app/components/SuperLikeComposeModal.tsx`. */
export function SuperLikeComposeModal({ visible, profile, onClose, onSend }: Props) {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState("");

  useEffect(() => {
    if (visible) setText("");
  }, [visible]);

  if (!profile) {
    return null;
  }

  const peerName = profile.name;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Без закрытия по тапу снаружи — как `disableBackdropClose` на веб */}
        <View style={styles.dim} />

        <View style={[styles.card, { marginBottom: Math.max(insets.bottom, 12) }]}>
          <LinearGradient colors={[...brandGradients.superLikeComposeHeader]} style={styles.head}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Star size={20} color="#fff" fill="#fff" />
                <Text style={styles.headT}>Суперлайк</Text>
              </View>
              <Text style={styles.headS}>
                Можно добавить одно короткое сообщение для {peerName}. Переписка откроется только после взаимного мэтча.
              </Text>
            </View>
            <Pressable onPress={onClose} style={styles.x} hitSlop={8}>
              <X size={22} color="#fff" />
            </Pressable>
          </LinearGradient>

          <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled" bounces={false}>
            <View style={styles.peerCard}>
              {profile.photo ? (
                <Image source={{ uri: profile.photo }} style={styles.ph} />
              ) : (
                <View style={[styles.ph, styles.phPlaceholder]}>
                  <Star size={28} color="#fff" fill="#fff" />
                </View>
              )}
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.peerTitle} numberOfLines={1}>
                  {peerName}
                </Text>
                <Text style={styles.peerHint}>Сообщение не попадёт в чат до мэтча — его увидят в уведомлении.</Text>
              </View>
            </View>

            <Text style={styles.label}>Сообщение (необязательно)</Text>
            <TextInput
              value={text}
              onChangeText={(t) => setText(t.slice(0, MAX))}
              placeholder="Например: привет, у нас общие интересы!"
              placeholderTextColor={tw.stone400}
              multiline
              maxLength={MAX}
              style={styles.input}
            />
            <Text style={styles.counter}>
              {text.length}/{MAX}
            </Text>
          </ScrollView>

          <View style={[styles.foot, { paddingBottom: 12 + insets.bottom }]}>
            <Pressable onPress={onClose} style={styles.btnGhost}>
              <Text style={styles.btnGhostT}>Отмена</Text>
            </Pressable>
            <Pressable onPress={() => onSend(text.trim() || undefined)} style={styles.btnPrimary}>
              <LinearGradient
                colors={[...brandGradients.superLikeComposeHeader]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.btnGrad}
              >
                <Send size={16} color="#fff" />
                <Text style={styles.btnPrimaryT}>Отправить суперлайк</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 16,
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  card: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    maxHeight: "88%",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 16 },
      android: { elevation: 12 },
    }),
  },
  head: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
  },
  headT: { fontSize: 18, fontWeight: "800", color: "#fff" },
  headS: { marginTop: 6, fontSize: 14, color: "rgba(255,255,255,0.92)", lineHeight: 20 },
  x: { padding: 6, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.2)" },
  scroll: { maxHeight: 360, paddingHorizontal: 20, paddingTop: 20 },
  peerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e0f2fe",
    backgroundColor: "rgba(240,249,255,0.65)",
  },
  ph: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: tw.stone200,
    borderWidth: 2,
    borderColor: "#fff",
  },
  phPlaceholder: { alignItems: "center", justifyContent: "center", backgroundColor: "rgba(125,211,252,0.85)" },
  peerTitle: { fontSize: 16, fontWeight: "600", color: tw.gray800 },
  peerHint: { marginTop: 4, fontSize: 12, color: "rgba(12,74,110,0.82)", lineHeight: 16 },
  label: { marginTop: 16, marginBottom: 6, fontSize: 12, fontWeight: "600", color: tw.gray500 },
  input: {
    minHeight: 120,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: tw.gray200,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: tw.gray800,
    backgroundColor: tw.gray100,
    textAlignVertical: "top",
  },
  counter: { marginTop: 6, textAlign: "right", fontSize: 11, color: tw.gray500 },
  foot: {
    flexDirection: "column",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: tw.gray200,
    backgroundColor: "#fff",
  },
  btnGhost: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: tw.gray200,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  btnGhostT: { fontWeight: "600", color: tw.gray700, fontSize: 14 },
  btnPrimary: { borderRadius: 999, overflow: "hidden", alignSelf: "stretch" },
  btnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  btnPrimaryT: { color: "#fff", fontWeight: "800", fontSize: 14 },
});
