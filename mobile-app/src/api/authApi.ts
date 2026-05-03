import { apiFetch, getRefreshToken, setTokens, clearTokens, type ApiResult } from "./client";

export type Profile = {
  id: string;
  name: string;
  age: number;
  email?: string;
  photo?: string;
  bio?: string;
  profileCompleted?: boolean;
  interests?: string[];
  location?: string;
  birthDate?: string;
  photos?: string[];
  personality?: Record<string, unknown>;
  astrology?: Record<string, unknown>;
  numerology?: Record<string, unknown>;
  lastSeenAt?: string | null;
};

export type AuthData = {
  accessToken: string;
  refreshToken: string;
  user: Profile;
};

export async function login(email: string, password: string): Promise<ApiResult<AuthData>> {
  const r = await apiFetch<AuthData>(
    "/api/auth/login",
    { method: "POST", body: JSON.stringify({ email, password }) },
    { public: true }
  );
  if (r.data) await setTokens(r.data.accessToken, r.data.refreshToken);
  return r;
}

export type RegisterParams = {
  authMethod?: "email" | "phone";
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
};

export async function register(p: RegisterParams): Promise<ApiResult<AuthData>> {
  const authMethod = p.authMethod ?? (p.loginPhone ? "phone" : "email");
  const body = {
    authMethod,
    email: authMethod === "email" ? p.email?.trim() : undefined,
    loginPhone: authMethod === "phone" ? p.loginPhone?.trim() : undefined,
    password: p.password,
    agreeToPrivacy: p.agreeToPrivacy,
    agreeToTerms: p.agreeToTerms,
    agreeToOffer: p.agreeToOffer,
    agreeToAge18: p.agreeToAge18,
    name: p.name.trim(),
    birthDate: p.birthDate,
    gender: p.gender,
    avatarUrl: p.avatarUrl,
    photos: p.photos?.length ? p.photos : undefined,
    bio: p.bio?.trim() || undefined,
    interests: p.interests?.length ? p.interests : undefined,
  };
  const r = await apiFetch<AuthData>(
    "/api/auth/register",
    { method: "POST", body: JSON.stringify(body) },
    { public: true }
  );
  if (r.data) await setTokens(r.data.accessToken, r.data.refreshToken);
  return r;
}

export async function logoutApi(): Promise<void> {
  const rt = await getRefreshToken();
  if (rt) {
    await apiFetch("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken: rt }),
    });
  }
  await clearTokens();
}
