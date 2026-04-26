/**
 * Сопоставление `mobile-app/src/theme/designTokens.ts` (источник правды) с Tailwind на вебе.
 * `designTokenTailwind` — сокращения для `className` (см. компоненты: ChatsList, Profile, Events…).
 * primary / titleText: from-red-600 to-amber-500 — основные шапки и CTA.
 * favorite: from-amber-500 to-amber-600 — акценты «в избранное».
 * featureCard: from-red-50 to-amber-50 — мягкие карточки/стат-блоки.
 * interestTag: from-red-100 to-amber-100 — бейджи интересов.
 * superLike: from-blue-400 to-blue-600.
 * detailCta: from-purple-500 to-purple-600.
 * QR share: from-amber-500 to-yellow-500.
 */

export const designTokenTailwind = {
  primary: "from-red-600 to-amber-500",
  favorite: "from-amber-500 to-amber-600",
  featureCard: "from-red-50 to-amber-50",
  interestTag: "from-red-100 to-amber-100",
} as const;

/** Чек-лист паритета веб/мобайл (~90%): критерии вручную, без эталонных скринов в репо. */
export const MOBILE_WEB_PARITY_90: readonly string[] = [
  "Чаты: GET список, POST read / mark-read all, DELETE; как в conversationsApi (моб).",
  "ChatsList / ChatModal: прочтение через API, перезагрузка списка, ошибки и busy-состояния.",
  "Градиенты/карточки: from-red-600 to-amber-50 стопы согласованы с designTokens (см. designTokenTailwind).",
  "Профиль: герой, аватар object-cover, оверлей камеры в редактировании, QR/Matreshka-CTA.",
  "События: вкладки список/календарь, цена, категория, тег, «Найдено k из M», сброс фильтров.",
  "Модалки: те же CTA/пустые состояния, что и на мобайле по смыслу; ~10% — PWA, HTTPS media, микроанимации.",
];
