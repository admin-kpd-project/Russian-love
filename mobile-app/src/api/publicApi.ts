import { apiFetch } from "./client";

export type PublicMobileApk = { downloadUrl: string };

/** Публичный эндпоинт: ссылка на APK для лендинга (как `web/app/services/publicService.ts`). */
export async function getPublicMobileApk() {
  return apiFetch<PublicMobileApk>("/api/public/mobile-apk", {}, { public: true });
}
