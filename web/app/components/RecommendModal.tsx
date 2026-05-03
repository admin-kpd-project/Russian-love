import { useState } from "react";
import { UsersRound, Send, Check } from "lucide-react";
import { UserProfile } from "../utils/compatibilityAI";
import { ModalShell } from "./ui/modal-shell";

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
    <ModalShell onClose={onClose} ariaLabel="Рекомендовать профиль">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-amber-500 px-5 sm:px-6 py-4 sm:py-5 text-white flex-shrink-0 pr-14">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-2xl flex-shrink-0">
              <UsersRound className="size-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold leading-tight truncate">Рекомендовать</h2>
              <p className="text-white/80 text-xs">Познакомьте друзей</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 sm:px-6 py-4 sm:py-5 flex-1 min-h-0 overflow-y-auto modal-scroll">
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
      </div>
    </ModalShell>
  );
}