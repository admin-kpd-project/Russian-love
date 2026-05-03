/**
 * Канонический staging (как web с `VITE_API_BASE_URL=https://dev.forruss.ru`): один origin, пути `/api/...`.
 */
export const CANONICAL_STAGING_API_BASE = "https://dev.forruss.ru";

/**
 * JS-fallback, если в приложении ничего не сохранено и нет BuildConfig (см. android/local.properties API_BASE_URL).
 * HTTPS staging — один origin для веба и /api, без cleartext и блокировок операторами на :8080.
 * Локально: «Сервер» в приложении или `API_BASE_URL` в android/local.properties (см. README).
 */
export const API_URL_FALLBACK_JS = CANONICAL_STAGING_API_BASE;

/**
 * Публичный origin для QR (/scan/:userId). Пустая строка — тот же origin, что у базы API (обычно https://dev.forruss.ru).
 * Прод-сайт в UI (лендинг и т.д.) — `https://forruss.ru`, отдельно от API.
 */
export const WEB_PUBLIC_BASE_URL = "";
