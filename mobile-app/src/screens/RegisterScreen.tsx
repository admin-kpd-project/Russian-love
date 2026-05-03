import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { launchImageLibrary } from "react-native-image-picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ArrowLeft, Camera, Check, Mail, Phone, UserPlus } from "lucide-react-native";

import { presignRegistration, putFileToPresignedUrl } from "../api/uploadApi";
import { register } from "../api/authApi";
import { getUserById } from "../api/usersApi";
import type { RootStackParamList } from "../navigation/types";
import { validateEmail } from "../utils/authValidation";
import { normalizeRuPhone } from "../utils/phone";
import { colors, radius, cardShadow, inputBase, placeholderColor } from "../theme/theme";
import { MatreshkaLogo } from "../components/MatreshkaLogo";
import { FadeInView, ScalePressable } from "../components/ui/Motion";
import { GradientButton } from "../components/ui/GradientButton";
import { brandGradients } from "../theme/designTokens";

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
  const [agreeAdult, setAgreeAdult] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );
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
    if (!agreeAdult) {
      setErr("Подтвердите, что вам 18 лет или больше");
      return;
    }
    if (!name.trim()) {
      setErr("Введите имя");
      return;
    }

    setLoading(true);
    try {
      const ps = await presignRegistration(avatarType, Math.max(sizeBytes, 1));
      if (ps.error || !ps.data) {
        setErr(ps.error || "Не удалось получить ссылку загрузки");
        return;
      }
      const up = await putFileToPresignedUrl(ps.data.uploadUrl, avatarLocalUri, avatarType);
      if (!up.ok) {
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
        agreeToAge18: agreeAdult,
        name: name.trim(),
        birthDate,
        gender,
        avatarUrl: ps.data.fileUrl,
        bio: bio.trim() || undefined,
        interests: interests.length ? interests : undefined,
      });
      if (r.error || !r.data) {
        setErr(r.error || "Регистрация не удалась");
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
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <FadeInView style={styles.shell}>
          <LinearGradient colors={[...brandGradients.primary]} style={styles.hero}>
            <ScalePressable style={styles.backButton} onPress={() => navigation.goBack()} disabled={loading}>
              <ArrowLeft size={20} color="#fff" />
            </ScalePressable>
            <View style={styles.logoHalo}>
              <MatreshkaLogo size={58} variant="onGradient" />
            </View>
            <Text style={styles.title}>Регистрация</Text>
            <Text style={styles.heroSub}>Создайте аккаунт и начните знакомства</Text>
          </LinearGradient>

          <View style={[styles.card, cardShadow()]}>
            {inviterName ? (
              <Text style={styles.inviteBanner}>Вы перешли по приглашению от {inviterName}</Text>
            ) : null}
            {err ? <Text style={styles.err}>{err}</Text> : null}

            <View style={styles.modeRow}>
              <ScalePressable
                onPress={() => setAuthMethod("email")}
                style={[styles.modeBtn, authMethod === "email" && styles.modeOn]}
              >
                <Text style={[styles.modeT, authMethod === "email" && styles.modeTOn]}>Email</Text>
              </ScalePressable>
              <ScalePressable
                onPress={() => setAuthMethod("phone")}
                style={[styles.modeBtn, authMethod === "phone" && styles.modeOn]}
              >
                <Text style={[styles.modeT, authMethod === "phone" && styles.modeTOn]}>Телефон</Text>
              </ScalePressable>
            </View>

            <ScalePressable style={styles.avatarBtn} onPress={pickAvatar}>
              {avatarLocalUri ? (
                <Image source={{ uri: avatarLocalUri }} style={styles.avatarImg} />
              ) : (
                <>
                  <Camera size={28} color="#d97706" />
                  <Text style={styles.avatarPl}>Фото профиля *</Text>
                </>
              )}
            </ScalePressable>

            {authMethod === "email" ? (
              <View style={styles.inputWrap}>
                <Mail size={19} color="#a8a29e" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.inputWithIcon]}
                  placeholder="example@mail.ru"
                  placeholderTextColor={placeholderColor}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  editable={!loading}
                />
              </View>
            ) : (
              <TextInput
                style={styles.input}
                placeholder="+7... или 8..."
                placeholderTextColor={placeholderColor}
                keyboardType="phone-pad"
                value={loginPhone}
                onChangeText={setLoginPhone}
                editable={!loading}
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="Пароль (мин. 6 символов)"
              placeholderTextColor={placeholderColor}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />
            <TextInput style={styles.input} placeholder="Имя" placeholderTextColor={placeholderColor} value={name} onChangeText={setName} editable={!loading} />
            <Text style={styles.hint}>Дата рождения (YYYY-MM-DD, 18+)</Text>
            <TextInput style={styles.input} value={birthDate} onChangeText={setBirthDate} editable={!loading} />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="О себе (необязательно)"
              placeholderTextColor={placeholderColor}
              value={bio}
              onChangeText={setBio}
              multiline
              editable={!loading}
            />
            <TextInput
              style={styles.input}
              placeholder="Интересы через запятую (необязательно)"
              placeholderTextColor={placeholderColor}
              value={interestsRaw}
              onChangeText={setInterestsRaw}
              editable={!loading}
            />

            <View style={styles.genderRow}>
              <ScalePressable
                onPress={() => setGender("female")}
                style={[styles.genderBtn, gender === "female" && styles.genderOn]}
              >
                <Text style={[styles.genderT, gender === "female" && styles.genderTOn]}>Женщина</Text>
              </ScalePressable>
              <ScalePressable
                onPress={() => setGender("male")}
                style={[styles.genderBtn, gender === "male" && styles.genderOn]}
              >
                <Text style={[styles.genderT, gender === "male" && styles.genderTOn]}>Мужчина</Text>
              </ScalePressable>
            </View>

            <ScalePressable style={styles.row} onPress={() => setAgreeAdult((v) => !v)}>
              <View style={[styles.cb, agreeAdult && styles.cbOn]}>{agreeAdult ? <Check size={14} color="#fff" /> : null}</View>
              <Text style={styles.rowT}>Мне исполнилось 18 лет (обязательно)</Text>
            </ScalePressable>
            <ScalePressable style={styles.row} onPress={() => setAgreePrivacy((v) => !v)}>
              <View style={[styles.cb, agreePrivacy && styles.cbOn]}>{agreePrivacy ? <Check size={14} color="#fff" /> : null}</View>
              <Text style={styles.rowT}>Согласие на обработку персональных данных</Text>
            </ScalePressable>
            <ScalePressable style={styles.row} onPress={() => setAgreeTerms((v) => !v)}>
              <View style={[styles.cb, agreeTerms && styles.cbOn]}>{agreeTerms ? <Check size={14} color="#fff" /> : null}</View>
              <Text style={styles.rowT}>Согласие с пользовательским соглашением</Text>
            </ScalePressable>
            <ScalePressable style={styles.row} onPress={() => setAgreeOffer((v) => !v)}>
              <View style={[styles.cb, agreeOffer && styles.cbOn]}>{agreeOffer ? <Check size={14} color="#fff" /> : null}</View>
              <Text style={styles.rowT}>Согласие с офертой (необязательно)</Text>
            </ScalePressable>

            <GradientButton title="Создать аккаунт" onPress={onSubmit} loading={loading} disabled={loading} style={styles.btn} />
            <ScalePressable onPress={() => navigation.goBack()} disabled={loading}>
              <Text style={styles.link}>Назад к входу</Text>
            </ScalePressable>
            <ScalePressable onPress={() => navigation.navigate("Landing")} disabled={loading}>
              <Text style={styles.link2}>На главную</Text>
            </ScalePressable>
          </View>
        </FadeInView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.pageBg },
  scroll: { padding: 16, paddingBottom: 40 },
  shell: { borderRadius: radius.xl, overflow: "hidden" },
  hero: { paddingTop: 34, paddingBottom: 28, paddingHorizontal: 24, alignItems: "center" },
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
  title: { fontSize: 25, fontWeight: "800", marginBottom: 8, textAlign: "center", color: colors.white },
  heroSub: { textAlign: "center", color: "rgba(255,255,255,0.92)", fontSize: 15 },
  card: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.stone200,
  },
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
  err: { color: colors.error, marginBottom: 10, textAlign: "center" },
  modeRow: { flexDirection: "row", gap: 8, marginBottom: 14, justifyContent: "center", backgroundColor: colors.stone100, borderRadius: radius.md, padding: 4 },
  modeBtn: { flex: 1, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  modeOn: { backgroundColor: colors.white, ...Platform.select({ ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 5 }, android: { elevation: 2 } }) },
  modeT: { fontWeight: "600", color: colors.stone600 },
  modeTOn: { color: colors.red600 },
  inputWrap: { position: "relative" },
  inputIcon: { position: "absolute", left: 13, top: 14, zIndex: 1 },
  input: { ...inputBase, marginBottom: 10, fontSize: 16, color: colors.stone900 },
  inputWithIcon: { paddingLeft: 42 },
  textArea: { minHeight: 86, textAlignVertical: "top" },
  hint: { fontSize: 12, color: colors.stone600, marginBottom: 5, marginLeft: 2 },
  avatarBtn: {
    alignSelf: "center",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.amber100,
    borderWidth: 2,
    borderColor: "#fde68a",
    marginBottom: 16,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImg: { width: "100%", height: "100%" },
  avatarPl: { padding: 8, textAlign: "center", color: "#92400e", fontWeight: "700" },
  genderRow: { flexDirection: "row", gap: 10, marginBottom: 14, justifyContent: "center" },
  genderBtn: { flex: 1, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 12, backgroundColor: colors.stone100, alignItems: "center", borderWidth: 1, borderColor: colors.stone200 },
  genderOn: { backgroundColor: "#fef2f2", borderColor: colors.red200 },
  genderT: { color: colors.stone600, fontWeight: "700" },
  genderTOn: { color: colors.red600 },
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
  cbOn: { backgroundColor: colors.heroRed, borderColor: colors.heroRed, alignItems: "center", justifyContent: "center" },
  rowT: { flex: 1, fontSize: 14, color: colors.stone600, lineHeight: 20 },
  btn: { marginTop: 10 },
  link: { color: colors.link, textAlign: "center", marginTop: 20, fontSize: 16, fontWeight: "600" },
  link2: { color: colors.stone500, textAlign: "center", marginTop: 12, fontSize: 14 },
});
