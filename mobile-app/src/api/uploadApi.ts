import { getApiBaseUrl } from "./apiBase";
import { apiFetch, type ApiResult, getAccessToken } from "./client";

type Presign = { uploadUrl: string; fileUrl: string };

export async function presignRegistration(contentType: string, fileSizeBytes: number): Promise<ApiResult<Presign>> {
  return apiFetch<Presign>(
    "/api/upload/registration",
    {
      method: "POST",
      body: JSON.stringify({ contentType, fileSizeBytes }),
    },
    { public: true }
  );
}

export async function presignAuth(contentType: string, fileSizeBytes: number): Promise<ApiResult<Presign>> {
  return apiFetch<Presign>("/api/upload", {
    method: "POST",
    body: JSON.stringify({ contentType, fileSizeBytes }),
  });
}

/**
 * Upload local file (file://) to S3 via presigned PUT.
 */
export async function putFileToPresignedUrl(
  presignedUrl: string,
  fileUri: string,
  contentType: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(fileUri);
    const blob = await res.blob();
    const put = await fetch(presignedUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: blob,
    });
    if (!put.ok) {
      return { ok: false, error: `Загрузка: HTTP ${put.status}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "upload failed" };
  }
}

export async function createChatWebSocket(conversationId: string): Promise<WebSocket | null> {
  const token = await getAccessToken();
  if (!token) return null;
  const baseUrl = await getApiBaseUrl();
  if (!baseUrl) return null;
  const base = baseUrl.replace(/^https:\/\//i, "wss://").replace(/^http:\/\//i, "ws://");
  const u = `${base}/api/ws/chats/${encodeURIComponent(conversationId)}?token=${encodeURIComponent(token)}`;
  return new WebSocket(u);
}
