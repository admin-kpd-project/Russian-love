/**
 * JS-fallback, если в приложении ничего не сохранено и нет BuildConfig (см. android/local.properties API_BASE_URL).
 * Статический стенд по HTTP — стабильно с эмулятора (cleartext для этого IP в network_security_config).
 * Эмулятор → API на ПК: `http://10.0.2.2:8000` (uvicorn) или :8080 (nginx), см. README. Staging HTTPS: `https://dev.forruss.ru`.
 */
export const API_URL_FALLBACK_JS = "http://81.26.181.58:8080";

/**
 * Публичный origin для QR (/scan/:userId). Пустая строка — тот же origin, что у базы API (удобно со статическим IP).
 * Для ссылок на прод-сайт: `https://forruss.ru`; для dev-домена: `https://dev.forruss.ru`.
 */
export const WEB_PUBLIC_BASE_URL = "";
