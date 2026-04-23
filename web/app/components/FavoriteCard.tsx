import { motion } from "motion/react";
import { Heart, MessageCircle, MapPin, Briefcase, BookOpen, Bookmark } from "lucide-react";
import { User } from "../types";
import { useState, forwardRef } from "react";
import { useFavorites } from "../contexts/FavoritesContext";

interface FavoriteCardProps {
  user: User;
  onClick: () => void;
}

export const FavoriteCard = forwardRef<HTMLDivElement, FavoriteCardProps>(
  ({ user, onClick }, ref) => {
    const { removeFromFavorites } = useFavorites();
    const [imageError, setImageError] = useState(false);

    // Debug log to see user data
    console.log('FavoriteCard rendering user:', {
      name: user.name,
      photos: user.photos,
      hasPhotos: user.photos && user.photos.length > 0,
      firstPhoto: user.photos?.[0]
    });

    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation();
      removeFromFavorites(user.id);
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ y: -4 }}
        onClick={onClick}
        className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer relative"
      >
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-red-100 to-amber-100">
          {!imageError && user.photos && user.photos.length > 0 && user.photos[0] ? (
            <img
              src={user.photos[0]}
              alt={user.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-6xl">👤</div>
            </div>
          )}
          
          {/* Remove from Favorites Button */}
          <button
            onClick={handleRemove}
            className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
          >
            <Bookmark className="w-5 h-5 fill-white" />
          </button>

          {/* Online Status */}
          {user.online && (
            <div className="absolute top-3 left-3 px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
              Онлайн
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-baseline gap-2 mb-2">
            <h3 className="text-xl font-bold text-gray-800">{user.name}</h3>
            <span className="text-gray-600">{user.age}</span>
          </div>

          {/* Location */}
          {user.location && (
            <div className="flex items-center gap-1 text-gray-600 text-sm mb-2">
              <MapPin className="size-4" />
              <span>{user.location}</span>
            </div>
          )}

          {/* Job */}
          {user.job && (
            <div className="flex items-center gap-1 text-gray-600 text-sm mb-2">
              <Briefcase className="size-4" />
              <span>{user.job}</span>
            </div>
          )}

          {/* Education */}
          {user.education && (
            <div className="flex items-center gap-1 text-gray-600 text-sm">
              <BookOpen className="size-4" />
              <span className="line-clamp-1">{user.education}</span>
            </div>
          )}
        </div>
      </motion.div>
    );
  }
);

FavoriteCard.displayName = "FavoriteCard";