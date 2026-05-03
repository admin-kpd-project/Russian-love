import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeModules, Platform } from "react-native";

import { API_URL_FALLBACK_JS, CANONICAL_STAGING_API_BASE } from "../config";

const KEY = "@rl_api_base";
/** Однократная миграция сохранённого base (legacy IP, хвост /api). */
const MIGRATION_VERSION_KEY = "@rl_api_base_migration_v1";
/** v2: добавлены другие старые стенды 81.26.x.x (раньше был только 81.26.181.58). */
const MIGRATION_VER = "2";

/**
 * Только миграция старых установок (AsyncStorage / старые BuildConfig).
 * Канонический адрес везде в коде и доках — `CANONICAL_STAGING_API_BASE` в config.ts.
 */
const LEGACY_FORRUSS_STAGING_IPV4 = new Set(["81.26.181.58", "81.26.176.56"]);

function isLocalOrLanHost(host: string): boolean {
  const h = host.toLowerCase();
  if (h === "localhost" || h === "127.0.0.1" || h === "10.0.2.2") return true;
  if (h.endsWith(".local")) return true;
  if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h)) return true;
  return false;
}

/** Публичный IPv4 без схемы: чаще HTTP-стенд (:8000/:8080), не HTTPS (иначе TLS к IP без SAN — обрыв). */
function isBarePublicIpv4(host: string): boolean {
  return /^(?:\d{1,3}\.){3}\d{1,3}$/.test(host);
}

function inferSchemeForBareHostPort(host: string, hostPort: string): "http" | "https" {
  if (isLocalOrLanHost(host)) return "http";
  const idx = hostPort.indexOf(":");
  const portStr = idx >= 0 ? hostPort.slice(idx + 1) : "";
  const p = portStr ? Number(portStr) : NaN;
  if (p === 443) return "https";
  if (isBarePublicIpv4(host)) return "http";
  return "https";
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

/** База должна быть origin без `/api` — пути клиента уже вида `/api/...`. */
function stripTrailingPublicApiPath(url: string): string {
  try {
    const u = new URL(url);
    const p = u.pathname.replace(/\/+$/, "") || "/";
    if (p === "/api") {
      return u.origin;
    }
  } catch {
    /* keep */
  }
  return url.replace(/\/+$/, "");
}

export function normalizeApiBase(s: string): string {
  let t = s.trim().replace(/[\u200B-\u200D\uFEFF]/g, "");
  if (!t) return "";
  t = t.replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(t)) {
    const hostPort = t.split("/")[0];
    const host = hostPort.split(":")[0] ?? "";
    const scheme = inferSchemeForBareHostPort(host, hostPort);
    t = `${scheme}://${t}`;
  }
  return stripTrailingPublicApiPath(preferHttpsForForrussStaging(t));
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

/** Соответствует миграции: любой выбор base из storage/native не остаётся на мёртвых IP-стендах. */
function remapLegacyStagingApiBase(base: string): string {
  if (!base) return base;
  try {
    const h = new URL(base).hostname;
    if (LEGACY_FORRUSS_STAGING_IPV4.has(h)) {
      return normalizeApiBase(CANONICAL_STAGING_API_BASE);
    }
  } catch {
    /* keep */
  }
  return base;
}

let migrationPromise: Promise<void> | null = null;

async function migrateStoredApiBaseOnce(): Promise<void> {
  try {
    const ver = await AsyncStorage.getItem(MIGRATION_VERSION_KEY);
    if (ver === MIGRATION_VER) return;
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      const next = remapLegacyStagingApiBase(normalizeApiBase(raw));
      const trimmed = raw.trim();
      if (next && next !== trimmed) {
        await AsyncStorage.setItem(KEY, next);
        invalidateApiBaseCache();
      }
    }
    await AsyncStorage.setItem(MIGRATION_VERSION_KEY, MIGRATION_VER);
  } catch {
    /* ignore */
  }
}

function ensureApiBaseMigrated(): Promise<void> {
  if (!migrationPromise) {
    migrationPromise = migrateStoredApiBaseOnce();
  }
  return migrationPromise;
}

/**
 * База API (без хвостового /). Порядок: AsyncStorage → BuildConfig (local.properties) → config.ts.
 */
export async function getApiBaseUrl(): Promise<string> {
  await ensureApiBaseMigrated();
  const fromStorage = await AsyncStorage.getItem(KEY);
  if (fromStorage) {
    const trimmed = fromStorage.trim();
    const n = remapLegacyStagingApiBase(normalizeApiBase(fromStorage));
    if (n) {
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
    return remapLegacyStagingApiBase(normalizeApiBase(fromNative));
  }
  if (API_URL_FALLBACK_JS) {
    return remapLegacyStagingApiBase(normalizeApiBase(API_URL_FALLBACK_JS));
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
