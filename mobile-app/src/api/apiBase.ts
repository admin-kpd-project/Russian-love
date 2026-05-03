import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeModules, Platform } from "react-native";

import { API_URL_FALLBACK_JS } from "../config";

const KEY = "@rl_api_base";

function isLocalOrLanHost(host: string): boolean {
  const h = host.toLowerCase();
  if (h === "localhost" || h === "127.0.0.1" || h === "10.0.2.2") return true;
  if (h.endsWith(".local")) return true;
  if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h)) return true;
  return false;
}

/** Публичные forruss: всегда HTTPS (Android блокирует cleartext вне domain-config). */
function preferHttpsForForrussStaging(url: string): string {
  try {
    const u = new URL(url);
    if (u.protocol !== "http:") return url;
    const h = u.hostname.toLowerCase();
    if (h === "dev.forruss.ru" || h === "forruss.ru" || h === "www.forruss.ru") {
      u.protocol = "https:";
      return u.toString().replace(/\/+$/, "");
    }
  } catch {
    /* keep */
  }
  return url;
}

export function normalizeApiBase(s: string): string {
  let t = s.trim().replace(/[\u200B-\u200D\uFEFF]/g, "");
  if (!t) return "";
  t = t.replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(t)) {
    const hostPort = t.split("/")[0];
    const host = hostPort.split(":")[0] ?? "";
    const scheme = isLocalOrLanHost(host) ? "http" : "https";
    t = `${scheme}://${t}`;
  }
  return preferHttpsForForrussStaging(t);
}

export function isValidApiBase(s: string): boolean {
  const n = normalizeApiBase(s);
  if (!n) return false;
  try {
    new URL(n);
    return true;
  } catch {
    return false;
  }
}

type NativeConfig = { defaultApiBase?: string } | undefined;

let cachedNativeDefault: string | null = null;

async function getNativeBuildDefault(): Promise<string> {
  if (Platform.OS !== "android") {
    return "";
  }
  if (cachedNativeDefault !== null) {
    return cachedNativeDefault;
  }
  const m = (NativeModules as { RNNativeApiConfig?: NativeConfig }).RNNativeApiConfig;
  const v = m?.defaultApiBase != null ? String(m.defaultApiBase).trim() : "";
  cachedNativeDefault = v;
  return v;
}

export function invalidateApiBaseCache(): void {
  cachedNativeDefault = null;
}

/**
 * База API (без хвостового /). Порядок: AsyncStorage → BuildConfig (local.properties) → config.ts.
 */
export async function getApiBaseUrl(): Promise<string> {
  const fromStorage = await AsyncStorage.getItem(KEY);
  if (fromStorage) {
    const n = normalizeApiBase(fromStorage);
    if (n) {
      const trimmed = fromStorage.trim();
      if (n !== trimmed) {
        try {
          await AsyncStorage.setItem(KEY, n);
        } catch {
          /* ignore */
        }
      }
      return n;
    }
  }
  const fromNative = await getNativeBuildDefault();
  if (fromNative) {
    return normalizeApiBase(fromNative);
  }
  if (API_URL_FALLBACK_JS) {
    return normalizeApiBase(API_URL_FALLBACK_JS);
  }
  return "";
}

export async function isApiBaseConfigured(): Promise<boolean> {
  return (await getApiBaseUrl()).length > 0;
}

/**
 * Сохраняет URL. Очистка токенов — в вызывающем коде после set (избегаем циклического импорта с client).
 */
export async function setApiBaseUrlInStorage(url: string): Promise<void> {
  const n = normalizeApiBase(url);
  if (!n) {
    await AsyncStorage.removeItem(KEY);
    return;
  }
  await AsyncStorage.setItem(KEY, n);
  invalidateApiBaseCache();
}

export async function clearApiBaseUrlInStorage(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
  invalidateApiBaseCache();
}
