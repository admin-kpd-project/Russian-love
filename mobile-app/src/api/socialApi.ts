import { apiFetch, type ApiResult } from "./client";

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

export async function sendSuperLike(userId: string): Promise<ApiResult<SuperLikeResponse>> {
  return apiFetch<SuperLikeResponse>("/api/superlikes", {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}
