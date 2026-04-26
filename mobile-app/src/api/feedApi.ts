import type { Profile } from "./authApi";
import { apiFetch, type ApiResult } from "./client";

export function getFeed(): Promise<ApiResult<Profile[]>> {
  return apiFetch<Profile[]>("/api/feed");
}
