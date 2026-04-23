import { motion, AnimatePresence } from "motion/react";
import { Bookmark, ArrowLeft } from "lucide-react";
import { useFavorites } from "../contexts/FavoritesContext";
import { FavoriteCard } from "../components/FavoriteCard";
import { useState } from "react";
import { UserProfileModal } from "../components/UserProfileModal";
import { User } from "../types";
import { useNavigate } from "react-router";

export default function Favorites() {
  const { favorites } = useFavorites();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-amber-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-amber-500 p-6 pb-8 shadow-lg sticky top-0 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Bookmark className="size-8 text-white fill-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Избранное</h1>
                <p className="text-white/90 text-sm">
                  {favorites.length} {favorites.length === 1 ? "профиль" : favorites.length < 5 ? "профиля" : "профилей"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center size-24 bg-amber-100 rounded-full mb-6">
              <Bookmark className="size-12 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Нет избранных профилей
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Добавляйте понравившиеся профили в избранное, чтобы вернуться к ним позже
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-8 py-3 bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-full font-medium hover:shadow-lg transition-all"
            >
              Начать поиск
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            <AnimatePresence mode="popLayout">
              {favorites.map((user) => (
                <FavoriteCard
                  key={user.id}
                  user={user}
                  onClick={() => setSelectedUser(user)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {selectedUser && (
          <UserProfileModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}