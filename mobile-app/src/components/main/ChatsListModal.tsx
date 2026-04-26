import React, { useEffect, useState } from "react";
import { Modal, View, Text, Pressable, StyleSheet, FlatList, Image, ActivityIndicator } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { X, MessageCircle } from "lucide-react-native";
import { listConversations, type ConversationListItem } from "../../api/conversationsApi";

type Props = {
  visible: boolean;
  onClose: () => void;
  onPick: (item: ConversationListItem) => void;
};

export function ChatsListModal({ visible, onClose, onPick }: Props) {
  const [rows, setRows] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    let c = false;
    void (async () => {
      setLoading(true);
      setErr(null);
      const r = await listConversations();
      if (c) return;
      setLoading(false);
      if (r.error) setErr(r.error);
      setRows(r.data ?? []);
    })();
    return () => {
      c = true;
    };
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <LinearGradient colors={["#fff", "#fffbeb"]} style={styles.header}>
          <Text style={styles.h1}>Сообщения</Text>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <X size={24} color="#44403c" />
          </Pressable>
        </LinearGradient>
        {err ? <Text style={styles.err}>{err}</Text> : null}
        {loading ? (
          <ActivityIndicator style={{ marginTop: 24 }} color="#ef4444" />
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(i) => i.id}
            contentContainerStyle={{ padding: 12 }}
            ListEmptyComponent={<Text style={styles.empty}>Нет чатов</Text>}
            renderItem={({ item }) => (
              <Pressable style={styles.row} onPress={() => onPick(item)}>
                {item.avatar ? (
                  <Image source={{ uri: item.avatar }} style={styles.av} />
                ) : (
                  <View style={[styles.av, styles.avPh]} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text numberOfLines={1} style={styles.last}>
                    {item.lastMessage}
                  </Text>
                </View>
                <MessageCircle size={20} color="#a8a29e" />
              </Pressable>
            )}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff7ed" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#e7e5e4",
  },
  h1: { fontSize: 20, fontWeight: "800", color: "#1c1917" },
  closeBtn: { padding: 8 },
  err: { color: "#b91c1c", textAlign: "center", marginTop: 8 },
  empty: { textAlign: "center", color: "#78716c", marginTop: 32 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f5f5f4",
  },
  av: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#e7e5e4" },
  avPh: { backgroundColor: "#d6d3d1" },
  name: { fontWeight: "700", fontSize: 16, color: "#1c1917" },
  last: { color: "#78716c", marginTop: 2 },
});
