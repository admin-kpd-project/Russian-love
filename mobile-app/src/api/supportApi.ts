import { apiFetch, type ApiResult } from "./client";

export type SupportTicket = {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: string;
  staffReply?: string | null;
  createdAt: string;
  updatedAt?: string | null;
};

export function createSupportTicket(subject: string, message: string): Promise<ApiResult<SupportTicket>> {
  return apiFetch<SupportTicket>("/api/support/tickets", {
    method: "POST",
    body: JSON.stringify({ subject, message }),
  });
}

export function listMySupportTickets(): Promise<ApiResult<SupportTicket[]>> {
  return apiFetch<SupportTicket[]>("/api/support/tickets");
}
