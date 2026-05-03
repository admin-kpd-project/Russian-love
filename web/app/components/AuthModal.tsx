import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Mail, Lock, Heart, Shield, MessageCircle, ArrowLeft, CheckCircle, Eye, EyeOff, Camera, Phone } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import matreshkaLogoWhite from "../../imports/1775050275_(1)_4.png";
import { login, register, redirectToYandexOAuth, redirectToMessengerOAuth } from "../services/authService";
import { uploadFile } from "../services/uploadService";
import { useAuth } from "../contexts/AuthContext";
import { normalizeRuPhone } from "../utils/phone";
import { ModalShell } from "./ui/modal-shell";

function getAdultMaxDate(): string {
  const today = new Date();
  const d = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  return d.toISOString().split("T")[0];
}

interface AuthModalProps {
  show?: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void | Promise<void>;
  onSuccess?: () => void | Promise<void>;
  /** When opening the modal, start on login (вход) or register (регистрация). */
  initialMode?: "login" | "register";
}

export function AuthModal({
  show = true,
  onClose,
  onAuthSuccess,
  onSuccess,
  initialMode = "login",
}: AuthModalProps) {
  const { refreshUser } = useAuth();
  
  const handleSuccess = async () => {
    // Refresh user data in AuthContext
    await refreshUser();
    
    // Call parent callbacks
    if (onSuccess) await Promise.resolve(onSuccess());
    if (onAuthSuccess) await Promise.resolve(onAuthSuccess());
  };

  const [mode, setMode] = useState<"login" | "register" | "reset">(initialMode);
  const [resetEmail, setResetEmail] = useState("");
  const formScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show) {
      setMode(initialMode);
    }
  }, [show, initialMode]);

  useEffect(() => {
    if (show && formScrollRef.current) {
      formScrollRef.current.scrollTop = 0;
    }
  }, [show, mode, initialMode]);
  const isLogin = mode === "login";
  const isRegister = mode === "register";
  const isReset = mode === "reset";
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    authMethod: "email" as "email" | "phone",
    loginPhone: "",
    password: "",
    confirmPassword: "",
    name: "",
    birthDate: "",
    gender: "female" as "male" | "female",
    avatarUrl: "",
    bio: "",
    interests: "",
    agreeToPrivacy: false,
    agreeToTerms: false,
    agreeToOffer: false,
    agreeToAge18: false,
    agreeToNewsletter: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (isLogin) {
      const raw = formData.email.trim();
      if (!raw) {
        newErrors.email = "Введите email или телефон";
      } else if (raw.includes("@")) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
          newErrors.email = "Неверный формат email";
        }
      } else if (!normalizeRuPhone(raw)) {
        newErrors.email = "Введите корректный номер (российский мобильный)";
      }
    } else if (formData.authMethod === "email") {
      if (!formData.email.trim()) {
        newErrors.email = "Введите email";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Неверный формат email";
      }
    } else {
      if (!formData.loginPhone.trim()) {
        newErrors.loginPhone = "Введите номер телефона";
      } else if (!normalizeRuPhone(formData.loginPhone)) {
        newErrors.loginPhone = "Введите корректный номер (российский мобильный)";
      }
    }

    if (!formData.password) {
      newErrors.password = "Введите пароль";
    } else if (!isLogin && formData.password.length < 6) {
      newErrors.password = "Пароль должен содержать минимум 6 символов";
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Пароли не совпадают";
    }

    if (!isLogin && !formData.agreeToPrivacy) {
      newErrors.agreeToPrivacy = "Необходимо согласие на обработку данных";
    }

    if (!isLogin && !formData.agreeToTerms) {
      newErrors.agreeToTerms = "Необходимо согласие с пользовательским соглашением";
    }

    if (!isLogin && !formData.agreeToOffer) {
      newErrors.agreeToOffer = "Необходимо согласие с публичной офертой";
    }

    if (!isLogin && !formData.agreeToAge18) {
      newErrors.agreeToAge18 = "Подтвердите, что вам 18 лет или больше";
    }

    if (!isLogin) {
      if (!formData.name.trim()) newErrors.name = "Введите имя";
      if (!formData.birthDate) newErrors.birthDate = "Укажите дату рождения";
      if (!formData.avatarUrl) newErrors.avatarUrl = "Загрузите фото профиля";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAvatarUpload = async (file?: File) => {
    if (!file) return;
    const res = await uploadFile(file, { forRegistration: true });
    if (!res.url) {
      setErrors((prev) => ({ ...prev, avatarUrl: res.error || "Ошибка загрузки" }));
      return;
    }
    setFormData((p) => ({ ...p, avatarUrl: res.url! }));
    setErrors((prev) => {
      const n = { ...prev };
      delete n.avatarUrl;
      return n;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (isLogin) {
        // Login
        const response = await login({
          email: formData.email,
          password: formData.password,
        });
        
        if (response.error) {
          setErrors({ password: response.error });
        } else if (response.data) {
          handleSuccess();
        }
      } else {
        // Register
        const response = await register({
          authMethod: formData.authMethod,
          email: formData.authMethod === "email" ? formData.email.trim() : undefined,
          loginPhone: formData.authMethod === "phone" ? formData.loginPhone.trim() : undefined,
          password: formData.password,
          agreeToPrivacy: formData.agreeToPrivacy,
          agreeToTerms: formData.agreeToTerms,
          agreeToOffer: formData.agreeToOffer,
          agreeToAge18: formData.agreeToAge18,
          name: formData.name.trim(),
          birthDate: formData.birthDate,
          gender: formData.gender,
          avatarUrl: formData.avatarUrl,
          bio: formData.bio.trim() || undefined,
          interests: (() => {
            const list = formData.interests
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
            return list.length ? list : undefined;
          })(),
        });
        
        if (response.error) {
          setErrors(
            formData.authMethod === "email"
              ? { email: response.error }
              : { loginPhone: response.error }
          );
        } else if (response.data) {
          handleSuccess();
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      setErrors({ password: "Произошла ошибка. Попробуйте еще раз." });
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
      return;
    }
    // Simulate sending reset email
    setResetEmailSent(true);
  };

  return (
    <ModalShell
      onClose={onClose}
      ariaLabel={isReset ? "Восстановление пароля" : isLogin ? "Вход" : "Регистрация"}
      disableBackdropClose
      hideCloseButton
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-red-500 to-amber-500 px-5 sm:px-6 py-5 flex-shrink-0">
          {isReset && (
            <button
              onClick={() => {
                setMode("login");
                setResetEmail("");
                setResetEmailSent(false);
              }}
              className="absolute top-3 left-3 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
              aria-label="Назад"
            >
              <ArrowLeft className="size-5 text-white" />
            </button>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
            aria-label="Закрыть"
          >
            <span className="block size-5 leading-none text-white text-xl">×</span>
          </button>

          <div className="text-center">
            <div className="flex justify-center mb-2">
              <div className="size-14 sm:size-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <img
                  src={matreshkaLogoWhite}
                  alt="Matreshka Logo"
                  className="size-10 sm:size-12 object-contain"
                />
              </div>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mb-0.5">
              {isReset ? "Восстановление пароля" : isLogin ? "Добро пожаловать!" : "Регистрация"}
            </h2>
            <p className="text-white/90 text-[11px] sm:text-xs">
              {isReset
                ? "Введите email для получения ссылки"
                : isLogin
                ? "Войдите, чтобы найти свою половинку"
                : "Создайте аккаунт и начните знакомства"}
            </p>
          </div>
        </div>

        {/* Form */}
        <div
          ref={formScrollRef}
          className="px-5 sm:px-6 py-5 overflow-y-auto modal-scroll flex-1 min-h-0"
        >
          {isReset ? (
            /* Password Reset Form */
            <form onSubmit={handleResetPassword} className="space-y-4">
              {resetEmailSent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="flex justify-center mb-4">
                    <div className="size-16 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="size-10 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Письмо отправлено!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Проверьте ваш email <span className="font-medium text-gray-800">{resetEmail}</span>
                    <br />
                    Ссылка для сброса пароля отправлена
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setResetEmail("");
                      setResetEmailSent(false);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
                  >
                    Вернуться ко входу
                  </button>
                </motion.div>
              ) : (
                <>
                  <div className="mb-6 text-center">
                    <p className="text-sm text-gray-600">
                      Мы отправим вам ссылку для сброса пароля на email
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                      <input
                        type="email"
                        autoComplete="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="example@mail.ru"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
                  >
                    <Mail className="size-5" />
                    Отправить ссылку
                  </button>
                  <div className="text-center pt-4 pb-6">
                    <button
                      type="button"
                      onClick={() => {
                        setMode("login");
                        setResetEmail("");
                      }}
                      className="text-sm text-gray-600 hover:text-red-600 py-2 px-4"
                    >
                      Вернуться ко входу
                    </button>
                  </div>
                </>
              )}
            </form>
          ) : (
            /* Login/Register Form */
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Способ регистрации: почта или телефон */}
              {isRegister && (
                <div className="flex gap-2 rounded-xl bg-gray-100 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((p) => ({ ...p, authMethod: "email" }));
                      setErrors((e) => {
                        const n = { ...e };
                        delete n.loginPhone;
                        return n;
                      });
                    }}
                    className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                      formData.authMethod === "email"
                        ? "bg-white text-red-600 shadow"
                        : "text-gray-600"
                    }`}
                  >
                    По почте
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((p) => ({ ...p, authMethod: "phone" }));
                      setErrors((e) => {
                        const n = { ...e };
                        delete n.email;
                        return n;
                      });
                    }}
                    className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                      formData.authMethod === "phone"
                        ? "bg-white text-red-600 shadow"
                        : "text-gray-600"
                    }`}
                  >
                    По телефону
                  </button>
                </div>
              )}

              {/* Логин: email или телефон; регистрация: одно из полей */}
              {isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email или телефон</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                    <input
                      type="text"
                      inputMode="email"
                      autoComplete="username"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="example@mail.ru или +7…"
                      className={`w-full pl-10 pr-4 py-3 border ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500`}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              )}
              {isRegister && formData.authMethod === "email" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                    <input
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="example@mail.ru"
                      className={`w-full pl-10 pr-4 py-3 border ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500`}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              )}
              {isRegister && formData.authMethod === "phone" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Номер телефона</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={formData.loginPhone}
                      onChange={(e) => handleInputChange("loginPhone", e.target.value)}
                      placeholder="+7 9XX XXX-XX-XX"
                      className={`w-full pl-10 pr-4 py-3 border ${
                        errors.loginPhone ? "border-red-500" : "border-gray-300"
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500`}
                    />
                  </div>
                  {errors.loginPhone && (
                    <p className="text-red-500 text-xs mt-1">{errors.loginPhone}</p>
                  )}
                </div>
              )}

              {/* Password field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Пароль
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-4 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500`}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password field (registration only) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Подтвердите пароль
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-4 py-3 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500`}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-gray-400"
                    >
                      {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              {/* Профиль — только при регистрации */}
              {!isLogin && (
                <div className="space-y-4 border-t border-gray-100 pt-4">
                  <p className="text-sm font-medium text-gray-800">Профиль</p>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Основное фото *</label>
                    <label className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 p-3 text-sm text-gray-600 hover:bg-gray-50">
                      <Camera className="size-4" />
                      <span>{formData.avatarUrl ? "Фото загружено" : "Загрузить фото"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => void handleAvatarUpload(e.target.files?.[0])}
                      />
                    </label>
                    {errors.avatarUrl && <p className="mt-1 text-xs text-red-500">{errors.avatarUrl}</p>}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Имя *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className={`w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Как вас зовут"
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Дата рождения *</label>
                    <input
                      type="date"
                      max={getAdultMaxDate()}
                      value={formData.birthDate}
                      onChange={(e) => handleInputChange("birthDate", e.target.value)}
                      className={`w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                        errors.birthDate ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.birthDate && <p className="mt-1 text-xs text-red-500">{errors.birthDate}</p>}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Пол *</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange("gender", e.target.value as "male" | "female")}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="female">Женский</option>
                      <option value="male">Мужской</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">О себе</label>
                    <textarea
                      rows={2}
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Коротко о себе"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Интересы (через запятую)</label>
                    <input
                      type="text"
                      value={formData.interests}
                      onChange={(e) => handleInputChange("interests", e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Кино, спорт, путешествия"
                    />
                  </div>
                </div>
              )}

              {/* Terms and Conditions (registration only) */}
              {!isLogin && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.agreeToAge18}
                        onChange={(e) => handleInputChange("agreeToAge18", e.target.checked)}
                        className="mt-1 size-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-600 leading-relaxed font-medium">
                        Мне исполнилось 18 лет (обязательно)
                      </span>
                    </label>
                    {errors.agreeToAge18 && (
                      <p className="text-red-500 text-xs mt-1 ml-7">{errors.agreeToAge18}</p>
                    )}
                  </div>
                  {/* Privacy Policy */}
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.agreeToPrivacy}
                        onChange={(e) => handleInputChange("agreeToPrivacy", e.target.checked)}
                        className="mt-1 size-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-600 leading-relaxed">
                        Я соглашаюсь с{" "}
                        <a href="#" className="text-red-600 hover:text-red-700 underline">
                          политикой обработки персональных данных
                        </a>
                      </span>
                    </label>
                    {errors.agreeToPrivacy && (
                      <p className="text-red-500 text-xs mt-1 ml-7">{errors.agreeToPrivacy}</p>
                    )}
                  </div>

                  {/* User Agreement */}
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.agreeToTerms}
                        onChange={(e) => handleInputChange("agreeToTerms", e.target.checked)}
                        className="mt-1 size-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-600 leading-relaxed">
                        Я соглашаюсь с{" "}
                        <a href="#" className="text-red-600 hover:text-red-700 underline">
                          пользовательским соглашением
                        </a>
                      </span>
                    </label>
                    {errors.agreeToTerms && (
                      <p className="text-red-500 text-xs mt-1 ml-7">{errors.agreeToTerms}</p>
                    )}
                  </div>

                  {/* Public Offer */}
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.agreeToOffer}
                        onChange={(e) => handleInputChange("agreeToOffer", e.target.checked)}
                        className="mt-1 size-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-600 leading-relaxed">
                        Я соглашаюсь с{" "}
                        <a href="#" className="text-red-600 hover:text-red-700 underline">
                          публичной офертой
                        </a>
                      </span>
                    </label>
                    {errors.agreeToOffer && (
                      <p className="text-red-500 text-xs mt-1 ml-7">{errors.agreeToOffer}</p>
                    )}
                  </div>

                  {/* Newsletter (optional) */}
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.agreeToNewsletter}
                        onChange={(e) => handleInputChange("agreeToNewsletter", e.target.checked)}
                        className="mt-1 size-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-600 leading-relaxed">
                        Я соглашаюсь{" "}
                        <a href="#" className="text-red-600 hover:text-red-700 underline">
                          на получение новостной и рекламной рассылки
                        </a>
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
              >
                <Heart className="size-5" />
                {isLogin ? "Войти" : "Зарегистрироваться"}
              </button>

              {/* Divider */}
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">или</span>
                </div>
              </div>

              {/* Social Auth Buttons */}
              <div className="space-y-3">
                {/* Госуслуги Button */}
                <button
                  type="button"
                  onClick={() => {
                    // Handle Госуслуги auth
                    redirectToYandexOAuth();
                  }}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:from-blue-700 hover:to-blue-800 flex items-center justify-center gap-2"
                >
                  <Shield className="size-5" />
                  {isLogin ? "Войти" : "Зарегистрироваться"} через Госуслуги
                </button>

                {/* MAX Messenger Button */}
                <button
                  type="button"
                  onClick={() => {
                    // Handle MAX messenger auth
                    redirectToMessengerOAuth();
                  }}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:from-purple-700 hover:to-purple-800 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="size-5" />
                  {isLogin ? "Войти" : "Зарегистрироваться"} через MAX
                </button>
              </div>

              {/* Toggle between login/register */}
              <div className="text-center pt-2">
                <p className="text-sm text-gray-800 font-medium py-4 px-4">
                  {isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode(isLogin ? "register" : "login");
                      setErrors({});
                      setFormData({
                        email: "",
                        authMethod: "email",
                        loginPhone: "",
                        password: "",
                        confirmPassword: "",
                        name: "",
                        birthDate: "",
                        gender: "female",
                        avatarUrl: "",
                        bio: "",
                        interests: "",
                        agreeToPrivacy: false,
                        agreeToTerms: false,
                        agreeToOffer: false,
                        agreeToAge18: false,
                        agreeToNewsletter: false,
                      });
                    }}
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    {isLogin ? "Зарегистрироваться" : "Войти"}
                  </button>
                </p>
              </div>

              {/* Forgot password (login only) */}
              {isLogin && (
                <div className="text-center pb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("reset");
                    }}
                    className="text-sm text-gray-600 hover:text-red-600 py-3 px-6 transition-colors"
                  >
                    Забыли пароль?
                  </button>
                </div>
              )}

              {/* Link to forruss.ru */}
              <div className="px-4 pb-4 text-center">
                <a 
                  href="https://forruss.ru" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-gray-500 hover:text-red-600 transition-colors"
                >
                  Подробнее на forruss.ru
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </ModalShell>
  );
}