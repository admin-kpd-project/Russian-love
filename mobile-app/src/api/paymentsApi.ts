import { apiFetch, type ApiResult } from "./client";

export type InitPaymentResponse = {
  paymentId: string;
  orderId: string;
  provider: string;
  paymentUrl: string;
  status: string;
};

export type PaymentsStatusResponse = {
  paymentsEnabled: boolean;
};

/** Публичный эндпоинт как на вебе ([web/app/services/paymentsService.ts](web/app/services/paymentsService.ts)). */
export function getPaymentsStatus(): Promise<ApiResult<PaymentsStatusResponse>> {
  return apiFetch<PaymentsStatusResponse>("/api/payments/status", { method: "GET" }, { public: true });
}

export function initTbankPayment(
  kind: string,
  amountMinor: number,
  metadata?: Record<string, unknown>
): Promise<ApiResult<InitPaymentResponse>> {
  return apiFetch<InitPaymentResponse>("/api/payments/tbank/init", {
    method: "POST",
    body: JSON.stringify({ kind, amountMinor, metadata }),
  });
}
