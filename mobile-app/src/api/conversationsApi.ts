import { apiFetch, type ApiResult } from "./client";

export type ConversationListItem = {
  id: string;
  /** Собеседник (для жалоб и т.п.) */
  peerUserId?: string;
  peerLastSeenAt?: string | null;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
};

export function listConversations(): Promise<ApiResult<ConversationListItem[]>> {
  return apiFetch<ConversationListItem[]>("/api/conversations");
}

export function createConversation(userId: string): Promise<ApiResult<{ id: string }>> {
  return apiFetch<{ id: string }>("/api/conversations", {
    method: "POST",
    body: JSON.stringify({ user_id: userId }),
  });
}

export function markConversationRead(conversationId: string): Promise<ApiResult<{ ok: boolean }>> {
  return apiFetch<{ ok: boolean }>(`/api/conversations/${conversationId}/read`, { method: "POST" });
}

export function markConversationsRead(
  body: { all: true } | { all: false; conversationIds: string[] },
): Promise<ApiResult<{ ok: boolean }>> {
  return apiFetch<{ ok: boolean }>("/api/conversations/mark-read", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function deleteConversation(conversationId: string): Promise<ApiResult<{ ok: boolean }>> {
  return apiFetch<{ ok: boolean }>(`/api/conversations/${conversationId}`, { method: "DELETE" });
}
