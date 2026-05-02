import { apiFetch, ApiResponse } from "./api";

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

export async function createSupportTicket(subject: string, message: string): Promise<ApiResponse<SupportTicket>> {
  return apiFetch<SupportTicket>("/api/support/tickets", {
    method: "POST",
    body: JSON.stringify({ subject, message }),
  });
}

export async function listMySupportTickets(): Promise<ApiResponse<SupportTicket[]>> {
  return apiFetch<SupportTicket[]>("/api/support/tickets", { method: "GET" });
}
