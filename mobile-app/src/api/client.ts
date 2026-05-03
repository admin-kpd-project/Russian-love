import AsyncStorage from "@react-native-async-storage/async-storage";

import { formatApiNetworkError } from "../utils/formatNetworkError";
import { buildApiFailureMessage } from "../utils/apiNetworkDiagnostics";
import { getApiBaseUrl } from "./apiBase";

const ACCESS = "@rl_access";
const REFRESH = "@rl_refresh";

/** Дефолт для всех `apiFetch` / refresh; отдельные вызовы могут задать меньше, но не больше `MAX_API_FETCH_TIMEOUT_MS`. */
export const DEFAULT_API_FETCH_TIMEOUT_MS = 10_000;
export const MAX_API_FETCH_TIMEOUT_MS = 20_000;

function resolveFetchTimeoutMs(requested?: number): number {
  const ms = requested ?? DEFAULT_API_FETCH_TIMEOUT_MS;
  return Math.min(ms, MAX_API_FETCH_TIMEOUT_MS);
}

function isLocalDevApiHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "10.0.2.2";
}

function devStackHeadersForBase(base: string): Record<string, string> {
  if (!__DEV__) return {};
  try {
    if (isLocalDevApiHost(new URL(base).hostname)) {
      return { "X-Vite-S3-Proxy": "1" };
    }
  } catch {
    if (/localhost|127\.0\.0\.1|10\.0\.2\.2/i.test(base)) {
      return { "X-Vite-S3-Proxy": "1" };
    }
  }
  return {};
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

export type ApiResult<T> = { data: T | null; error: string | null };

async function parseBody<T>(response: Response): Promise<ApiResult<T>> {
  const raw = await response.text();
  if (!raw) {
    return { data: null, error: response.ok ? null : `[HTTP ${response.status}] Пустой ответ` };
  }
  try {
    const parsed = JSON.parse(raw) as {
      data?: T;
      error?: string | null;
      detail?: string | string[] | { msg?: string }[];
    };
    if ("data" in parsed || "error" in parsed) {
      return { data: (parsed.data ?? null) as T | null, error: parsed.error ?? null };
    }
    if (!response.ok && parsed.detail != null) {
      const d = parsed.detail;
      let err: string;
      if (typeof d === "string") err = d;
      else if (Array.isArray(d)) {
        err = d
          .map((x) => (typeof x === "string" ? x : (x && typeof x === "object" && "msg" in x && x.msg) || JSON.stringify(x)))
          .join("; ");
      } else err = JSON.stringify(d);
      return { data: null, error: err ? `[HTTP ${response.status}] ${err}` : `[HTTP ${response.status}]` };
    }
    return { data: response.ok ? (parsed as T) : null, error: null };
  } catch {
    return { data: null, error: response.ok ? null : `[HTTP ${response.status}] Некорректный JSON` };
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
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...devStackHeadersForBase(base),
  };
  let r: Response;
  try {
    r = await fetchWithTimeout(
      `${base}/api/auth/refresh`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ refreshToken: rt }),
      },
      resolveFetchTimeoutMs()
    );
  } catch {
    return false;
  }
  let j: ApiResult<{ accessToken: string; refreshToken: string }>;
  try {
    j = await parseBody<{ accessToken: string; refreshToken: string }>(r);
  } catch {
    return false;
  }
  if (j.data) {
    await setTokens(j.data.accessToken, j.data.refreshToken);
    return true;
  }
  await clearTokens();
  return false;
}

type FetchOpts = { public?: boolean; timeoutMs?: number };

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  opts?: FetchOpts
): Promise<ApiResult<T>> {
  try {
    const base = await getApiBaseUrl();
    if (!base) {
      return { data: null, error: "Не задан адрес API (экран «Сервер»)" };
    }
    const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
    const headers: Record<string, string> = {
      ...(init.headers as Record<string, string> | undefined),
      ...devStackHeadersForBase(base),
    };
    if (!headers.Accept) headers.Accept = "application/json";
    const hasBody = init.body != null;
    if (hasBody && !headers["Content-Type"] && !(init.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }
    if (!opts?.public) {
      const t = await getAccessToken();
      if (t) headers.Authorization = `Bearer ${t}`;
    }

    const timeoutMs = resolveFetchTimeoutMs(opts?.timeoutMs);

    let r: Response;
    try {
      r = await fetchWithTimeout(url, { ...init, headers }, timeoutMs);
    } catch (e) {
      const aborted = e instanceof Error && e.name === "AbortError";
      return {
        data: null,
        error: aborted
          ? buildApiFailureMessage(base, path, e, { aborted: true, timeoutMs })
          : buildApiFailureMessage(base, path, e),
      };
    }

    if (r.status === 401 && !opts?.public) {
      const ok = await tryRefresh();
      if (ok) {
        const t2 = await getAccessToken();
        if (t2) headers.Authorization = `Bearer ${t2}`;
        try {
          r = await fetchWithTimeout(url, { ...init, headers }, timeoutMs);
        } catch (e) {
          const aborted = e instanceof Error && e.name === "AbortError";
          return {
            data: null,
            error: aborted
              ? buildApiFailureMessage(base, path, e, { aborted: true, timeoutMs })
              : buildApiFailureMessage(base, path, e),
          };
        }
      }
    }

    return await parseBody<T>(r);
  } catch (e) {
    try {
      const base = await getApiBaseUrl();
      if (base) {
        return { data: null, error: buildApiFailureMessage(base, path, e) };
      }
    } catch {
      /* fall through */
    }
    return { data: null, error: formatApiNetworkError(e instanceof Error ? e.message : String(e)) };
  }
}
