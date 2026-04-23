import { X, Sparkles, Star, Check } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface DetailedAnalysisPurchaseModalProps {
  onClose: () => void;
  onPurchase: (type: "single" | "unlimited") => void;
  profileName: string;
}

export function DetailedAnalysisPurchaseModal({ 
  onClose, 
  onPurchase,
  profileName 
}: DetailedAnalysisPurchaseModalProps) {
  const [selectedOption, setSelectedOption] = useState<"single" | "unlimited">("single");

  const handlePurchase = () => {
    onPurchase(selectedOption);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-6 text-white flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
          >
            <X className="size-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
              <Sparkles className="size-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Детальный анализ</h2>
              <p className="text-sm text-white/90">Узнайте больше о совместимости</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Получите детальный астрологический и нумерологический анализ совместимости с {profileName}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {/* Single Analysis */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedOption("single")}
              className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                selectedOption === "single"
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="size-5 text-purple-500" />
                    <h3 className="font-bold text-gray-900">Один анализ</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Детальный анализ с текущим профилем
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">₽99</span>
                    <span className="text-sm text-gray-500">разовая покупка</span>
                  </div>
                </div>
                {selectedOption === "single" && (
                  <div className="flex-shrink-0 p-1 bg-purple-500 rounded-full">
                    <Check className="size-4 text-white" />
                  </div>
                )}
              </div>
            </motion.button>

            {/* Unlimited Analysis */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedOption("unlimited")}
              className={`w-full p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden ${
                selectedOption === "unlimited"
                  ? "border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                ПОПУЛЯРНО
              </div>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="size-5 text-purple-500" />
                    <h3 className="font-bold text-gray-900">Безлимит</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Неограниченные анализы со всеми профилями
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">₽299</span>
                    <span className="text-sm text-gray-500">в месяц</span>
                  </div>
                  <ul className="mt-2 space-y-1">
                    <li className="text-xs text-gray-600 flex items-center gap-1">
                      <Check className="size-3 text-purple-500" />
                      Астрологический анализ
                    </li>
                    <li className="text-xs text-gray-600 flex items-center gap-1">
                      <Check className="size-3 text-purple-500" />
                      Нумерологический анализ
                    </li>
                    <li className="text-xs text-gray-600 flex items-center gap-1">
                      <Check className="size-3 text-purple-500" />
                      Безлимитный доступ
                    </li>
                  </ul>
                </div>
                {selectedOption === "unlimited" && (
                  <div className="flex-shrink-0 p-1 bg-purple-500 rounded-full">
                    <Check className="size-4 text-white" />
                  </div>
                )}
              </div>
            </motion.button>
          </div>

          {/* Features */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Sparkles className="size-5 text-purple-500" />
              Что включено:
            </h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="size-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <span>Детальный астрологический анализ совместимости по знакам зодиака</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="size-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <span>Нумерологический расчет чисел судьбы и совместимости</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="size-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <span>Рекомендации для улучшения отношений</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="size-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <span>Анализ создан с помощью ИИ</span>
              </li>
            </ul>
          </div>

          {/* Purchase Button */}
          <button
            onClick={handlePurchase}
            className="w-full py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white rounded-full font-bold text-lg hover:shadow-lg transition-shadow active:scale-95"
          >
            {selectedOption === "single" ? "Купить за ₽99" : "Купить за ₽299/мес"}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Нажимая кнопку, вы соглашаетесь с условиями покупки
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}