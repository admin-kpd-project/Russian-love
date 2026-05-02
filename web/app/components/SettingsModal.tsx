import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { X, Bell, Shield, MapPin, UsersRound, Globe, Trash2, ChevronRight, QrCode, Sparkles, AlertTriangle } from "lucide-react";
import { UserGuideModal } from "./UserGuideModal";

interface SettingsModalProps {
  onClose: () => void;
}

// Регионы и города России
const REGIONS_CITIES = {
  "Москва и область": ["Москва", "Химки", "Подольск", "Люберцы", "Мытищи", "Балашиха", "Королёв", "Одинцово"],
  "Санкт-Петербург и область": ["Санкт-Петербург", "Пушкин", "Петергоф", "Колпино", "Кронштадт", "Гатчина"],
  "Московская область": ["Красногорск", "Домодедово", "Видное", "Раменское", "Сергиев Посад", "Коломна"],
  "Краснодарский край": ["Краснодар", "Сочи", "Новороссийск", "Армавир", "Анапа", "Геленджик", "Туапсе"],
  "Ростовская область": ["Ростов-на-Дону", "Таганрог", "Шахты", "Новочеркасск", "Волгодонск", "Батайск"],
  "Свердловская область": ["Екатеринбург", "Нижний Тагил", "Каменск-Уральский", "Первоуральск", "Серов"],
  "Республика Татарстан": ["Казань", "Набережные Челны", "Нижнекамск", "Альметьевск", "Зеленодольск"],
  "Нижегородская область": ["Нижний Новгород", "Дзержинск", "Арзамас", "Саров", "Бор", "Кстово"],
  "Челябинская область": ["Челябинск", "Магнитогорск", "Златоуст", "Миасс", "Копейск", "Озёрск"],
  "Самарская область": ["Самара", "Тольятти", "Сызрань", "Новокуйбышевск", "Чапаевск"],
  "Республика Башкортостан": ["Уфа", "Стерлитамак", "Салават", "Нефтекамск", "Октябрьский"],
  "Пермский край": ["Пермь", "Березники", "Соликамск", "Чайковский", "Кунгур"],
  "Красноярский край": ["Красноярск", "Норильск", "Ачинск", "Канск", "Железногорск"],
  "Воронежская область": ["Воронеж", "Борисоглебск", "Россошь", "Лиски", "Нововоронеж"],
  "Волгоградская область": ["Волгоград", "Волжский", "Камышин", "Михайловка", "Урюпинск"],
  "Саратовская область": ["Саратов", "Энгельс", "Балаково", "Вольск", "Ртищево"],
  "Тюменская область": ["Тюмень", "Тобольск", "Ишим", "Ялуторовск"],
  "Иркутская область": ["Иркутск", "Братск", "Ангарск", "Усть-Илимск", "Черемхово"],
  "Алтайский край": ["Барнаул", "Бийск", "Рубцовск", "Новоалтайск", "Камень-на-Оби"],
  "Хабаровский край": ["Хабаровск", "Комсомольск-на-Амуре", "Амурск", "Советская Гавань"],
  "Приморский край": ["Владивосток", "Находка", "Уссурийск", "Артём", "Большой Камень"],
  "Новосибирская область": ["Новосибирск", "Бердск", "Искитим", "Куйбышев", "Обь"],
  "Омская область": ["Омск", "Тара", "Калачинск", "Исилькуль", "Называевск"],
  "Кемеровская область": ["Кемерово", "Новокузнецк", "Прокопьевск", "Ленинск-Кузнецкий"],
  "Республика Крым": ["Симферополь", "Севастополь", "Керчь", "Евпатория", "Ялта", "Феодосия"],
};

type SearchMode = "distance" | "city" | "both";

