/**
 * Склейка относительных путей медиа с базой API (как в браузере с тем же origin).
 * Поддержка: /files/..., files/..., полные http(s), protocol-relative //host
 */
export function resolveMediaUrl(maybePath: string, apiBase: string): string {
  const raw = (maybePath ?? "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("//")) {
    try {
      const u = new URL(apiBase);
      return `${u.protocol}${raw}`;
    } catch {
      return `https:${raw}`;
    }
  }
  let b = (apiBase ?? "").trim().replace(/\/+$/, "");
  if (!b) return raw;
  if (!b.startsWith("http")) {
    b = `http://${b}`;
  }
  if (raw.startsWith("/")) return `${b}${raw}`;
  return `${b}/${raw}`;
}
