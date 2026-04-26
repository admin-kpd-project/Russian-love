import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

import { login } from "../api/authApi";
import { validateLoginIdentifier } from "../utils/authValidation";
import { normalizeRuPhone } from "../utils/phone";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import {
  colors,
  radius,
  cardShadow,
  primaryButton,
  primaryButtonText,
  outlineButton,
  inputBase,
  placeholderColor,
} from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async () => {
    setErr(null);
    const idErr = validateLoginIdentifier(email);
    if (idErr) {
      setErr(idErr);
      return;
    }
    const raw = email.trim();
    const loginId = raw.includes("@") ? raw : normalizeRuPhone(raw) || raw;
    setLoading(true);
    const r = await login(loginId, password);
    setLoading(false);
    if (r.error || !r.data) {
      setErr(r.error || "Вход не удался");
      return;
    }
    navigation.reset({ index: 0, routes: [{ name: "Main" }] });
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrap}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>
            <Text style={styles.heroTitleMain}>Любить </Text>
            <Text style={styles.heroTitleAccent}>по-russки</Text>
          </Text>
          <Text style={styles.heroSub}>Войдите, чтобы продолжить</Text>
        </View>

        <View style={[styles.card, cardShadow()]}>
          <Text style={styles.cardH}>Вход</Text>
          {err ? <Text style={styles.err}>{err}</Text> : null}
          <TextInput
            style={[styles.input, styles.inputFirst]}
            placeholder="Email или телефон"
            placeholderTextColor={placeholderColor}
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            placeholder="Пароль"
            placeholderTextColor={placeholderColor}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />
          <Pressable style={[styles.btn, loading && styles.btnDisabled]} onPress={onSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.white} /> : <Text style={primaryButtonText}>Войти</Text>}
          </Pressable>
          <Pressable
            style={[styles.outlineBtn, loading && styles.btnDisabled]}
            onPress={() => navigation.navigate("Register")}
            disabled={loading}
          >
            <Text style={styles.outlineBtnT}>Регистрация</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate("Landing")} disabled={loading} style={styles.homeL}>
            <Text style={styles.homeT}>На главную</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.pageBg },
  scroll: { flexGrow: 1, paddingBottom: 32 },
  hero: {
    paddingTop: 28,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    backgroundColor: colors.heroRed,
  },
  heroTitle: { textAlign: "center", marginBottom: 8 },
  heroTitleMain: { fontSize: 26, fontWeight: "800", color: colors.white },
  heroTitleAccent: { fontSize: 26, fontWeight: "800", color: "#fde68a" },
  heroSub: { textAlign: "center", color: "rgba(255,255,255,0.92)", fontSize: 15 },
  card: {
    marginTop: -28,
    marginHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.stone200,
  },
  cardH: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.stone900,
    marginBottom: 14,
    textAlign: "center",
  },
  err: { color: colors.error, marginBottom: 10, textAlign: "center", fontSize: 14 },
  input: { ...inputBase, marginBottom: 12, fontSize: 16, color: colors.stone900 },
  inputFirst: { marginTop: 0 },
  btn: { ...primaryButton, marginTop: 6 },
  btnDisabled: { opacity: 0.65 },
  outlineBtn: { ...outlineButton, marginTop: 14 },
  outlineBtnT: { color: colors.red600, fontWeight: "600", fontSize: 16 },
  homeL: { marginTop: 16, alignItems: "center" },
  homeT: { color: colors.stone500, fontSize: 14 },
});
