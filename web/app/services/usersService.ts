import { apiFetch, ApiResponse } from "./api";
import { ProfileResponse } from "./authService";

// Get current user profile
export async function getCurrentUser(): Promise<ApiResponse<ProfileResponse>> {
  return apiFetch<ProfileResponse>("/api/users/me");
}

// Update current user profile
export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  birthDate?: string;
  bio?: string;
  location?: string;
  avatarUrl?: string;
  photos?: string[];
  interests?: string[];
  personality?: any;
  astrology?: any;
  numerology?: any;
}

export async function updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<ProfileResponse>> {
  return apiFetch<ProfileResponse>("/api/users/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// Get user profile by ID
export async function getUserById(id: string): Promise<ApiResponse<ProfileResponse>> {
  return apiFetch<ProfileResponse>(`/api/users/${id}`);
}
