import { motion, AnimatePresence } from "motion/react";
import { X, ChevronRight, Heart, Star, MessageCircle, User, Settings, QrCode, Shield, Sparkles, RotateCcw } from "lucide-react";
import { useState } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface UserGuideModalProps {
  onClose: () => void;
}

interface GuideSection {
  id: string;
  title: string;
  icon: JSX.Element;
  content: JSX.Element;
}

export function UserGuideModal({ onClose }: UserGuideModalProps) {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const sections: GuideSection[] = [
    {
      id: "getting-started",
      title: "Начало работы",
      icon: <Sparkles className="size-6" />,
      content: (
        <div className="space-y-4">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1702482527875-e16d07f0d91b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1c2VyJTIwcHJvZmlsZSUyMHBob3RvfGVufDF8fHx8MTc3NTA1Nzc0NHww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Регистрация"
            className="w-full h-48 object-cover rounded-xl"
          />
          <h4 className="font-bold text-lg text-gray-800">Регистрация и создание профиля</h4>
          <div className="space-y-3 text-gray-700">
            <p><strong>1. Загрузите фото</strong></p>
            <p className="text-sm">При первом входе выберите своё лучшее фото. Это будет главное изображение вашего профиля.</p>
            
            <p><strong>2. Заполните профиль</strong></p>
            <p className="text-sm">Укажите имя, возраст, биографию и интересы. Чем подробнее профиль, тем выше шансы найти совместимость!</p>
            
            <p><strong>3. Начните поиск</strong></p>
            <p className="text-sm">После заполнения профиля вы попадёте на главный экран с карточками других пользователей.</p>
          </div>
        </div>
      ),
    },
    {
      id: "swipe",
      title: "Свайп-механика",
      icon: <Heart className="size-6" />,
      content: (
        <div className="space-y-4">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1643639779309-1ae5675511ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBkYXRpbmclMjBhcHAlMjBzd2lwZXxlbnwxfHx8fDE3NzUwNTc3NDN8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Свайп"
            className="w-full h-48 object-cover rounded-xl"
          />
          <h4 className="font-bold text-lg text-gray-800">Как использовать свайпы</h4>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="size-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <X className="size-6 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Свайп влево / Кнопка ✕</p>
                <p className="text-sm text-gray-600">Пропустить профиль, если человек не заинтересовал</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="size-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Heart className="size-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Свайп вправо / Кнопка ❤️</p>
                <p className="text-sm text-gray-600">Поставить лайк. Если человек ответит взаимностью — будет match!</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="size-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Star className="size-6 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Кнопка ⭐ (Суперлайк)</p>
                <p className="text-sm text-gray-600">Отправить суперлайк для гарантированного совпадения. У вас есть 5 бесплатных!</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="size-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <RotateCcw className="size-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Кнопка ↺ (Отменить)</p>
                <p className="text-sm text-gray-600">Отменить последнее действие, если случайно свайпнули не туда</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "superlikes",
      title: "Суперлайки",
      icon: <Star className="size-6" />,
      content: (
        <div className="space-y-4">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1761568394061-a2ec4832b9e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFydCUyMGxvdmUlMjBjb25uZWN0aW9ufGVufDF8fHx8MTc3NTA1Nzc0NXww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Суперлайки"
            className="w-full h-48 object-cover rounded-xl"
          />
          <h4 className="font-bold text-lg text-gray-800">Что такое суперлайк?</h4>
          <div className="space-y-3 text-gray-700">
            <p className="text-sm">
              <strong>Суперлайк</strong> — это специальный вид лайка, который <span className="text-amber-600 font-semibold">гарантирует совпадение</span> с другим пользователем.
            </p>
            
            <div className="bg-gradient-to-r from-amber-50 to-red-50 p-4 rounded-xl border border-amber-200">
              <p className="font-semibold text-amber-800 mb-2">🎁 Бесплатные суперлайки</p>
              <p className="text-sm text-gray-700">Каждый новый пользователь получает 5 бесплатных суперлайков!</p>
            </div>
            
            <p><strong>Как купить суперлайки:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Нажмите кнопку ⭐ на карточке профиля</li>
              <li>Если суперлайки закончились, откроется магазин</li>
              <li>Выберите пакет: 5, 10 или 50 суперлайков</li>
              <li>Завершите покупку</li>
            </ul>
            
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <p className="text-sm text-gray-700">
                <strong>💡 Совет:</strong> Используйте суперлайки для профилей, которые вам действительно понравились!
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "matching",
      title: "Match и совметимость",
      icon: <Heart className="size-6" />,
      content: (
        <div className="space-y-4">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1770022006565-1217f8c78ba1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBtYXRjaGluZyUyMGNvbm5lY3Rpb258ZW58MXx8fHwxNzc1MDU3NzQzfDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Match"
            className="w-full h-48 object-cover rounded-xl"
          />
          <h4 className="font-bold text-lg text-gray-800">Система совпадений</h4>
          <div className="space-y-3 text-gray-700">
            <p><strong>🤖 AI-алгоритм совместимости</strong></p>
            <p className="text-sm">
              На каждой карточке вы видите процент совместимости, рассчитанный искусственным интеллектом на основе ваших интересов, возраста, местоположения и других параметров.
            </p>
            
            <p><strong>💕 Что такое Match?</strong></p>
            <p className="text-sm">
              Match происходит, когда два человека ставят лайк друг другу. После этого открывается возможность общения в чате!
            </p>
            
            <div className="bg-gradient-to-r from-pink-50 to-red-50 p-4 rounded-xl border border-pink-200">
              <p className="font-semibold text-pink-800 mb-2">✨ Уведомление о Match</p>
              <p className="text-sm text-gray-700">При взаимной симпатии появится красивое уведомление с фотографиями обоих пользователей и кнопками для начала чата или продолжения просмотра.</p>
            </div>
            
            <p><strong>🎯 Увеличьте шансы на Match:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Добавьте качественное фото</li>
              <li>Заполните биографию подробно</li>
              <li>Укажите свои интересы и хобби</li>
              <li>Разрешите AI-анализ соцсетей в настройках</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "chat",
      title: "Чат и общение",
      icon: <MessageCircle className="size-6" />,
      content: (
        <div className="space-y-4">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1646766677899-9c1750e28b0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGF0JTIwbWVzc2FnaW5nJTIwY29udmVyc2F0ионufGVufDF8fHx8MTc3NTA1Nzc0NHww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Чат"
            className="w-full h-48 object-cover rounded-xl"
          />
          <h4 className="font-bold text-lg text-gray-800">Как общаться</h4>
          <div className="space-y-3 text-gray-700">
            <p><strong>💬 Открыть чат</strong></p>
            <p className="text-sm">
              После Match нажмите на иконку сообщений 💬 внизу экрана, чтобы открыть список ваших чатов. Выберите собеседника и начните общение!
            </p>
            
            <p><strong>⌨️ Отправка сообщений</strong></p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Введите текст в поле внизу экрана</li>
              <li>Нажмите кнопку отправки (она появится автоматически)</li>
              <li>Ваше сообщение отправлено!</li>
            </ul>
            
            <p><strong>🎤 Голосовые сообщения</strong></p>
            <p className="text-sm">
              Если поле ввода пустое, вместо кнопки отправки появится кнопка микрофона. Удерживайте её для записи голосового сообщения.
            </p>
            
            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
              <p className="text-sm text-gray-700">
                <strong>🌟 Советы по общению:</strong><br/>
                • Будьте вежливы и дружелюбны<br/>
                • Задавайте открытые вопросы<br/>
                • Делитесь своими интересами<br/>
                • Не бойтесь быть собой!
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "profile",
      title: "Профиль",
      icon: <User className="size-6" />,
      content: (
        <div className="space-y-4">
          <h4 className="font-bold text-lg text-gray-800">Управление профилем</h4>
          <div className="space-y-3 text-gray-700">
            <p><strong>📸 Изменить фото</strong></p>
            <p className="text-sm">
              Нажмите на иконку профиля 👤 внизу экрана. В своём профиле нажмите на фото, чтобы загрузить новое изображение.
            </p>
            
            <p><strong>✏️ Редактировать информацию</strong></p>
            <p className="text-sm">
              В профиле можно изменить имя, возраст, биографию и список интересов. Нажмите на соответствующее поле для редактирования.
            </p>
            
            <p><strong>🏆 Значки и достижения</strong></p>
            <p className="text-sm">
              На вашем профиле отображаются специальные значки:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>✓ Верифицированный аккаунт</li>
              <li>📍 Местоположение (город или регион)</li>
              <li>💯 Процент заполненности профиля</li>
            </ul>
            
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
              <p className="text-sm text-gray-700">
                <strong>💡 Заполните профиль на 100%</strong> для повышения видимости и увеличения шансов на Match!
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "qr",
      title: "QR-коды",
      icon: <QrCode className="size-6" />,
      content: (
        <div className="space-y-4">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1569908420024-c8f709b75700?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxxciUyMGNvZGUlMjBzY2FubmluZ3xlbnwxfHx8fDE3NzUwNTc3NDV8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="QR код"
            className="w-full h-48 object-cover rounded-xl"
          />
          <h4 className="font-bold text-lg text-gray-800">Поделиться профилем</h4>
          <div className="space-y-3 text-gray-700">
            <p><strong>📱 Ваш QR-код</strong></p>
            <p className="text-sm">
              В вашем профиле есть кнопка QR-кода. Нажмите на неё, тобы показать свой уникальн��й QR-ко�� другим людям.
            </p>
            
            <p><strong>📤 Поделиться</strong></p>
            <p className="text-sm">
              В окне QR-кода вы можете:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Показать код для сканирования</li>
              <li>Скачать QR-код как изображение</li>
              <li>Поделиться ссылкой через мессенджеры</li>
            </ul>
            
            <p><strong>📷 Сканировать QR-код</strong></p>
            <p className="text-sm">
              На главном экране нажмите кнопку сканирования QR 📷 в правом верхнем углу. Наведите камеру на QR-код другого пользователя.
            </p>
            
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
              <p className="text-sm text-gray-700">
                <strong>🎯 Когда это полезно:</strong><br/>
                • Встретили интересного человека в реальной жизни<br/>
                • На мероприятиях и вечеринках<br/>
                • Хотите поделиться профилем с друзьями
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "settings",
      title: "Настройки",
      icon: <Settings className="size-6" />,
      content: (
        <div className="space-y-4">
          <h4 className="font-bold text-lg text-gray-800">Параметры приложения</h4>
          <div className="space-y-3 text-gray-700">
            <p><strong>⚙️ Открыть настройки</strong></p>
            <p className="text-sm">
              Нажмите на иконку шестерёнки ⚙️ в правом верхнем углу главного экрана или в своём профиле.
            </p>
            
            <p><strong>📍 Расстояние поиска</strong></p>
            <p className="text-sm">
              Установите радиус поиска от 5 до 100 км. Приложение будет показывать пользователей в этом радиусе от вашего местоположения.
            </p>
            
            <p><strong>🎂 Возрастной диапазон</strong></p>
            <p className="text-sm">
              Выберите минимальный и максимальный возраст людей, которых хотите видеть (от 18 до 85 лет).
            </p>
            
            <p><strong>🔔 Уведомления</strong></p>
            <p className="text-sm">
              Включите или отключите push-уведомления о новых match и сообщениях.
            </p>
            
            <p><strong>🔒 Приватность</strong></p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Приватный профиль</strong> — скрыть профиль от всех пользователей</li>
              <li><strong>Скрывать город</strong> — показывать только регион</li>
              <li><strong>Разрешить QR-сканирование</strong> — могут ли другие находить вас по QR</li>
            </ul>
            
            <p><strong>🤖 AI-анализ</strong></p>
            <p className="text-sm">
              Разрешите анализ ваших социальных сетей для улучшения алгоритма подбора совместимости.
            </p>
            
            <p><strong>🌐 Язык интерфейса</strong></p>
            <p className="text-sm">
              Выберите язык: Русский, English или Українська.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "safety",
      title: "Безопасность",
      icon: <Shield className="size-6" />,
      content: (
        <div className="space-y-4">
          <h4 className="font-bold text-lg text-gray-800">Ваша безопасность важна</h4>
          <div className="space-y-3 text-gray-700">
            <div className="bg-red-50 p-4 rounded-xl border border-red-200">
              <p className="font-semibold text-red-800 mb-2">🛡️ Правила безопасности</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>Не делитесь личными данными (адресом, финансовой информацией)</li>
                <li>Первая встреча — только в общественном месте</li>
                <li>Сообщите друзьям, куда вы идёте</li>
                <li>Доверяйте своей интуиции</li>
              </ul>
            </div>
            
            <p><strong>🚫 Как пожаловаться на пользователя</strong></p>
            <p className="text-sm">
              Если кто-то ведёт себя неподобающе:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Откройте профиль пользователя</li>
              <li>Нажмите на кнопку меню (⋮)</li>
              <li>Выберите "Пожаловаться"</li>
              <li>Укажите причину жалобы</li>
            </ul>
            
            <p><strong>🔒 Конфиденциальность данных</strong></p>
            <p className="text-sm">
              Мы серьёзно относимся к защите ваших данных. Прочитайте нашу <span className="text-red-600 font-semibold">Политику конфиденциальности</span> в настройках приложения.
            </p>
            
            <p><strong>❌ Блокировка пользователей</strong></p>
            <p className="text-sm">
              Вы можете заблокировать любого пользователя. Заблокированные люди не увидят ваш профиль и не смогут написать вам.
            </p>
            
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <p className="text-sm text-gray-700">
                <strong>📞 Служба поддержки:</strong><br/>
                Если у вас возникли проблемы или вопросы, свяжитесь с нами через раздел "Помощь" в настройках.
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  if (selectedSection) {
    const section = sections.find(s => s.id === selectedSection);
    if (!section) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
        onClick={() => setSelectedSection(null)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, x: 50 }}
          animate={{ scale: 1, opacity: 1, x: 0 }}
          exit={{ scale: 0.9, opacity: 0, x: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-amber-500 p-6 text-white relative">
            <button
              onClick={() => setSelectedSection(null)}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="size-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className="size-12 bg-white/20 rounded-xl flex items-center justify-center">
                {section.icon}
              </div>
              <h2 className="text-2xl font-bold">{section.title}</h2>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
            {section.content}
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-amber-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="size-6" />
          </button>
          <h2 className="text-2xl font-bold mb-1">Руководство пользователя</h2>
          <p className="text-white/90 text-sm">Всё, что нужно знать о "Любить по-russки"</p>
        </div>

        {/* Welcome Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="bg-gradient-to-r from-red-50 to-amber-50 p-4 rounded-xl border border-red-200">
            <h3 className="font-bold text-lg text-gray-800 mb-2">👋 Добро пожаловать!</h3>
            <p className="text-sm text-gray-700">
              <strong>"Любить по-russки"</strong> — это мобильное приложение знакомств с уникальным 
              AI-алгоритмом расчёта совместимости. Мы поможем вам найти родственную душу на основе 
              ваших интересов, ценностей и предпочтений.
            </p>
          </div>
        </div>

        {/* Sections List */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-240px)]">
          <h3 className="font-bold text-gray-800 mb-4">Выберите раздел:</h3>
          <div className="space-y-3">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setSelectedSection(section.id)}
                className="w-full flex items-center justify-between px-4 py-4 bg-gray-50 hover:bg-gradient-to-r hover:from-red-50 hover:to-amber-50 rounded-xl transition-all group border border-gray-200 hover:border-red-300"
              >
                <div className="flex items-center gap-4">
                  <div className="size-12 bg-white rounded-xl flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform shadow-sm">
                    {section.icon}
                  </div>
                  <span className="text-gray-800 font-semibold text-left text-sm sm:text-base leading-snug">{section.title}</span>
                </div>
                <ChevronRight className="size-5 text-gray-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-600">
              <strong>Нужна помощь?</strong> Пишите в поддержку!
            </p>
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
            >
              Закрыть
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}