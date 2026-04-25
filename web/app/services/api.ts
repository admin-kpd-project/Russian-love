// API Configuration: in Vite dev, empty base = same-origin so /api is proxied (see vite.config.ts).
const rawBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
export const API_BASE_URL =
  rawBase !== undefined && rawBase !== ""
    ? rawBase
    : import.meta.env.DEV
      ? ""
      : "http://localhost:8080";

// API Response wrapper type
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

async function parseApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const raw = await response.text();
  if (!raw) {
    return {
      data: null,
      error: response.ok ? null : `HTTP ${response.status}`,
    };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ApiResponse<T>>;
    if ("data" in parsed || "error" in parsed) {
      return {
        data: (parsed.data as T | null) ?? null,
        error: (parsed.error as string | null) ?? null,
      };
    }
    return {
      data: response.ok ? (parsed as T) : null,
      error: response.ok ? null : `HTTP ${response.status}`,
    };
  } catch {
    return {
      data: null,
      error: response.ok ? null : `HTTP ${response.status}`,
    };
  }
}

// Token storage
export const tokenStorage = {
  getAccessToken: (): string | null => {
    return localStorage.getItem("accessToken");
  },
  
  setAccessToken: (token: string): void => {
    localStorage.setItem("accessToken", token);
  },
  
  getRefreshToken: (): string | null => {
    return localStorage.getItem("refreshToken");
  },
  
  setRefreshToken: (token: string): void => {
    localStorage.setItem("refreshToken", token);
  },
  
  clearTokens: (): void => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("isAuthenticated");
  },
  
  setTokens: (accessToken: string, refreshToken: string): void => {
    tokenStorage.setAccessToken(accessToken);
    tokenStorage.setRefreshToken(refreshToken);
    localStorage.setItem("isAuthenticated", "true");
  }
};

export type ApiFetchOptions = {
  /** No Authorization header; 401 does not trigger refresh (для публичных presign и т.п.). */
  public?: boolean;
};

// Fetch wrapper with auth
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  fetchOpts?: ApiFetchOptions
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Add auth header if token exists
  const accessToken = tokenStorage.getAccessToken();
  const headers: Record<string, string> = { ...(options.headers as Record<string, string> | undefined) };
  const hasBody = options.body !== undefined && options.body !== null;
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (hasBody && !isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  if (import.meta.env.DEV) {
    headers["X-Vite-S3-Proxy"] = "1";
  }
  
  if (!fetchOpts?.public && accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    const json = await parseApiResponse<T>(response);
    
    // Handle 401 - try to refresh token
    if (response.status === 401 && endpoint !== "/api/auth/refresh" && !fetchOpts?.public) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry the original request with new token
        return apiFetch<T>(endpoint, options, fetchOpts);
      } else {
        // Refresh failed, clear tokens and redirect
        tokenStorage.clearTokens();
        if (window.location.pathname !== "/") {
          window.location.href = "/";
        }
        return { data: null, error: "Сессия истекла. Пожалуйста, войдите снова." };
      }
    }
    
    return json;
  } catch (error) {
    console.error("API Error:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Ошибка сети",
    };
  }
}

// Refresh access token
async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return false;
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    
    const json = await parseApiResponse<{ accessToken: string; refreshToken: string }>(response);
    
    if (json.data) {
      tokenStorage.setTokens(json.data.accessToken, json.data.refreshToken);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Token refresh error:", error);
    return false;
  }
}