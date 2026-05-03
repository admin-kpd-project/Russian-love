import { apiFetch, type ApiResult } from "./client";

export type NotificationItem = {
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
  superMessage?: string;
};

export function getNotifications(): Promise<ApiResult<NotificationItem[]>> {
  return apiFetch<NotificationItem[]>("/api/notifications");
}

export function markNotificationsRead(): Promise<ApiResult<{ ok: boolean }>> {
  return apiFetch<{ ok: boolean }>("/api/notifications/read", { method: "POST" });
}
