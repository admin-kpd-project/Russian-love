import { apiFetch, type ApiResponse } from "./api";

export type PublicMobileApk = { downloadUrl: string };

/** Без JWT: ссылка на APK для лендинга (из админки / site_settings). */
export async function getPublicMobileApk(): Promise<ApiResponse<PublicMobileApk>> {
  return apiFetch<PublicMobileApk>("/api/public/mobile-apk", {}, { public: true });
}
