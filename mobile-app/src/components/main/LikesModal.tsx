import React from "react";
import { Modal, View, Text, Pressable, StyleSheet, FlatList, Image, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import { X, Heart } from "lucide-react-native";
import type { UserProfile } from "../../utils/compatibilityAI";
import { brandGradients, tw } from "../../theme/designTokens";

type Props = {
  visible: boolean;
  profiles: UserProfile[];
  onClose: () => void;
  onOpenProfile: (p: UserProfile) => void;
};

export function LikesModal({ visible, profiles, onClose, onOpenProfile }: Props) {
  const insets = useSafeAreaInsets();
  const { height: winH } = useWindowDimensions();
  const listMaxH = Math.max(240, Math.floor(winH * 0.8) - 88 - insets.bottom);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={[styles.back, { paddingBottom: insets.bottom }]} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <LinearGradient colors={[...brandGradients.primary]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.header}>
            <View style={styles.headerIn}>
              <Heart size={24} color="#fff" fill="#fff" />
              <Text style={styles.h1}>Мои лайки</Text>
            </View>
            <Pressable onPress={onClose} style={styles.xHit} hitSlop={8}>
              <X size={24} color="#fff" />
            </Pressable>
          </LinearGradient>

          <View style={{ maxHeight: listMaxH }}>
            <FlatList
              data={profiles}
              keyExtractor={(i) => String(i.id)}
              contentContainerStyle={[
                styles.listPad,
                { paddingBottom: 16 + insets.bottom },
                profiles.length === 0 ? { flexGrow: 1, justifyContent: "center" } : null,
              ]}
              ListEmptyComponent={
                <View style={styles.emptyBox}>
                  <View style={styles.emptyCircle}>
                    <Heart size={44} color="#9ca3af" />
                  </View>
                  <Text style={styles.emptyH}>Пока нет лайков</Text>
                  <Text style={styles.emptyT}>Начните свайпать профили вправо, чтобы поставить лайк</Text>
                </View>
              }
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [styles.row, pressed && { borderColor: "#fecaca" }]}
                  onPress={() => onOpenProfile(item)}
                >
                  {item.photo ? <Image source={{ uri: item.photo }} style={styles.ph} /> : <View style={[styles.ph, styles.phE]} />}
                  <View style={styles.rowText}>
                    <Text style={styles.name}>
                      {item.name}, {item.age}
                    </Text>
                    {item.location ? <Text numberOfLines={1} style={styles.loc}>{item.location}</Text> : null}
                    {item.bio ? (
                      <Text numberOfLines={1} style={styles.bio}>
                        {item.bio}
                      </Text>
                    ) : null}
                  </View>
                  <Heart size={24} color={tw.red500} fill={tw.red500} style={styles.heartR} />
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  back: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 0,
  },
  card: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    width: "100%",
    alignSelf: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  headerIn: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  h1: { fontSize: 24, fontWeight: "800", color: "#fff" },
  xHit: { padding: 8, marginRight: -8 },
  listPad: { padding: 16, paddingBottom: 24, flexGrow: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#f3f4f6",
  },
  ph: { width: 80, height: 80, borderRadius: 12, backgroundColor: tw.stone200 },
  phE: { backgroundColor: tw.stone200 },
  rowText: { flex: 1, minWidth: 0 },
  name: { fontWeight: "800", fontSize: 18, color: tw.gray700 },
  loc: { fontSize: 14, color: tw.gray600, marginTop: 2 },
  bio: { fontSize: 14, color: tw.gray600, marginTop: 4 },
  heartR: { flexShrink: 0 },
  emptyBox: { paddingVertical: 32, paddingHorizontal: 12, alignItems: "center" },
  emptyCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyH: { fontSize: 20, fontWeight: "800", color: tw.gray700, marginBottom: 8, textAlign: "center" },
  emptyT: { fontSize: 15, color: tw.gray600, textAlign: "center", lineHeight: 22, maxWidth: 320 },
});
