/**
 * Сопоставление веб (Tailwind) — React Native, без NativeWind.
 * См. web: `from-red-50`, `text-sm`, `rounded-2xl` и т.д.
 * При будущем вынесении в `packages/shared` / NativeWind — источник правды.
 */
export const tw = {
  // Фоны/градиенты-стопы
  fromRed50: "#fef2f2",
  viaAmber50: "#fffbeb",
  toYellow50: "#fefce8",
  white: "#ffffff",
  white80: "rgba(255,255,255,0.8)",
  red200: "#fecaca",
  red500: "#ef4444",
  red600: "#dc2626",
  amber500: "#f59e0b",
  amber600: "#d97706",
  stone200: "#e7e5e4",
  stone400: "#a8a29e",
  stone500: "#78716c",
  stone600: "#57534e",
  stone700: "#44403c",
  stone800: "#292524",
  stone900: "#1c1917",
  /** `text-gray-600` (Tailwind) */
  gray600: "#4b5563",
  /** `text-gray-700` — body на карточке профиля (веб) */
  gray700: "#374151",
  /** `text-gray-400` — иконки нижней панели Main (веб rest) */
  gray400: "#9ca3af",
  /** `text-gray-500` — подписи второго уровня (веб) */
  gray500: "#6b7280",
  /** `bg-gray-100` — плейсхолдер фото */
  gray100: "#f3f4f6",
  /** `text-gray-800` — заголовки пустых экранов */
  gray800: "#1f2937",
  /** `border-gray-200` — веб-разделители */
  gray200: "#e5e7eb",
  /** `from-blue-400` / `to-blue-600` — суперлайк (веб) */
  blue400: "#60a5fa",
  blue600: "#2563eb",
  /** `from-purple-500` / `to-purple-600` — кнопка «Детально» */
  purple500: "#a855f7",
  purple600: "#9333ea",

  // Сетка
  textXs: 12, // text-xs
  textSm: 14, // text-sm
  textBase: 16, // text-base
  textLg: 17, // text-lg
  text2xl: 24, // text-2xl (заголовок на карточке веб: sm:text-3xl = 30 — ниже)
  text3xl: 30, // sm:text-3xl в ProfileCard
  // Отступы (кратны 4 в Tailwind)
  p4: 16,
  p6: 24,
  // Радиусы
  rounded2xl: 16, // rounded-2xl
  rounded3xl: 24, // rounded-3xl
  /** shadcn `--radius` 0.625rem — inputs / кнопки secondary на web */
  roundedShadcn: 10,
  gray900: "#111827", // bg-gray-900 footer web
} as const;

/** Светлая тема shadcn из `web/styles/theme.css` :root — для модалок/инпутов 1:1 с web. */
export const shadcnLight = {
  background: "#ffffff",
  foreground: "#0a0a0a",
  destructive: "#d4183d",
  muted: "#ececf0",
  mutedForeground: "#717182",
  border: "rgba(0,0,0,0.1)",
  inputBackground: "#f3f3f5",
  ring: "#b5b5b5",
} as const;

export const brandGradients = {
  page: ["#fef2f2", "#fffbeb", "#fefce8"] as const,
  primary: ["#ef4444", "#f59e0b"] as const,
  primaryDark: ["#dc2626", "#d97706"] as const,
  /** Текст шапки Main (веб: `from-red-600 to-amber-500` на h1) */
  titleText: ["#dc2626", "#f59e0b"] as const,
  featureCard: ["#fef2f2", "#fffbeb"] as const,
  /** Веб: `from-blue-400 to-blue-600` — совпадает с tw.blue400 / tw.blue600 */
  superLike: ["#60a5fa", "#2563eb"] as const,
  /** Веб: шапка SuperLikeComposeModal `from-sky-500 to-indigo-600` */
  superLikeComposeHeader: ["#0ea5e9", "#4f46e5"] as const,
  /** Кнопка «Детально» на карточке (веб: purple-500 → purple-600) */
  detailCta: ["#a855f7", "#9333ea"] as const,
  /** Интересы: from-red-100 to-amber-100 */
  interestTag: ["#fee2e2", "#fef3c7"] as const,
  favorite: ["#fbbf24", "#d97706"] as const,
  softRed: ["#fff1f2", "#fffbeb"] as const,
  premium: ["#9333ea", "#ec4899", "#ef4444"] as const,
  shop: ["#f97316", "#ef4444", "#ec4899"] as const,
  apk: ["#fffbeb", "#ffffff"] as const,
  blueInfo: ["#eff6ff", "#dbeafe"] as const,
  greenSuccess: ["#dcfce7", "#bbf7d0"] as const,
  /** Веб: кнопка «Поделиться QR» from-amber-500 to-yellow-500 */
  qrShareCta: ["#f59e0b", "#eab308"] as const,
} as const;

/**
 * Источник правды для плоского фона под `LinearGradient` (Login/Register и т.д.).
 * Согласовано с конечным стопом `brandGradients.page` / `to-yellow-50` на веб.
 */
export const pageBackgroundFlat = tw.toYellow50;

/** Пока нет API — те же цифры, что в веб ProfileSettingsModal (заглушка). */
export const profileStatsPlaceholder = { likes: 24, matches: 12 } as const;

export const motionTiming = {
  enterMs: 520,
  pressMs: 120,
  springDamping: 14,
  springStiffness: 160,
} as const;

// Дальнейший шаг к полному совпадению с веб: NativeWind + общий `tailwind.config`
// с `web/`, либо пакет `packages/shared` с токенами — без этого значения дублируются в theme/tw.
