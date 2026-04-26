import { apiFetch, ApiResponse } from "./api";

// Conversation type
export interface ConversationResponse {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

// Get all conversations
export async function getConversations(): Promise<ApiResponse<ConversationResponse[]>> {
  return apiFetch<ConversationResponse[]>("/api/conversations");
}

// Create or get conversation with user
export interface CreateConversationRequest {
  user_id: string;
}

export interface ConversationCreatedResponse {
  id: string;
}

export async function createConversation(
  userId: string
): Promise<ApiResponse<ConversationCreatedResponse>> {
  return apiFetch<ConversationCreatedResponse>("/api/conversations", {
    method: "POST",
    body: JSON.stringify({ user_id: userId }),
  });
}

export type MarkConversationsReadBody =
  | { all: true }
  | { all: false; conversationIds: string[] };

export async function markConversationRead(
  conversationId: string
): Promise<ApiResponse<{ ok: boolean }>> {
  return apiFetch<{ ok: boolean }>(`/api/conversations/${conversationId}/read`, {
    method: "POST",
  });
}

export async function markConversationsRead(
  body: MarkConversationsReadBody
): Promise<ApiResponse<{ ok: boolean }>> {
  return apiFetch<{ ok: boolean }>("/api/conversations/mark-read", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function deleteConversation(
  conversationId: string
): Promise<ApiResponse<{ ok: boolean }>> {
  return apiFetch<{ ok: boolean }>(`/api/conversations/${conversationId}`, {
    method: "DELETE",
  });
}
