import { Heart, Sparkles, Shield, MessageCircle, Zap, Globe, Download, ArrowRight, Star, UsersRound, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import matreshkaLogo from "../../imports/1775050275_(1)_3_(1)-1.png";
import { AuthModal } from "./AuthModal";
import { useAuth } from "../contexts/AuthContext";

export function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  // Redirect to app if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/app");
    }
  }, [isAuthenticated, loading, navigate]);

  const handleGetStarted = () => {
    setShowAuth(true);
  };

  const handleAuthSuccess = () => {
    // The AuthContext will handle the state update
    // Just close the modal and let the useEffect handle the navigation
    setShowAuth(false);
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

  const stats = [
    { value: "50K+", label: "Активных пользователей" },
    { value: "10K+", label: "Счастливых пар" },
    { value: "95%", label: "Точность AI" },
  ];

  return (
    <div className="size-full bg-gradient-to-br from-red-50 via-amber-50 to-yellow-50 overflow-y-auto">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={matreshkaLogo} 
              alt="Matreshka Logo" 
              className="size-10 object-contain"
            />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent">
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
          <button
            onClick={handleGetStarted}
            className="px-6 py-2 bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-full font-medium hover:shadow-lg transition-all"
          >
            Войти
          </button>
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
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent">
            Знакомства с русской душой
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-700 mb-4 max-w-3xl mx-auto font-medium">
            Люди — это наше богатство
          </p>
          
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Мы создали простое и понятное приложение для знакомств, где искусственный интеллект помогает найти идеального партнера
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleGetStarted}
              className="group px-8 py-4 bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-full text-lg font-medium hover:shadow-2xl transition-all flex items-center gap-2"
            >
              <Download className="size-5" />
              Начать знакомство
              <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <a
              href="https://forruss.ru"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white text-gray-800 rounded-full text-lg font-medium hover:shadow-lg transition-all border-2 border-gray-200 flex items-center gap-2"
            >
              <Globe className="size-5" />
              Посетить forruss.ru
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-gray-600">{stat.label}</div>
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

      {/* Testimonials */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Истории успеха
            </h3>
            <p className="text-lg text-gray-600">
              Настоящие отзывы счастливых пар
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Анна и Дмитрий", text: "Встретились через приложение 6 месяцев назад. AI показал 94% совместимости, и он не ошибся!", rating: 5 },
              { name: "Мария и Александр", text: "Спасибо за супер-лайк! Без него мы бы никогда не познакомились. Теперь планируем свадьбу!", rating: 5 },
              { name: "Екатерина", text: "Лучшее приложение для знакомств! Интерфейс удобный, люди адекватные. Рекомендую!", rating: 5 },
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-red-50 to-amber-50"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="size-5 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <p className="font-medium text-gray-900">— {testimonial.name}</p>
              </motion.div>
            ))}
          </div>
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
              Присоединяйтесь к тысячам счастливых пользователей уже сегодня
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-white text-red-600 rounded-full text-lg font-medium hover:shadow-2xl transition-all flex items-center gap-2"
              >
                <Download className="size-5" />
                Начать сейчас
              </button>
              <a
                href="https://forruss.ru"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full text-lg font-medium hover:bg-white/20 transition-all border-2 border-white/30 flex items-center gap-2"
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
                <li><button onClick={handleGetStarted} className="hover:text-white transition-colors">Функции</button></li>
                <li><button onClick={handleGetStarted} className="hover:text-white transition-colors">Тарифы</button></li>
                <li><button onClick={handleGetStarted} className="hover:text-white transition-colors">Безопасность</button></li>
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
          onClose={() => setShowAuth(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}