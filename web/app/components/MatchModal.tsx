import { motion, AnimatePresence } from "motion/react";
import { Heart, X, MessageCircle, ChevronRight, UserPlus, Sparkles, Calendar } from "lucide-react";
import type { OpenChatParams } from "../types/chat";
import { UserProfile, calculateDetailedCompatibility, currentUser } from "../utils/compatibilityAI";
import { Button } from "./ui/button";
import { CompatibilityDetailsModal } from "./CompatibilityDetailsModal";
import { EventsModal } from "./EventsModal";
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="size-5 text-gray-500" />
          </button>

          {/* Hearts Animation */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                }}
                className="bg-gradient-to-br from-red-500 to-amber-500 rounded-full p-6"
              >
                <Heart className="size-12 text-white fill-white" />
              </motion.div>
              
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 1.5],
                    x: Math.cos((i * Math.PI) / 3) * 60,
                    y: Math.sin((i * Math.PI) / 3) * 60,
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
          <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent">
            {isMatch ? "Это Match!" : "Вы понравились друг другу"}
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Вы и {profile.name} понравились друг другу
          </p>

          {/* Compatibility - Now Clickable */}
          <button
            onClick={() => setShowDetails(true)}
            className="w-full bg-gradient-to-r from-red-50 to-amber-50 rounded-2xl p-4 mb-6 hover:from-red-100 hover:to-amber-100 transition-all hover:shadow-md group"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="text-4xl font-bold bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent">
                {compatibility}%
              </div>
            </div>
            <div className="flex items-center justify-center gap-1">
              <p className="text-center text-sm text-gray-600">
                Совместимость по AI-алгоритму
              </p>
              <ChevronRight className="size-4 text-gray-400 group-hover:text-red-500 transition-colors" />
            </div>
          </button>

          {/* Profile Preview */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-2xl">
            <img
              src={profile.photo}
              alt={profile.name}
              className="size-16 rounded-full object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{profile.name}, {profile.age}</h3>
              <p className="text-sm text-gray-600">{profile.location}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 rounded-full"
              >
                Продолжить поиск
              </Button>
              <Button
                onClick={() =>
                  onOpenChat({
                    userName: profile.name,
                    userAvatar: profile.photo,
                    peerUserId: String(profile.id),
                  })
                }
                className="flex-1 rounded-full bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600"
              >
                <MessageCircle className="size-4 mr-2" />
                Написать
              </Button>
            </div>
            <Button
              onClick={() => setShowEvents(true)}
              variant="outline"
              className="w-full rounded-full border-amber-200 text-amber-600 hover:bg-amber-50"
            >
              <Calendar className="size-4 mr-2" />
              Куда сходить вместе
            </Button>
            {onDetailedAnalysisClick && (
              null
            )}
            {onRecommend && (
              <Button
                onClick={onRecommend}
                variant="outline"
                className="w-full rounded-full border-red-200 text-red-600 hover:bg-red-50"
              >
                <UserPlus className="size-4 mr-2" />
                Рекомендовать друзьям
              </Button>
            )}
          </div>
        </motion.div>
      </motion.div>

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