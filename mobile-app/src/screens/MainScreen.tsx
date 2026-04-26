import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { getFeed } from "../api/feedApi";
import { listConversations, createConversation } from "../api/conversationsApi";
import { logoutApi } from "../api/authApi";
import type { Profile } from "../api/authApi";
import type { ConversationListItem } from "../api/conversationsApi";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Main">;

export function MainScreen({ navigation }: Props) {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => navigation.navigate("Server", { reconfigure: true })} style={{ paddingRight: 8, paddingLeft: 8 }}>
          <Text style={{ color: "#b45309", fontWeight: "600" }}>Сервер</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  const [tab, setTab] = useState<"feed" | "chats">("feed");
  const [feed, setFeed] = useState<Profile[] | null>(null);
  const [chats, setChats] = useState<ConversationListItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const loadFeed = useCallback(async () => {
    setErr(null);
    setLoading(true);
    const r = await getFeed();
    setLoading(false);
    if (r.error) setErr(r.error);
    setFeed(r.data ?? []);
  }, []);

  const loadChats = useCallback(async () => {
    setErr(null);
    setLoading(true);
    const r = await listConversations();
    setLoading(false);
    if (r.error) setErr(r.error);
    setChats(r.data ?? []);
  }, []);

  useEffect(() => {
    if (tab === "feed" && feed === null) void loadFeed();
  }, [tab, feed, loadFeed]);

  useEffect(() => {
    if (tab === "chats" && chats === null) void loadChats();
  }, [tab, chats, loadChats]);

  const onRefresh = () => {
    if (tab === "feed") void loadFeed();
    else void loadChats();
  };

  const openOrCreateChat = async (user: Profile) => {
    setLoading(true);
    const c = await createConversation(user.id);
    setLoading(false);
    if (c.error || !c.data) {
      setErr(c.error || "Не удалось открыть чат");
      return;
    }
    navigation.navigate("Chat", { conversationId: c.data.id, title: user.name });
  };

  const onLogout = async () => {
    await logoutApi();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <View style={styles.tabs}>
          <Pressable
            onPress={() => {
              setTab("feed");
            }}
            style={[styles.tab, tab === "feed" && styles.tabOn]}
          >
            <Text style={styles.tabT}>Лента</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setTab("chats");
            }}
            style={[styles.tab, tab === "chats" && styles.tabOn]}
          >
            <Text style={styles.tabT}>Чаты</Text>
          </Pressable>
        </View>
        <Pressable onPress={onLogout}>
          <Text style={styles.out}>Выход</Text>
        </Pressable>
      </View>
      {err ? <Text style={styles.err}>{err}</Text> : null}
      {tab === "feed" && (
        <FlatList
          data={feed ?? []}
          keyExtractor={(i) => i.id}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
          ListEmptyComponent={loading ? <ActivityIndicator style={{ marginTop: 24 }} /> : <Text style={styles.empty}>Нет анкет</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item.photo ? <Image source={{ uri: item.photo }} style={styles.ph} /> : <View style={[styles.ph, styles.phPl]} />}
              <Text style={styles.name}>
                {item.name}, {item.age}
              </Text>
              <Text numberOfLines={2} style={styles.bio}>
                {item.bio || ""}
              </Text>
              <Pressable style={styles.write} onPress={() => openOrCreateChat(item)} disabled={loading}>
                <Text style={styles.writeT}>Написать</Text>
              </Pressable>
            </View>
          )}
        />
      )}
      {tab === "chats" && (
        <FlatList
          data={chats ?? []}
          keyExtractor={(i) => i.id}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
          ListEmptyComponent={loading ? <ActivityIndicator style={{ marginTop: 24 }} /> : <Text style={styles.empty}>Нет чатов</Text>}
          renderItem={({ item }) => (
            <Pressable
              style={styles.chatRow}
              onPress={() => navigation.navigate("Chat", { conversationId: item.id, title: item.name })}
            >
              {item.avatar ? <Image source={{ uri: item.avatar }} style={styles.avatarSm} /> : <View style={[styles.avatarSm, styles.phPl]} />}
              <View style={styles.chatText}>
                <Text style={styles.cname}>{item.name}</Text>
                <Text numberOfLines={1} style={styles.last}>
                  {item.lastMessage}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff8f5" },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 12, paddingTop: 8 },
  tabs: { flexDirection: "row", gap: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#e7e5e4" },
  tabOn: { backgroundColor: "#fecaca" },
  tabT: { fontWeight: "600" },
  out: { color: "#b91c1c" },
  err: { color: "#b91c1c", textAlign: "center", marginBottom: 4 },
  empty: { textAlign: "center", color: "#78716c", marginTop: 24 },
  card: { marginHorizontal: 12, marginBottom: 12, padding: 12, backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#e7e5e4" },
  ph: { width: "100%", height: 200, borderRadius: 12, marginBottom: 8, backgroundColor: "#f5f5f4" },
  phPl: { backgroundColor: "#d6d3d1" },
  name: { fontSize: 18, fontWeight: "700" },
  bio: { color: "#57534e", marginVertical: 4 },
  write: { marginTop: 8, backgroundColor: "#dc2626", borderRadius: 10, padding: 10, alignItems: "center" },
  writeT: { color: "#fff", fontWeight: "600" },
  chatRow: { flexDirection: "row", padding: 12, marginHorizontal: 8, marginBottom: 4, backgroundColor: "#fff", borderRadius: 12, alignItems: "center", gap: 10 },
  avatarSm: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#e7e5e4" },
  cname: { fontWeight: "600", fontSize: 16 },
  last: { color: "#78716c", fontSize: 14 },
  chatText: { flex: 1 },
});
