// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true" || !import.meta.env.VITE_API_BASE_URL;

// API Response wrapper type
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
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

// Fetch wrapper with auth
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Add auth header if token exists
  const accessToken = tokenStorage.getAccessToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // Parse JSON response
    const json: ApiResponse<T> = await response.json();
    
    // Handle 401 - try to refresh token
    if (response.status === 401 && endpoint !== "/api/auth/refresh") {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry the original request with new token
        return apiFetch<T>(endpoint, options);
      } else {
        // Refresh failed, clear tokens and redirect
        tokenStorage.clearTokens();
        window.location.href = "/";
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
    
    const json: ApiResponse<{ accessToken: string; refreshToken: string }> = await response.json();
    
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