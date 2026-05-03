import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Heart, Sparkles, MapPin, User } from "lucide-react";
import { UserProfile, calculateCompatibility } from "../utils/compatibilityAI";
import matreshkaLogo from "../../imports/1775050275_(1)_3_(1)-1.png";
import { getCurrentUser, getUserById } from "../services/usersService";
import { mapApiProfileToUserProfile } from "../utils/mapApiProfile";
import { normalizeAssetUrlForHttps } from "../utils/mediaUrl";

export function ScanProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [scannedUser, setScannedUser] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [compatibility, setCompatibility] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      const [meRes, scannedRes] = await Promise.all([getCurrentUser(), getUserById(userId)]);
      if (cancelled) return;
      if (!meRes.data || !scannedRes.data) {
        setIsLoading(false);
        return;
      }
      const me = mapApiProfileToUserProfile(meRes.data);
      const scanned = mapApiProfileToUserProfile(scannedRes.data);
      setCurrentUser(me);
      setScannedUser(scanned);
      setCompatibility(calculateCompatibility(me, scanned));
      setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <motion.img
            src={matreshkaLogo}
            alt="Logo"
            className="w-24 h-24 mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-600">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (!scannedUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Пользователь не найден
            </h2>
            <p className="text-gray-600 mb-6">
              К сожалению, этот профиль недоступен
            </p>
            <button
              onClick={() => navigate("/app")}
              className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
            >
              Вернуться в приложение
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If scanning own QR code
  if (currentUser && scannedUser.id === currentUser.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <motion.img
              src={matreshkaLogo}
              alt="Logo"
              className="w-24 h-24 mx-auto mb-6"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Это ваш профиль!
            </h2>
            <p className="text-gray-600 mb-6">
              Вы не можете сканировать собственный QR-код 😊
            </p>
            <button
              onClick={() => navigate("/app")}
              className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
            >
              Вернуться в приложение
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return "from-green-500 to-emerald-500";
    if (score >= 70) return "from-blue-500 to-cyan-500";
    if (score >= 60) return "from-amber-500 to-yellow-500";
    return "from-red-500 to-pink-500";
  };

  const getCompatibilityLabel = (score: number) => {
    if (score >= 90) return "Идеальное совпадение";
    if (score >= 80) return "Отличная совместимость";
    if (score >= 70) return "Высокая совместимость";
    if (score >= 60) return "Хорошая совместимость";
    return "Средняя совместимость";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate("/app")}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold text-gray-800">Результат сканирования</h1>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto p-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Compatibility Score */}
          <div className="bg-white rounded-3xl p-6 shadow-xl mb-6">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-6 h-6 text-amber-500" />
                <h2 className="text-xl font-bold text-gray-800">
                  Совместимость
                </h2>
                <Sparkles className="w-6 h-6 text-amber-500" />
              </div>
              <p className="text-sm text-gray-600">
                между вами и {scannedUser.name}
              </p>
            </div>

            {/* Big Score Circle */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.8, delay: 0.2 }}
              className="relative w-48 h-48 mx-auto mb-6"
            >
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#f3f4f6"
                  strokeWidth="12"
                  fill="none"
                />
                <motion.circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 552" }}
                  animate={{ strokeDasharray: `${(compatibility / 100) * 552} 552` }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-center"
                >
                  <div className="text-5xl font-bold bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent">
                    {compatibility}%
                  </div>
                  <Heart className="w-8 h-8 text-red-500 mx-auto mt-2" />
                </motion.div>
              </div>
            </motion.div>

            <div className="text-center">
              <div className={`inline-block px-6 py-2 bg-gradient-to-r ${getCompatibilityColor(compatibility)} text-white rounded-full font-medium text-sm`}>
                {getCompatibilityLabel(compatibility)}
              </div>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-xl">
            <div className="relative h-96">
              <img
                src={normalizeAssetUrlForHttps(scannedUser.photo)}
                alt={scannedUser.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              {/* Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h2 className="text-3xl font-bold mb-2">
                  {scannedUser.name}, {scannedUser.age}
                </h2>
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5" />
                  <span className="text-lg">{scannedUser.location}</span>
                </div>
                <p className="text-white/90 leading-relaxed">
                  {scannedUser.bio}
                </p>
              </div>
            </div>

            {/* Interests */}
            <div className="p-6">
              <h3 className="font-semibold text-gray-800 mb-3">Интересы</h3>
              <div className="flex flex-wrap gap-2">
                {scannedUser.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gradient-to-r from-red-100 to-amber-100 text-red-700 rounded-full text-sm font-medium"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Info Message */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <div className="flex gap-3">
              <Sparkles className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-blue-800 leading-relaxed">
                  <strong>{scannedUser.name}</strong> получит уведомление о том, что вы посмотрели их профиль. 
                  Они увидят вашу карточку и процент совместимости на главном экране приложения!
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => navigate("/app")}
            className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow text-lg"
          >
            Вернуться в приложение
          </button>
        </motion.div>
      </div>
    </div>
  );
}