export function SettingsModal({ onClose }: SettingsModalProps) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [privateProfile, setPrivateProfile] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>("distance");
  const [searchDistance, setSearchDistance] = useState(50);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [ageRange, setAgeRange] = useState({ min: 18, max: 35 });
  const [language, setLanguage] = useState("ru");
  const [allowQRScan, setAllowQRScan] = useState(true);
  const [hideCityName, setHideCityName] = useState(false);
  const [allowAIAnalysis, setAllowAIAnalysis] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUserGuide, setShowUserGuide] = useState(false);

  const regions = Object.keys(REGIONS_CITIES);
  const cities = selectedRegion ? REGIONS_CITIES[selectedRegion as keyof typeof REGIONS_CITIES] : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-amber-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="size-6" />
          </button>
          <h2 className="text-2xl font-bold">Настройки</h2>
          <p className="text-white/80 text-sm">Управление приложением</p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Notifications */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Bell className="size-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Уведомления</h3>
                  <p className="text-xs text-gray-600">Получать push-уведомления</p>
                </div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative w-11 h-5 rounded-2xl transition-colors flex-shrink-0 outline-none border-0 ${
                  notifications ? "bg-red-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-0 left-0.5 w-5 h-5 bg-white rounded-xl transition-transform shadow-sm border-0 ${
                    notifications ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Privacy */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Shield className="size-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Приватный профиль</h3>
                  <p className="text-xs text-gray-600">Скрыть от всех пользователей</p>
                </div>
              </div>
              <button
                onClick={() => setPrivateProfile(!privateProfile)}
                className={`relative w-11 h-5 rounded-2xl transition-colors flex-shrink-0 outline-none border-0 ${
                  privateProfile ? "bg-red-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-0 left-0.5 w-5 h-5 bg-white rounded-xl transition-transform shadow-sm border-0 ${
                    privateProfile ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Search Mode */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="size-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Режим поиска</h3>
                <p className="text-xs text-gray-600">Выберите режим поиска</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Расстояние</label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={searchDistance}
                  onChange={(e) => setSearchDistance(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5 км</span>
                  <span>100 км</span>
                </div>
              </div>
              <div>
                
                
              </div>
              <div>
                
                
              </div>
            </div>
          </div>

          {/* Age Range */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UsersRound className="size-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Возрастной диапазон</h3>
                <p className="text-xs text-gray-600">{ageRange.min} - {ageRange.max} лет</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Минимальный возраст</label>
                <input
                  type="range"
                  min="18"
                  max="85"
                  value={ageRange.min}
                  onChange={(e) => {
                    const newMin = parseInt(e.target.value);
                    setAgeRange(prev => ({ 
                      ...prev, 
                      min: newMin,
                      max: Math.max(newMin, prev.max) // Если min > max, поднять max
                    }));
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Максимальный возраст</label>
                <input
                  type="range"
                  min="18"
                  max="85"
                  value={ageRange.max}
                  onChange={(e) => {
                    const newMax = parseInt(e.target.value);
                    setAgeRange(prev => ({ 
                      ...prev, 
                      max: newMax,
                      min: Math.min(newMax, prev.min) // Если max < min, опустить min
                    }));
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                />
              </div>
            </div>
          </div>

          {/* Language */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Globe className="size-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Язык интерфейса</h3>
                <p className="text-xs text-gray-600">Выберите язык приложения</p>
              </div>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
            >
              <option value="ru">Русский</option>
              <option value="en">English</option>
              <option value="uk">Українська</option>
            </select>
          </div>

          {/* QR Scan */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <QrCode className="size-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Разрешить сканирование моего QR-кода</h3>
                  <p className="text-xs text-gray-600">Другие пользователи смогут найти вас</p>
                </div>
              </div>
              <button
                onClick={() => setAllowQRScan(!allowQRScan)}
                className={`relative w-11 h-5 rounded-2xl transition-colors flex-shrink-0 outline-none border-0 ${
                  allowQRScan ? "bg-red-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-0 left-0.5 w-5 h-5 bg-white rounded-xl transition-transform shadow-sm border-0 ${
                    allowQRScan ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Hide City Name */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <Sparkles className="size-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Скрывать город</h3>
                  <p className="text-xs text-gray-600">Показывать только регион</p>
                </div>
              </div>
              <button
                onClick={() => setHideCityName(!hideCityName)}
                className={`relative w-11 h-5 rounded-2xl transition-colors flex-shrink-0 outline-none border-0 ${
                  hideCityName ? "bg-red-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-0 left-0.5 w-5 h-5 bg-white rounded-xl transition-transform shadow-sm border-0 ${
                    hideCityName ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* AI Analysis */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <Sparkles className="size-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Разрешить анализ соцсетей с помощью AI</h3>
                  <p className="text-xs text-gray-600">Для улучшения рекомендаций</p>
                </div>
              </div>
              <button
                onClick={() => setAllowAIAnalysis(!allowAIAnalysis)}
                className={`relative w-11 h-5 rounded-2xl transition-colors flex-shrink-0 outline-none border-0 ${
                  allowAIAnalysis ? "bg-red-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-0 left-0.5 w-5 h-5 bg-white rounded-xl transition-transform shadow-sm border-0 ${
                    allowAIAnalysis ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Account Actions */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate("/support");
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <span className="text-gray-700 font-medium">Поддержка</span>
              <ChevronRight className="size-5 text-gray-400" />
            </button>
            <button
              onClick={() => setShowUserGuide(true)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <span className="text-gray-700 font-medium">Руководство пользователя</span>
              <ChevronRight className="size-5 text-gray-400" />
            </button>
            <a 
              href="https://forruss.ru" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-50 to-amber-50 hover:from-red-100 hover:to-amber-100 rounded-xl transition-colors"
            >
              <span className="text-gray-700 font-medium">Посетить forruss.ru</span>
              <ChevronRight className="size-5 text-gray-400" />
            </a>
            <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
              <span className="text-gray-700 font-medium">Политика конфиденциальности</span>
              <ChevronRight className="size-5 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
              <span className="text-gray-700 font-medium">Условия использования</span>
              <ChevronRight className="size-5 text-gray-400" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium transition-colors"
            >
              <Trash2 className="size-5" />
              Удалить аккаунт
            </button>
          </div>

          {/* Delete Confirmation */}
          <AnimatePresence>
            {showDeleteConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Warning Icon */}
                  <div className="flex justify-center pt-8 pb-4">
                    <div className="size-20 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="size-10 text-red-600" />
                    </div>
                  </div>

                  <div className="px-6 pb-6 text-center">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Удалить аккаунт?
                    </h3>
                    <p className="text-gray-600 mb-1">
                      Вы действительно хотите удалить свой аккаунт?
                    </p>
                    <p className="text-sm text-red-600 font-medium mb-6">
                      Данные будут удалены в течение 30 дней
                    </p>

                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          // Add delete account logic here
                          setShowDeleteConfirm(false);
                          onClose();
                        }}
                        className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
                      >
                        Да, удалить
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="w-full px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Guide Modal */}
        <AnimatePresence>
          {showUserGuide && (
            <UserGuideModal onClose={() => setShowUserGuide(false)} />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}