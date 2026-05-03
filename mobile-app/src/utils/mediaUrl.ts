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
      const u = new URL(apiBase.includes("://") ? apiBase : `https://${apiBase}`);
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

/**
 * Если API по HTTPS, а в данных остался http:// (часто с IP: MinIO до прокси) —
 * подставляем origin API + тот же path (один Nginx с вебом).
 * Совпадает по смыслу с web/app/utils/mediaUrl.ts `normalizeAssetUrlForHttps`.
 */
export function scrubInsecureMediaUrl(url: string, apiBase: string): string {
  const raw = (url ?? "").trim();
  if (!raw || !raw.startsWith("http://")) return raw;
  const base = (apiBase ?? "").trim();
  if (!base) return raw;
  let apiOrigin: string;
  try {
    const b = new URL(base.includes("://") ? base : `https://${base}`);
    if (b.protocol !== "https:") return raw;
    apiOrigin = b.origin;
  } catch {
    return raw;
  }
  try {
    const u = new URL(raw);
    const host = u.hostname.toLowerCase();
    const apiHost = new URL(apiOrigin).hostname.toLowerCase();
    if (host === apiHost) {
      return `${apiOrigin}${u.pathname}${u.search}${u.hash}`;
    }
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
      return `${apiOrigin}${u.pathname}${u.search}${u.hash}`;
    }
  } catch {
    return raw;
  }
  return raw;
}

/** resolve относительных путей + убрать http-at-IP при HTTPS API */
export function publicDisplayMediaUrl(maybePath: string, apiBase: string): string {
  const r = resolveMediaUrl(maybePath, apiBase);
  if (!apiBase.trim()) return r;
  return scrubInsecureMediaUrl(r, apiBase);
}
