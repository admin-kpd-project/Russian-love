import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeModules, Platform } from "react-native";

import { API_URL_FALLBACK_JS } from "../config";

const KEY = "@rl_api_base";

export function normalizeApiBase(s: string): string {
  let t = s.trim();
  if (!t) return "";
  t = t.replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(t)) {
    t = `http://${t}`;
  }
  return t;
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
    if (n) return n;
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
