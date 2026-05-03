import { motion } from "motion/react";
import { Sparkles, Star } from "lucide-react";

/** Полупрозрачный слой поверх стека карточек на время суперлайка. */
export function SuperLikeBurstOverlay() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center overflow-hidden rounded-3xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-sky-400/35 via-blue-500/25 to-indigo-600/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.span
          key={i}
          className="absolute text-amber-200/90 drop-shadow-lg"
          style={{
            left: `${12 + (i * 17) % 76}%`,
            top: `${18 + (i * 23) % 55}%`,
            fontSize: 10 + (i % 4) * 4,
          }}
          initial={{ scale: 0, opacity: 0, rotate: -40 }}
          animate={{
            scale: [0, 1.2, 1],
            opacity: [0, 1, 0.85],
            rotate: [0, 12 + i * 8, 0],
            y: [0, -28 - i * 4, -8],
          }}
          transition={{
            duration: 0.85,
            delay: i * 0.05,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          ✦
        </motion.span>
      ))}
      <motion.div
        className="relative flex flex-col items-center gap-2"
        initial={{ scale: 0.2, opacity: 0 }}
        animate={{ scale: [0.2, 1.15, 1], opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <div className="relative">
          <motion.div
            className="absolute inset-0 rounded-full bg-sky-400/50 blur-2xl"
            animate={{ scale: [1, 1.4, 1.1], opacity: [0.6, 0.9, 0.5] }}
            transition={{ duration: 0.9, repeat: 1, ease: "easeInOut" }}
          />
          <div className="relative flex size-28 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 shadow-2xl ring-4 ring-white/40">
            <Star className="size-14 text-white drop-shadow-md" fill="white" strokeWidth={1.2} />
          </div>
          <motion.div
            className="absolute -right-1 -top-1"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 12 }}
          >
            <Sparkles className="size-9 text-amber-300 drop-shadow-md" fill="currentColor" />
          </motion.div>
        </div>
        <motion.p
          className="text-center text-base font-extrabold tracking-wide text-white drop-shadow-md"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
        >
          Суперлайк отправлен!
        </motion.p>
        <motion.p
          className="max-w-[220px] text-center text-xs font-medium text-white/90"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.3 }}
        >
          Пользователь увидит, что вы проявили особый интерес
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
