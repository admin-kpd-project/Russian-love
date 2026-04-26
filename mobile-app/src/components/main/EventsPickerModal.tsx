import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { addMonths, eachDayOfInterval, endOfMonth, format, isSameDay, startOfMonth, subMonths } from "date-fns";
import { ru } from "date-fns/locale";
import LinearGradient from "react-native-linear-gradient";
import { X, Calendar, MapPin, Clock, ChevronLeft, ChevronRight } from "lucide-react-native";

import {
  generateEventPicksForProfile,
  type EventCategoryRu,
  type GeneratedEventPick,
} from "../../data/eventTemplates";
import { tw, brandGradients } from "../../theme/designTokens";

export type EventPick = GeneratedEventPick;

const CATS: (EventCategoryRu | "все")[] = ["все", "романтика", "культура", "активность", "еда", "развлечения"];

const PRICE: ("все" | "бесплатные" | "платные")[] = ["все", "бесплатные", "платные"];

type Tab = "list" | "calendar";

const WEEK_RU = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];

type Props = {
  visible: boolean;
  profileName: string;
  onClose: () => void;
  onPick: (eventTitle: string, eventDescription: string) => void;
};

function parseLocalDate(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function EventsPickerModal({ visible, profileName, onClose, onPick }: Props) {
  const [tab, setTab] = useState<Tab>("list");
  const [cat, setCat] = useState<(typeof CATS)[number]>("все");
  const [price, setPrice] = useState<(typeof PRICE)[number]>("все");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const events = useMemo(() => generateEventPicksForProfile(profileName), [profileName]);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    events.forEach((e) => e.tags.forEach((t) => s.add(t)));
    return [...s].sort();
  }, [events]);

  const filtered = useMemo(() => {
    let e = events;
    if (cat !== "все") e = e.filter((x) => x.category === cat);
    if (price === "бесплатные") e = e.filter((x) => x.isFree);
    if (price === "платные") e = e.filter((x) => !x.isFree);
    if (tagFilter) e = e.filter((x) => x.tags.includes(tagFilter));
    return e;
  }, [events, cat, price, tagFilter]);

  const M = events.length;
  const k = filtered.length;

  const forList = useMemo(() => {
    if (tab !== "list") return [];
    return filtered;
  }, [tab, filtered]);

  const eventsByDate = useMemo(() => {
    const m: Record<string, number> = {};
    filtered.forEach((e) => {
      m[e.dateKey] = (m[e.dateKey] ?? 0) + 1;
    });
    return m;
  }, [filtered]);

  const forCalendarDay = useMemo(() => {
    if (!selectedDateKey) return [];
    return filtered.filter((e) => e.dateKey === selectedDateKey);
  }, [filtered, selectedDateKey]);

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const daysInView = useMemo(
    () => eachDayOfInterval({ start: monthStart, end: monthEnd }),
    [monthStart, monthEnd]
  );
  const lead = (monthStart.getDay() + 6) % 7;
  const cells: (Date | "pad")[] = useMemo(() => {
    const pads: ("pad")[] = Array(lead).fill("pad");
    return [...pads, ...daysInView];
  }, [lead, daysInView]);

  const resetFilters = () => {
    setCat("все");
    setPrice("все");
    setTagFilter(null);
    setSelectedDateKey(null);
  };

  useEffect(() => {
    if (!visible) return;
    setTab("list");
    setCat("все");
    setPrice("все");
    setTagFilter(null);
    setSelectedDateKey(null);
    setViewDate(new Date());
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.back} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.head}>
            <View style={styles.headLeft}>
              <Calendar size={22} color="#d97706" />
              <View>
                <Text style={styles.headT}>Куда сходить вместе</Text>
                <Text style={styles.sub}>Идеи для встречи с {profileName}</Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={styles.close} hitSlop={8}>
              <X size={22} color="#78716c" />
            </Pressable>
          </View>

          <View style={styles.tabRow}>
            {(["list", "calendar"] as const).map((t) => {
              const on = tab === t;
              return (
                <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, on && styles.tabOn]}>
                  <Text style={[styles.tabT, on && styles.tabTOn]}>{t === "list" ? "Список" : "Календарь"}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.statsRow}>
            <Text style={styles.statsT}>
              Найдено: {k} из {M}
            </Text>
            <Pressable onPress={resetFilters} hitSlop={6}>
              <Text style={styles.resetT}>Сбросить</Text>
            </Pressable>
          </View>

          <View style={styles.chipsLabel}>
            <Text style={styles.lbl}>Цена</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll} contentContainerStyle={styles.hScrollIn}>
            {PRICE.map((p) => {
              const on = price === p;
              const lab = p === "все" ? "Все" : p === "бесплатные" ? "Бесплатные" : "Платные";
              return (
                <Pressable key={p} onPress={() => setPrice(p)} style={[styles.chip, on && styles.chipOn]}>
                  <Text style={[styles.chipT, on && styles.chipTOn]}>{lab}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.chipsLabel}>
            <Text style={styles.lbl}>Категория</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll} contentContainerStyle={styles.hScrollIn}>
            {CATS.map((c) => {
              const on = cat === c;
              return (
                <Pressable key={c} onPress={() => setCat(c)} style={[styles.chip, on && styles.chipOn]}>
                  <Text style={[styles.chipT, on && styles.chipTOn]}>{c === "все" ? "Все" : c}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {allTags.length > 0 ? (
            <>
              <View style={styles.chipsLabel}>
                <Text style={styles.lbl}>Теги</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll} contentContainerStyle={styles.hScrollIn}>
                {allTags.map((t) => {
                  const on = tagFilter === t;
                  return (
                    <Pressable
                      key={t}
                      onPress={() => setTagFilter((prev) => (prev === t ? null : t))}
                      style={[styles.chip, styles.hashChip, on && styles.chipOn]}
                    >
                      <Text style={[styles.chipT, on && styles.chipTOn]}>#{t}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </>
          ) : null}

          {tab === "calendar" ? (
            <View style={styles.calBlock}>
              <View style={styles.calNav}>
                <Pressable onPress={() => setViewDate((d) => subMonths(d, 1))} style={styles.calNavBtn}>
                  <ChevronLeft size={24} color="#1c1917" />
                </Pressable>
                <Text style={styles.calTitle}>{format(viewDate, "LLLL yyyy", { locale: ru })}</Text>
                <Pressable onPress={() => setViewDate((d) => addMonths(d, 1))} style={styles.calNavBtn}>
                  <ChevronRight size={24} color="#1c1917" />
                </Pressable>
              </View>
              <View style={styles.dowRow}>
                {WEEK_RU.map((d) => (
                  <Text key={d} style={styles.dowCell}>
                    {d}
                  </Text>
                ))}
              </View>
              <View style={styles.grid}>
                {cells.map((c, i) => {
                  if (c === "pad") {
                    return <View key={`p-${i}`} style={styles.cell} />;
                  }
                  const dk = format(c, "yyyy-MM-dd");
                  const cnt = eventsByDate[dk] ?? 0;
                  const sel = selectedDateKey != null && dk === selectedDateKey;
                  const tod = isSameDay(c, new Date());
                  return (
                    <Pressable
                      key={dk}
                      style={[styles.cell, styles.cellBtn, styles.cellTodayBase, tod && styles.cellToday, sel && styles.cellSel]}
                      onPress={() => setSelectedDateKey((prev) => (prev === dk ? null : dk))}
                    >
                      <Text style={styles.cellD}>{format(c, "d", { locale: ru })}</Text>
                      {cnt > 0 ? <View style={styles.dot} /> : null}
                    </Pressable>
                  );
                })}
              </View>
              {selectedDateKey ? (
                <Text style={styles.dayH}>
                  События {format(parseLocalDate(selectedDateKey), "d MMMM", { locale: ru })}
                </Text>
              ) : (
                <Text style={styles.dayH}>Выберите дату в сетке</Text>
              )}
            </View>
          ) : null}

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollIn}>
            {tab === "list"
              ? forList.map((ev) => (
                  <EventCard
                    key={ev.id}
                    ev={ev}
                    onPress={() => {
                      const ptext = ev.priceLine ? ` Стоимость: ${ev.priceLine}.` : "";
                      const msg = `Приглашаю на «${ev.title}» (${ev.dateLine}): ${ev.description}.${ptext} Место: ${ev.location}. Организатор: ${ev.organizer}.`;
                      onPick(ev.title, msg);
                    }}
                  />
                ))
              : forCalendarDay.map((ev) => (
                  <EventCard
                    key={ev.id}
                    ev={ev}
                    onPress={() => {
                      const ptext = ev.priceLine ? ` Стоимость: ${ev.priceLine}.` : "";
                      const msg = `Приглашаю на «${ev.title}» (${ev.dateLine}): ${ev.description}.${ptext} Место: ${ev.location}. Организатор: ${ev.organizer}.`;
                      onPick(ev.title, msg);
                    }}
                  />
                ))}
            {tab === "list" && forList.length === 0 ? <Text style={styles.emptyList}>Нет событий по выбранным фильтрам</Text> : null}
            {tab === "calendar" && !selectedDateKey ? (
              <Text style={styles.emptyList}>Коснитесь даты в календаре, чтобы увидеть события</Text>
            ) : null}
            {tab === "calendar" && selectedDateKey && forCalendarDay.length === 0 ? (
              <Text style={styles.emptyList}>В этот день нет событий</Text>
            ) : null}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function EventCard({ ev, onPress }: { ev: GeneratedEventPick; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.card} accessibilityRole="button">
      <LinearGradient colors={["#fef2f2", "#fff7ed"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.thumb}>
        <Calendar size={28} color={tw.amber600} />
      </LinearGradient>
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={[styles.tag, { color: tw.purple600 }]} numberOfLines={1}>
            {ev.category}
          </Text>
          {ev.isFree ? (
            <Text style={styles.freeB}>Бесплатно</Text>
          ) : ev.priceLine ? (
            <Text style={styles.priceT}>{ev.priceLine}</Text>
          ) : null}
        </View>
        <Text style={styles.cardT}>{ev.title}</Text>
        <Text style={styles.cardD} numberOfLines={2}>
          {ev.description}
        </Text>
        {ev.hours ? (
          <View style={styles.meta}>
            <Clock size={14} color="#78716c" />
            <Text style={styles.metaT} numberOfLines={1}>
              {ev.hours} · {ev.dateLine}
            </Text>
          </View>
        ) : (
          <Text style={styles.dateL}>{ev.dateLine}</Text>
        )}
        <View style={styles.meta}>
          <MapPin size={14} color="#78716c" />
          <Text style={styles.metaT} numberOfLines={1}>
            {ev.location}
          </Text>
        </View>
        {ev.tags && ev.tags.length > 0 ? (
          <View style={styles.tagLine}>
            {ev.tags.slice(0, 4).map((t) => (
              <Text key={t} style={styles.miniTag}>
                #{t}
              </Text>
            ))}
          </View>
        ) : null}
        <LinearGradient colors={[...brandGradients.primary]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.invite}>
          <Text style={styles.inviteT}>{ev.isFree ? "Бесплатно" : "Регистрация / подробности"}</Text>
        </LinearGradient>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  back: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 16,
    maxHeight: "92%",
  },
  head: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  headLeft: { flexDirection: "row", gap: 10, flex: 1, minWidth: 0 },
  headT: { fontSize: 18, fontWeight: "800", color: "#1c1917" },
  sub: { color: "#57534e", marginTop: 2, fontSize: 13 },
  close: { padding: 4 },
  tabRow: { flexDirection: "row", marginHorizontal: 18, marginTop: 12, gap: 8 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: tw.gray100, alignItems: "center" },
  tabOn: { backgroundColor: "#fff7ed", borderWidth: 1, borderColor: tw.amber500 },
  tabT: { fontSize: 14, fontWeight: "600", color: tw.gray600 },
  tabTOn: { color: tw.amber600 },
  statsRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 18, marginTop: 10 },
  statsT: { fontSize: 13, color: tw.stone600, fontWeight: "600" },
  resetT: { fontSize: 13, color: tw.red500, fontWeight: "700" },
  chipsLabel: { paddingHorizontal: 18, marginTop: 6 },
  lbl: { fontSize: 12, color: tw.stone500, fontWeight: "600" },
  hScroll: { maxHeight: 40, marginTop: 4, marginBottom: 4 },
  hScrollIn: { paddingHorizontal: 14, gap: 8, flexDirection: "row", alignItems: "center" },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: tw.gray100,
    borderWidth: 1,
    borderColor: tw.stone200,
  },
  hashChip: { borderStyle: "dashed" as const },
  chipOn: { backgroundColor: "#fff7ed", borderColor: "#fdba74" },
  chipT: { fontSize: 12, fontWeight: "700", color: tw.stone600 },
  chipTOn: { color: tw.amber600 },
  calBlock: { paddingHorizontal: 16, marginTop: 6 },
  calNav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  calNavBtn: { padding: 6, borderRadius: 999 },
  calTitle: { fontSize: 16, fontWeight: "800", color: "#1c1917", textTransform: "capitalize" },
  dowRow: { flexDirection: "row", marginBottom: 2 },
  dowCell: { flex: 1, textAlign: "center", fontSize: 11, color: tw.stone500, fontWeight: "600" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "14.2857%", minHeight: 36, paddingVertical: 2 },
  cellBtn: { alignItems: "center", justifyContent: "center" },
  cellD: { fontSize: 14, fontWeight: "700", color: "#1c1917" },
  cellTodayBase: { borderRadius: 999, borderWidth: 1, borderColor: "transparent" },
  cellSel: { backgroundColor: tw.red200, borderColor: tw.amber500 },
  cellToday: { backgroundColor: "#fff7ed", borderColor: tw.amber500 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: tw.red500, marginTop: 2 },
  dayH: { fontSize: 14, fontWeight: "800", color: "#1c1917", marginTop: 10, marginBottom: 4 },
  scroll: { flexGrow: 1, flex: 1, minHeight: 200, maxHeight: 400, marginTop: 4 },
  scrollIn: { paddingHorizontal: 14, paddingBottom: 12, flexGrow: 1 },
  card: { flexDirection: "row", gap: 10, marginBottom: 12, alignItems: "stretch" },
  thumb: {
    width: 80,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: tw.red200,
  },
  cardBody: { flex: 1, minWidth: 0 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  tag: { fontSize: 10, fontWeight: "800", textTransform: "capitalize", flex: 1 },
  freeB: { fontSize: 11, fontWeight: "800", color: tw.amber600, backgroundColor: "#d1fae5", paddingHorizontal: 6, borderRadius: 6 },
  priceT: { fontSize: 11, fontWeight: "700", color: tw.stone600 },
  cardT: { fontWeight: "800", fontSize: 15, color: "#1c1917" },
  cardD: { fontSize: 13, color: "#57534e", marginTop: 2 },
  dateL: { fontSize: 11, color: "#78716c", fontWeight: "600", marginTop: 2 },
  meta: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  metaT: { fontSize: 11, color: "#78716c", flex: 1 },
  tagLine: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 4 },
  miniTag: { fontSize: 10, color: tw.stone500 },
  invite: { marginTop: 8, borderRadius: 10, paddingVertical: 8, alignItems: "center" },
  inviteT: { color: "#fff", fontWeight: "700", fontSize: 12 },
  emptyList: { textAlign: "center", color: tw.stone500, padding: 20 },
});
