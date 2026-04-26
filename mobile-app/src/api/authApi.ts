import { apiFetch, getRefreshToken, setTokens, clearTokens, type ApiResult } from "./client";

export type Profile = {
  id: string;
  name: string;
  age: number;
  photo?: string;
  bio?: string;
  profileCompleted?: boolean;
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
  email: string;
  password: string;
  name: string;
  birthDate: string;
  gender: "male" | "female";
  avatarUrl: string;
};

export async function register(p: RegisterParams): Promise<ApiResult<AuthData>> {
  const body = {
    authMethod: "email",
    email: p.email,
    password: p.password,
    agreeToPrivacy: true,
    agreeToTerms: true,
    agreeToOffer: true,
    name: p.name,
    birthDate: p.birthDate,
    gender: p.gender,
    avatarUrl: p.avatarUrl,
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
