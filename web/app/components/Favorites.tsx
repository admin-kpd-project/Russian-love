import { motion, AnimatePresence } from "motion/react";
import { X, Bookmark } from "lucide-react";
import { FavoriteCard } from "./FavoriteCard";
import { UserProfileModal } from "./UserProfileModal";
import { useFavorites } from "../contexts/FavoritesContext";
import { useState } from "react";
import { User } from "../types";

interface FavoritesProps {
  onClose: () => void;
}

export function Favorites({ onClose }: FavoritesProps) {
  const { favorites } = useFavorites();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-gradient-to-br from-white via-amber-50/30 to-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <Bookmark className="size-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Избранное</h2>
              <p className="text-white/90 text-sm">
                {favorites.length} {favorites.length === 1 ? 'профиль' : favorites.length < 5 ? 'профиля' : 'профилей'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
          {favorites.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-full p-8 mx-auto w-fit mb-6">
                <Bookmark className="size-16 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Нет избранных профилей
              </h3>
              <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                Добавляйте профили в избранное, нажимая на кнопку с закладкой на карточках
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full font-medium hover:shadow-lg transition-shadow"
              >
                Начать просмотр
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {favorites.map((user) => (
                  <FavoriteCard
                    key={user.id}
                    user={user}
                    onClick={() => setSelectedUser(user)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* User Detail Modal - можно расширить в будущем */}
        {selectedUser && (
          <UserProfileModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
          />
        )}
      </motion.div>
    </motion.div>
  );
}