import { apiFetch, type ApiResult } from "./client";

export type ConversationListItem = {
  id: string;
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
