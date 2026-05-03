import { useEffect, useState } from "react";
import {
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { clearTokens } from "../api/client";
import { CANONICAL_STAGING_API_BASE } from "../config";
import { getApiBaseUrl, isValidApiBase, setApiBaseUrlInStorage, normalizeApiBase } from "../api/apiBase";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Server">;

export function ServerConfigScreen({ navigation, route }: Props) {
  const reconfigure = Boolean(route.params?.reconfigure);
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const u = await getApiBaseUrl();
      setValue(u);
    })();
  }, []);

  const onSave = async () => {
    setErr(null);
    if (!isValidApiBase(value)) {
      setErr(`Укажите полный URL, например ${CANONICAL_STAGING_API_BASE} или http://10.0.2.2:8000`);
      return;
    }
    setSaving(true);
    await setApiBaseUrlInStorage(value);
    await clearTokens();
    setSaving(false);
    navigation.reset({ index: 0, routes: [{ name: reconfigure ? "Login" : "Landing" }] });
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.h1}>Адрес бэкенда (API)</Text>
        <Text style={styles.hint}>
          Без завершающего слэша. Staging по умолчанию: {"\n"}
          {CANONICAL_STAGING_API_BASE}
          {"\n\n"}
          Эмулятор Android, API на этом ПК: {"\n"}http://10.0.2.2:PORT{"\n\n"}
          Телефон в той же сети, API на ПК: {"\n"}http://ВАШ_LAN_IP:PORT{"\n\n"}
          USB: adb reverse tcp:PORT tcp:PORT, затем {"\n"}http://127.0.0.1:PORT
        </Text>
        {err ? <Text style={styles.err}>{err}</Text> : null}
        <TextInput
          style={styles.inp}
          value={value}
          onChangeText={setValue}
          placeholder={CANONICAL_STAGING_API_BASE}
          placeholderTextColor="#a8a29e"
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!saving}
        />
        <Text style={styles.preview}>
          {value.trim() ? `Будет использовано: ${normalizeApiBase(value)}` : " "}
        </Text>
        <Pressable style={styles.btn} onPress={onSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnT}>Сохранить и сбросить сессию</Text>}
        </Pressable>
        {reconfigure ? (
          <Pressable onPress={() => navigation.goBack()} disabled={saving}>
            <Text style={styles.back}>Назад</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff8f5" },
  scroll: { padding: 20, paddingBottom: 40 },
  h1: { fontSize: 20, fontWeight: "700", marginBottom: 10 },
  hint: { color: "#57534e", fontSize: 13, lineHeight: 20, marginBottom: 12 },
  err: { color: "#b91c1c", marginBottom: 8 },
  inp: {
    borderWidth: 1,
    borderColor: "#d6d3d1",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  preview: { marginTop: 6, fontSize: 12, color: "#78716c" },
  btn: {
    marginTop: 20,
    backgroundColor: "#b91c1c",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  btnT: { color: "#fff", fontWeight: "600" },
  back: { textAlign: "center", marginTop: 20, color: "#b45309", fontSize: 16 },
});
