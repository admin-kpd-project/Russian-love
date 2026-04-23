import { motion } from "motion/react";
import { X, Flame, Check, Sparkles } from "lucide-react";

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 p-6 text-white overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
          
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/30 rounded-full transition-colors z-50 bg-white/10"
          >
            <X className="size-6" />
          </button>

          <div className="relative z-10">
            <div className="size-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3">
              <Flame className="size-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-center mb-2">
              Суперлайки
            </h2>
            <p className="text-white/90 text-center text-sm">
              Гарантированный мэтч с любым пользователем!
            </p>
            <div className="mt-3 bg-white/20 backdrop-blur-sm rounded-xl p-2.5 text-center">
              <p className="text-xs opacity-90">У вас сейчас:</p>
              <p className="text-2xl font-bold">{currentAmount} 🔥</p>
            </div>
          </div>
        </div>

        {/* Packages */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
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
      </motion.div>
    </motion.div>
  );
}