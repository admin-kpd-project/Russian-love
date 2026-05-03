/**
 * На HTTPS-странице смешанный контент блокирует http:// URL.
 * Chromium не апгрейдит http://<IP>/… автоматически — подставляем текущий origin (тот же Nginx, что и сайт).
 */
export function normalizeAssetUrlForHttps(url: string | null | undefined): string {
  if (url == null) return "";
  const s = String(url).trim();
  if (s === "") return "";
  if (s.startsWith("data:") || s.startsWith("blob:")) return s;
  if (s.startsWith("/") && !s.startsWith("//")) return s;
  if (!s.startsWith("http://")) return s;
  if (typeof window === "undefined" || window.location.protocol !== "https:") return s;
  try {
    const u = new URL(s);
    const host = u.hostname.toLowerCase();
    const pageHost = window.location.hostname.toLowerCase();
    if (host === pageHost) {
      return `https://${u.host}${u.pathname}${u.search}${u.hash}`;
    }
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
      return `${window.location.origin}${u.pathname}${u.search}${u.hash}`;
    }
  } catch {
    return s;
  }
  return s;
}
