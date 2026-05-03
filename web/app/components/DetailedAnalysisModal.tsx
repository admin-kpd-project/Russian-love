import { Star, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { ModalShell } from "./ui/modal-shell";

interface DetailedAnalysisModalProps {
  onClose: () => void;
  profileName: string;
  profileAge: number;
  compatibility: number;
}

export function DetailedAnalysisModal({ 
  onClose, 
  profileName, 
  profileAge,
  compatibility 
}: DetailedAnalysisModalProps) {
  const [activeTab, setActiveTab] = useState<"astrology" | "numerology">("astrology");
  const [isLoading, setIsLoading] = useState(true);
  const [analysis, setAnalysis] = useState({
    astrology: "",
    numerology: ""
  });

  useEffect(() => {
    // Simulate AI analysis generation
    setTimeout(() => {
      setAnalysis({
        astrology: generateAstrologyAnalysis(profileName, profileAge, compatibility),
        numerology: generateNumerologyAnalysis(profileName, profileAge, compatibility)
      });
      setIsLoading(false);
    }, 1500);
  }, [profileName, profileAge, compatibility]);

  return (
    <ModalShell onClose={onClose} ariaLabel="Детальный анализ" size="wide" variant="sheet">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 px-5 sm:px-6 py-4 sm:py-5 text-white flex-shrink-0 pr-14">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full flex-shrink-0">
              <Sparkles className="size-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold leading-tight">Детальный анализ</h2>
              <p className="text-xs text-white/90 truncate">Совместимость с {profileName}</p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 bg-white/20 rounded-full h-2">
              <div
                className="bg-white h-full rounded-full transition-all"
                style={{ width: `${compatibility}%` }}
              />
            </div>
            <span className="text-base font-bold">{compatibility}%</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-white sticky top-0 z-10">
          <button
            onClick={() => setActiveTab("astrology")}
            className={`flex-1 py-4 text-center font-medium transition-colors relative ${
              activeTab === "astrology"
                ? "text-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Star className="size-5 inline-block mr-2" />
            Астрология
            {activeTab === "astrology" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("numerology")}
            className={`flex-1 py-4 text-center font-medium transition-colors relative ${
              activeTab === "numerology"
                ? "text-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Sparkles className="size-5 inline-block mr-2" />
            Нумерология
            {activeTab === "numerology" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"
              />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-4"
              >
                <Sparkles className="size-12 text-purple-500" />
              </motion.div>
              <p className="text-gray-600">Анализируем совместимость...</p>
            </div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="prose prose-sm max-w-none">
                {activeTab === "astrology" ? (
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    {analysis.astrology.split('\n\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    {analysis.numerology.split('\n\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <Sparkles className="size-4" />
            <span>Анализ создан с помощью ИИ</span>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

function generateAstrologyAnalysis(name: string, age: number, compatibility: number): string {
  const zodiacSigns = ["Овна", "Тельца", "Близнецов", "Рака", "Льва", "Девы", "Весов", "Скорпиона", "Стрельца", "Козерога", "Водолея", "Рыб"];
  const yourSign = zodiacSigns[Math.floor(Math.random() * zodiacSigns.length)];
  const theirSign = zodiacSigns[Math.floor(Math.random() * zodiacSigns.length)];
  
  if (compatibility >= 80) {
    return `🌟 Астрологическая совместимость: ${yourSign} и ${theirSign}

Ваше сочетание знаков представляет собой гармоничное астрологическое соединение. Энергии ваших знаков прекрасно дополняют друг друга, создавая атмосферу взаимопонимания и поддержки.

Планетарные аспекты указывают на сильное эмоциональное влечение и интеллектуальную совместимость. Венера в вашей натальной карте образует благоприятный аспект с Марсом партнера, что усиливает романтическое притяжение.

Луна в гармоничных позициях обещает эмоциональную стабильность в отношениях. Вы легко понимаете чувства друг друга без сов, создавая глубокую эмоциональную связь.

Юпитер приносит удачу и расширение в эти отношения. Вместе вы сможете достичь большего, чем порознь. Совместные проекты и цели будут успешными.`;
  } else if (compatibility >= 60) {
    return `⭐ Астрологическая совместимость: ${yourSign} и ${theirSign}

Ваша астрологическая совместимость показывает интересное сочетание элементов. Есть как гармоничные, так и напряженные аспекты, которые создают динамичные отношения.

Солнце в вашей карте образует квадратуру с Луной партнера, что может создавать некоторое напряжение, но также добавляет страсти и интенсивности. Важно научиться понимать различия в эмоциональных потребностях.

Меркурий в благоприятном положении обеспечивает хорошую коммуникацию. Вы можете открыто обсуждать проблемы и находить компромиссы через диалог.

Сатурн указывает на потенциал для долгосрочных отношений, если вы готовы работать над ними. Терпение и зрелость помогут преодолеть трудности.`;
  } else {
    return `💫 Астрологическая совместимость: ${yourSign} и ${theirSign}

Ваше астрологическое сочетание представляет собой вызов, который может стать возможностью для роста. Ваши знаки имеют разные подходы к жизни и отношениям.

Планетарные позиции показывают, что вам потребуется больше усилий для достижения гармонии. Марс создает напряженные аспекты, что может приводить к конфликтам и недопониманию.

Однако эти различия могут стать источником роста, если оба партнера готовы учиться друг у друга. Ваши различные энергии могут дополнять друг друга при правильном подходе.

Нептун предлагает возможность для духовного роста через эти отношения. Терпимость и понимание станут ключом к успеху. Работа над собой поможет улучшить совместимость.`;
  }
}

function generateNumerologyAnalysis(name: string, age: number, compatibility: number): string {
  const yourNumber = Math.floor(Math.random() * 9) + 1;
  const theirNumber = Math.floor(Math.random() * 9) + 1;
  const destinyNumber = (yourNumber + theirNumber) % 9 || 9;
  
  if (compatibility >= 80) {
    return `🔢 Нумерологический анализ: Число ${yourNumber} и Число ${theirNumber}

Ваши числа судьбы находятся в гармоничной вибрации. Число совместимости ${destinyNumber} указывает на сильную связь и естественное притяжение между вами.

Жизненный путь: Ваши пути идут параллельно, поддерживая и дополняя друг друга. Вибрации ваших чисел создают резонанс, усиливающий позитивные качества каждого.

Число душевного порыва показывает глубокое понимание желаний и мотиваций партнера. Вы интуитивно чувствуете, что важно для другого человека, и готовы поддерживать эти стремления.

Число выражения указывает на совместимость в общении и самореализации. Вместе вы создаете гармоничное пространство для роста и развития. Ваши таланты прекрасно дополняют друг друга.`;
  } else if (compatibility >= 60) {
    return `🔢 Нумерологический анализ: Число ${yourNumber} и Число ${theirNumber}

Ваши числа показывают интересную комбинацию вибраций. Число совместимости ${destinyNumber} говорит о потенциале для развития отношений при осознанном подходе.

Жизненный путь: Ваши пути иногда расходятся, но это создает возможности для обогащения опыта друг друга. Различные вибрации могут стать источником новых перспектив.

Число душевного порыва показывает некоторые различия в приоритетах и желаниях. Важно открыто обсуждать свои потребности и находить баланс между личными целями и совместными.

Число выражения указывает на разные стили коммуникации и самовыражения. Учитесь ценить эти различия как возможность расширить свое понимание мира. Терпение и уважение помогут найти общий язык.`;
  } else {
    return `🔢 Нумерологический анализ: Число ${yourNumber} и Число ${theirNumber}

Ваши числа находятся в конфликтующих вибрациях. Число совместимости ${destinyNumber} показывает вызовы, которые потребуют сознательных усилий для преодоления.

Жизненный путь: Ваши пути идут в разных направлениях, что может создавать трения. Эти различия требуют зрелости и готовности к компромиссам для построения гармоничных отношений.

Число душевного порыва выявляет существенные различия в базовых потребностях и желаниях. Важно не пытаться изменить партнера, а найти способы уважать индивидуальность друг друга.

Число выражения показывает разные подходы к жизни и коммуникации. Эти отношения могут стать катализатором для личностного роста, если оба готовы учиться и развиваться. Работа над собой и отношениями необходима.`;
  }
}