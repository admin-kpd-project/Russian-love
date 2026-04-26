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
  Image,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { presignRegistration, putFileToPresignedUrl } from "../api/uploadApi";
import { register } from "../api/authApi";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export function RegisterScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("2000-01-15");
  const [gender, setGender] = useState<"male" | "female">("female");
  const [avatarLocalUri, setAvatarLocalUri] = useState<string | null>(null);
  const [avatarType, setAvatarType] = useState("image/jpeg");
  const [sizeBytes, setSizeBytes] = useState(0);
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
    const r = await register({
      email: email.trim(),
      password,
      name: name.trim(),
      birthDate,
      gender,
      avatarUrl: ps.data.fileUrl,
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
      <Text style={styles.title}>Регистрация</Text>
      {err ? <Text style={styles.err}>{err}</Text> : null}

      <Pressable style={styles.avatarBtn} onPress={pickAvatar}>
        {avatarLocalUri ? (
          <Image source={{ uri: avatarLocalUri }} style={styles.avatarImg} />
        ) : (
          <Text style={styles.avatarPl}>Фото (обязательно)</Text>
        )}
      </Pressable>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Пароль (мин. 6 символов)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!loading}
      />
      <TextInput style={styles.input} placeholder="Имя" value={name} onChangeText={setName} />
      <Text style={styles.hint}>Дата рождения (YYYY-MM-DD, 18+)</Text>
      <TextInput style={styles.input} value={birthDate} onChangeText={setBirthDate} />

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

      <Pressable style={styles.btn} onPress={onSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Создать аккаунт</Text>}
      </Pressable>
      <Pressable onPress={() => navigation.goBack()} disabled={loading}>
        <Text style={styles.link}>Назад к входу</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20, backgroundColor: "#fff8f5" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 12, textAlign: "center" },
  err: { color: "#b91c1c", marginBottom: 8, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#e7e5e4",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#fff",
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
  btn: {
    backgroundColor: "#b45309",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  link: { color: "#b45309", textAlign: "center", marginTop: 20, fontSize: 16 },
});
