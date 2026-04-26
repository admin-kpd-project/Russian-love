import React, { useMemo, useState } from "react";
import { Modal, View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { X, Calendar, MapPin, Clock } from "lucide-react-native";

import {
  generateEventPicksForProfile,
  type EventCategoryRu,
  type GeneratedEventPick,
} from "../../data/eventTemplates";

export type EventPick = GeneratedEventPick;

const CATS: (EventCategoryRu | "все")[] = ["все", "романтика", "культура", "активность", "еда", "развлечения"];

type Props = {
  visible: boolean;
  profileName: string;
  onClose: () => void;
  onPick: (eventTitle: string, eventDescription: string) => void;
};

export function EventsPickerModal({ visible, profileName, onClose, onPick }: Props) {
  const [cat, setCat] = useState<(typeof CATS)[number]>("все");
  const events = useMemo(() => generateEventPicksForProfile(profileName), [profileName]);
  const filtered = useMemo(
    () => (cat === "все" ? events : events.filter((e) => e.category === cat)),
    [events, cat]
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.back} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.head}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Calendar size={22} color="#d97706" />
              <Text style={styles.headT}>Куда сходить вместе</Text>
            </View>
            <Pressable onPress={onClose} style={styles.close}>
              <X size={22} color="#78716c" />
            </Pressable>
          </View>
          <Text style={styles.sub}>Идеи для встречи с {profileName}</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chips}>
            {CATS.map((c) => {
              const on = cat === c;
              return (
                <Pressable key={c} onPress={() => setCat(c)} style={[styles.chip, on && styles.chipOn]}>
                  <Text style={[styles.chipT, on && styles.chipTOn]}>{c === "все" ? "Все" : c}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {filtered.map((ev) => (
              <Pressable
                key={ev.id}
                onPress={() => {
                  const price = ev.priceLine ? ` Стоимость: ${ev.priceLine}.` : "";
                  const msg = `Приглашаю на «${ev.title}» (${ev.dateLine}): ${ev.description}.${price} Место: ${ev.location}. Организатор: ${ev.organizer}.`;
                  onPick(ev.title, msg);
                }}
                style={styles.card}
              >
                <LinearGradient colors={["#fef2f2", "#fffbeb"]} style={styles.cardIn}>
                  <View style={styles.tagRow}>
                    <Text style={styles.tag}>{ev.category}</Text>
                    <Text style={styles.dateL}>{ev.dateLine}</Text>
                  </View>
                  <Text style={styles.cardT}>{ev.title}</Text>
                  <Text style={styles.cardD}>{ev.description}</Text>
                  {ev.priceLine ? <Text style={styles.price}>{ev.priceLine}</Text> : null}
                  <View style={styles.meta}>
                    <MapPin size={14} color="#78716c" />
                    <Text style={styles.metaT}>{ev.location}</Text>
                  </View>
                  {ev.hours ? (
                    <View style={styles.meta}>
                      <Clock size={14} color="#78716c" />
                      <Text style={styles.metaT}>{ev.hours}</Text>
                    </View>
                  ) : null}
                  <LinearGradient colors={["#ef4444", "#f59e0b"]} style={styles.invite}>
                    <Text style={styles.inviteT}>Пригласить в чат</Text>
                  </LinearGradient>
                </LinearGradient>
              </Pressable>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  back: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "88%",
    paddingBottom: 24,
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headT: { fontSize: 18, fontWeight: "800", color: "#1c1917" },
  close: { padding: 8 },
  sub: { paddingHorizontal: 18, color: "#57534e", marginBottom: 8 },
  chipsScroll: { maxHeight: 44, marginBottom: 8 },
  chips: { paddingHorizontal: 14, gap: 8, flexDirection: "row", alignItems: "center" },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#f5f5f4",
    borderWidth: 1,
    borderColor: "#e7e5e4",
  },
  chipOn: { backgroundColor: "#fff7ed", borderColor: "#fdba74" },
  chipT: { fontSize: 12, fontWeight: "700", color: "#57534e" },
  chipTOn: { color: "#c2410c" },
  scroll: { paddingHorizontal: 14 },
  card: { marginBottom: 12 },
  cardIn: { borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#fecaca" },
  tagRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  tag: { fontSize: 11, fontWeight: "800", color: "#9333ea", textTransform: "capitalize" },
  dateL: { fontSize: 11, color: "#78716c", fontWeight: "600" },
  cardT: { fontWeight: "800", fontSize: 16, color: "#1c1917", marginBottom: 6 },
  cardD: { fontSize: 14, color: "#57534e", marginBottom: 6 },
  price: { fontSize: 13, fontWeight: "700", color: "#b45309", marginBottom: 6 },
  meta: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  metaT: { fontSize: 12, color: "#78716c", flex: 1 },
  invite: { marginTop: 10, borderRadius: 999, paddingVertical: 10, alignItems: "center" },
  inviteT: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
