import { motion } from "motion/react";
import { Flame, Check, Sparkles } from "lucide-react";
import { ModalShell } from "./ui/modal-shell";

interface SuperLikeShopModalProps {
  onClose: () => void;
  onPurchase: (amount: number) => void;
  currentAmount: number;
}

export function SuperLikeShopModal({ onClose, onPurchase, currentAmount }: SuperLikeShopModalProps) {
  const packages = [
    { 
      amount: 5, 
      price: "99₽", 
      pricePerUnit: "~20₽/шт",
      popular: false,
      icon: "🔥"
    },
    { 
      amount: 10, 
      price: "169₽", 
      pricePerUnit: "~17₽/шт",
      popular: true,
      icon: "🔥🔥",
      discount: "Выгодно!"
    },
    { 
      amount: 50, 
      price: "599₽", 
      pricePerUnit: "~12₽/шт",
      popular: false,
      icon: "🔥🔥🔥",
      discount: "Скидка 40%"
    },
  ];

  return (
    <ModalShell onClose={onClose} ariaLabel="Магазин суперлайков" variant="sheet">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 px-5 sm:px-6 py-4 text-white overflow-hidden flex-shrink-0">
          <div className="relative z-10 pr-12">
            <div className="size-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-2">
              <Flame className="size-6 text-white" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-center">
              Суперлайки
            </h2>
            <p className="text-white/90 text-center text-xs">
              Гарантированный мэтч с любым пользователем
            </p>
            <div className="mt-3 bg-white/20 backdrop-blur-sm rounded-xl p-2 text-center">
              <p className="text-[11px] opacity-90">У вас сейчас:</p>
              <p className="text-xl font-bold">{currentAmount} 🔥</p>
            </div>
          </div>
        </div>

        {/* Packages */}
        <div className="px-5 sm:px-6 py-4 space-y-3 overflow-y-auto modal-scroll flex-1 min-h-0">
          <div className="text-center mb-4">
            <h3 className="font-semibold text-gray-800 mb-1">Выберите пакет</h3>
            <p className="text-sm text-gray-600">Чем больше, тем выгоднее!</p>
          </div>

          {packages.map((pkg) => (
            <motion.div
              key={pkg.amount}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative rounded-2xl p-4 border-2 transition-all cursor-pointer ${
                pkg.popular
                  ? "border-orange-500 bg-gradient-to-br from-orange-50 to-red-50 shadow-lg"
                  : "border-gray-200 bg-white hover:border-orange-300 hover:shadow-md"
              }`}
              onClick={() => {
                onPurchase(pkg.amount);
                onClose();
              }}
            >
              {pkg.popular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-0.5 rounded-full shadow-lg">
                  <Sparkles className="size-3 inline mr-1" />
                  ПОПУЛЯРНОЕ
                </div>
              )}

              {pkg.discount && !pkg.popular && (
                <div className="absolute -top-2.5 right-4 bg-green-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-lg">
                  {pkg.discount}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{pkg.icon}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xl font-bold text-gray-800">
                        {pkg.amount}
                      </span>
                      <span className="text-sm text-gray-600">суперлайков</span>
                    </div>
                    <p className="text-xs text-gray-500">{pkg.pricePerUnit}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {pkg.price}
                  </div>
                  <button className="mt-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium text-xs hover:shadow-lg transition-shadow">
                    Купить
                  </button>
                </div>
              </div>

              {pkg.popular && (
                <div className="mt-2.5 pt-2.5 border-t border-orange-200 flex items-center gap-2 text-xs text-gray-600">
                  <Check className="size-3.5 text-green-600" />
                  <span>Лучшее соотношение цены и качества</span>
                </div>
              )}
            </motion.div>
          ))}

          <div className="mt-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
            <div className="flex items-start gap-2.5">
              <div className="size-7 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Flame className="size-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1 text-sm">Что даёт суперлайк?</h4>
                <ul className="text-xs text-gray-600 space-y-0.5">
                  <li>• Гарантированный мэтч с пользователем</li>
                  <li>• Ваш профиль показывается первым</li>
                  <li>• Особое уведомление о вашем интересе</li>
                </ul>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center mt-3">
            После покупки суперлайки будут зачислены моментально
          </p>
        </div>
      </div>
    </ModalShell>
  );
}