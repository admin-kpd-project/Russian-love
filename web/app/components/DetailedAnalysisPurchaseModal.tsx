import { Sparkles, Star, Check } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { ModalShell } from "./ui/modal-shell";

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
    <ModalShell onClose={onClose} ariaLabel="Покупка детального анализа">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 px-5 sm:px-6 py-4 sm:py-5 text-white flex-shrink-0 pr-14">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full flex-shrink-0">
              <Sparkles className="size-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold leading-tight">Детальный анализ</h2>
              <p className="text-xs text-white/90 truncate">Узнайте больше о совместимости</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 sm:px-6 py-4 sm:py-5 space-y-4 overflow-y-auto modal-scroll flex-1 min-h-0">
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
      </div>
    </ModalShell>
  );
}