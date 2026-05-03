/**
 * Детальный чеклист UI/UX паритета web → React Native.
 * Критерии DoD: при одинаковых данных экран визуально совпадает (цвета, типографика, отступы, состояния).
 * Соответствие файлов см. `webRnMatrix.ts`.
 */
export type ParityCriterion = {
  id: string;
  web: string;
  rn: string;
  checks: readonly string[];
};

export const PARITY_SCREEN_CHECKLIST: readonly ParityCriterion[] = [
  {
    id: "landing",
    web: "components/LandingPage.tsx",
    rn: "screens/LandingScreen.tsx",
    checks: [
      "Фон: from-red-50 via-amber-50 to-yellow-50",
      "Шапка: white/80, тень, порядок APK → Регистрация → Войти",
      "Hero: градиентный заголовок как h2 web, три CTA + forruss.ru",
      "MVP-карточки: white/50, border amber-100/80, значения с градиентом red-600→amber-600",
      "Features: карточки from-red-50 to-amber-50, иконки в градиентном квадрате",
      "Блок APK: текст и кнопка как на web при наличии URL из /api/public/mobile-apk",
      "Истории успеха и финальный CTA с TrendingUp и тремя кнопками",
      "Footer: колонки Продукт / Компания / Документы + юрблок как на web",
    ],
  },
  {
    id: "auth-login",
    web: "components/AuthModal.tsx (login)",
    rn: "screens/LoginScreen.tsx",
    checks: [
      "Hero: from-red-500 to-amber-500, логотип в круге white/20",
      "Карточка: белая, поля rounded-xl, ошибки красным",
      "Кнопки: градиент primary, outline регистрация",
    ],
  },
  {
    id: "auth-register",
    web: "components/AuthModal.tsx (register)",
    rn: "screens/RegisterScreen.tsx",
    checks: [
      "Переключатель По почте / По телефону как segmented gray-100",
      "Согласия и валидации совпадают по смыслу с web",
    ],
  },
  {
    id: "main",
    web: "pages/MainApp.tsx",
    rn: "screens/MainScreen.tsx",
    checks: [
      "Шапка: градиентный заголовок «Любить по-russки», иконки gray-600",
      "Низ: white/80, Flame red-500, остальные gray-400, бейджи градиенты как web",
      "Непрочитанные чаты: точка red-500 с кольцом white",
      "Карточка профиля и ActionButtons совпадают с web-компонентами",
    ],
  },
  {
    id: "chat",
    web: "components/ChatModal.tsx",
    rn: "screens/ChatScreen.tsx",
    checks: [
      "Шапка, пузыри, composer, медиа — визуально как web",
      "Состояния loading/empty/error",
    ],
  },
  {
    id: "support",
    web: "pages/SupportPage.tsx",
    rn: "screens/SupportScreen.tsx",
    checks: ["Градиентный hero с иконкой Headphones", "Белая карточка, поля как rounded-xl"],
  },
  {
    id: "payment-confirm",
    web: "pages/PaymentConfirmPage.tsx",
    rn: "screens/PaymentConfirmScreen.tsx",
    checks: ["Белая карточка rounded-3xl shadow-2xl", "Заголовок и текст как web"],
  },
  {
    id: "invite-scan",
    web: "components/InvitePage.tsx + pages/ScanProfile.tsx",
    rn: "screens/InviteScreen.tsx + ScanProfileScreen.tsx",
    checks: ["Тот же копирайт и CTA, градиенты страницы"],
  },
  {
    id: "modals",
    web: "components/*Modal.tsx в MainApp",
    rn: "components/main/*Modal.tsx",
    checks: [
      "Backdrop black/50, карточка white rounded-3xl",
      "Пустые и загрузочные состояния как на web",
    ],
  },
];

/** Краткий чеклист поведения (из веб `MOBILE_WEB_PARITY_90` + UI). */
export const PARITY_QA_NOTES: readonly string[] = [
  "Чаты: список, read, mark-read, delete — совпадают с API веба.",
  "Градиенты CTA и карточек — стопы из designTokens / Tailwind map.",
  "Профиль: герой, аватар cover, оверлей редактирования.",
  "События: вкладки и фильтры как EventsModal на web.",
];
