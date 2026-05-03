import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, Heart, MapPin } from "lucide-react";
import { ScanEvent, markScanEventAsViewed } from "../utils/scanEvents";
import { UserProfileModal } from "./UserProfileModal";
import { useState } from "react";
import { normalizeAssetUrlForHttps } from "../utils/mediaUrl";

interface ScanNotificationCardProps {
  scanEvent: ScanEvent;
  onClose: () => void;
}

export function ScanNotificationCard({ scanEvent, onClose }: ScanNotificationCardProps) {
  const { scannerProfile, compatibility } = scanEvent;
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleClose = () => {
    markScanEventAsViewed(scanEvent.id);
    onClose();
  };

  const handleViewProfile = () => {
    markScanEventAsViewed(scanEvent.id);
    setShowProfileModal(true);
  };

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
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{ type: "spring", duration: 0.5 }}
      className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-amber-200"
    >
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-full hover:bg-black/30 transition-colors"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      {/* Sparkle Badge */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
        <Sparkles className="w-4 h-4" />
        <span>Новое сканирование!</span>
      </div>

      {/* Profile Image */}
      <div className="relative h-80">
        <img
          src={normalizeAssetUrlForHttps(scannerProfile.photo)}
          alt={scannerProfile.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Compatibility Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.3 }}
          className="absolute top-16 left-1/2 -translate-x-1/2"
        >
          <div className="bg-white rounded-2xl px-6 py-3 shadow-xl">
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent">
                {compatibility}%
              </div>
              <div className="text-xs text-gray-600 font-medium">
                совместимость
              </div>
            </div>
          </div>
        </motion.div>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h3 className="text-2xl font-bold mb-1">
            {scannerProfile.name}, {scannerProfile.age}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{scannerProfile.location}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Message */}
        <div className="text-center mb-4">
          <p className="text-gray-700 leading-relaxed">
            <strong>{scannerProfile.name}</strong> отсканировал ваш QR-код и посмотрел ваш профиль!
          </p>
        </div>

        {/* Compatibility Label */}
        <div className="flex justify-center mb-4">
          <div className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${getCompatibilityColor(compatibility)} text-white rounded-full text-sm font-medium`}>
            <Heart className="w-4 h-4" />
            {getCompatibilityLabel(compatibility)}
          </div>
        </div>

        {/* Interests Preview */}
        {scannerProfile.interests.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1.5 justify-center">
              {scannerProfile.interests.slice(0, 3).map((interest, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gradient-to-r from-red-100 to-amber-100 text-red-700 rounded-full text-xs font-medium"
                >
                  {interest}
                </span>
              ))}
              {scannerProfile.interests.length > 3 && (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                  +{scannerProfile.interests.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* View Profile Button */}
        <button
          onClick={handleViewProfile}
          className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
        >
          Посмотреть профиль
        </button>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <UserProfileModal
          profile={scannerProfile}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </motion.div>
  );
}