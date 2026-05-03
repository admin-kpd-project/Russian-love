/**
 * JS-fallback, если в приложении ничего не сохранено и нет BuildConfig (см. android/local.properties API_BASE_URL).
 * По умолчанию — staging: сразу можно тестировать без экрана «Сервер». Для только локального API: "" и `http://10.0.2.2:8080` в UI или local.properties.
 */
export const API_URL_FALLBACK_JS = "https://dev.forruss.ru";

/**
 * Публичный origin для QR и шаринга (/scan/:userId). Совпадает с вебом на dev; для прода смените на https://forruss.ru (или оставьте пустым — тогда берётся origin от URL API).
 */
export const WEB_PUBLIC_BASE_URL = "https://dev.forruss.ru";
