import { Heart } from "lucide-react";
import { motion } from "motion/react";
import { ModalShell } from "./ui/modal-shell";

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
    <ModalShell onClose={onClose} ariaLabel="Мои лайки">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-red-500 to-amber-500 text-white px-5 sm:px-6 py-4 sm:py-5 flex items-center gap-3 pr-14">
          <Heart className="size-5 fill-white flex-shrink-0" />
          <h2 className="text-lg sm:text-xl font-bold">Мои лайки</h2>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto modal-scroll">
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
      </div>
    </ModalShell>
  );
}
