import { Brain, Heart, MapPin, Calendar, CheckCircle2, Info, Sparkles, Star } from "lucide-react";
import { CompatibilityDetails } from "../utils/compatibilityAI";
import { ModalShell } from "./ui/modal-shell";

interface CompatibilityDetailsModalProps {
  details: CompatibilityDetails;
  userName: string;
  onClose: () => void;
  onOpenDetailedAnalysis?: () => void;
  compatibility: number;
}

const traitLabels: { [key: string]: string } = {
  extroversion: "Экстраверсия",
  openness: "Открытость",
  conscientiousness: "Добросовестность",
  agreeableness: "Доброжелательность",
  emotionalStability: "Эмоциональная стабильность",
};

export function CompatibilityDetailsModal({ details, userName, onClose, onOpenDetailedAnalysis, compatibility }: CompatibilityDetailsModalProps) {
  return (
    <ModalShell onClose={onClose} ariaLabel="Анализ совместимости" size="wide" variant="sheet">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-amber-500 px-5 sm:px-6 py-4 flex-shrink-0 pr-14">
          <h2 className="text-lg sm:text-xl font-bold text-white">Анализ совместимости</h2>
          <p className="text-xs text-white/90">Детальный расчет AI</p>
        </div>

        {/* Content */}
        <div className="overflow-y-auto modal-scroll flex-1 min-h-0 p-5 sm:p-6 space-y-5">
          {/* Total Score */}
          <div className="text-center pb-6 border-b border-gray-200">
            <div className="inline-flex items-center justify-center size-24 rounded-full bg-gradient-to-br from-red-100 to-amber-100 mb-3">
              <div className="text-4xl font-bold bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent">
                {compatibility}%
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Общая совместимость с {userName}
            </p>
            
            {/* Detailed Analysis Button */}
            {onOpenDetailedAnalysis && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetailedAnalysis();
                }}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm font-bold mx-auto"
              >
                <Sparkles className="size-4" />
                Получить детальный анализ
              </button>
            )}
          </div>

          {/* Personality Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Brain className="size-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">Личность</h3>
                <p className="text-xs text-gray-500">Вес: {details.personality.weight}%</p>
              </div>
              <div className="text-lg font-bold text-purple-600">
                {details.personality.score}%
              </div>
            </div>

            <div className="pl-12 space-y-2">
              {Object.entries(details.personality.traits).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{traitLabels[key]}</span>
                    <span className="font-medium text-gray-800">{Math.round(value.match)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all"
                      style={{ width: `${value.match}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interests Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Heart className="size-5 text-pink-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">Интересы</h3>
                <p className="text-xs text-gray-500">Вес: {details.interests.weight}%</p>
              </div>
              <div className="text-lg font-bold text-pink-600">
                {details.interests.score}%
              </div>
            </div>

            <div className="pl-12 space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Общих интересов:</span>
                <span className="font-medium text-gray-800">
                  {details.interests.shared.length} из {details.interests.total}
                </span>
              </div>
              
              {details.interests.shared.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {details.interests.shared.map((interest, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1 px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-xs font-medium"
                    >
                      <CheckCircle2 className="size-3" />
                      {interest}
                    </div>
                  ))}
                </div>
              )}
              
              {details.interests.shared.length === 0 && (
                <p className="text-sm text-gray-500 italic">Нет общих интересов</p>
              )}
            </div>
          </div>

          {/* Age Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="size-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">Возраст</h3>
                <p className="text-xs text-gray-500">Вес: {details.age.weight}%</p>
              </div>
              <div className="text-lg font-bold text-blue-600">
                {details.age.score}%
              </div>
            </div>

            <div className="pl-12">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Разница в возрасте:</span>
                <span className="font-medium text-gray-800">
                  {details.age.difference} {details.age.difference === 1 ? 'год' : 'лет'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mt-2">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all"
                  style={{ width: `${details.age.score}%` }}
                />
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="size-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">Местоположение</h3>
                <p className="text-xs text-gray-500">Вес: {details.location.weight}%</p>
              </div>
              <div className="text-lg font-bold text-green-600">
                {details.location.score}%
              </div>
            </div>

            <div className="pl-12">
              <div className="flex items-center gap-2 text-sm">
                {details.location.same ? (
                  <>
                    <CheckCircle2 className="size-4 text-green-600" />
                    <span className="text-gray-800 font-medium">Один город</span>
                  </>
                ) : (
                  <>
                    <Info className="size-4 text-gray-400" />
                    <span className="text-gray-600">Разные города</span>
                  </>
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mt-2">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all"
                  style={{ width: `${details.location.score}%` }}
                />
              </div>
            </div>
          </div>

          {/* Astrology Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Sparkles className="size-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">Астрология</h3>
                <p className="text-xs text-gray-500">Вес: {details.astrology.weight}%</p>
              </div>
              <div className="text-lg font-bold text-indigo-600">
                {details.astrology.score}%
              </div>
            </div>

            <div className="pl-12 space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  {details.astrology.zodiacCompatible ? (
                    <>
                      <CheckCircle2 className="size-4 text-indigo-600" />
                      <span className="text-gray-800 font-medium">Знаки зодиака совместимы</span>
                    </>
                  ) : (
                    <>
                      <Info className="size-4 text-gray-400" />
                      <span className="text-gray-600">Знаки зодиака требуют работы</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {details.astrology.elementMatch ? (
                    <>
                      <CheckCircle2 className="size-4 text-indigo-600" />
                      <span className="text-gray-800 font-medium">Элементы гармонируют</span>
                    </>
                  ) : (
                    <>
                      <Info className="size-4 text-gray-400" />
                      <span className="text-gray-600">Разные элементы</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {details.astrology.moonMatch ? (
                    <>
                      <CheckCircle2 className="size-4 text-indigo-600" />
                      <span className="text-gray-800 font-medium">Луны совпадают</span>
                    </>
                  ) : (
                    <>
                      <Info className="size-4 text-gray-400" />
                      <span className="text-gray-600">Разные лунные знаки</span>
                    </>
                  )}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full transition-all"
                  style={{ width: `${details.astrology.score}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 italic">{details.astrology.details}</p>
              
              {/* Removed individual Astrology button */}
            </div>
          </div>

          {/* Numerology Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Star className="size-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">Нумерология</h3>
                <p className="text-xs text-gray-500">Вес: {details.numerology.weight}%</p>
              </div>
              <div className="text-lg font-bold text-amber-600">
                {details.numerology.score}%
              </div>
            </div>

            <div className="pl-12 space-y-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Путь жизни</span>
                  <span className="font-medium text-gray-800">{details.numerology.lifePathMatch}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all"
                    style={{ width: `${details.numerology.lifePathMatch}%` }}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Стремление души</span>
                  <span className="font-medium text-gray-800">{details.numerology.soulUrgeMatch}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all"
                    style={{ width: `${details.numerology.soulUrgeMatch}%` }}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Судьба</span>
                  <span className="font-medium text-gray-800">{details.numerology.destinyMatch}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all"
                    style={{ width: `${details.numerology.destinyMatch}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-600 italic mt-2">{details.numerology.details}</p>
              
              {/* Removed individual Numerology button */}
            </div>
          </div>

          {/* AI Info */}
          <div className="bg-gradient-to-r from-red-50 to-amber-50 rounded-2xl p-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="p-2 bg-gradient-to-br from-red-500 to-amber-500 rounded-lg">
                  <Brain className="size-5 text-white" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Как работает AI?</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Наш алгоритм анализирует 4 ключевых фактора: личностные черты (40%), 
                  общие интересы (30%), совместимость по возрасту (15%) и близость 
                  местоположения (15%). Финальная оценка учитывает все параметры с 
                  соответствующими весами.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}