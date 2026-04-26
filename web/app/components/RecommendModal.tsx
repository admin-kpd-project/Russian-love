import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, UsersRound, Send, Check } from "lucide-react";
import { UserProfile } from "../utils/compatibilityAI";

interface RecommendModalProps {
  onClose: () => void;
  profileToRecommend: UserProfile;
  availableFriends: UserProfile[];
}

export function RecommendModal({ onClose, profileToRecommend, availableFriends }: RecommendModalProps) {
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleRecommend = () => {
    if (!selectedFriend) return;
    
    // Here you would send the recommendation to backend
    setShowSuccess(true);
    
    // Close after showing success
    setTimeout(() => {
      onClose();
    }, 1500);
  };

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
        <div className="bg-gradient-to-r from-red-600 to-amber-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="size-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <UsersRound className="size-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Рекомендовать профиль</h2>
              <p className="text-white/80 text-sm">Познакомьте друзей</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Profile to Recommend */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">Вы рекомендуете:</p>
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-amber-50 rounded-xl">
              <div className="size-14 rounded-full overflow-hidden flex-shrink-0">
                <img
                  src={profileToRecommend.photo}
                  alt={profileToRecommend.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  {profileToRecommend.name}, {profileToRecommend.age}
                </h3>
                <p className="text-sm text-gray-600">{profileToRecommend.location}</p>
              </div>
            </div>
          </div>

          {/* Select Friend */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">Выберите друга из ваших матчей:</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableFriends.map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => setSelectedFriend(String(friend.id))}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    selectedFriend === String(friend.id)
                      ? "bg-gradient-to-r from-red-100 to-amber-100 border-2 border-red-500"
                      : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                  }`}
                >
                  <div className="size-12 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src={friend.photo}
                      alt={friend.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-medium text-gray-800">
                      {friend.name}, {friend.age}
                    </h4>
                    <p className="text-xs text-gray-600">{friend.location}</p>
                  </div>
                  {selectedFriend === String(friend.id) && (
                    <Check className="size-5 text-red-500" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleRecommend}
            disabled={!selectedFriend || showSuccess}
            className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-medium transition-all ${
              selectedFriend && !showSuccess
                ? "bg-gradient-to-r from-red-600 to-amber-500 text-white hover:shadow-lg"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {showSuccess ? (
              <>
                <Check className="size-5" />
                Рекомендация отправлена!
              </>
            ) : (
              <>
                <Send className="size-5" />
                Отправить рекомендацию
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center mt-3">
            Ваш друг получит уведомление о рекомендации
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}