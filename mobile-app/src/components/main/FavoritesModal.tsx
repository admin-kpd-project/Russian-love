import React from "react";
import { Modal, View, Text, Pressable, StyleSheet, FlatList, Image } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { X, Bookmark } from "lucide-react-native";
import { useFavorites } from "../../context/FavoritesContext";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function FavoritesModal({ visible, onClose }: Props) {
  const { favorites, removeFromFavorites } = useFavorites();
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <LinearGradient colors={["#f59e0b", "#d97706"]} style={styles.header}>
          <Bookmark size={22} color="#fff" fill="#fff" />
          <View style={{ flex: 1 }}>
            <Text style={styles.h1}>Избранное</Text>
            <Text style={styles.sub}>
              {favorites.length}{" "}
              {favorites.length === 1 ? "профиль" : favorites.length < 5 ? "профиля" : "профилей"}
            </Text>
          </View>
          <Pressable onPress={onClose} style={styles.x}>
            <X size={24} color="#fff" />
          </Pressable>
        </LinearGradient>
        <FlatList
          data={favorites}
          keyExtractor={(i) => i.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 10, paddingHorizontal: 12 }}
          contentContainerStyle={{ paddingVertical: 12, gap: 10 }}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <LinearGradient colors={["#f59e0b", "#d97706"]} style={styles.emptyIco}>
                <Bookmark size={40} color="#fff" fill="#fff" />
              </LinearGradient>
              <Text style={styles.emptyH}>Нет избранных профилей</Text>
              <Text style={styles.emptyT}>Добавляйте профили кнопкой закладки на карточке</Text>
              <Pressable onPress={onClose}>
                <LinearGradient colors={["#f59e0b", "#d97706"]} style={styles.cta}>
                  <Text style={styles.ctaT}>Начать просмотр</Text>
                </LinearGradient>
              </Pressable>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item.photos[0] ? (
                <Image source={{ uri: item.photos[0] }} style={styles.img} />
              ) : (
                <View style={[styles.img, styles.imgPh]} />
              )}
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              <Pressable style={styles.rm} onPress={() => removeFromFavorites(item.id)}>
                <Text style={styles.rmT}>Убрать</Text>
              </Pressable>
            </View>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fffbeb" },
  header: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16 },
  h1: { fontSize: 22, fontWeight: "800", color: "#fff" },
  sub: { color: "rgba(255,255,255,0.92)", fontSize: 13, marginTop: 2 },
  x: { padding: 8 },
  emptyWrap: { alignItems: "center", padding: 32, marginTop: 24 },
  emptyIco: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  emptyH: { fontSize: 22, fontWeight: "800", color: "#292524", marginBottom: 8 },
  emptyT: { color: "#57534e", textAlign: "center", marginBottom: 20, maxWidth: 280 },
  cta: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999 },
  ctaT: { color: "#fff", fontWeight: "700" },
  card: {
    flex: 1,
    maxWidth: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e7e5e4",
  },
  img: { width: "100%", aspectRatio: 3 / 4, backgroundColor: "#fecdd3" },
  imgPh: { backgroundColor: "#e7e5e4" },
  name: { padding: 8, fontWeight: "700", color: "#1c1917" },
  rm: { padding: 8, alignItems: "center" },
  rmT: { color: "#b91c1c", fontWeight: "600", fontSize: 13 },
});
