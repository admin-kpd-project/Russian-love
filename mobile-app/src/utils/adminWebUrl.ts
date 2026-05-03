/**
 * Веб-админка — отдельный origin (обычно Vite :5173), API — :8000.
 * Для dev: тот же host, порт 5173, путь /admin.
 */
export function guessWebAdminUrl(apiBase: string): string | null {
  const raw = (apiBase || "").trim();
  if (!raw) return null;
  try {
    const u = new URL(raw.startsWith("http") ? raw : `http://${raw}`);
    if (u.port === "8000") {
      u.port = "5173";
    } else if (!u.port && (u.hostname === "localhost" || u.hostname === "127.0.0.1")) {
      u.port = "5173";
    }
    u.pathname = "/admin";
    u.search = "";
    u.hash = "";
    return u.toString();
  } catch {
    return null;
  }
}
