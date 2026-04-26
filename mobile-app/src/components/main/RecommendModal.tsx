import React, { useState } from "react";
import { Modal, View, Text, Pressable, StyleSheet, ScrollView, Image, Platform } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { X, UsersRound, Send, Check } from "lucide-react-native";

import type { UserProfile } from "../../utils/compatibilityAI";
import { brandGradients, tw } from "../../theme/designTokens";

type Props = {
  visible: boolean;
  profileToRecommend: UserProfile | null;
  availableFriends: UserProfile[];
  onClose: () => void;
};

export function RecommendModal({ visible, profileToRecommend, availableFriends, onClose }: Props) {
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [success, setSuccess] = useState(false);

  if (!profileToRecommend) return null;

  const send = () => {
    if (!selectedId) return;
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setSelectedId(null);
      onClose();
    }, 1200);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.back} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <LinearGradient colors={[...brandGradients.primary]} style={styles.head}>
            <View style={styles.headRow}>
              <View style={styles.icoBg}>
                <UsersRound size={26} color="#fff" />
              </View>
              <View style={styles.headTxt}>
                <Text style={styles.headT}>Рекомендовать профиль</Text>
                <Text style={styles.headS}>Познакомьте друзей</Text>
              </View>
              <Pressable style={styles.x} onPress={onClose} hitSlop={6}>
                <X size={24} color="#fff" />
              </Pressable>
            </View>
          </LinearGradient>

          <ScrollView style={styles.body}>
            <Text style={styles.lbl}>Вы рекомендуете:</Text>
            <LinearGradient colors={["#fef2f2", "#fffbeb"]} style={styles.card}>
              {profileToRecommend.photo ? (
                <Image source={{ uri: profileToRecommend.photo }} style={styles.av} />
              ) : (
                <View style={[styles.av, styles.avPh]} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>
                  {profileToRecommend.name}, {profileToRecommend.age}
                </Text>
                <Text style={styles.loc}>{profileToRecommend.location}</Text>
              </View>
            </LinearGradient>

            <Text style={styles.lbl2}>Выберите друга из ваших матчей:</Text>
            {availableFriends.length === 0 ? (
              <Text style={styles.empty}>Пока нет профилей в лайках — поставьте симпатии в ленте.</Text>
            ) : (
              availableFriends.map((friend) => {
                const sel = selectedId === friend.id;
                return (
                  <Pressable
                    key={String(friend.id)}
                    onPress={() => setSelectedId(friend.id)}
                    style={styles.friendOuter}
                  >
                    {sel ? (
                      <LinearGradient
                        colors={["#fef2f2", "#fffbeb"]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.friendSelected}
                      >
                        {friend.photo ? <Image source={{ uri: friend.photo }} style={styles.fav} /> : <View style={[styles.fav, styles.avPh]} />}
                        <View style={{ flex: 1 }}>
                          <Text style={styles.fn}>
                            {friend.name}, {friend.age}
                          </Text>
                          <Text style={styles.fl}>{friend.location}</Text>
                        </View>
                        <Check size={22} color={tw.red500} />
                      </LinearGradient>
                    ) : (
                      <View style={styles.friend}>
                        {friend.photo ? <Image source={{ uri: friend.photo }} style={styles.fav} /> : <View style={[styles.fav, styles.avPh]} />}
                        <View style={{ flex: 1 }}>
                          <Text style={styles.fn}>
                            {friend.name}, {friend.age}
                          </Text>
                          <Text style={styles.fl}>{friend.location}</Text>
                        </View>
                      </View>
                    )}
                  </Pressable>
                );
              })
            )}

            <Pressable style={[styles.send, (!selectedId || success) && styles.sendOff]} onPress={send} disabled={!selectedId || success}>
              {success ? (
                <>
                  <Check size={22} color="#fff" />
                  <Text style={styles.sendT}>Рекомендация отправлена!</Text>
                </>
              ) : (
                <>
                  <Send size={22} color="#fff" />
                  <Text style={styles.sendT}>Отправить рекомендацию</Text>
                </>
              )}
            </Pressable>
            <Text style={styles.hint}>Ваш друг получит уведомление о рекомендации</Text>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  back: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16 },
  sheet: { backgroundColor: "#fff", borderRadius: 24, maxHeight: "88%", overflow: "hidden" },
  head: { paddingHorizontal: 16, paddingVertical: 16, paddingTop: 18 },
  headRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  icoBg: { width: 48, height: 48, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.22)", alignItems: "center", justifyContent: "center" },
  headTxt: { flex: 1, minWidth: 0 },
  x: { padding: 8, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.2)" },
  headT: { fontSize: 19, fontWeight: "800", color: "#fff" },
  headS: { fontSize: 13, color: "rgba(255,255,255,0.9)", marginTop: 2 },
  body: { padding: 18 },
  lbl: { fontSize: 13, color: "#78716c", marginBottom: 8 },
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, marginBottom: 18, borderWidth: 1, borderColor: "#fecaca" },
  av: { width: 56, height: 56, borderRadius: 28 },
  avPh: { backgroundColor: "#d6d3d1" },
  name: { fontWeight: "800", fontSize: 17, color: "#292524" },
  loc: { fontSize: 13, color: "#78716c", marginTop: 2 },
  lbl2: { fontSize: 13, color: "#78716c", marginBottom: 8 },
  empty: { color: "#78716c", marginBottom: 12 },
  friendOuter: { marginBottom: 8, borderRadius: 16, overflow: "hidden" },
  friend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    backgroundColor: "#fafaf9",
    borderWidth: 2,
    borderColor: tw.gray200,
    borderRadius: 16,
    ...Platform.select({
      ios: { shadowColor: "#1c1917", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 },
      default: { elevation: 0 },
    }),
  },
  friendSelected: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: "#f97316",
    borderRadius: 16,
  },
  fav: { width: 48, height: 48, borderRadius: 24 },
  fn: { fontWeight: "700", color: "#292524" },
  fl: { fontSize: 12, color: "#78716c" },
  send: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#ea580c",
    paddingVertical: 16,
    borderRadius: 14,
  },
  sendOff: { backgroundColor: "#d6d3d1" },
  sendT: { color: "#fff", fontWeight: "800", fontSize: 16 },
  hint: { fontSize: 11, color: "#a8a29e", textAlign: "center", marginTop: 10, marginBottom: 16 },
});
