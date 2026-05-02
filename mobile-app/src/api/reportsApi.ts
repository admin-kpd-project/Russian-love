import { apiFetch, type ApiResult } from "./client";

export type UserReport = {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: string;
  status: string;
  createdAt: string;
  resolvedAt?: string | null;
  resolvedById?: string | null;
};

export function submitUserReport(reportedUserId: string, reason: string): Promise<ApiResult<UserReport>> {
  return apiFetch<UserReport>("/api/reports", {
    method: "POST",
    body: JSON.stringify({ reportedUserId, reason }),
  });
}
