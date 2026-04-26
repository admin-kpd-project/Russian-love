import { apiFetch, type ApiResponse } from "./api";

export interface MessageResponse {
  id: string;
  text?: string | null;
  type: string;
  sender: "me" | "other";
  time: string;
  mediaUrl?: string | null;
  duration?: string | null;
}

export async function getMessages(
  conversationId: string,
  page = 1,
  limit = 20
): Promise<ApiResponse<MessageResponse[]>> {
  return apiFetch<MessageResponse[]>(
    `/api/conversations/${encodeURIComponent(conversationId)}/messages?page=${page}&limit=${limit}`
  );
}

export async function sendTextMessage(
  conversationId: string,
  text: string
): Promise<ApiResponse<MessageResponse>> {
  return apiFetch<MessageResponse>(
    `/api/conversations/${encodeURIComponent(conversationId)}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ text }),
    }
  );
}

export async function sendMediaMessage(
  conversationId: string,
  mediaUrl: string,
  mediaType: string,
  durationSec?: number
): Promise<ApiResponse<MessageResponse>> {
  const body: Record<string, unknown> = { mediaUrl, mediaType };
  if (durationSec != null && durationSec >= 0) {
    body.durationSec = Math.min(3600, Math.floor(durationSec));
  }
  return apiFetch<MessageResponse>(
    `/api/conversations/${encodeURIComponent(conversationId)}/messages`,
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );
}
