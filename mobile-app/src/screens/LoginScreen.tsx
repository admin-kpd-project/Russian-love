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
} from "react-native";

import { login } from "../api/authApi";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async () => {
    setErr(null);
    setLoading(true);
    const r = await login(email.trim(), password);
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
      <Text style={styles.title}>Вход</Text>
      {err ? <Text style={styles.err}>{err}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Email или телефон"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Пароль"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!loading}
      />
      <Pressable style={styles.btn} onPress={onSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Войти</Text>}
      </Pressable>
      <Pressable onPress={() => navigation.navigate("Register")} disabled={loading}>
        <Text style={styles.link}>Регистрация</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20, justifyContent: "center", backgroundColor: "#fff8f5" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16, textAlign: "center" },
  err: { color: "#b91c1c", marginBottom: 8, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#e7e5e4",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  btn: {
    backgroundColor: "#dc2626",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  link: { color: "#b45309", textAlign: "center", marginTop: 20, fontSize: 16 },
});
