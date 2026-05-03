import { motion, AnimatePresence } from "motion/react";
import { Heart, MessageCircle, ChevronRight, UserPlus, Calendar } from "lucide-react";
import type { OpenChatParams } from "../types/chat";
import { UserProfile, calculateDetailedCompatibility, currentUser } from "../utils/compatibilityAI";
import { Button } from "./ui/button";
import { CompatibilityDetailsModal } from "./CompatibilityDetailsModal";
import { EventsModal } from "./EventsModal";
import { ModalShell } from "./ui/modal-shell";
import { useState } from "react";

interface MatchModalProps {
  profile: UserProfile;
  compatibility: number;
  onClose: () => void;
  onOpenChat: (params: OpenChatParams) => void;
  onRecommend?: () => void;
  onDetailedAnalysisClick?: () => void;
  isMatch?: boolean;
}

export function MatchModal({ profile, compatibility, onClose, onOpenChat, onRecommend, onDetailedAnalysisClick, isMatch = true }: MatchModalProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const details = calculateDetailedCompatibility(currentUser, profile);

  // Handle event invitation - send message to chat
  const handleSendEventInvite = (eventTitle: string, eventDescription: string) => {
    // Close events modal and open chat with pre-filled message
    setShowEvents(false);
    onClose();
    onOpenChat({
      userName: profile.name,
      userAvatar: profile.photo,
      prefilledMessage: eventDescription,
      peerUserId: String(profile.id),
    });
  };

  return (
    <>
      <ModalShell onClose={onClose} ariaLabel={isMatch ? "Это Match!" : "Вы понравились друг другу"}>
        <div className="flex flex-col h-full">
          {/* Scrollable area: hearts + info */}
          <div className="flex-1 min-h-0 overflow-y-auto modal-scroll px-5 sm:px-6 pt-6 sm:pt-8">
            {/* Hearts Animation */}
            <div className="flex justify-center mb-4 sm:mb-5">
              <div className="relative">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                  }}
                  className="bg-gradient-to-br from-red-600 to-amber-500 rounded-full p-4 sm:p-5"
                >
                  <Heart className="size-9 sm:size-10 text-white fill-white" />
                </motion.div>

                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 1.5],
                      x: Math.cos((i * Math.PI) / 3) * 50,
                      y: Math.sin((i * Math.PI) / 3) * 50,
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  >
                    <Heart className="size-4 text-red-400 fill-red-400" />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Match Text */}
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-1 bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent">
              {isMatch ? "Это Match!" : "Вы понравились друг другу"}
            </h2>
            <p className="text-center text-sm text-gray-600 mb-4 sm:mb-5">
              Вы и {profile.name} понравились друг другу
            </p>

            {/* Compatibility - Now Clickable */}
            <button
              onClick={() => setShowDetails(true)}
              className="w-full bg-gradient-to-r from-red-50 to-amber-50 rounded-2xl p-3 sm:p-4 mb-4 hover:from-red-100 hover:to-amber-100 transition-all hover:shadow-md group"
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent">
                  {compatibility}%
                </div>
              </div>
              <div className="flex items-center justify-center gap-1">
                <p className="text-center text-xs sm:text-sm text-gray-600">
                  Совместимость по AI-алгоритму
                </p>
                <ChevronRight className="size-4 text-gray-400 group-hover:text-red-500 transition-colors" />
              </div>
            </button>

            {/* Profile Preview */}
            <div className="flex items-center gap-3 mb-4 p-3 sm:p-4 bg-gray-50 rounded-2xl">
              <img
                src={profile.photo}
                alt={profile.name}
                className="size-12 sm:size-14 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base sm:text-lg truncate">{profile.name}, {profile.age}</h3>
                <p className="text-xs sm:text-sm text-gray-600 truncate">{profile.location}</p>
              </div>
            </div>
          </div>

          {/* Sticky footer with actions */}
          <div className="flex-shrink-0 px-5 sm:px-6 pb-5 sm:pb-6 pt-3 border-t border-gray-100 bg-white space-y-2">
            <div className="flex gap-2">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 rounded-full text-xs sm:text-sm"
              >
                Продолжить
              </Button>
              <Button
                onClick={() =>
                  onOpenChat({
                    userName: profile.name,
                    userAvatar: profile.photo,
                    peerUserId: String(profile.id),
                  })
                }
                className="flex-1 rounded-full bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-600 hover:to-amber-600 text-xs sm:text-sm"
              >
                <MessageCircle className="size-4 mr-1.5" />
                Написать
              </Button>
            </div>
            <Button
              onClick={() => setShowEvents(true)}
              variant="outline"
              className="w-full rounded-full border-amber-200 text-amber-600 hover:bg-amber-50 text-xs sm:text-sm"
            >
              <Calendar className="size-4 mr-1.5" />
              Куда сходить вместе
            </Button>
            {onRecommend && (
              <Button
                onClick={onRecommend}
                variant="outline"
                className="w-full rounded-full border-red-200 text-red-600 hover:bg-red-50 text-xs sm:text-sm"
              >
                <UserPlus className="size-4 mr-1.5" />
                Рекомендовать друзьям
              </Button>
            )}
          </div>
        </div>
      </ModalShell>

      <AnimatePresence>
        {showDetails && (
          <CompatibilityDetailsModal
            details={details}
            userName={profile.name}
            onClose={() => setShowDetails(false)}
            onOpenDetailedAnalysis={onDetailedAnalysisClick}
            compatibility={compatibility}
          />
        )}
        {showEvents && (
          <EventsModal
            profileName={profile.name}
            profilePhoto={profile.photo}
            onSendEventInvite={handleSendEventInvite}
            onClose={() => setShowEvents(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}