import { apiFetch, ApiResponse } from "./api";

/** Чтение админки без JWT (когда на API включён DATING_ADMIN_PUBLIC_PANEL). */
const adminReadPublic = { public: true } as const;

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

export type CreatedUserPayload = { user: Record<string, unknown> };

export async function createAdminPublicUser(body: {
  email: string;
  password: string;
  name: string;
  role: "user" | "admin" | "moderator" | "support";
}): Promise<ApiResponse<CreatedUserPayload>> {
  return apiFetch<CreatedUserPayload>(
    "/api/admin/public/users",
    { method: "POST", body: JSON.stringify(body) },
    { public: true }
  );
}

export async function getAdminStats(): Promise<ApiResponse<AdminStats>> {
  return apiFetch<AdminStats>("/api/admin/stats", {}, adminReadPublic);
}

export async function listAdminTickets(): Promise<ApiResponse<AdminTicket[]>> {
  return apiFetch<AdminTicket[]>("/api/admin/tickets", {}, adminReadPublic);
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
  return apiFetch<AdminReport[]>("/api/admin/reports", {}, adminReadPublic);
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

export type MobileApkSetting = { downloadUrl: string | null; updatedAt: string | null };

export async function getAdminMobileApk(): Promise<ApiResponse<MobileApkSetting>> {
  return apiFetch<MobileApkSetting>("/api/admin/mobile-apk");
}

export async function patchAdminMobileApk(downloadUrl: string | null): Promise<ApiResponse<{ downloadUrl: string | null }>> {
  return apiFetch<{ downloadUrl: string | null }>("/api/admin/mobile-apk", {
    method: "PATCH",
    body: JSON.stringify({ downloadUrl }),
  });
}
