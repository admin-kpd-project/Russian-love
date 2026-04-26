import React from "react";
import { Modal, View, Text, Pressable, StyleSheet, FlatList, Image } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { X, Heart } from "lucide-react-native";
import type { UserProfile } from "../../utils/compatibilityAI";

type Props = {
  visible: boolean;
  profiles: UserProfile[];
  onClose: () => void;
  onOpenProfile: (p: UserProfile) => void;
};

export function LikesModal({ visible, profiles, onClose, onOpenProfile }: Props) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <LinearGradient colors={["#fef2f2", "#fff"]} style={styles.header}>
          <Heart size={22} color="#ef4444" fill="#fecaca" />
          <Text style={styles.h1}>Симпатии</Text>
          <Pressable onPress={onClose} style={styles.x}>
            <X size={24} color="#44403c" />
          </Pressable>
        </LinearGradient>
        <FlatList
          data={profiles}
          keyExtractor={(i) => String(i.id)}
          contentContainerStyle={{ padding: 12 }}
          ListEmptyComponent={<Text style={styles.empty}>Пока никого не лайкнули</Text>}
          renderItem={({ item }) => (
            <Pressable style={styles.row} onPress={() => onOpenProfile(item)}>
              {item.photo ? <Image source={{ uri: item.photo }} style={styles.ph} /> : <View style={[styles.ph, styles.phE]} />}
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>
                  {item.name}, {item.age}
                </Text>
                <Text numberOfLines={1} style={styles.bio}>
                  {item.bio}
                </Text>
              </View>
            </Pressable>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff7ed" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#fecaca",
  },
  h1: { flex: 1, fontSize: 20, fontWeight: "800", color: "#1c1917" },
  x: { padding: 8 },
  empty: { textAlign: "center", color: "#78716c", marginTop: 32 },
  row: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e7e5e4",
  },
  ph: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#e7e5e4" },
  phE: { backgroundColor: "#d6d3d1" },
  name: { fontWeight: "700", fontSize: 16 },
  bio: { color: "#78716c", fontSize: 13, marginTop: 2 },
});
