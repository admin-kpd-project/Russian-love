/** Сообщения об ошибках fetch / OkHttp в React Native на Android часто на английском. */
export function formatApiNetworkError(raw: string): string {
  const t = (raw || "").trim();
  const low = t.toLowerCase();
  if (!t) return "Ошибка сети. Проверьте подключение к интернету.";
  if (low.includes("network request failed") || low === "failed to fetch") {
    return [
      "Не удалось установить соединение с сервером.",
      "В «Сервер» укажите полный URL: для стенда — http://81.26.181.58:8080; для эмулятора с API на ПК — http://10.0.2.2:8000 (или :8080); для staging — https://dev.forruss.ru.",
      "Если включены AdGuard, антивирус или «фильтрация HTTPS» — отключите для приложения или добавьте исключение (debug-сборка доверяет пользовательским сертификатам).",
      "Проверьте в Chrome тот же URL; смените Wi‑Fi / мобильные данные.",
    ].join(" ");
  }
  if (low.includes("ssl") || low.includes("certificate") || low.includes("handshake")) {
    return [
      "Ошибка проверки сертификата (TLS).",
      "Попробуйте отключить перехват HTTPS (AdGuard, VPN, корпоративный прокси) или обновите систему.",
      "Адрес API должен быть https://…",
    ].join(" ");
  }
  if (low.includes("aborted") || low.includes("abort")) {
    return "Запрос прерван или истекло время ожидания.";
  }
  return t;
}
