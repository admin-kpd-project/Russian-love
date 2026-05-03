import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { ArrowLeft, LogIn, Mail } from "lucide-react-native";

import { login } from "../api/authApi";
import { validateLoginIdentifier } from "../utils/authValidation";
import { normalizeRuPhone } from "../utils/phone";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { colors, radius, cardShadow, inputBase, placeholderColor } from "../theme/theme";
import { MatreshkaLogo } from "../components/MatreshkaLogo";
import { FadeInView, ScalePressable } from "../components/ui/Motion";
import { GradientButton } from "../components/ui/GradientButton";
import { brandGradients } from "../theme/designTokens";

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
    try {
      const r = await login(loginId, password);
      if (r.error || !r.data) {
        setErr(r.error || "Вход не удался");
        return;
      }
      navigation.reset({ index: 0, routes: [{ name: "Main" }] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrap}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient colors={[...brandGradients.page]} style={StyleSheet.absoluteFill} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <FadeInView style={styles.shell}>
          <LinearGradient colors={[...brandGradients.primary]} style={styles.hero}>
            <ScalePressable style={styles.backButton} onPress={() => navigation.navigate("Landing")} disabled={loading}>
              <ArrowLeft size={20} color="#fff" />
            </ScalePressable>
            <View style={styles.logoHalo}>
              <MatreshkaLogo size={58} variant="onGradient" />
            </View>
            <Text style={styles.heroTitle}>Добро пожаловать!</Text>
            <Text style={styles.heroSub}>Войдите, чтобы найти свою половинку</Text>
          </LinearGradient>

          <View style={[styles.card, cardShadow()]}>
            <Text style={styles.cardH}>Вход</Text>
            {err ? <Text style={styles.err}>{err}</Text> : null}
            <View style={styles.inputWrap}>
              <Mail size={19} color="#a8a29e" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputWithIcon]}
                placeholder="example@mail.ru или +7..."
                placeholderTextColor={placeholderColor}
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Пароль"
              placeholderTextColor={placeholderColor}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />
            <GradientButton
              title="Войти"
              onPress={onSubmit}
              loading={loading}
              disabled={loading}
              left={!loading ? <LogIn size={19} color="#fff" /> : null}
              style={styles.btn}
            />
            <GradientButton
              title="Регистрация"
              variant="outline"
              onPress={() => navigation.navigate("Register")}
              disabled={loading}
              style={styles.outlineBtn}
              textStyle={styles.outlineBtnT}
            />
            <ScalePressable onPress={() => navigation.navigate("Landing")} disabled={loading} style={styles.homeL}>
              <Text style={styles.homeT}>На главную</Text>
            </ScalePressable>
          </View>
        </FadeInView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.pageBg },
  scroll: { flexGrow: 1, padding: 16, paddingBottom: 32, justifyContent: "center" },
  shell: { borderRadius: radius.xl, overflow: "hidden" },
  hero: {
    paddingTop: 34,
    paddingBottom: 28,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 14,
    left: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoHalo: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  heroTitle: { textAlign: "center", marginBottom: 8, fontSize: 25, fontWeight: "800", color: colors.white },
  heroSub: { textAlign: "center", color: "rgba(255,255,255,0.92)", fontSize: 15 },
  card: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
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
  inputWrap: { position: "relative" },
  inputIcon: { position: "absolute", left: 13, top: 14, zIndex: 1 },
  input: { ...inputBase, marginBottom: 12, fontSize: 16, color: colors.stone900 },
  inputWithIcon: { paddingLeft: 42 },
  btn: { marginTop: 6 },
  outlineBtn: { marginTop: 14 },
  outlineBtnT: { color: colors.red600, fontWeight: "600", fontSize: 16 },
  homeL: { marginTop: 16, alignItems: "center" },
  homeT: { color: colors.stone500, fontSize: 14 },
});
