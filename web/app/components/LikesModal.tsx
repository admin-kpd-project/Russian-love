import { X, Heart } from "lucide-react";
import { motion } from "motion/react";

interface Profile {
  id: number;
  name: string;
  age: number;
  photo: string;
  bio: string;
  interests: string[];
  location: string;
}

interface LikesModalProps {
  onClose: () => void;
  likedProfiles: Profile[];
  onOpenProfile?: (profile: Profile) => void;
}

export function LikesModal({ onClose, likedProfiles, onOpenProfile }: LikesModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-red-500 to-amber-500 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="size-6 fill-white" />
            <h2 className="text-2xl font-bold">Мои лайки</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(80vh-88px)]">
          {likedProfiles.length === 0 ? (
            <div className="p-8 text-center">
              <div className="bg-gray-100 rounded-full p-8 mx-auto w-fit mb-4">
                <Heart className="size-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Пока нет лайков
              </h3>
              <p className="text-gray-600">
                Начните свайпать профили вправо, чтобы поставить лайк
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {likedProfiles.map((profile) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border-2 border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:border-red-200 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => onOpenProfile?.(profile)}
                >
                  <img
                    src={profile.photo}
                    alt={profile.name}
                    className="size-20 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-800">
                      {profile.name}, {profile.age}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {profile.location}
                    </p>
                    <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                      {profile.bio}
                    </p>
                  </div>
                  <Heart className="size-6 text-red-500 fill-red-500 flex-shrink-0" />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
