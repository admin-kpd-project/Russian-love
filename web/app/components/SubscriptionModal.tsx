import { Flame, Sparkles, Check, Crown } from "lucide-react";
import { motion } from "motion/react";
import { ModalShell } from "./ui/modal-shell";

interface SubscriptionModalProps {
  onClose: () => void;
  remainingSuperLikes: number;
}

export function SubscriptionModal({ onClose, remainingSuperLikes }: SubscriptionModalProps) {
  return (
    <ModalShell onClose={onClose} ariaLabel="Премиум подписка" className="bg-gradient-to-br from-amber-50 to-red-50">
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="relative flex-shrink-0 bg-gradient-to-r from-red-500 via-amber-500 to-yellow-500 text-white p-6 sm:p-7 text-center overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 opacity-20"
          >
            <Sparkles className="absolute top-4 left-4 size-8" />
            <Sparkles className="absolute bottom-4 right-4 size-6" />
            <Sparkles className="absolute top-1/2 right-8 size-10" />
          </motion.div>
          <div className="relative z-10">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-white/20 backdrop-blur-sm rounded-full p-4 mx-auto w-fit mb-3"
            >
              <Crown className="size-10 fill-white" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-1">Премиум подписка</h2>
            <p className="text-white/90 text-sm">Любить без ограничений</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto modal-scroll p-5 sm:p-6">
          {/* Current Status */}
          <div className="bg-white rounded-2xl p-4 mb-6 border-2 border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-red-500 to-amber-500 rounded-full p-3">
                  <Flame className="size-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Осталось огоньков</p>
                  <p className="text-2xl font-bold text-gray-800">{remainingSuperLikes} / 5</p>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6">
            <h3 className="font-bold text-lg text-gray-800 mb-4">Преимущества премиум:</h3>
            
            <div className="flex items-start gap-3">
              <div className="bg-green-100 rounded-full p-1 mt-0.5">
                <Check className="size-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Неограниченные огоньки</p>
                <p className="text-sm text-gray-600">Ставьте супер-лайки без ограничений</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-green-100 rounded-full p-1 mt-0.5">
                <Check className="size-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Приоритет в показе</p>
                <p className="text-sm text-gray-600">Ваш профиль видят в первую очередь</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-green-100 rounded-full p-1 mt-0.5">
                <Check className="size-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Безлимитные лайки</p>
                <p className="text-sm text-gray-600">Лайкайте сколько угодно профилей</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-green-100 rounded-full p-1 mt-0.5">
                <Check className="size-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Кто вас лайкнул</p>
                <p className="text-sm text-gray-600">Смотрите, кому вы понравились</p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-3 mb-6">
            <div className="bg-gradient-to-r from-red-500 to-amber-500 rounded-2xl p-4 text-white border-4 border-amber-300 relative overflow-hidden">
              <div className="absolute top-2 right-2 bg-yellow-400 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                ПОПУЛЯРНО
              </div>
              <div className="relative z-10">
                <p className="text-sm opacity-90">1 месяц</p>
                <p className="text-3xl font-bold">990 ₽</p>
                <p className="text-sm opacity-90">~33 ₽ в день</p>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-2xl p-4">
              <p className="text-sm text-gray-600">3 месяца</p>
              <p className="text-2xl font-bold text-gray-800">1990 ₽</p>
              <p className="text-sm text-gray-600">~22 ₽ в день • экономия 33%</p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-2xl p-4">
              <p className="text-sm text-gray-600">6 месяцев</p>
              <p className="text-2xl font-bold text-gray-800">2990 ₽</p>
              <p className="text-sm text-gray-600">~16 ₽ в день • экономия 50%</p>
            </div>
          </div>

          {/* CTA Button */}
          <button className="w-full py-4 bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-2xl font-bold text-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]">
            Оформить подписку
          </button>

          <p className="text-center text-xs text-gray-500 mt-4">
            Автоматическое продление. Отменить можно в любой момент
          </p>
        </div>
      </div>
    </ModalShell>
  );
}
