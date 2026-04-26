import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import { launchImageLibrary } from "react-native-image-picker";
import { X, QrCode, LogOut, Camera, MapPin, Mail, Heart, Sparkles, Cake, Server } from "lucide-react-native";

import type { Profile } from "../../api/authApi";
import { updateProfile } from "../../api/usersApi";
import { presignAuth, putFileToPresignedUrl } from "../../api/uploadApi";
import { getAdultMaxDate, ageFromBirthDate } from "../../utils/profileDates";
import { getApiBaseUrl } from "../../api/apiBase";
import { resolveMediaUrl } from "../../utils/mediaUrl";
import { brandGradients, profileStatsPlaceholder, tw } from "../../theme/designTokens";

type Props = {
  visible: boolean;
  user: Profile | null;
  onClose: () => void;
  onOpenQR: () => void;
  onOpenSettings: () => void;
  onServer: () => void;
  onLogout: () => void;
  onProfileSaved?: () => void;
};

export function ProfileSettingsModal({
  visible,
  user,
  onClose,
  onOpenQR,
  onOpenSettings,
  onServer,
  onLogout,
  onProfileSaved,
}: Props) {
  const insets = useSafeAreaInsets();
  const { height: winH } = useWindowDimensions();
  /** Иначе ScrollView с `flex:1` внутриPressable без высоты схлопывается в 0 — виден только «угол» sheet */
  const sheetMaxH = winH * 0.92;
  const heroBlockH = 128;
  const scrollMaxH = Math.max(220, sheetMaxH - heroBlockH - insets.bottom);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", birthDate: "", location: "", bio: "" });
  const [interestTags, setInterestTags] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [apiBase, setApiBase] = useState("");

  useEffect(() => {
    void getApiBaseUrl().then(setApiBase);
  }, []);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || "",
      email: user.email || "",
      birthDate: user.birthDate || "",
      location: user.location || "",
      bio: user.bio || "",
    });
    setInterestTags(user.interests || []);
    setAvatarUrl(user.photo || "");
    setPhotos(user.photos || []);
    setEditing(false);
    setError(null);
  }, [user, visible]);

  const displayName = (editing ? form.name : user?.name || "").trim() || user?.name || "";
  const displayAge = ageFromBirthDate(editing ? form.birthDate : user?.birthDate, user?.age ?? 0);

  const displayAvatarUri = useMemo(() => {
    if (!avatarUrl) return "";
    if (avatarUrl.startsWith("file:") || /^https?:\/\//i.test(avatarUrl)) {
      return avatarUrl;
    }
    if (apiBase) {
      return resolveMediaUrl(avatarUrl, apiBase) || avatarUrl;
    }
    return avatarUrl;
  }, [avatarUrl, apiBase]);

  const canSave = useMemo(
    () => !!form.name.trim() && !!form.email.trim() && !!form.birthDate.trim() && !!avatarUrl && !saving,
    [avatarUrl, form.birthDate, form.email, form.name, saving]
  );

  const uploadImageUri = async (uri: string, contentType: string, size: number) => {
    const ps = await presignAuth(contentType, Math.max(size, 1));
    if (ps.error || !ps.data) throw new Error(ps.error || "presign");
    const up = await putFileToPresignedUrl(ps.data.uploadUrl, uri, contentType);
    if (!up.ok) throw new Error(up.error || "upload");
    return ps.data.fileUrl;
  };

  const pickAvatar = () => {
    void launchImageLibrary({ mediaType: "photo", maxWidth: 1200, maxHeight: 1200, quality: 0.9 }, async (res) => {
      const a = res.assets?.[0];
      if (!a?.uri) return;
      try {
        const url = await uploadImageUri(a.uri, a.type || "image/jpeg", a.fileSize ?? 600_000);
        setAvatarUrl(url);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ошибка загрузки");
      }
    });
  };

  const pickExtra = () => {
    void launchImageLibrary({ mediaType: "photo" }, async (res) => {
      const a = res.assets?.[0];
      if (!a?.uri) return;
      try {
        const url = await uploadImageUri(a.uri, a.type || "image/jpeg", a.fileSize ?? 600_000);
        setPhotos((p) => [...p, url]);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ошибка загрузки");
      }
    });
  };

  const addInterest = () => {
    const t = newInterest.trim();
    if (t && !interestTags.includes(t)) {
      setInterestTags((prev) => [...prev, t]);
      setNewInterest("");
    }
  };

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    const res = await updateProfile({
      name: form.name.trim(),
      email: form.email.trim(),
      birthDate: form.birthDate,
      location: form.location.trim(),
      bio: form.bio.trim(),
      avatarUrl,
      photos,
      interests: interestTags,
    });
    setSaving(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setEditing(false);
    onProfileSaved?.();
  };

  if (!user) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.back}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="Закрыть" />
        <View
          style={[
            styles.sheet,
            {
              maxHeight: sheetMaxH,
              minHeight: Math.min(sheetMaxH, winH * 0.56),
            },
          ]}
        >
          <View style={styles.heroSection}>
            <LinearGradient
              colors={[...brandGradients.primary]}
              style={styles.heroGradient}
            />
            <Pressable
              style={({ pressed }) => [styles.qrFab, pressed && styles.headerFabPressed]}
              onPress={() => {
                onClose();
                onOpenQR();
              }}
            >
              <QrCode size={24} color="#fff" />
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.xFab, pressed && styles.headerFabPressed]}
              onPress={onClose}
            >
              <X size={24} color="#fff" />
            </Pressable>
            <View style={styles.avatarWrap} pointerEvents="box-none">
              {displayAvatarUri ? <Image source={{ uri: displayAvatarUri }} style={styles.avatar} /> : <View style={[styles.avatar, styles.avatarPh]} />}
              {editing ? (
                <Pressable style={styles.camOverlay} onPress={pickAvatar}>
                  <Camera size={28} color="#fff" />
                </Pressable>
              ) : null}
            </View>
          </View>

          <KeyboardAvoidingView
            style={[styles.kav, { maxHeight: scrollMaxH }]}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={insets.top + 8}
          >
            <ScrollView
              style={styles.bodyScroll}
              contentContainerStyle={[
                styles.bodyContent,
                { paddingBottom: Math.max(20, 12 + insets.bottom) },
              ]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces
            >
            {editing ? (
              <View style={styles.form}>
                <Text style={styles.lbl}>Имя</Text>
                <TextInput style={styles.inp} value={form.name} onChangeText={(t) => setForm((f) => ({ ...f, name: t }))} />
                <Text style={styles.lbl}>Email</Text>
                <TextInput style={styles.inp} value={form.email} onChangeText={(t) => setForm((f) => ({ ...f, email: t }))} keyboardType="email-address" autoCapitalize="none" />
                <Text style={styles.lbl}>Дата рождения</Text>
                <TextInput style={styles.inp} value={form.birthDate} onChangeText={(t) => setForm((f) => ({ ...f, birthDate: t }))} placeholder="YYYY-MM-DD" />
                <Text style={styles.hint}>Не старше {getAdultMaxDate()}</Text>
                <Text style={styles.lbl}>Город</Text>
                <TextInput style={styles.inp} value={form.location} onChangeText={(t) => setForm((f) => ({ ...f, location: t }))} />
              </View>
            ) : (
              <View style={styles.centerHead}>
                <Text style={styles.title}>
                  {displayName}, {displayAge}
                </Text>
                <View style={styles.locRow}>
                  <MapPin size={16} color="#78716c" />
                  <Text style={styles.loc}>{user.location || "Не указан город"}</Text>
                </View>
              </View>
            )}

            {!editing ? (
              <View style={styles.stats}>
                <LinearGradient colors={[...brandGradients.featureCard]} style={styles.statCell}>
                  <Heart size={20} color={tw.red500} />
                  <Text style={styles.statN}>{profileStatsPlaceholder.likes}</Text>
                  <Text style={styles.statL}>Лайки</Text>
                </LinearGradient>
                <LinearGradient colors={[...brandGradients.featureCard]} style={styles.statCell}>
                  <Sparkles size={20} color={tw.amber500} />
                  <Text style={styles.statN}>{profileStatsPlaceholder.matches}</Text>
                  <Text style={styles.statL}>Матчи</Text>
                </LinearGradient>
                <LinearGradient colors={[...brandGradients.featureCard]} style={styles.statCell}>
                  <Cake size={20} color="#ea580c" />
                  <Text style={styles.statN}>{displayAge}</Text>
                  <Text style={styles.statL}>Лет</Text>
                </LinearGradient>
              </View>
            ) : null}

            <Text style={styles.secH}>О себе</Text>
            {editing ? (
              <TextInput
                style={styles.bio}
                multiline
                value={form.bio}
                onChangeText={(t) => setForm((f) => ({ ...f, bio: t }))}
                placeholder="Расскажите о себе..."
              />
            ) : (
              <Text style={styles.bioRead}>{user.bio || "Добавьте описание о себе"}</Text>
            )}

            <Text style={styles.secH}>Интересы</Text>
            {editing ? (
              <>
                <View style={styles.tags}>
                  {interestTags.map((t) => (
                    <Pressable key={t} onPress={() => setInterestTags((x) => x.filter((y) => y !== t))}>
                      <LinearGradient colors={[...brandGradients.interestTag]} style={styles.tagRo}>
                        <Text style={styles.tagT}>
                          {t} ×
                        </Text>
                      </LinearGradient>
                    </Pressable>
                  ))}
                </View>
                <View style={styles.addRow}>
                  <TextInput style={[styles.inp, { flex: 1, marginBottom: 0 }]} value={newInterest} onChangeText={setNewInterest} placeholder="Добавить интерес" />
                  <Pressable style={styles.plus} onPress={addInterest}>
                    <Text style={styles.plusT}>+</Text>
                  </Pressable>
                </View>
                <Pressable style={styles.extraPho} onPress={pickExtra}>
                  <Camera size={18} color="#57534e" />
                  <Text style={styles.extraPhoT}>Добавить фото ({photos.length})</Text>
                </Pressable>
              </>
            ) : (
              <View style={styles.tags}>
                {(user.interests || []).length ? (
                  (user.interests || []).map((t) => (
                    <LinearGradient key={t} colors={[...brandGradients.interestTag]} style={styles.tagRo}>
                      <Text style={styles.tagT}>{t}</Text>
                    </LinearGradient>
                  ))
                ) : (
                  <Text style={styles.muted}>Добавьте интересы в режиме редактирования</Text>
                )}
              </View>
            )}

            {!editing ? (
              <View style={styles.contacts}>
                <Text style={styles.secH}>Контакты</Text>
                <View style={styles.mailRow}>
                  <Mail size={18} color={tw.red500} />
                  <Text style={styles.mailT}>{user.email || "Email не указан"}</Text>
                </View>
              </View>
            ) : null}

            {error ? <Text style={styles.err}>{error}</Text> : null}

            {editing ? (
              <View style={styles.btnRow}>
                <Pressable style={({ pressed }) => [pressed && { opacity: canSave ? 0.92 : 0.5 }]} onPress={() => void handleSave()} disabled={!canSave}>
                  <LinearGradient colors={[...brandGradients.primary]} style={styles.save}>
                    {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveT}>Сохранить</Text>}
                  </LinearGradient>
                </Pressable>
                <Pressable
                  style={styles.cancel}
                  onPress={() => {
                    setEditing(false);
                    setError(null);
                    setForm({
                      name: user.name || "",
                      email: user.email || "",
                      birthDate: user.birthDate || "",
                      location: user.location || "",
                      bio: user.bio || "",
                    });
                    setInterestTags(user.interests || []);
                    setAvatarUrl(user.photo || "");
                    setPhotos(user.photos || []);
                  }}
                >
                  <Text style={styles.cancelT}>Отмена</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <View style={styles.btnRow}>
                  <Pressable onPress={() => setEditing(true)}>
                    <LinearGradient colors={[...brandGradients.primary]} style={styles.save}>
                      <Text style={styles.saveT}>Редактировать</Text>
                    </LinearGradient>
                  </Pressable>
                  <Pressable style={styles.cancel} onPress={() => { onClose(); onOpenSettings(); }}>
                    <Text style={styles.cancelT}>Настройки</Text>
                  </Pressable>
                </View>
                <Pressable onPress={() => { onClose(); onOpenQR(); }}>
                  <LinearGradient colors={[...brandGradients.qrShareCta]} style={styles.qrFull}>
                    <QrCode size={20} color="#fff" />
                    <Text style={styles.qrFullT}>Поделиться QR-кодом</Text>
                  </LinearGradient>
                </Pressable>
                <Pressable style={styles.srv} onPress={() => { onClose(); onServer(); }}>
                  <Server size={20} color="#c2410c" />
                  <Text style={styles.srvT}>Адрес API (сервер)</Text>
                </Pressable>
                <Pressable style={styles.out} onPress={() => { onClose(); void onLogout(); }}>
                  <LogOut size={20} color="#fff" />
                  <Text style={styles.outT}>Выйти</Text>
                </Pressable>
              </>
            )}
            <View style={{ height: 12 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  back: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: "100%",
    overflow: "hidden",
  },
  /**
   * Шапка и аватар (в т.ч. вылезающий вниз) рисуются *поверх* белого ScrollView — иначе сосед
   * `bodyScroll` с непрозрачным фоном перекрывает круг. На Android важен elevation.
   */
  heroSection: { height: 128, position: "relative", zIndex: 10, ...Platform.select({ android: { elevation: 8 } }) },
  heroGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 128,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerFabPressed: { opacity: 0.9 },
  qrFab: { position: "absolute", left: 16, top: 16, zIndex: 2, padding: 10, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.2)" },
  xFab: { position: "absolute", right: 16, top: 16, zIndex: 2, padding: 10, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.2)" },
  /** size-32 (128) + -bottom-12 (48) как в веб `ProfileSettingsModal` */
  avatarWrap: {
    position: "absolute",
    left: "50%",
    marginLeft: -64,
    bottom: -48,
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 4,
    borderColor: "#fff",
    backgroundColor: "#fff",
    zIndex: 3,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: { width: "100%", height: "100%" },
  avatarPh: { backgroundColor: "#e7e5e4" },
  camOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  kav: { zIndex: 0, width: "100%" },
  bodyScroll: { zIndex: 0, backgroundColor: "#fff", ...Platform.select({ android: { elevation: 0 } }) },
  /** `pt-20` + `px-6` как в веб; paddingBottom дополняется safe area в компоненте */
  bodyContent: { flexGrow: 1, backgroundColor: "#fff", paddingTop: 80, paddingHorizontal: 24 },
  form: { marginBottom: 12 },
  lbl: { fontSize: 13, fontWeight: "600", color: "#57534e", marginBottom: 4 },
  inp: {
    borderWidth: 1,
    borderColor: "#d6d3d1",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: "#1c1917",
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  hint: { fontSize: 11, color: "#a8a29e", marginBottom: 8 },
  centerHead: { alignItems: "center", marginBottom: 12 },
  title: { fontSize: 24, fontWeight: "800", color: "#1f2937" },
  locRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  loc: { fontSize: 14, color: "#78716c" },
  stats: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statCell: {
    flex: 1,
    aspectRatio: 1,
    maxHeight: 100,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  statN: { fontSize: 18, fontWeight: "800", color: "#1f2937", marginTop: 4 },
  statL: { fontSize: 12, color: "#4b5563" },
  secH: { fontSize: 16, fontWeight: "800", color: "#1f2937", marginBottom: 8 },
  bio: {
    borderWidth: 1,
    borderColor: "#d6d3d1",
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 14,
    fontSize: 15,
    color: "#1c1917",
  },
  bioRead: { fontSize: 15, color: "#374151", lineHeight: 22, marginBottom: 14 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  tagRo: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, overflow: "hidden" },
  tagT: { fontSize: 12, color: "#b91c1c", fontWeight: "600" },
  addRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  plus: { width: 48, borderRadius: 12, backgroundColor: tw.red500, alignItems: "center", justifyContent: "center" },
  plusT: { color: "#fff", fontSize: 22, fontWeight: "700" },
  extraPho: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#d6d3d1",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  extraPhoT: { color: "#57534e", fontSize: 14 },
  muted: { fontSize: 14, color: "#a8a29e" },
  contacts: { marginBottom: 12 },
  mailRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  mailT: { fontSize: 14, color: "#44403c" },
  err: { color: "#b91c1c", marginBottom: 10 },
  btnRow: { flexDirection: "row", gap: 10, marginTop: 8 },
  save: {
    flex: 1,
    minHeight: 48,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  saveT: { color: "#fff", fontWeight: "800", fontSize: 16 },
  cancel: {
    flex: 1,
    minHeight: 48,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelT: { color: "#44403c", fontWeight: "700", fontSize: 16 },
  qrFull: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  qrFullT: { color: "#fff", fontWeight: "800", fontSize: 16 },
  srv: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#fed7aa",
  },
  srvT: { color: "#c2410c", fontWeight: "700", fontSize: 15 },
  out: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: tw.red500,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 10,
  },
  outT: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
