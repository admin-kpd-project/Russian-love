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
  stone500: "#78716c",
  stone600: "#57534e",
  stone700: "#44403c",
  stone800: "#292524",
  stone900: "#1c1917",

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
} as const;

export const brandGradients = {
  page: ["#fef2f2", "#fffbeb", "#fefce8"] as const,
  primary: ["#ef4444", "#f59e0b"] as const,
  primaryDark: ["#dc2626", "#d97706"] as const,
  featureCard: ["#fef2f2", "#fffbeb"] as const,
  superLike: ["#60a5fa", "#2563eb"] as const,
  favorite: ["#fbbf24", "#d97706"] as const,
  softRed: ["#fff1f2", "#fffbeb"] as const,
  premium: ["#9333ea", "#ec4899", "#ef4444"] as const,
  shop: ["#f97316", "#ef4444", "#ec4899"] as const,
  apk: ["#fffbeb", "#ffffff"] as const,
  blueInfo: ["#eff6ff", "#dbeafe"] as const,
  greenSuccess: ["#dcfce7", "#bbf7d0"] as const,
} as const;

export const motionTiming = {
  enterMs: 520,
  pressMs: 120,
  springDamping: 14,
  springStiffness: 160,
} as const;

// Дальнейший шаг к полному совпадению с веб: NativeWind + общий `tailwind.config`
// с `web/`, либо пакет `packages/shared` с токенами — без этого значения дублируются в theme/tw.
