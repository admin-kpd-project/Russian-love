import { X, Heart, RotateCcw, Star, Bookmark } from "lucide-react";
import { motion } from "motion/react";

interface ActionButtonsProps {
  onReject: () => void;
  onLike: () => void;
  onUndo: () => void;
  onSuperLike: () => void;
  onFavorite: () => void;
  hasUndo: boolean;
  isFavorite: boolean;
}

export function ActionButtons({ onReject, onLike, onUndo, onSuperLike, onFavorite, hasUndo, isFavorite }: ActionButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 px-2 sm:px-4">
      {/* Undo Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onUndo}
        disabled={!hasUndo}
        className={`p-3 sm:p-4 rounded-full shadow-lg transition-all active:scale-90 flex items-center justify-center ${
          hasUndo
            ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-600"
            : "bg-gray-100 text-gray-300 cursor-not-allowed"
        }`}
      >
        <RotateCcw className="size-5 sm:size-7" />
      </motion.button>

      {/* Reject Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onReject}
        className="p-5 sm:p-7 rounded-full bg-white shadow-xl hover:shadow-2xl transition-shadow border-2 border-red-100 hover:border-red-200 group active:scale-90 flex items-center justify-center"
      >
        <X className="size-9 sm:size-11 text-red-500 group-active:scale-110 transition-transform" />
      </motion.button>

      {/* Super Like Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onSuperLike}
        className="p-5 sm:p-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-xl hover:shadow-2xl transition-all group active:scale-90 flex items-center justify-center"
      >
        <Star className="size-9 sm:size-11 text-white transition-transform fill-white group-active:scale-110" />
      </motion.button>

      {/* Like Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onLike}
        className="p-5 sm:p-7 rounded-full bg-gradient-to-br from-red-500 to-amber-500 shadow-xl hover:shadow-2xl transition-shadow group active:scale-90 flex items-center justify-center"
      >
        <Heart className="size-9 sm:size-11 text-white group-active:scale-110 transition-transform fill-white" />
      </motion.button>

      {/* Favorite Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onFavorite}
        className={`p-3 sm:p-4 rounded-full shadow-lg transition-all active:scale-90 flex items-center justify-center ${
          isFavorite
            ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white"
            : "bg-amber-100 hover:bg-amber-200 text-amber-600"
        }`}
      >
        <Bookmark className={`size-5 sm:size-7 ${isFavorite ? "fill-white" : ""}`} />
      </motion.button>
    </div>
  );
}