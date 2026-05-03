import { ArrowRight, Heart, Sparkles, Camera } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { useNavigate, useParams } from "react-router";
import { ProfileCard } from "./ProfileCard";
import matreshkaLogo from "../../imports/1775050275_(1)_3_(1)-1.png";
import { calculateCompatibility } from "../utils/compatibilityAI";
import { getUserById } from "../services/usersService";
import { register } from "../services/authService";
import { uploadFile } from "../services/uploadService";

function getAdultMaxDate(): string {
  const today = new Date();
  const d = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  return d.toISOString().split("T")[0];
}
import { mapApiProfileToUserProfile } from "../utils/mapApiProfile";
import { useAuth } from "../contexts/AuthContext";
import { normalizeRuPhone } from "../utils/phone";

export function InvitePage() {
  const { inviterId } = useParams<{ inviterId: string }>();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [step, setStep] = useState<"intro" | "register" | "profile">("intro");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [inviterProfile, setInviterProfile] = useState<any | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    authMethod: "email" as "email" | "phone",
    email: "",
    loginPhone: "",
    password: "",
    birthDate: "",
    gender: "female" as "male" | "female",
    avatarUrl: "",
    bio: "",
    interests: "",
    agreeToAge18: false,
  });

  useEffect(() => {
    if (step === "register") {
      window.scrollTo(0, 0);
    }
  }, [step]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!inviterId) {
        setLoadError("Некорректная ссылка приглашения");
        setLoading(false);
        return;
      }
      const res = await getUserById(inviterId);
      if (cancelled) return;
      setLoading(false);
      if (res.error || !res.data) {
        setLoadError(res.error || "Профиль пригласившего недоступен");
        return;
      }
      setInviterProfile(mapApiProfileToUserProfile(res.data));
    })();
    return () => {
      cancelled = true;
    };
  }, [inviterId]);

  const compatibility = useMemo(() => {
    if (!inviterProfile) return 0;
    const age = formData.birthDate
      ? new Date().getFullYear() - new Date(formData.birthDate).getFullYear()
      : 25;
    return calculateCompatibility(
      {
        id: "invite-new-user",
        name: formData.name || "Новый пользователь",
        age,
        bio: "",
        interests: [],
        location: "",
        photo: "",
        personality: { extroversion: 50, openness: 50, conscientiousness: 50, agreeableness: 50, emotionalStability: 50 },
        astrology: { zodiacSign: "", element: "air", moonSign: "", ascendant: "" },
        numerology: { lifePath: 1, soulUrge: 1, destiny: 1 },
        birthDate: formData.birthDate || "1999-01-01",
      },
      inviterProfile
    );
  }, [formData.birthDate, formData.name, inviterProfile]);

  const handleRegister = async () => {
    setSubmitError(null);
    const emailOk =
      formData.email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    const phoneOk = !!normalizeRuPhone(formData.loginPhone);
    const idOk = formData.authMethod === "email" ? emailOk : phoneOk;
    if (!formData.agreeToAge18) {
      setSubmitError("Подтвердите, что вам 18 лет или больше");
      return;
    }
    if (!formData.name || !formData.password || !formData.birthDate || !formData.avatarUrl || !idOk) {
      setSubmitError("Заполните все обязательные поля, укажите email или корректный телефон и загрузите фото");
      return;
    }
    setSubmitting(true);
    const interestList = formData.interests
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const res = await register({
      authMethod: formData.authMethod,
      email: formData.authMethod === "email" ? formData.email.trim() : undefined,
      loginPhone: formData.authMethod === "phone" ? formData.loginPhone.trim() : undefined,
      password: formData.password,
      agreeToOffer: true,
      agreeToPrivacy: true,
      agreeToTerms: true,
      agreeToAge18: formData.agreeToAge18,
      name: formData.name.trim(),
      birthDate: formData.birthDate,
      gender: formData.gender,
      avatarUrl: formData.avatarUrl,
      bio: formData.bio.trim() || undefined,
      interests: interestList.length ? interestList : undefined,
    });
    setSubmitting(false);
    if (res.error || !res.data) {
      setSubmitError(res.error || "Не удалось зарегистрироваться");
      return;
    }
    await refreshUser();
    setStep("profile");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600">Загрузка...</div>;
  }

  if (loadError || !inviterProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
          <p className="text-red-600 mb-4">{loadError || "Профиль не найден"}</p>
          <button onClick={() => navigate("/")} className="px-6 py-3 bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-xl">
            На главную
          </button>
        </div>
      </div>
    );
  }

  if (step === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md w-full"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-amber-500 p-8 text-white text-center">
            <img src={matreshkaLogo} alt="Matreshka Logo" className="size-20 object-contain mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Любить по-russки</h1>
            <p className="text-white/90">
              Приглашение от {inviterProfile.name}
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="flex justify-center mb-6">
              <img
                src={inviterProfile.photo}
                alt={inviterProfile.name}
                className="size-32 rounded-full object-cover border-4 border-gradient-to-r from-red-500 to-amber-500 shadow-xl"
              />
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {inviterProfile.name} хочет узнать вашу совместимость
              </h2>
              <p className="text-gray-600">
                Зарегистрируйтесь и узнайте, насколько вы подходите друг другу
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
                <div className="bg-red-500 p-2 rounded-full">
                  <Heart className="size-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">AI Совместимость</p>
                  <p className="text-sm text-gray-600">Алгоритм рассчитает ваш процент</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl">
                <div className="bg-amber-500 p-2 rounded-full">
                  <Sparkles className="size-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">Мистический анализ</p>
                  <p className="text-sm text-gray-600">Астрология и нумерология</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep("register")}
              className="w-full py-4 bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
            >
              Зарегистрироваться
              <ArrowRight className="size-6" />
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Уже есть аккаунт? <button className="text-red-500 font-semibold">Войти</button>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (step === "register") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md w-full"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-amber-500 p-6 text-white">
            <h2 className="text-2xl font-bold">Регистрация</h2>
            <p className="text-white/80 text-sm">Заполните информацию о себе</p>
          </div>

          {/* Form */}
          <div className="p-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Имя
              </label>
              <div className="relative">
                <Heart className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Ваше имя"
                />
              </div>
            </div>

            <div className="flex gap-2 rounded-xl bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setFormData((d) => ({ ...d, authMethod: "email" }))}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                  formData.authMethod === "email" ? "bg-white text-red-600 shadow" : "text-gray-600"
                }`}
              >
                По почте
              </button>
              <button
                type="button"
                onClick={() => setFormData((d) => ({ ...d, authMethod: "phone" }))}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                  formData.authMethod === "phone" ? "bg-white text-red-600 shadow" : "text-gray-600"
                }`}
              >
                По телефону
              </button>
            </div>
            {formData.authMethod === "email" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
            )}
            {formData.authMethod === "phone" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Номер телефона</label>
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={formData.loginPhone}
                  onChange={(e) => setFormData({ ...formData, loginPhone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="+7 9XX XXX-XX-XX"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Пароль
              </label>
              <div className="relative">
                <Heart className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Дата рождения *</label>
              <input
                type="date"
                max={getAdultMaxDate()}
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Пол *</label>
              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value as "male" | "female" })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="female">Женский</option>
                <option value="male">Мужской</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Основное фото *</label>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 p-3 text-gray-600 hover:bg-gray-50">
                <Camera className="size-4" />
                <span>{formData.avatarUrl ? "Фото загружено" : "Загрузить фото"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const r = await uploadFile(file, { forRegistration: true });
                    if (r.url) setFormData((d) => ({ ...d, avatarUrl: r.url! }));
                    else setSubmitError(r.error || "Ошибка загрузки");
                  }}
                />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">О себе</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                placeholder="Коротко о себе"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Интересы (через запятую)</label>
              <input
                value={formData.interests}
                onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Кино, музыка"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={formData.agreeToAge18}
                onChange={(e) => setFormData((d) => ({ ...d, agreeToAge18: e.target.checked }))}
                className="mt-1 size-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
              />
              <span className="text-sm text-gray-700 leading-relaxed font-medium">
                Мне исполнилось 18 лет (обязательно)
              </span>
            </label>

            <button
              onClick={() => void handleRegister()}
              disabled={
                submitting ||
                !formData.agreeToAge18 ||
                !formData.name ||
                !formData.password ||
                !formData.birthDate ||
                !formData.avatarUrl ||
                (formData.authMethod === "email" &&
                  (!formData.email.trim() ||
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))) ||
                (formData.authMethod === "phone" && !normalizeRuPhone(formData.loginPhone))
              }
              className="w-full py-4 bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {submitting ? "Регистрация..." : "Продолжить"}
            </button>
            {submitError && <p className="text-sm text-red-600 mt-2">{submitError}</p>}
          </div>
        </motion.div>
      </div>
    );
  }

  // Profile view
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-block"
          >
            <div className="bg-white rounded-full p-4 shadow-xl mb-4">
              <Heart className="size-12 text-red-500" />
            </div>
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Добро пожаловать, {formData.name}!
          </h2>
          <p className="text-gray-600">
            Вот профиль {inviterProfile.name} и ваша совместимость
          </p>
        </div>

        <div className="mb-6">
          <ProfileCard profile={inviterProfile} compatibility={compatibility} />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Ваша совместимость</p>
            <div className="text-5xl font-bold bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent">
              {compatibility}%
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            {inviterProfile.name} увидит ваш профиль и процент совместимости
          </p>
          <button
            onClick={() => navigate("/app")}
            className="w-full py-3 bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
          >
            Перейти в приложение
          </button>
        </div>
      </motion.div>
    </div>
  );
}