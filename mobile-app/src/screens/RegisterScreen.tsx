import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { presignRegistration, putFileToPresignedUrl } from "../api/uploadApi";
import { register } from "../api/authApi";
import { getUserById } from "../api/usersApi";
import type { RootStackParamList } from "../navigation/types";
import { validateEmail } from "../utils/authValidation";
import { normalizeRuPhone } from "../utils/phone";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export function RegisterScreen({ navigation, route }: Props) {
  const inviterId = route.params?.inviterId;
  const [inviterName, setInviterName] = useState<string | null>(null);

  useEffect(() => {
    if (!inviterId) return;
    void getUserById(inviterId).then((r) => {
      if (r.data?.name) setInviterName(r.data.name);
    });
  }, [inviterId]);
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [loginPhone, setLoginPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("2000-01-15");
  const [gender, setGender] = useState<"male" | "female">("female");
  const [bio, setBio] = useState("");
  const [interestsRaw, setInterestsRaw] = useState("");
  const [avatarLocalUri, setAvatarLocalUri] = useState<string | null>(null);
  const [avatarType, setAvatarType] = useState("image/jpeg");
  const [sizeBytes, setSizeBytes] = useState(0);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeOffer, setAgreeOffer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const pickAvatar = () => {
    void launchImageLibrary(
      { mediaType: "photo", maxWidth: 1200, maxHeight: 1200, quality: 0.9 },
      (res) => {
        const a = res.assets?.[0];
        if (a?.uri) {
          setAvatarLocalUri(a.uri);
          setAvatarType(a.type || "image/jpeg");
          setSizeBytes(a.fileSize ?? 500_000);
        }
      }
    );
  };

  const onSubmit = async () => {
    setErr(null);
    if (!avatarLocalUri) {
      setErr("Выберите фото для аватара (обязательно для регистрации)");
      return;
    }
    if (authMethod === "email") {
      const e = validateEmail(email);
      if (e) {
        setErr(e);
        return;
      }
    } else {
      if (!normalizeRuPhone(loginPhone)) {
        setErr("Введите корректный номер (российский мобильный)");
        return;
      }
    }
    if (password.length < 6) {
      setErr("Пароль должен содержать минимум 6 символов");
      return;
    }
    if (!agreePrivacy) {
      setErr("Необходимо согласие на обработку данных");
      return;
    }
    if (!agreeTerms) {
      setErr("Необходимо согласие с пользовательским соглашением");
      return;
    }
    if (!name.trim()) {
      setErr("Введите имя");
      return;
    }

    setLoading(true);
    const ps = await presignRegistration(avatarType, Math.max(sizeBytes, 1));
    if (ps.error || !ps.data) {
      setLoading(false);
      setErr(ps.error || "Не удалось получить ссылку загрузки");
      return;
    }
    const up = await putFileToPresignedUrl(ps.data.uploadUrl, avatarLocalUri, avatarType);
    if (!up.ok) {
      setLoading(false);
      setErr(up.error || "Ошибка загрузки фото");
      return;
    }

    const interests = interestsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const r = await register({
      authMethod,
      email: authMethod === "email" ? email.trim() : undefined,
      loginPhone: authMethod === "phone" ? loginPhone.trim() : undefined,
      password,
      agreeToPrivacy: agreePrivacy,
      agreeToTerms: agreeTerms,
      agreeToOffer: agreeOffer,
      name: name.trim(),
      birthDate,
      gender,
      avatarUrl: ps.data.fileUrl,
      bio: bio.trim() || undefined,
      interests: interests.length ? interests : undefined,
    });
    setLoading(false);
    if (r.error || !r.data) {
      setErr(r.error || "Регистрация не удалась");
      return;
    }
    navigation.reset({ index: 0, routes: [{ name: "Main" }] });
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrap}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Регистрация</Text>
        {inviterName ? (
          <Text style={styles.inviteBanner}>Вы перешли по приглашению от {inviterName}</Text>
        ) : null}
        {err ? <Text style={styles.err}>{err}</Text> : null}

        <View style={styles.modeRow}>
          <Pressable
            onPress={() => setAuthMethod("email")}
            style={[styles.modeBtn, authMethod === "email" && styles.modeOn]}
          >
            <Text style={styles.modeT}>Email</Text>
          </Pressable>
          <Pressable
            onPress={() => setAuthMethod("phone")}
            style={[styles.modeBtn, authMethod === "phone" && styles.modeOn]}
          >
            <Text style={styles.modeT}>Телефон</Text>
          </Pressable>
        </View>

        <Pressable style={styles.avatarBtn} onPress={pickAvatar}>
          {avatarLocalUri ? (
            <Image source={{ uri: avatarLocalUri }} style={styles.avatarImg} />
          ) : (
            <Text style={styles.avatarPl}>Фото (обязательно)</Text>
          )}
        </Pressable>

        {authMethod === "email" ? (
          <TextInput
            style={styles.input}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />
        ) : (
          <TextInput
            style={styles.input}
            placeholder="+7… или 8…"
            keyboardType="phone-pad"
            value={loginPhone}
            onChangeText={setLoginPhone}
            editable={!loading}
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Пароль (мин. 6 символов)"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />
        <TextInput style={styles.input} placeholder="Имя" value={name} onChangeText={setName} editable={!loading} />
        <Text style={styles.hint}>Дата рождения (YYYY-MM-DD, 18+)</Text>
        <TextInput style={styles.input} value={birthDate} onChangeText={setBirthDate} editable={!loading} />
        <TextInput
          style={styles.input}
          placeholder="О себе (необязательно)"
          value={bio}
          onChangeText={setBio}
          multiline
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          placeholder="Интересы через запятую (необязательно)"
          value={interestsRaw}
          onChangeText={setInterestsRaw}
          editable={!loading}
        />

        <View style={styles.genderRow}>
          <Pressable
            onPress={() => setGender("female")}
            style={[styles.genderBtn, gender === "female" && styles.genderOn]}
          >
            <Text>Ж</Text>
          </Pressable>
          <Pressable
            onPress={() => setGender("male")}
            style={[styles.genderBtn, gender === "male" && styles.genderOn]}
          >
            <Text>М</Text>
          </Pressable>
        </View>

        <Pressable style={styles.row} onPress={() => setAgreePrivacy((v) => !v)}>
          <View style={[styles.cb, agreePrivacy && styles.cbOn]} />
          <Text style={styles.rowT}>Согласие на обработку персональных данных</Text>
        </Pressable>
        <Pressable style={styles.row} onPress={() => setAgreeTerms((v) => !v)}>
          <View style={[styles.cb, agreeTerms && styles.cbOn]} />
          <Text style={styles.rowT}>Согласие с пользовательским соглашением</Text>
        </Pressable>
        <Pressable style={styles.row} onPress={() => setAgreeOffer((v) => !v)}>
          <View style={[styles.cb, agreeOffer && styles.cbOn]} />
          <Text style={styles.rowT}>Согласие с офертой (необязательно)</Text>
        </Pressable>

        <Pressable style={styles.btn} onPress={onSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Создать аккаунт</Text>}
        </Pressable>
        <Pressable onPress={() => navigation.goBack()} disabled={loading}>
          <Text style={styles.link}>Назад к входу</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate("Landing")} disabled={loading}>
          <Text style={styles.link2}>На главную</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#fff8f5" },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 12, textAlign: "center" },
  inviteBanner: {
    textAlign: "center",
    fontSize: 14,
    color: "#9a3412",
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#fed7aa",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    fontWeight: "600",
  },
  err: { color: "#b91c1c", marginBottom: 8, textAlign: "center" },
  modeRow: { flexDirection: "row", gap: 10, marginBottom: 12, justifyContent: "center" },
  modeBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999, backgroundColor: "#e7e5e4" },
  modeOn: { backgroundColor: "#fecaca" },
  modeT: { fontWeight: "600", color: "#292524" },
  input: {
    borderWidth: 1,
    borderColor: "#e7e5e4",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#1c1917",
  },
  hint: { fontSize: 12, color: "#57534e", marginBottom: 4 },
  avatarBtn: {
    alignSelf: "center",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#fef3c7",
    marginBottom: 16,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImg: { width: "100%", height: "100%" },
  avatarPl: { padding: 8, textAlign: "center", color: "#92400e" },
  genderRow: { flexDirection: "row", gap: 12, marginBottom: 12, justifyContent: "center" },
  genderBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12, backgroundColor: "#e7e5e4" },
  genderOn: { backgroundColor: "#fecaca" },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  cb: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#d6d3d1",
    marginTop: 2,
    backgroundColor: "#fff",
  },
  cbOn: { backgroundColor: "#ea580c", borderColor: "#ea580c" },
  rowT: { flex: 1, fontSize: 14, color: "#44403c", lineHeight: 20 },
  btn: {
    backgroundColor: "#b45309",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  link: { color: "#b45309", textAlign: "center", marginTop: 20, fontSize: 16 },
  link2: { color: "#78716c", textAlign: "center", marginTop: 12, fontSize: 14 },
});
