import { apiFetch, type ApiResult } from "./client";
import type { Profile } from "./authApi";

export type UpdateProfileRequest = {
  name?: string;
  email?: string;
  birthDate?: string;
  bio?: string;
  location?: string;
  avatarUrl?: string;
  photos?: string[];
  interests?: string[];
  personality?: unknown;
  astrology?: unknown;
  numerology?: unknown;
};

export async function getCurrentUser(): Promise<ApiResult<Profile>> {
  return apiFetch<Profile>("/api/users/me");
}

export async function updateProfile(data: UpdateProfileRequest): Promise<ApiResult<Profile>> {
  return apiFetch<Profile>("/api/users/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function getUserById(id: string): Promise<ApiResult<Profile>> {
  return apiFetch<Profile>(`/api/users/${encodeURIComponent(id)}`);
}
