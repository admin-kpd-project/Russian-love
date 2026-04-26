import { apiFetch, type ApiResult } from "./client";

export type MessageResponse = {
  id: string;
  text?: string | null;
  type: string;
  sender: "me" | "other";
  time: string;
  mediaUrl?: string | null;
  duration?: string | null;
};

export function getMessages(conversationId: string, page = 1, limit = 50): Promise<ApiResult<MessageResponse[]>> {
  return apiFetch<MessageResponse[]>(
    `/api/conversations/${encodeURIComponent(conversationId)}/messages?page=${page}&limit=${limit}`
  );
}

export function sendTextMessage(conversationId: string, text: string): Promise<ApiResult<MessageResponse>> {
  return apiFetch<MessageResponse>(`/api/conversations/${encodeURIComponent(conversationId)}/messages`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export function sendMediaMessage(
  conversationId: string,
  mediaUrl: string,
  mediaType: string,
  durationSec?: number
): Promise<ApiResult<MessageResponse>> {
  const body: Record<string, unknown> = { mediaUrl, mediaType };
  if (durationSec != null && durationSec >= 0) {
    body.durationSec = Math.min(3600, Math.floor(durationSec));
  }
  return apiFetch<MessageResponse>(`/api/conversations/${encodeURIComponent(conversationId)}/messages`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
