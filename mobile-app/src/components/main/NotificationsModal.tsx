import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Platform,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import { X, Heart, Star, MessageCircle, UserPlus, Gift, Send } from "lucide-react-native";

import { getNotifications, markNotificationsRead, type NotificationItem } from "../../api/notificationsApi";
import { brandGradients, tw } from "../../theme/designTokens";

type Props = {
  visible: boolean;
  onClose: () => void;
  onOpenChat: (p: {
    userName: string;
    userAvatar: string;
    conversationId?: string;
    peerUserId?: string;
  }) => void;
};

function iconFor(type: NotificationItem["type"]) {
  const s = 22;
  switch (type) {
    case "match":
      return <Heart size={s} color={tw.red500} />;
    case "superlike":
      return <Star size={s} color={tw.amber500} />;
    case "like":
      return <Heart size={s} color="#ec4899" />;
    case "message":
      return <MessageCircle size={s} color="#3b82f6" />;
    case "new":
      return <UserPlus size={s} color="#22c55e" />;
    default:
      return <Gift size={s} color="#a855f7" />;
  }
}

function iconBg(type: NotificationItem["type"]): string {
  switch (type) {
    case "match":
      return "#fef2f2";
    case "superlike":
      return "#fffbeb";
    case "like":
      return "#fdf2f8";
    case "message":
      return "#eff6ff";
    case "new":
      return "#f0fdf4";
    default:
      return "#faf5ff";
  }
}

export function NotificationsModal({ visible, onClose, onOpenChat }: Props) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    let c = false;
    void (async () => {
      setLoading(true);
      setError(null);
      const res = await getNotifications();
      if (c) return;
      setLoading(false);
      if (res.error) {
        setError(res.error);
        setItems([]);
        return;
      }
      setItems(res.data ?? []);
    })();
    return () => {
      c = true;
    };
  }, [visible]);

  const insets = useSafeAreaInsets();
  const sheetMaxH = Dimensions.get("window").height * 0.88;
  const unread = items.filter((n) => !n.read).length;
  const unreadLabel =
    unread === 0
      ? "Всё прочитано"
      : `${unread} ${unread === 1 ? "непрочитанное" : "непрочитанных"}`;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.back} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { maxHeight: sheetMaxH, marginBottom: Math.max(insets.bottom, 8) }]}
          onPress={(e) => e.stopPropagation()}
        >
          <LinearGradient colors={[...brandGradients.primary]} style={styles.head}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headT}>Уведомления</Text>
              <Text style={styles.headS}>{unreadLabel}</Text>
            </View>
            <Pressable onPress={onClose} style={styles.headX} hitSlop={6}>
              <X size={26} color="#fff" />
            </Pressable>
          </LinearGradient>

          <ScrollView style={styles.list} contentContainerStyle={styles.listIn} bounces>
            {loading ? (
              <ActivityIndicator style={{ marginVertical: 40 }} color="#78716c" />
            ) : error ? (
              <Text style={styles.err}>{error}</Text>
            ) : items.length === 0 ? (
              <View style={styles.empty}>
                <LinearGradient colors={["#fee2e2", "#fef3c7"]} style={styles.emptyIco}>
                  <MessageCircle size={48} color={tw.red500} />
                </LinearGradient>
                <Text style={styles.emptyT}>Нет новых уведомлений</Text>
              </View>
            ) : (
              items.map((n) => (
                <View
                  key={n.id}
                  style={[
                    styles.row,
                    !n.read ? styles.rowUnread : styles.rowRead,
                  ]}
                >
                  <View style={[styles.icoWrap, { backgroundColor: iconBg(n.type) }]}>
                    {n.avatar ? (
                      <Image source={{ uri: n.avatar }} style={styles.avatar} />
                    ) : (
                      iconFor(n.type)
                    )}
                  </View>
                  <View style={styles.body}>
                    <View style={styles.titleR}>
                      <Text style={styles.title}>{n.title}</Text>
                      {!n.read ? <View style={styles.dot} /> : null}
                    </View>
                    <Text style={styles.msg}>{n.message}</Text>
                    <Text style={styles.time}>{n.timestamp}</Text>
                    {n.avatar && n.userName ? (
                      <Pressable
                        onPress={() => {
                          onClose();
                          onOpenChat({
                            userName: n.userName!,
                            userAvatar: n.avatar!,
                            conversationId: n.conversationId,
                            peerUserId: n.peerUserId,
                          });
                        }}
                        style={styles.writeWrap}
                      >
                        <LinearGradient colors={[...brandGradients.primary]} style={styles.writeBtn}>
                          <Send size={16} color="#fff" />
                          <Text style={styles.writeT}>Написать</Text>
                        </LinearGradient>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          {items.length > 0 ? (
            <View style={styles.foot}>
              <Pressable
                onPress={async () => {
                  await markNotificationsRead();
                  setItems((prev) => prev.map((x) => ({ ...x, read: true })));
                }}
              >
                <Text style={styles.markAll}>Отметить все как прочитанные</Text>
              </Pressable>
            </View>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  back: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16 },
  sheet: {
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.18, shadowRadius: 20 },
      android: { elevation: 12 },
    }),
  },
  head: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", paddingHorizontal: 22, paddingTop: 18, paddingBottom: 18 },
  headT: { fontSize: 22, fontWeight: "800", color: "#fff" },
  headS: { fontSize: 14, color: "rgba(255,255,255,0.9)", marginTop: 4, fontWeight: "600" },
  headX: { padding: 8, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.2)" },
  list: { maxHeight: 360 },
  listIn: { padding: 16, paddingBottom: 8 },
  err: { textAlign: "center", color: "#b91c1c", paddingVertical: 24 },
  empty: { alignItems: "center", paddingVertical: 28 },
  emptyIco: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  emptyT: { color: "#57534e" },
  row: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e7e5e4",
    ...Platform.select({
      ios: { shadowColor: "#1c1917", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },
  rowUnread: { backgroundColor: "#fff7ed", borderColor: "#ffedd5" },
  rowRead: { backgroundColor: "#fff", borderColor: "#f5f5f4" },
  icoWrap: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  body: { flex: 1, minWidth: 0 },
  titleR: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 4 },
  title: { flex: 1, fontWeight: "700", fontSize: 14, color: "#292524" },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: tw.red500, marginTop: 4 },
  msg: { fontSize: 13, color: "#57534e", marginBottom: 4 },
  time: { fontSize: 11, color: "#a8a29e" },
  writeWrap: { marginTop: 10, alignSelf: "flex-start" },
  writeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  writeT: { color: "#fff", fontWeight: "700", fontSize: 13 },
  foot: { paddingHorizontal: 22, paddingVertical: 14, borderTopWidth: 1, borderTopColor: "#f5f5f4" },
  markAll: { textAlign: "center", color: tw.red500, fontWeight: "600", fontSize: 14 },
});
