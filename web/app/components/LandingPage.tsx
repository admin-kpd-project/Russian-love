import { Heart, Sparkles, Shield, MessageCircle, Zap, Globe, Download, ArrowRight, Star, UsersRound, TrendingUp, LogIn } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useNavigate } from "react-router";
import matreshkaLogo from "../../imports/1775050275_(1)_3_(1)-1.png";
import { AuthModal } from "./AuthModal";
import { getCurrentUser } from "../services/usersService";

export function LandingPage() {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<"login" | "register">("register");
  const appDownloadUrl = (import.meta.env.VITE_APP_DOWNLOAD_URL ?? "").trim();

  const openRegister = () => {
    setAuthInitialMode("register");
    setShowAuth(true);
  };

  const openLogin = () => {
    setAuthInitialMode("login");
    setShowAuth(true);
  };

  const handleAuthSuccess = async () => {
    setShowAuth(false);
    const res = await getCurrentUser();
    if (!res.data) return;
    navigate("/app", { replace: true });
  };

  const features = [
    {
      icon: Sparkles,
      title: "AI-алгоритм совместимости",
      description: "Умный искусственный интеллект анализирует интересы и характеры для расчета процента совместимости"
    },
    {
      icon: Heart,
      title: "Взаимные симпатии",
      description: "Свайп-механика и уведомления о match только при взаимной симпатии"
    },
    {
      icon: MessageCircle,
      title: "Безопасные чаты",
      description: "Общайтесь только с теми, с кем произошел match"
    },
    {
      icon: Shield,
      title: "Проверенные профили",
      description: "Модерация и верификация для безопасного знакомства"
    },
    {
      icon: Zap,
      title: "Супер-лайки",
      description: "Гарантированное совпадение с особенными людьми"
    },
    {
      icon: Globe,
      title: "Русская душа",
      description: "Специально для тех, кто ценит русские традиции и культуру"
    }
  ];

  const mvpHighlights = [
    { value: "MVP", label: "Сервис в развитии" },
    { value: "AI", label: "Совместимость и аналитика" },
    { value: "24/7", label: "Доступ к приложению" },
  ];

  return (
    <div className="size-full min-h-dvh bg-gradient-to-br from-red-50 via-amber-50 to-yellow-50 overflow-y-auto pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {/* Header — как на forruss.ru: отдельно «начать» и «войти» */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 pt-[max(0px,env(safe-area-inset-top))]">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img 
              src={matreshkaLogo} 
              alt="Matreshka Logo" 
              className="size-9 sm:size-10 object-contain shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent truncate">
                Любить по-russки
              </h1>
              <a 
                href="https://forruss.ru" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-gray-600 hover:text-red-600 transition-colors"
              >
                forruss.ru
              </a>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={openRegister}
              className="min-h-11 min-w-[44px] px-4 sm:px-5 py-2.5 rounded-full text-sm sm:text-base font-medium border-2 border-red-200 text-red-600 hover:bg-red-50 transition-all"
            >
              Регистрация
            </button>
            <button
              type="button"
              onClick={openLogin}
              className="min-h-11 min-w-[44px] px-4 sm:px-6 py-2.5 bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-full text-sm sm:text-base font-medium hover:shadow-lg transition-all inline-flex items-center justify-center gap-1.5"
            >
              <LogIn className="size-4 sm:size-5" />
              Войти
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="flex justify-center mb-8">
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-red-500 to-amber-500 rounded-full blur-xl opacity-20"
              />
              <img 
                src={matreshkaLogo} 
                alt="Matreshka Logo" 
                className="size-32 object-contain relative z-10"
              />
            </div>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent px-1">
            Знакомства с русской душой
          </h2>
          
          <p className="text-lg sm:text-xl md:text-2xl text-gray-800 mb-3 max-w-3xl mx-auto font-medium px-2">
            Уникальное приложение для знакомств с AI-алгоритмом расчёта совместимости
          </p>
          
          <p className="text-base sm:text-lg text-gray-600 mb-8 sm:mb-10 max-w-2xl mx-auto px-2">
            Искусственный интеллект анализирует ваши интересы, характер и ценности, чтобы помочь найти подходящего партнёра
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-2xl mx-auto px-1">
            <button
              type="button"
              onClick={openRegister}
              className="group min-h-[44px] px-6 sm:px-8 py-3.5 bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-full text-base sm:text-lg font-medium hover:shadow-2xl transition-all flex items-center justify-center gap-2"
            >
              <Download className="size-5 shrink-0" />
              Начать знакомство
              <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>
            <button
              type="button"
              onClick={openLogin}
              className="min-h-[44px] px-6 sm:px-8 py-3.5 bg-white text-gray-800 rounded-full text-base sm:text-lg font-medium hover:shadow-lg transition-all border-2 border-gray-200 flex items-center justify-center gap-2"
            >
              <LogIn className="size-5" />
              Войти
            </button>
            <a
              href="https://forruss.ru"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] px-6 sm:px-8 py-3.5 bg-white/60 text-gray-700 rounded-full text-base sm:text-lg font-medium hover:bg-white border border-dashed border-gray-300 flex items-center justify-center gap-2"
            >
              <Globe className="size-5" />
              forruss.ru
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 mt-12 sm:mt-16 max-w-3xl mx-auto px-2">
            {mvpHighlights.map((row, index) => (
              <motion.div
                key={row.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                className="text-center rounded-2xl bg-white/50 px-3 py-3 border border-amber-100/80"
              >
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                  {row.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 leading-snug">{row.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Почему выбирают нас?
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Современные технологии встречаются с традиционными ценностями
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-red-50 to-amber-50 hover:shadow-lg transition-shadow"
                >
                  <div className="size-12 bg-gradient-to-br from-red-500 to-amber-500 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="size-6 text-white" />
                  </div>
                  <h4 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h4>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-red-500 to-amber-500">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Наши ценности
            </h3>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Философия, на которой построено наше приложение
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Value 1: People */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border-2 border-white/20"
            >
              <div className="size-16 bg-white rounded-2xl flex items-center justify-center mb-6">
                <UsersRound className="size-8 text-red-600" />
              </div>
              <h4 className="text-2xl md:text-3xl font-bold mb-4 text-white">
                Люди — это наше богатство
              </h4>
              <p className="text-lg text-white/90 leading-relaxed mb-4">
                Мы верим, что каждый человек уникален и ценен. Наша миссия — помочь людям найти друг друга, создавая пространство для искренних знакомств и настоящих отношений.
              </p>
              <p className="text-base text-white/80 leading-relaxed">
                Мы не просто технологическая платформа. Мы создаём сообщество, где каждый может найти своё счастье, будучи самим собой.
              </p>
            </motion.div>

            {/* Value 2: Simplicity */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border-2 border-white/20"
            >
              <div className="size-16 bg-white rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="size-8 text-amber-600" />
              </div>
              <h4 className="text-2xl md:text-3xl font-bold mb-4 text-white">
                Простота и понятность
              </h4>
              <p className="text-lg text-white/90 leading-relaxed mb-4">
                Технологии должны упрощать жизнь, а не усложнять её. Мы создали интуитивно понятное приложение, где каждая функция на своём месте.
              </p>
              <p className="text-base text-white/80 leading-relaxed">
                Никаких сложных настроек или запутанных меню. Просто скачайте приложение и начните знакомиться — всё остальное мы взяли на себя.
              </p>
            </motion.div>
          </div>

          {/* Additional Values */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {[
              {
                icon: Shield,
                title: "Безопасность",
                description: "Защита данных и модерация контента — наш приоритет"
              },
              {
                icon: Heart,
                title: "Искренность",
                description: "Мы за настоящие эмоции и честные отношения"
              },
              {
                icon: Star,
                title: "Качество",
                description: "Внимание к деталям и забота о пользователях"
              }
            ].map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center"
                >
                  <div className="size-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="size-6 text-red-600" />
                  </div>
                  <h5 className="text-lg font-bold text-white mb-2">{value.title}</h5>
                  <p className="text-sm text-white/80">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Simplicity Showcase Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Просто, понятно, удобно
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Всё, что вам нужно для знакомств — в одном приложении
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left side - Features */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {[
                {
                  icon: Sparkles,
                  title: "Интуитивный интерфейс",
                  description: "Не нужно читать инструкции — всё понятно с первого взгляда"
                },
                {
                  icon: Zap,
                  title: "Быстрый старт",
                  description: "Регистрация за 2 минуты, и вы уже смотрите профили"
                },
                {
                  icon: Heart,
                  title: "Свайп-механика",
                  description: "Знакомый жест свайпа — влево или вправо, всё просто"
                },
                {
                  icon: MessageCircle,
                  title: "Удобные чаты",
                  description: "Общайтесь так же легко, как в любом мессенджере"
                }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="size-12 bg-gradient-to-br from-red-500 to-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="size-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Right side - Visual representation */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-red-50 to-amber-50 rounded-3xl p-8 md:p-12">
                <div className="aspect-[3/4] bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center justify-center">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, -2, 2, 0]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="size-32 bg-gradient-to-br from-red-500 to-amber-500 rounded-full flex items-center justify-center mb-6"
                  >
                    <Heart className="size-16 text-white" />
                  </motion.div>
                  <div className="text-center">
                    <div className="text-6xl font-bold bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent mb-2">
                      3
                    </div>
                    <div className="text-gray-600 font-medium">
                      Простых шага<br/>до знакомства
                    </div>
                  </div>
                  <div className="mt-8 flex gap-2">
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: i * 0.1 }}
                        className="size-3 bg-gradient-to-r from-red-500 to-amber-500 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Как это работает?
            </h3>
            <p className="text-lg text-gray-600">
              Три простых шага к счастью
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { number: "1", title: "Создайте профиль", description: "Расскажите о себе, своих интересах и предпочтениях", icon: UsersRound },
              { number: "2", title: "Смотрите профили", description: "Свайпайте карточки и находите совместимых людей", icon: Heart },
              { number: "3", title: "Общайтесь", description: "При взаимной симпатии начинайте общение", icon: MessageCircle },
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="text-center"
                >
                  <div className="relative mb-6">
                    <div className="size-20 bg-gradient-to-br from-red-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="size-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 size-10 bg-white rounded-full shadow-lg flex items-center justify-center font-bold text-xl text-red-600">
                      {step.number}
                    </div>
                  </div>
                  <h4 className="text-xl font-bold mb-3 text-gray-900">{step.title}</h4>
                  <p className="text-gray-600">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Android APK / скачивание вне магазина */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-amber-50/80 to-white">
        <div className="max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-amber-200/80 bg-white/90 p-6 md:p-8 shadow-lg"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Download className="size-6 text-red-600 shrink-0" />
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">
                Приложение для Android
              </h3>
            </div>
            {appDownloadUrl ? (
              <>
                <p className="text-gray-700 text-center mb-4">
                  Скачайте APK-файл и установите приложение вручную (для теста и дистрибуции вне Google Play).
                </p>
                <a
                  href={appDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-amber-500 px-6 py-3.5 text-lg font-medium text-white shadow-md hover:shadow-xl transition-shadow"
                >
                  <Download className="size-5 shrink-0" />
                  Скачать APK
                </a>
                <p className="mt-4 text-xs text-gray-600 leading-relaxed border-t border-amber-100 pt-4">
                  Установка из неизвестного источника: в настройках Android разрешите установку для браузера или
                  проводника, с которого открываете файл. Скачивайте APK только с доверенного адреса; при появлении
                  публикации в магазине ссылка может быть обновлена.
                </p>
              </>
            ) : (
              <p className="text-center text-gray-600">
                Скоро: прямая ссылка на APK и, при публикации, магазин Google Play. Следите за обновлениями на{" "}
                <a
                  href="https://forruss.ru"
                  className="text-red-600 hover:underline font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  forruss.ru
                </a>
                .
              </p>
            )}
          </motion.div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Истории успеха
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              Мы в режиме MVP: раздел с реальными отзывами и историями появится позже. Сейчас приоритет — стабильность, безопасность и честные знакомства.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-red-500 to-amber-500 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl"
          >
            <TrendingUp className="size-16 mx-auto mb-6" />
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Готовы найти свою половинку?
            </h3>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Создайте аккаунт или войдите — и пройдите настройку профиля, чтобы увидеть ленту
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-2xl mx-auto">
              <button
                type="button"
                onClick={openRegister}
                className="min-h-[44px] px-8 py-4 bg-white text-red-600 rounded-full text-lg font-medium hover:shadow-2xl transition-all flex items-center justify-center gap-2"
              >
                <Download className="size-5" />
                Начать сейчас
              </button>
              <button
                type="button"
                onClick={openLogin}
                className="min-h-[44px] px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full text-lg font-medium hover:bg-white/20 transition-all border-2 border-white/30 flex items-center justify-center gap-2"
              >
                <LogIn className="size-5" />
                Войти
              </button>
              <a
                href="https://forruss.ru"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] px-8 py-4 text-white/95 rounded-full text-lg font-medium border border-white/30 flex items-center justify-center gap-2 hover:bg-white/10"
              >
                <Globe className="size-5" />
                forruss.ru
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src={matreshkaLogo} 
                  alt="Matreshka Logo" 
                  className="size-10 object-contain brightness-0 invert"
                />
                <div className="text-lg font-bold">Любить по-russки</div>
              </div>
              <p className="text-gray-400 text-sm">
                Знакомства с искусственным интеллектом и русской душой
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Продукт</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button type="button" onClick={openRegister} className="hover:text-white transition-colors min-h-10 text-left w-full sm:w-auto">Регистрация</button></li>
                <li><a href="https://forruss.ru" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors inline-block min-h-10 py-1.5">Тарифы</a></li>
                <li><button type="button" onClick={openLogin} className="hover:text-white transition-colors min-h-10 text-left w-full sm:w-auto">Вход</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Компания</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="https://forruss.ru" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">О нас</a></li>
                <li><a href="https://forruss.ru" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Блог</a></li>
                <li><a href="https://forruss.ru" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Контакты</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Документы</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="https://forruss.ru" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Политика обработки персональных данных</a></li>
                <li><a href="https://forruss.ru" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Согласие на обработку персональных данных</a></li>
                <li><a href="https://forruss.ru" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Руководство пользователя</a></li>
                <li><a href="https://forruss.ru" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Описание функциональных характеристик</a></li>
                <li><a href="https://forruss.ru" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Материалы для инвестора</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col gap-4 text-sm text-gray-400">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <p>
                  <span className="font-semibold text-white">АО «КПД»</span> • Основная деятельность: Разработка компьютерного программного обеспечения [62.01]
                </p>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <p>
                  Юридический адрес: 107497, город Москва, Монтажная ул, д. 9 стр. 1, помещ. 6/2 • ОГРН: 1257700237453
                </p>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t border-gray-800">
                <p>
                  © 2025 г. АО «КПД». Все права защищены и охраняются законом.
                </p>
                <a 
                  href="https://forruss.ru" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <Globe className="size-4" />
                  forruss.ru
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal
          initialMode={authInitialMode}
          onClose={() => setShowAuth(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}