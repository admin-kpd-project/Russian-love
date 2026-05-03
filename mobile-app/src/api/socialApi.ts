import { apiFetch, type ApiResult } from "./client";
import type { Profile } from "./authApi";

export type LikeResponse = {
  liked: boolean;
  matched: boolean;
  matchId: string | null;
};

export async function sendLike(userId: string): Promise<ApiResult<LikeResponse>> {
  return apiFetch<LikeResponse>("/api/likes", {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}

export type SuperLikeResponse = { ok: boolean; superLikesBalance?: number };

export async function sendSuperLike(
  userId: string,
  opts?: { message?: string }
): Promise<ApiResult<SuperLikeResponse>> {
  const body: { userId: string; message?: string } = { userId };
  const m = (opts?.message ?? "").trim();
  if (m) body.message = m;
  return apiFetch<SuperLikeResponse>("/api/superlikes", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export type MatchItem = {
  id: string;
  createdAt: string;
  peer: Profile;
};

export function getMatches(): Promise<ApiResult<MatchItem[]>> {
  return apiFetch<MatchItem[]>("/api/matches");
}