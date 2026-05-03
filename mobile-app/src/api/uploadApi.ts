import { getApiBaseUrl } from "./apiBase";
import { apiFetch, type ApiResult, getAccessToken } from "./client";

type Presign = { uploadUrl: string; fileUrl: string };

/** Как web/uploadService: backend отбрасывает параметры MIME после `;` (напр. codecs). */
export function normalizeUploadContentType(raw: string): string {
  const s = (raw || "").trim().toLowerCase();
  const base = s.includes(";") ? s.slice(0, s.indexOf(";")).trim() : s;
  const aliases: Record<string, string> = {
    "image/jpg": "image/jpeg",
    "image/pjpeg": "image/jpeg",
    "image/x-png": "image/png",
    "audio/mp3": "audio/mpeg",
    "audio/x-mpeg": "audio/mpeg",
    "audio/x-mp3": "audio/mpeg",
  };
  return aliases[base] ?? base;
}

export async function presignRegistration(contentType: string, fileSizeBytes: number): Promise<ApiResult<Presign>> {
  const ct = normalizeUploadContentType(contentType);
  return apiFetch<Presign>(
    "/api/upload/registration",
    {
      method: "POST",
      body: JSON.stringify({ contentType: ct, fileSizeBytes }),
    },
    { public: true }
  );
}

export async function presignAuth(contentType: string, fileSizeBytes: number): Promise<ApiResult<Presign>> {
  const ct = normalizeUploadContentType(contentType);
  return apiFetch<Presign>("/api/upload", {
    method: "POST",
    body: JSON.stringify({ contentType: ct, fileSizeBytes }),
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
  const ct = normalizeUploadContentType(contentType);
  try {
    const res = await fetch(fileUri);
    const blob = await res.blob();
    const put = await fetch(presignedUrl, {
      method: "PUT",
      headers: { "Content-Type": ct },
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
