import { apiFetch, type ApiResponse } from "./api";

export interface InitPaymentResponse {
  paymentId: string;
  orderId: string;
  provider: string;
  paymentUrl: string;
  status: string;
}

export async function initTbankPayment(
  kind: string,
  amountMinor: number,
  metadata?: Record<string, unknown>
): Promise<ApiResponse<InitPaymentResponse>> {
  return apiFetch<InitPaymentResponse>("/api/payments/tbank/init", {
    method: "POST",
    body: JSON.stringify({ kind, amountMinor, metadata }),
  });
}
