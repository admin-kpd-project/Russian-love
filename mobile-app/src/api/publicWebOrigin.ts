import { CANONICAL_STAGING_API_BASE, WEB_PUBLIC_BASE_URL } from "../config";
import { getApiBaseUrl, normalizeApiBase } from "./apiBase";

function originFromBase(base: string): string {
  try {
    return new URL(base).origin;
  } catch {
    return base.replace(/\/$/, "");
  }
}

/**
 * Origin публичного сайта для deep link / QR (как window.location.origin на вебе).
 */
export async function getPublicWebOrigin(): Promise<string> {
  let w = WEB_PUBLIC_BASE_URL.trim();
  if (w) {
    w = normalizeApiBase(w.startsWith("http") ? w : `https://${w}`);
    if (w) return originFromBase(w);
  }
  const api = await getApiBaseUrl();
  if (api) return originFromBase(api);
  return originFromBase(CANONICAL_STAGING_API_BASE);
}
