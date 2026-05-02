import { apiFetch, ApiResponse } from "./api";

export type AdminStats = { openTickets: number; openReports: number };

export type AdminTicket = {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: string;
  staffReply?: string | null;
  createdAt: string;
  updatedAt?: string | null;
};

export type AdminReport = {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: string;
  status: string;
  createdAt: string;
  resolvedAt?: string | null;
  resolvedById?: string | null;
};

export async function getAdminStats(): Promise<ApiResponse<AdminStats>> {
  return apiFetch<AdminStats>("/api/admin/stats");
}

export async function listAdminTickets(): Promise<ApiResponse<AdminTicket[]>> {
  return apiFetch<AdminTicket[]>("/api/admin/tickets");
}

export async function patchAdminTicket(
  id: string,
  body: { status?: "open" | "in_progress" | "closed"; staffReply?: string },
): Promise<ApiResponse<AdminTicket>> {
  return apiFetch<AdminTicket>(`/api/admin/tickets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function listAdminReports(): Promise<ApiResponse<AdminReport[]>> {
  return apiFetch<AdminReport[]>("/api/admin/reports");
}

export async function patchAdminReport(
  id: string,
  status: "open" | "resolved" | "dismissed",
): Promise<ApiResponse<AdminReport>> {
  return apiFetch<AdminReport>(`/api/admin/reports/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function deactivateUser(userId: string): Promise<ApiResponse<{ ok: boolean; userId: string }>> {
  return apiFetch<{ ok: boolean; userId: string }>(`/api/admin/users/${userId}/deactivate`, {
    method: "POST",
  });
}

export async function activateUser(userId: string): Promise<ApiResponse<{ ok: boolean; userId: string }>> {
  return apiFetch<{ ok: boolean; userId: string }>(`/api/admin/users/${userId}/activate`, {
    method: "POST",
  });
}
