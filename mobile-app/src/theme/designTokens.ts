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

// Дальнейший шаг к полному совпадению с веб: NativeWind + общий `tailwind.config`
// с `web/`, либо пакет `packages/shared` с токенами — без этого значения дублируются в theme/tw.
