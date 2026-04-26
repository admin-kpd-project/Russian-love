import AsyncStorage from "@react-native-async-storage/async-storage";

import { getApiBaseUrl } from "./apiBase";

const ACCESS = "@rl_access";
const REFRESH = "@rl_refresh";

export type ApiResult<T> = { data: T | null; error: string | null };

async function parseBody<T>(response: Response): Promise<ApiResult<T>> {
  const raw = await response.text();
  if (!raw) {
    return { data: null, error: response.ok ? null : `HTTP ${response.status}` };
  }
  try {
    const parsed = JSON.parse(raw) as { data?: T; error?: string | null };
    if ("data" in parsed || "error" in parsed) {
      return { data: (parsed.data ?? null) as T | null, error: parsed.error ?? null };
    }
    return { data: response.ok ? (parsed as T) : null, error: null };
  } catch {
    return { data: null, error: response.ok ? null : `HTTP ${response.status}` };
  }
}

export async function getAccessToken(): Promise<string | null> {
  return AsyncStorage.getItem(ACCESS);
}

export async function getRefreshToken(): Promise<string | null> {
  return AsyncStorage.getItem(REFRESH);
}

export async function setTokens(access: string, refresh: string): Promise<void> {
  await AsyncStorage.multiSet([
    [ACCESS, access],
    [REFRESH, refresh],
  ]);
}

export async function clearTokens(): Promise<void> {
  await AsyncStorage.multiRemove([ACCESS, REFRESH]);
}

async function tryRefresh(): Promise<boolean> {
  const rt = await getRefreshToken();
  if (!rt) return false;
  const base = await getApiBaseUrl();
  if (!base) return false;
  const r = await fetch(`${base}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: rt }),
  });
  const j = await parseBody<{ accessToken: string; refreshToken: string }>(r);
  if (j.data) {
    await setTokens(j.data.accessToken, j.data.refreshToken);
    return true;
  }
  await clearTokens();
  return false;
}

type FetchOpts = { public?: boolean };

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  opts?: FetchOpts
): Promise<ApiResult<T>> {
  const base = await getApiBaseUrl();
  if (!base) {
    return { data: null, error: "Не задан адрес API (экран «Сервер»)" };
  }
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: Record<string, string> = { ...(init.headers as Record<string, string> | undefined) };
  const hasBody = init.body != null;
  if (hasBody && !headers["Content-Type"] && !(init.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (!opts?.public) {
    const t = await getAccessToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }

  let r = await fetch(url, { ...init, headers });

  if (r.status === 401 && !opts?.public) {
    const ok = await tryRefresh();
    if (ok) {
      const t2 = await getAccessToken();
      if (t2) headers.Authorization = `Bearer ${t2}`;
      r = await fetch(url, { ...init, headers });
    }
  }

  return parseBody<T>(r);
}
