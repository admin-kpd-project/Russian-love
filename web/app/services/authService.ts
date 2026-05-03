import { apiFetch, tokenStorage, ApiResponse, API_BASE_URL } from "./api";

// Types from API spec
export interface ProfileResponse {
  id: string;
  name: string;
  age: number;
  gender?: "male" | "female";
  bio?: string;
  interests: string[];
  location?: string;
  photo?: string;
  photos?: string[];
  birthDate: string;
  email?: string;
  phone?: string;
  profileCompleted?: boolean;
  personality?: any;
  astrology?: any;
  numerology?: any;
  preferences?: {
    minAge: number;
    maxAge: number;
    maxDistance: number;
  };
  /** user | admin | moderator | support */
  role?: string;
  /** ISO 8601 (UTC, Z) — последняя активность в приложении по API. */
  lastSeenAt?: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: ProfileResponse;
}

// Register (профиль обязателен в одном запросе)
export interface RegisterRequest {
  authMethod: "email" | "phone";
  email?: string;
  loginPhone?: string;
  password: string;
  agreeToPrivacy: boolean;
  agreeToTerms: boolean;
  agreeToOffer: boolean;
  agreeToAge18: boolean;
  name: string;
  birthDate: string;
  gender: "male" | "female";
  avatarUrl: string;
  photos?: string[];
  bio?: string;
  interests?: string[];
}

export async function register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
  const response = await apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
  
  if (response.data) {
    tokenStorage.setTokens(response.data.accessToken, response.data.refreshToken);
  }
  
  return response;
}

// Login: поле email — email или телефон (как вводит пользователь)
export interface LoginRequest {
  email: string;
  password: string;
}

export async function login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
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
  window.location.href = `${API_BASE_URL}/api/auth/yandex`;
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

// Messenger OAuth
export function redirectToMessengerOAuth(): void {
  window.location.href = `${API_BASE_URL}/api/auth/messenger`;
}

export interface CompleteProfileRequest {
  name: string;
  birthDate: string;
  email: string;
  gender: "male" | "female";
  avatarUrl: string;
  photos?: string[];
  bio?: string;
  interests?: string[];
}

export async function completeProfile(
  data: CompleteProfileRequest
): Promise<ApiResponse<ProfileResponse>> {
  return apiFetch<ProfileResponse>("/api/users/me/complete-profile", {
    method: "POST",
    body: JSON.stringify(data),
  });
}