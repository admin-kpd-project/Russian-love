import React, { useCallback, useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import { X, MessageCircle, Check, Trash2 } from "lucide-react-native";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import {
  listConversations,
  markConversationsRead,
  deleteConversation,
  type ConversationListItem,
} from "../../api/conversationsApi";
import { getApiBaseUrl } from "../../api/apiBase";
import { publicDisplayMediaUrl } from "../../utils/mediaUrl";
import { tw, brandGradients } from "../../theme/designTokens";

type Props = {
  visible: boolean;
  onClose: () => void;
  onPick: (item: ConversationListItem) => void;
};

function formatChatTime(iso: string): string {
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: ru });
  } catch {
    return "";
  }
}

export function ChatsListModal({ visible, onClose, onPick }: Props) {
  const insets = useSafeAreaInsets();
  const [rows, setRows] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    const r = await listConversations();
    setLoading(false);
    if (r.error) setErr(r.error);
    const base = (await getApiBaseUrl()) ?? "";
    const raw = r.data ?? [];
    setRows(
      base
        ? raw.map((it) => ({ ...it, avatar: publicDisplayMediaUrl(it.avatar, base) }))
        : raw,
    );
  }, []);

  useEffect(() => {
    if (!visible) return;
    void load();
  }, [visible, load]);

  useEffect(() => {
    if (!visible) {
      setSelectionMode(false);
      setSelectedIds(new Set());
    }
  }, [visible]);

  const unreadCount = rows.filter((r) => r.unread).length;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const onMarkAllRead = async () => {
    setBusy(true);
    const r = await markConversationsRead({ all: true });
    setBusy(false);
    if (r.error) {
      Alert.alert("Ошибка", r.error);
      return;
    }
    void load();
  };

  const onClearAll = () => {
    Alert.alert("Очистить все чаты?", "Все беседы будут удалены без восстановления.", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Удалить все",
        style: "destructive",
        onPress: () => void clearAllChats(),
      },
    ]);
  };

  const clearAllChats = async () => {
    setBusy(true);
    const ids = rows.map((r) => r.id);
    for (const id of ids) {
      const r = await deleteConversation(id);
      if (r.error) {
        setBusy(false);
        Alert.alert("Ошибка", r.error);
        return;
      }
    }
    setBusy(false);
    setSelectionMode(false);
    setSelectedIds(new Set());
    void load();
  };

  const onDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    Alert.alert("Удалить выбранные?", `Будет удалено чатов: ${selectedIds.size}`, [
      { text: "Отмена", style: "cancel" },
      {
        text: "Удалить",
        style: "destructive",
        onPress: () => void deleteSelected(),
      },
    ]);
  };

  const deleteSelected = async () => {
    setBusy(true);
    for (const id of selectedIds) {
      const r = await deleteConversation(id);
      if (r.error) {
        setBusy(false);
        Alert.alert("Ошибка", r.error);
        return;
      }
    }
    setBusy(false);
    setSelectedIds(new Set());
    setSelectionMode(false);
    void load();
  };

  const exitSelection = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.h1}>Сообщения</Text>
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
            <X size={24} color={tw.gray600} />
          </Pressable>
        </View>
        {err ? <Text style={styles.err}>{err}</Text> : null}

        <LinearGradient
          colors={brandGradients.primaryDark as unknown as string[]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          {selectionMode ? (
            <View style={styles.heroTop}>
              <Text style={styles.heroTitle}>Выбрано: {selectedIds.size}</Text>
              <Pressable onPress={exitSelection} hitSlop={8}>
                <Text style={styles.heroLink}>Готово</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={styles.heroTitle}>Личные чаты</Text>
              <Text style={styles.heroSub}>
                {unreadCount === 0 ? "Нет непрочитанных" : `${unreadCount} непрочитанных`}
              </Text>
            </>
          )}
          <View style={styles.heroActions}>
            <Pressable
              style={[styles.heroBtn, busy && styles.heroBtnDisabled]}
              onPress={onMarkAllRead}
              disabled={busy}
            >
              <Text style={styles.heroBtnText}>Отметить все прочитанными</Text>
            </Pressable>
            <Pressable
              style={[styles.heroBtn, busy && styles.heroBtnDisabled]}
              onPress={() => {
                if (selectionMode) exitSelection();
                else setSelectionMode(true);
              }}
              disabled={busy}
            >
              <Text style={styles.heroBtnText}>{selectionMode ? "Отменить выбор" : "Выбрать"}</Text>
            </Pressable>
            <Pressable
              style={[styles.heroBtnOutline, busy && styles.heroBtnDisabled]}
              onPress={onClearAll}
              disabled={busy}
            >
              <Text style={styles.heroBtnOutlineText}>Очистить все</Text>
            </Pressable>
          </View>
          {selectionMode && selectedIds.size > 0 ? (
            <Pressable style={styles.deleteBar} onPress={onDeleteSelected}>
              <Trash2 size={20} color="#fff" />
              <Text style={styles.deleteBarText}>Удалить выбранные</Text>
            </Pressable>
          ) : null}
        </LinearGradient>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 24 }} color={tw.red500} />
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(i) => i.id}
            contentContainerStyle={{ padding: 12, paddingBottom: insets.bottom + 24 }}
            ListEmptyComponent={<Text style={styles.empty}>Нет чатов</Text>}
            renderItem={({ item }) => {
              const selected = selectedIds.has(item.id);
              return (
                <Pressable
                  style={[styles.row, item.unread && !selectionMode && styles.rowUnread]}
                  onPress={() => {
                    if (selectionMode) toggleSelect(item.id);
                    else onPick(item);
                  }}
                >
                  {selectionMode ? (
                    <View style={[styles.check, selected && styles.checkOn]}>
                      {selected ? <Check size={16} color="#fff" /> : null}
                    </View>
                  ) : null}
                  {item.avatar ? (
                    <Image source={{ uri: item.avatar }} style={styles.av} />
                  ) : (
                    <View style={[styles.av, styles.avPh]} />
                  )}
                  <View style={{ flex: 1 }}>
                    <View style={styles.nameRow}>
                      <Text style={styles.name}>{item.name}</Text>
                      <Text style={styles.time}>{formatChatTime(item.timestamp)}</Text>
                    </View>
                    <Text numberOfLines={1} style={styles.last}>
                      {item.lastMessage || " "}
                    </Text>
                  </View>
                  {!selectionMode && item.unread ? (
                    <View style={styles.dot} />
                  ) : !selectionMode ? (
                    <MessageCircle size={20} color={tw.gray400} />
                  ) : null}
                </Pressable>
              );
            }}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tw.gray100 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: tw.gray200,
  },
  h1: { fontSize: 24, fontWeight: "800", color: tw.gray800 },
  closeBtn: { padding: 8, borderRadius: 999 },
  err: { color: "#b91c1c", textAlign: "center", marginTop: 8 },
  empty: { textAlign: "center", color: tw.gray500, marginTop: 32, fontSize: 15 },
  heroCard: {
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 20,
    padding: 16,
    overflow: "hidden",
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  heroTitle: { color: "#fff", fontSize: 20, fontWeight: "800" },
  heroSub: { color: "rgba(255,255,255,0.9)", fontSize: 15, marginTop: 4, fontWeight: "600" },
  heroLink: { color: "#fff", fontSize: 16, fontWeight: "700" },
  heroActions: { marginTop: 14, gap: 8 },
  heroBtn: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  heroBtnDisabled: { opacity: 0.5 },
  heroBtnText: { color: "#fff", fontSize: 14, fontWeight: "700", textAlign: "center" },
  heroBtnOutline: {
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.85)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  heroBtnOutlineText: { color: "#fff", fontSize: 14, fontWeight: "700", textAlign: "center" },
  deleteBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 12,
    paddingVertical: 12,
  },
  deleteBarText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: tw.gray200,
  },
  rowUnread: {
    borderColor: tw.red200,
    backgroundColor: tw.fromRed50,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: tw.gray400,
    alignItems: "center",
    justifyContent: "center",
  },
  checkOn: { backgroundColor: tw.red500, borderColor: tw.red500 },
  av: { width: 52, height: 52, borderRadius: 26, backgroundColor: tw.gray100 },
  avPh: { backgroundColor: tw.gray200 },
  nameRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontWeight: "700", fontSize: 16, color: tw.gray800, flex: 1 },
  time: { fontSize: 12, color: tw.gray500, marginLeft: 8 },
  last: { color: tw.gray600, marginTop: 2, fontSize: 14 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: tw.red500,
  },
});
