import React, { useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Switch,
  Linking,
  Alert,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import {
  X,
  Bell,
  Shield,
  MapPin,
  UsersRound,
  Globe,
  Trash2,
  ChevronRight,
  QrCode,
  Sparkles,
  AlertTriangle,
} from "lucide-react-native";

import { REGIONS_CITIES } from "../../data/settingsRegions";

type Props = { visible: boolean; onClose: () => void };

function RowSwitch({
  title,
  subtitle,
  value,
  onValue,
  Icon,
  iconBg,
}: {
  title: string;
  subtitle: string;
  value: boolean;
  onValue: (v: boolean) => void;
  Icon: React.ComponentType<Record<string, unknown>>;
  iconBg: string;
}) {
  return (
    <View style={styles.rowBlock}>
      <View style={styles.rowHead}>
        <View style={[styles.icoBg, { backgroundColor: iconBg }]}>
          <Icon size={20} color="#44403c" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowT}>{title}</Text>
          <Text style={styles.rowS}>{subtitle}</Text>
        </View>
        <Switch value={value} onValueChange={onValue} trackColor={{ false: "#d6d3d1", true: "#fecaca" }} thumbColor={value ? "#ef4444" : "#f5f5f4"} />
      </View>
    </View>
  );
}

export function SettingsModal({ visible, onClose }: Props) {
  const [notifications, setNotifications] = useState(true);
  const [privateProfile, setPrivateProfile] = useState(false);
  const [searchDistance, setSearchDistance] = useState(50);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [ageRange, setAgeRange] = useState({ min: 18, max: 35 });
  const [language, setLanguage] = useState("ru");
  const [allowQRScan, setAllowQRScan] = useState(true);
  const [hideCityName, setHideCityName] = useState(false);
  const [allowAIAnalysis, setAllowAIAnalysis] = useState(true);
  const [showDelete, setShowDelete] = useState(false);

  const regions = useMemo(() => Object.keys(REGIONS_CITIES), []);
  const cities = selectedRegion ? REGIONS_CITIES[selectedRegion] ?? [] : [];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.back} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <LinearGradient colors={["#ef4444", "#f59e0b"]} style={styles.head}>
            <Pressable style={styles.x} onPress={onClose}>
              <X size={24} color="#fff" />
            </Pressable>
            <Text style={styles.headT}>Настройки</Text>
            <Text style={styles.headS}>Управление приложением</Text>
          </LinearGradient>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            <RowSwitch
              title="Уведомления"
              subtitle="Получать push-уведомления"
              value={notifications}
              onValue={setNotifications}
              Icon={Bell}
              iconBg="#fee2e2"
            />
            <RowSwitch
              title="Приватный профиль"
              subtitle="Скрыть от всех пользователей"
              value={privateProfile}
              onValue={setPrivateProfile}
              Icon={Shield}
              iconBg="#fef3c7"
            />

            <View style={styles.section}>
              <View style={styles.secTitleRow}>
                <View style={[styles.icoBg, { backgroundColor: "#dbeafe" }]}>
                  <MapPin size={20} color="#1d4ed8" />
                </View>
                <View>
                  <Text style={styles.secT}>Режим поиска</Text>
                  <Text style={styles.secS}>Расстояние (км)</Text>
                </View>
              </View>
              <Text style={styles.distVal}>{searchDistance} км</Text>
              <View style={styles.stepRow}>
                <Pressable style={styles.stepBtn} onPress={() => setSearchDistance((d) => Math.max(5, d - 5))}>
                  <Text style={styles.stepTxt}>−</Text>
                </Pressable>
                <Pressable style={styles.stepBtn} onPress={() => setSearchDistance((d) => Math.min(100, d + 5))}>
                  <Text style={styles.stepTxt}>+</Text>
                </Pressable>
              </View>
              <Text style={styles.lbl}>Регион</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
                {regions.map((r) => (
                  <Pressable
                    key={r}
                    onPress={() => {
                      setSelectedRegion(r);
                      setSelectedCity("");
                    }}
                    style={[styles.chip, selectedRegion === r && styles.chipOn]}
                  >
                    <Text style={[styles.chipT, selectedRegion === r && styles.chipTon]} numberOfLines={1}>
                      {r}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
              {cities.length > 0 ? (
                <>
                  <Text style={styles.lbl}>Город</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
                    {cities.map((c) => (
                      <Pressable key={c} onPress={() => setSelectedCity(c)} style={[styles.chip, selectedCity === c && styles.chipOn]}>
                        <Text style={[styles.chipT, selectedCity === c && styles.chipTon]}>{c}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </>
              ) : null}
            </View>

            <View style={styles.section}>
              <View style={styles.secTitleRow}>
                <View style={[styles.icoBg, { backgroundColor: "#ede9fe" }]}>
                  <UsersRound size={20} color="#5b21b6" />
                </View>
                <View>
                  <Text style={styles.secT}>Возрастной диапазон</Text>
                  <Text style={styles.secS}>
                    {ageRange.min} – {ageRange.max} лет
                  </Text>
                </View>
              </View>
              <Text style={styles.lbl}>Мин. возраст</Text>
              <View style={styles.stepRow}>
                <Pressable style={styles.stepBtn} onPress={() => setAgeRange((a) => ({ ...a, min: Math.max(18, a.min - 1), max: Math.max(a.max, Math.max(18, a.min - 1)) }))}>
                  <Text style={styles.stepTxt}>−</Text>
                </Pressable>
                <Pressable style={styles.stepBtn} onPress={() => setAgeRange((a) => ({ ...a, min: Math.min(a.max, a.min + 1) }))}>
                  <Text style={styles.stepTxt}>+</Text>
                </Pressable>
              </View>
              <Text style={styles.lbl}>Макс. возраст</Text>
              <View style={styles.stepRow}>
                <Pressable style={styles.stepBtn} onPress={() => setAgeRange((a) => ({ ...a, max: Math.max(a.min, a.max - 1) }))}>
                  <Text style={styles.stepTxt}>−</Text>
                </Pressable>
                <Pressable style={styles.stepBtn} onPress={() => setAgeRange((a) => ({ ...a, max: Math.min(85, a.max + 1) }))}>
                  <Text style={styles.stepTxt}>+</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.secTitleRow}>
                <View style={[styles.icoBg, { backgroundColor: "#dcfce7" }]}>
                  <Globe size={20} color="#166534" />
                </View>
                <View>
                  <Text style={styles.secT}>Язык интерфейса</Text>
                </View>
              </View>
              {(["ru", "en", "uk"] as const).map((code) => (
                <Pressable key={code} style={[styles.langRow, language === code && styles.langOn]} onPress={() => setLanguage(code)}>
                  <Text style={styles.langT}>{code === "ru" ? "Русский" : code === "en" ? "English" : "Українська"}</Text>
                </Pressable>
              ))}
            </View>

            <RowSwitch
              title="Разрешить сканирование QR-кода"
              subtitle="Другие пользователи смогут найти вас"
              value={allowQRScan}
              onValue={setAllowQRScan}
              Icon={QrCode}
              iconBg="#e0e7ff"
            />
            <RowSwitch
              title="Скрывать город"
              subtitle="Показывать только регион"
              value={hideCityName}
              onValue={setHideCityName}
              Icon={Sparkles}
              iconBg="#ccfbf1"
            />
            <RowSwitch
              title="Анализ соцсетей с помощью AI"
              subtitle="Для улучшения рекомендаций"
              value={allowAIAnalysis}
              onValue={setAllowAIAnalysis}
              Icon={Sparkles}
              iconBg="#ede9fe"
            />

            <Pressable
              style={styles.listBtn}
              onPress={() =>
                Alert.alert(
                  "Руководство пользователя",
                  "Свайпайте карточки вправо — симпатия, влево — пропуск. Супер-лайк — особый интерес. Match открывает чат."
                )
              }
            >
              <Text style={styles.listBtnT}>Руководство пользователя</Text>
              <ChevronRight size={20} color="#a8a29e" />
            </Pressable>
            <Pressable style={styles.listBtnGold} onPress={() => void Linking.openURL("https://forruss.ru")}>
              <Text style={styles.listBtnT}>Посетить forruss.ru</Text>
              <ChevronRight size={20} color="#a8a29e" />
            </Pressable>
            <Pressable style={styles.listBtn} onPress={() => Alert.alert("Политика конфиденциальности", "См. forruss.ru")}>
              <Text style={styles.listBtnT}>Политика конфиденциальности</Text>
              <ChevronRight size={20} color="#a8a29e" />
            </Pressable>
            <Pressable style={styles.listBtn} onPress={() => Alert.alert("Условия использования", "См. forruss.ru")}>
              <Text style={styles.listBtnT}>Условия использования</Text>
              <ChevronRight size={20} color="#a8a29e" />
            </Pressable>

            <Pressable style={styles.delBtn} onPress={() => setShowDelete(true)}>
              <Trash2 size={20} color="#b91c1c" />
              <Text style={styles.delBtnT}>Удалить аккаунт</Text>
            </Pressable>
            <View style={{ height: 24 }} />
          </ScrollView>
        </Pressable>
      </Pressable>

      <Modal visible={showDelete} transparent animationType="fade">
        <Pressable style={styles.delBack} onPress={() => setShowDelete(false)}>
          <Pressable style={styles.delSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.delIco}>
              <AlertTriangle size={40} color="#dc2626" />
            </View>
            <Text style={styles.delH}>Удалить аккаунт?</Text>
            <Text style={styles.delP}>Вы действительно хотите удалить свой аккаунт?</Text>
            <Text style={styles.delWarn}>Данные будут удалены в течение 30 дней</Text>
            <Pressable
              style={styles.delYes}
              onPress={() => {
                setShowDelete(false);
                onClose();
                Alert.alert("Запрос принят", "Удаление аккаунта на стороне сервера — уточните в поддержке.");
              }}
            >
              <Text style={styles.delYesT}>Да, удалить</Text>
            </Pressable>
            <Pressable style={styles.delNo} onPress={() => setShowDelete(false)}>
              <Text style={styles.delNoT}>Отмена</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  back: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "92%" },
  head: { paddingTop: 16, paddingBottom: 20, paddingHorizontal: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  x: { position: "absolute", top: 14, right: 14, zIndex: 2, padding: 8, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.2)" },
  headT: { fontSize: 24, fontWeight: "800", color: "#fff" },
  headS: { fontSize: 14, color: "rgba(255,255,255,0.88)", marginTop: 4 },
  scroll: { paddingHorizontal: 16, paddingTop: 12 },
  rowBlock: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#f5f5f4" },
  rowHead: { flexDirection: "row", alignItems: "center", gap: 12 },
  icoBg: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rowT: { fontSize: 16, fontWeight: "700", color: "#292524" },
  rowS: { fontSize: 12, color: "#78716c", marginTop: 2 },
  section: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#f5f5f4" },
  secTitleRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  secT: { fontSize: 16, fontWeight: "700", color: "#292524" },
  secS: { fontSize: 12, color: "#78716c", marginTop: 2 },
  distVal: { fontSize: 18, fontWeight: "800", color: "#dc2626", marginBottom: 8 },
  stepRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#f5f5f4",
    alignItems: "center",
    justifyContent: "center",
  },
  stepTxt: { fontSize: 22, fontWeight: "700", color: "#44403c" },
  lbl: { fontSize: 12, color: "#78716c", marginBottom: 6, marginTop: 4 },
  chips: { marginBottom: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#f5f5f4",
    marginRight: 8,
    maxWidth: 220,
  },
  chipOn: { backgroundColor: "#fecaca" },
  chipT: { fontSize: 13, color: "#44403c" },
  chipTon: { color: "#991b1b", fontWeight: "700" },
  langRow: { padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "#e7e5e4", marginBottom: 8 },
  langOn: { borderColor: "#f97316", backgroundColor: "#fff7ed" },
  langT: { fontSize: 16, color: "#292524" },
  listBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    backgroundColor: "#fafaf9",
    borderRadius: 14,
    marginBottom: 8,
  },
  listBtnGold: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    backgroundColor: "#fffbeb",
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  listBtnT: { fontSize: 15, fontWeight: "600", color: "#44403c" },
  delBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    backgroundColor: "#fef2f2",
    borderRadius: 14,
    marginTop: 8,
  },
  delBtnT: { fontSize: 16, fontWeight: "700", color: "#b91c1c" },
  delBack: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", padding: 20 },
  delSheet: { backgroundColor: "#fff", borderRadius: 24, padding: 24 },
  delIco: { alignSelf: "center", width: 72, height: 72, borderRadius: 36, backgroundColor: "#fee2e2", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  delH: { fontSize: 20, fontWeight: "800", textAlign: "center", color: "#292524", marginBottom: 8 },
  delP: { textAlign: "center", color: "#57534e", marginBottom: 4 },
  delWarn: { textAlign: "center", color: "#b91c1c", fontWeight: "600", fontSize: 13, marginBottom: 20 },
  delYes: { backgroundColor: "#ef4444", paddingVertical: 14, borderRadius: 14, marginBottom: 10 },
  delYesT: { color: "#fff", fontWeight: "700", textAlign: "center", fontSize: 16 },
  delNo: { borderWidth: 2, borderColor: "#e7e5e4", paddingVertical: 14, borderRadius: 14 },
  delNoT: { color: "#44403c", fontWeight: "600", textAlign: "center", fontSize: 16 },
});
