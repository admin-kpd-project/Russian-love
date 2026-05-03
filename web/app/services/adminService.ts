import { apiFetch, ApiResponse, tokenStorage } from "./api";

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
  return withPublicThenPrivateFallback<AdminStats>("/api/admin/stats");
}

export async function listAdminTickets(): Promise<ApiResponse<AdminTicket[]>> {
  return withPublicThenPrivateFallback<AdminTicket[]>("/api/admin/tickets");
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
  return withPublicThenPrivateFallback<AdminReport[]>("/api/admin/reports");
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

function isAuthError(error: string | null): boolean {
  if (!error) return false;
  const e = error.toLowerCase();
  return (
    e.includes("http 401") ||
    e.includes("http 403") ||
    e.includes("требуется вход") ||
    e.includes("not authenticated") ||
    e.includes("недостаточно прав")
  );
}

async function withPublicThenPrivateFallback<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const hasToken = !!tokenStorage.getAccessToken();
  // Prefer authenticated request first when user already has a session:
  // this avoids noisy "public 401 -> private 403" chains in admin logs.
  if (hasToken) {
    const privateResult = await apiFetch<T>(endpoint, options);
    if (!isAuthError(privateResult.error)) return privateResult;
    return privateResult;
  }
  const publicResult = await apiFetch<T>(endpoint, options, adminReadPublic);
  if (!isAuthError(publicResult.error)) return publicResult;
  return publicResult;
}

export async function getAdminMobileApk(): Promise<ApiResponse<MobileApkSetting>> {
  return withPublicThenPrivateFallback<MobileApkSetting>("/api/admin/mobile-apk");
}

export async function patchAdminMobileApk(downloadUrl: string | null): Promise<ApiResponse<{ downloadUrl: string | null }>> {
  return withPublicThenPrivateFallback<{ downloadUrl: string | null }>(
    "/api/admin/mobile-apk",
    {
      method: "PATCH",
      body: JSON.stringify({ downloadUrl }),
    }
  );
}
