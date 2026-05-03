import { apiFetch, type ApiResponse } from "./api";

export interface NotificationItem {
  id: string;
  type: "match" | "like" | "message" | "superlike" | "new";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  avatar?: string;
  userName?: string;
  conversationId?: string;
  peerUserId?: string;
  /** Текст, приложенный к суперлайку (не сообщение в чате). */
  superMessage?: string;
}

export async function getNotifications(): Promise<ApiResponse<NotificationItem[]>> {
  return apiFetch<NotificationItem[]>("/api/notifications");
}

export async function markNotificationsRead(): Promise<ApiResponse<{ ok: boolean }>> {
  return apiFetch<{ ok: boolean }>("/api/notifications/read", { method: "POST" });
}
