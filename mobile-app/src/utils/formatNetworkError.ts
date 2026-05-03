/** Сообщения об ошибках fetch / OkHttp в React Native на Android часто на английском. */
export function formatApiNetworkError(raw: string): string {
  const t = (raw || "").trim();
  const low = t.toLowerCase();
  if (!t) return "Ошибка сети. Проверьте подключение к интернету.";
  if (low.includes("network request failed") || low === "failed to fetch") {
    return [
      "Не удалось установить соединение с сервером.",
      "Убедитесь, что в «Сервер» указан полный адрес с https:// (например https://dev.forruss.ru).",
      "В эмуляторе откройте Chrome и проверьте тот же URL; при необходимости перезапустите эмулятор (Cold Boot).",
    ].join(" ");
  }
  if (low.includes("aborted") || low.includes("abort")) {
    return "Запрос прерван или истекло время ожидания.";
  }
  return t;
}
