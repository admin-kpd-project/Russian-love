import { useState } from "react";
import { motion } from "motion/react";
import { X, Mail, Lock, User, Phone, Heart, Calendar, Shield, MessageCircle, Camera, ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react";
import DatePicker, { registerLocale } from "react-datepicker";
import InputMask from "react-input-mask";
import ru from "date-fns/locale/ru";
import "react-datepicker/dist/react-datepicker.css";
import matreshkaLogo from "../../imports/1775050275_(1)_3_(1)-1.png";
import matreshkaLogoWhite from "../../imports/1775050275_(1)_4.png";
import { login, register, redirectToYandexOAuth, redirectToMessengerOAuth } from "../services/authService";
import { useAuth } from "../contexts/AuthContext";

registerLocale("ru", ru);

interface AuthModalProps {
  show?: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
  onSuccess?: () => void;
}

export function AuthModal({ show = true, onClose, onAuthSuccess, onSuccess }: AuthModalProps) {
  const { refreshUser } = useAuth();
  
  const handleSuccess = async () => {
    // Refresh user data in AuthContext
    await refreshUser();
    
    // Call parent callbacks
    if (onSuccess) onSuccess();
    if (onAuthSuccess) onAuthSuccess();
  };

  const [mode, setMode] = useState<"login" | "register" | "reset">("login");
  const [resetEmail, setResetEmail] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    isOver18: false,
    agreeToPrivacy: false,
    agreeToTerms: false,
    agreeToOffer: false,
    agreeToNewsletter: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!isLogin && !formData.name.trim()) {
      newErrors.name = "Введите имя";
    }

    if (!isLogin && !formData.birthDate.trim()) {
      newErrors.birthDate = "Введите дату рождения";
    } else if (!isLogin && formData.birthDate) {
      const today = new Date();
      const birthDate = new Date(formData.birthDate);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 18) {
        newErrors.birthDate = "Вам должно быть не менее 18 лет";
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = "Введите email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Неверный формат email";
    }

    if (!isLogin && !formData.phone.trim()) {
      newErrors.phone = "Введите номер телефона";
    }

    if (!formData.password) {
      newErrors.password = "Введите пароль";
    } else if (!isLogin && formData.password.length < 6) {
      newErrors.password = "Пароль должен содержать минимум 6 символов";
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Пароли не совпадают";
    }

    if (!isLogin && !formData.isOver18) {
      newErrors.isOver18 = "Подтвердите, что вам есть 18 лет";
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
          name: formData.name,
          birthDate: formData.birthDate,
          email: formData.email,
          phone: formData.phone || undefined,
          password: formData.password,
          agreeToPrivacy: formData.agreeToPrivacy,
          agreeToTerms: formData.agreeToTerms,
          agreeToOffer: formData.agreeToOffer,
        });
        
        if (response.error) {
          setErrors({ email: response.error });
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

  const isLogin = mode === "login";
  const isRegister = mode === "register";
  const isReset = mode === "reset";

  // Calculate max date (18 years ago from today)
  const maxBirthDate = (() => {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return maxDate.toISOString().split('T')[0];
  })();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-red-500 to-amber-500 px-6 py-8">
          {isReset && (
            <button
              onClick={() => {
                setMode("login");
                setResetEmail("");
                setResetEmailSent(false);
              }}
              className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="size-6 text-white" />
            </button>
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
          >
            <X className="size-6 text-white" />
          </button>
          
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="size-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <img
                  src={matreshkaLogoWhite}
                  alt="Matreshka Logo"
                  className="size-14 object-contain"
                />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {isReset ? "Восстановление пароля" : isLogin ? "Добро пожаловать!" : "Регистрация"}
            </h2>
            <p className="text-white/90 text-sm">
              {isReset 
                ? "Введите email для получения ссылки" 
                : isLogin 
                ? "Войдите, чтобы найти свою половинку" 
                : "Создайте аккаунт и начните знакомства"}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-180px)]">
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
              {/* Profile Photo Upload (registration only) */}
              {!isLogin && (
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      id="profile-photo-upload"
                    />
                    <label
                      htmlFor="profile-photo-upload"
                      className="block cursor-pointer"
                    >
                      <div className="relative size-24 rounded-full bg-gray-100 border-4 border-white shadow-lg overflow-hidden hover:opacity-90 transition-opacity">
                        {profilePhoto ? (
                          <img
                            src={profilePhoto}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-100 to-amber-100">
                            <Camera className="size-8 text-red-500" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Camera className="size-6 text-white" />
                        </div>
                      </div>
                    </label>
                    <div className="absolute -bottom-1 -right-1 size-8 bg-red-500 rounded-full flex items-center justify-center shadow-md border-2 border-white">
                      <Camera className="size-4 text-white" />
                    </div>
                  </div>
                </div>
              )}

              {/* Name field (registration only) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Имя
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Ваше имя"
                      className={`w-full pl-10 pr-4 py-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500`}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>
              )}

              {/* Birth Date field (registration only) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Дата рождения <span className="text-xs text-gray-500">(вам должно быть не менее 18 лет)</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400 pointer-events-none z-10" />
                    <DatePicker
                      selected={formData.birthDate ? new Date(formData.birthDate) : null}
                      onChange={(date) => {
                        if (date) {
                          handleInputChange("birthDate", date.toISOString().split('T')[0]);
                        }
                      }}
                      dateFormat="dd.MM.yyyy"
                      locale="ru"
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      maxDate={new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate())}
                      placeholderText="Выберите дату"
                      className={`w-full pl-10 pr-4 py-3 border ${errors.birthDate ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500`}
                      wrapperClassName="w-full"
                    />
                  </div>
                  {errors.birthDate && (
                    <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>
                  )}
                </div>
              )}

              {/* Email field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="example@mail.ru"
                    className={`w-full pl-10 pr-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone field (registration only) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Телефон
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                    <InputMask
                      mask="+7 (999) 999-99-99"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+7 (___) ___-__-__"
                      className={`w-full pl-10 pr-4 py-3 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
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

              {/* Terms and Conditions (registration only) */}
              {!isLogin && (
                <div className="space-y-3 pt-2">
                  {/* Age confirmation */}
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isOver18}
                        onChange={(e) => handleInputChange("isOver18", e.target.checked)}
                        className="mt-1 size-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-600 leading-relaxed">
                        Мне уже есть 18 лет
                      </span>
                    </label>
                    {errors.isOver18 && (
                      <p className="text-red-500 text-xs mt-1 ml-7">{errors.isOver18}</p>
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
                        name: "",
                        birthDate: "",
                        email: "",
                        phone: "",
                        password: "",
                        confirmPassword: "",
                        isOver18: false,
                        agreeToPrivacy: false,
                        agreeToTerms: false,
                        agreeToOffer: false,
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
      </motion.div>
    </motion.div>
  );
}