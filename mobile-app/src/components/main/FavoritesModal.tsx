import React from "react";
import { Modal, View, Text, Pressable, StyleSheet, FlatList, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import { X, Bookmark } from "lucide-react-native";
import { useFavorites } from "../../context/FavoritesContext";
import { brandGradients, tw } from "../../theme/designTokens";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function FavoritesModal({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { favorites, removeFromFavorites } = useFavorites();
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={[...brandGradients.favorite]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.header}
        >
          <View style={styles.headerIconWrap}>
            <Bookmark size={24} color="#fff" fill="#fff" />
          </View>
          <View style={{ flex: 1, marginLeft: 2 }}>
            <Text style={styles.h1}>Избранное</Text>
            <Text style={styles.sub}>
              {favorites.length}{" "}
              {favorites.length === 1 ? "профиль" : favorites.length < 5 ? "профиля" : "профилей"}
            </Text>
          </View>
          <Pressable onPress={onClose} style={styles.xCircle}>
            <X size={24} color="#fff" />
          </Pressable>
        </LinearGradient>
        <FlatList
          data={favorites}
          keyExtractor={(i) => i.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 10, paddingHorizontal: 12 }}
          contentContainerStyle={{ paddingVertical: 12, paddingBottom: 12 + insets.bottom, gap: 10 }}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <LinearGradient colors={[...brandGradients.favorite]} style={styles.emptyIco}>
                <Bookmark size={40} color="#fff" fill="#fff" />
              </LinearGradient>
              <Text style={styles.emptyH}>Нет избранных профилей</Text>
              <Text style={styles.emptyT}>
                Добавляйте профили в избранное, нажимая на кнопку с закладкой на карточках
              </Text>
              <Pressable onPress={onClose}>
                <LinearGradient colors={[...brandGradients.favorite]} style={styles.cta}>
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
  root: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 20, paddingVertical: 20 },
  headerIconWrap: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  h1: { fontSize: 24, fontWeight: "800", color: "#fff" },
  sub: { color: "rgba(255,255,255,0.9)", fontSize: 14, marginTop: 2 },
  xCircle: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.2)" },
  emptyWrap: { alignItems: "center", padding: 32, marginTop: 16 },
  emptyIco: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  emptyH: { fontSize: 24, fontWeight: "800", color: tw.gray800, marginBottom: 8 },
  emptyT: { color: tw.gray600, textAlign: "center", marginBottom: 20, maxWidth: 320, lineHeight: 22, fontSize: 15 },
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
    borderColor: tw.gray200,
  },
  img: { width: "100%", aspectRatio: 3 / 4, backgroundColor: tw.gray100 },
  imgPh: { backgroundColor: tw.gray200 },
  name: { padding: 8, fontWeight: "700", color: tw.gray800 },
  rm: { padding: 8, alignItems: "center" },
  rmT: { color: "#b91c1c", fontWeight: "600", fontSize: 13 },
});
