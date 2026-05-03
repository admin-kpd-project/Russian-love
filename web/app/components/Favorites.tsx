import { AnimatePresence } from "motion/react";
import { Bookmark } from "lucide-react";
import { FavoriteCard } from "./FavoriteCard";
import { UserProfileModal } from "./UserProfileModal";
import { useFavorites } from "../contexts/FavoritesContext";
import { useState } from "react";
import { User } from "../types";
import { ModalShell } from "./ui/modal-shell";

interface FavoritesProps {
  onClose: () => void;
}

export function Favorites({ onClose }: FavoritesProps) {
  const { favorites } = useFavorites();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  return (
    <ModalShell onClose={onClose} ariaLabel="Избранное" variant="sheet" className="bg-gradient-to-br from-white via-amber-50/30 to-white">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-5 sm:px-6 py-4 sm:py-5 flex-shrink-0 pr-14">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl flex-shrink-0">
              <Bookmark className="size-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-white">Избранное</h2>
              <p className="text-white/90 text-xs">
                {favorites.length} {favorites.length === 1 ? "профиль" : favorites.length < 5 ? "профиля" : "профилей"}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto modal-scroll flex-1 min-h-0">
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
            <div className="grid grid-cols-1 gap-3">
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

        {/* User Detail Modal */}
        {selectedUser && (
          <UserProfileModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
          />
        )}
      </div>
    </ModalShell>
  );
}