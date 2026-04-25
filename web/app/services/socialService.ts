import { apiFetch, type ApiResponse, tokenStorage, API_BASE_URL } from "./api";
import type { ProfileResponse } from "./authService";

export interface LikeResponse {
  liked: boolean;
  matched: boolean;
  matchId: string | null;
}

export interface MatchItem {
  id: string;
  createdAt: string;
  peer: ProfileResponse;
}

export async function sendLike(userId: string): Promise<ApiResponse<LikeResponse>> {
  return apiFetch<LikeResponse>("/api/likes", {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}

export async function sendSuperLike(userId: string): Promise<ApiResponse<{ ok: boolean }>> {
  return apiFetch<{ ok: boolean }>("/api/superlikes", {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}

export async function getMatches(): Promise<ApiResponse<MatchItem[]>> {
  return apiFetch<MatchItem[]>("/api/matches");
}

export async function createInvite(): Promise<ApiResponse<{ code: string; url: string }>> {
  return apiFetch<{ code: string; url: string }>("/api/invites", { method: "POST" });
}

export function createChatWebSocket(conversationId: string): WebSocket | null {
  const token = tokenStorage.getAccessToken();
  if (!token) return null;
  const base = API_BASE_URL
    ? API_BASE_URL.replace(/^http/, "ws")
    : "";
  return new WebSocket(`${base}/api/ws/chats/${encodeURIComponent(conversationId)}?token=${encodeURIComponent(token)}`);
}
