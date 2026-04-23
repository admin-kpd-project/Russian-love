import { Heart, Download, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";
import { useParams } from "react-router";
import { datingProfiles } from "../data/profiles";
import { ProfileCard } from "./ProfileCard";
import matreshkaLogo from "../../imports/1775050275_(1)_3_(1)-1.png";
import { calculateCompatibility } from "../utils/compatibilityAI";

export function InvitePage() {
  const { inviterId } = useParams<{ inviterId: string }>();
  const [step, setStep] = useState<"intro" | "register" | "profile">("intro");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    gender: "female" as "male" | "female",
  });

  // Find inviter profile (для демонстрации используем первый профиль)
  const inviterProfile = datingProfiles[0];
  
  // Calculate compatibility with mock user data
  const mockNewUser = {
    name: formData.name || "Новый пользователь",
    age: parseInt(formData.age) || 25,
    gender: formData.gender,
  };
  
  const compatibility = calculateCompatibility(mockNewUser, inviterProfile);

  const handleRegister = () => {
    // Simulate registration
    if (formData.name && formData.email && formData.password && formData.age) {
      setStep("profile");
    }
  };

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Download className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="your@email.com"
                />
              </div>
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Возраст
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="25"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Пол
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as "male" | "female" })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="female">Женский</option>
                  <option value="male">Мужской</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleRegister}
              disabled={!formData.name || !formData.email || !formData.password || !formData.age}
              className="w-full py-4 bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              Продолжить
            </button>
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
          <button className="w-full py-3 bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow">
            Перейти в приложение
          </button>
        </div>
      </motion.div>
    </div>
  );
}