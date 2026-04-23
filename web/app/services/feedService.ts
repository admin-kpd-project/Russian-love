import { apiFetch, ApiResponse } from "./api";
import type { ProfileResponse } from "./authService";

export async function getFeed(): Promise<ApiResponse<ProfileResponse[]>> {
  return apiFetch<ProfileResponse[]>("/api/feed");
}
