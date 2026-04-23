import { apiFetch, tokenStorage, ApiResponse, DEMO_MODE } from "./api";

// Types from API spec
export interface ProfileResponse {
  id: string;
  name: string;
  age: number;
  bio?: string;
  interests: string[];
  location?: string;
  photo?: string;
  photos?: string[];
  birthDate: string;
  email?: string;
  personality?: any;
  astrology?: any;
  numerology?: any;
  preferences?: {
    minAge: number;
    maxAge: number;
    maxDistance: number;
  };
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: ProfileResponse;
}

// Register
export interface RegisterRequest {
  name: string;
  birthDate: string;
  email: string;
  phone?: string;
  password: string;
  agreeToPrivacy: boolean;
  agreeToTerms: boolean;
  agreeToOffer: boolean;
}

export async function register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
  // Demo mode - simulate successful registration
  if (DEMO_MODE) {
    console.log("DEMO: Simulating registration");
    const demoResponse: AuthResponse = {
      accessToken: "demo-access-token",
      refreshToken: "demo-refresh-token",
      user: {
        id: "demo-user",
        name: data.name,
        email: data.email,
        birthDate: data.birthDate,
        age: new Date().getFullYear() - new Date(data.birthDate).getFullYear(),
        photos: [],
        interests: [],
        preferences: {
          minAge: 18,
          maxAge: 99,
          maxDistance: 100,
        },
      },
    };
    tokenStorage.setTokens(demoResponse.accessToken, demoResponse.refreshToken);
    return { data: demoResponse, error: null };
  }

  const response = await apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
  
  if (response.data) {
    tokenStorage.setTokens(response.data.accessToken, response.data.refreshToken);
  }
  
  return response;
}

// Login
export interface LoginRequest {
  email: string;
  password: string;
}

export async function login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
  // Demo mode - simulate successful login
  if (DEMO_MODE) {
    console.log("DEMO: Simulating login");
    const demoResponse: AuthResponse = {
      accessToken: "demo-access-token",
      refreshToken: "demo-refresh-token",
      user: {
        id: "demo-user",
        name: "Демо Пользователь",
        email: data.email,
        birthDate: "1990-01-01",
        age: 34,
        photos: [],
        interests: [],
        preferences: {
          minAge: 18,
          maxAge: 99,
          maxDistance: 100,
        },
      },
    };
    tokenStorage.setTokens(demoResponse.accessToken, demoResponse.refreshToken);
    return { data: demoResponse, error: null };
  }

  const response = await apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
  
  if (response.data) {
    tokenStorage.setTokens(response.data.accessToken, response.data.refreshToken);
  }
  
  return response;
}

// Logout
export async function logout(): Promise<ApiResponse<{ ok: boolean }>> {
  const refreshToken = tokenStorage.getRefreshToken();
  
  const response = await apiFetch<{ ok: boolean }>("/api/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
  
  tokenStorage.clearTokens();
  return response;
}

// Yandex OAuth - redirect to Yandex
export function redirectToYandexOAuth(): void {
  // Demo mode - simulate OAuth login
  if (DEMO_MODE) {
    console.log("DEMO: Simulating Yandex OAuth login");
    const demoResponse: AuthResponse = {
      accessToken: "demo-access-token",
      refreshToken: "demo-refresh-token",
      user: {
        id: "demo-user",
        name: "Демо Пользователь",
        email: "demo@gosuslugi.ru",
        birthDate: "1990-01-01",
        age: 34,
        photos: [],
        interests: [],
        preferences: {
          minAge: 18,
          maxAge: 99,
          maxDistance: 100,
        },
      },
    };
    tokenStorage.setTokens(demoResponse.accessToken, demoResponse.refreshToken);
    // Redirect to app
    window.location.href = "/app";
    return;
  }

  window.location.href = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}/api/auth/yandex`;
}

// Handle Yandex callback (called by router)
export async function handleYandexCallback(code: string, state: string): Promise<ApiResponse<AuthResponse>> {
  const response = await apiFetch<AuthResponse>(
    `/api/auth/yandex/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`,
    { method: "GET" }
  );
  
  if (response.data) {
    tokenStorage.setTokens(response.data.accessToken, response.data.refreshToken);
  }
  
  return response;
}

// Messenger OAuth - redirect to MAX Messenger
export function redirectToMessengerOAuth(): void {
  // Demo mode - simulate OAuth login
  if (DEMO_MODE) {
    console.log("DEMO: Simulating MAX Messenger OAuth login");
    const demoResponse: AuthResponse = {
      accessToken: "demo-access-token",
      refreshToken: "demo-refresh-token",
      user: {
        id: "demo-user",
        name: "Демо Пользователь",
        email: "demo@maxmessenger.ru",
        birthDate: "1990-01-01",
        age: 34,
        photos: [],
        interests: [],
        preferences: {
          minAge: 18,
          maxAge: 99,
          maxDistance: 100,
        },
      },
    };
    tokenStorage.setTokens(demoResponse.accessToken, demoResponse.refreshToken);
    // Redirect to app
    window.location.href = "/app";
    return;
  }

  window.location.href = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}/api/auth/messenger`;
}