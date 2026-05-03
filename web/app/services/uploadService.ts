import { apiFetch, ApiResponse } from "./api";

export type UploadFileOptions = {
  /** Регистрация / приглашение: presign без JWT. */
  forRegistration?: boolean;
};

/** Совпадает с backend upload_routes: параметры после `;` убираем (MediaRecorder даёт codecs=…). */
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

/** Браузеры на части Android не заполняют file.type — иначе бэкенд отклонит presign. */
function guessImageContentType(file: File): string {
  const t = file.type?.trim();
  if (t) return t;
  const n = file.name.toLowerCase();
  if (n.endsWith(".png")) return "image/png";
  if (n.endsWith(".webp")) return "image/webp";
  if (n.endsWith(".gif")) return "image/gif";
  if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "image/jpeg";
  return "image/jpeg";
}

function guessMediaContentType(file: File): string {
  const t = file.type?.trim();
  if (t) return t;
  const n = file.name.toLowerCase();
  if (n.endsWith(".mp4")) return "video/mp4";
  if (n.endsWith(".webm")) return "video/webm";
  if (n.endsWith(".ogg")) return "audio/ogg";
  if (n.endsWith(".mp3")) return "audio/mpeg";
  return guessImageContentType(file);
}

// Presigned upload response
export interface PresignUploadResponse {
  uploadUrl: string;
  fileUrl: string;
}

export interface UploadResult {
  url: string | null;
  error: string | null;
}

// Get presigned URL for file upload (contract: contentType + fileSizeBytes per OpenAPI)
export async function getPresignedUploadUrl(
  contentType: string,
  fileSizeBytes: number,
  forRegistration = false
): Promise<ApiResponse<PresignUploadResponse>> {
  const path = forRegistration ? "/api/upload/registration" : "/api/upload";
  return apiFetch<PresignUploadResponse>(
    path,
    {
      method: "POST",
      body: JSON.stringify({
        contentType,
        fileSizeBytes,
      }),
    },
    forRegistration ? { public: true } : undefined
  );
}

// Upload file to S3 using presigned URL
export async function uploadFileToS3(
  presignedUrl: string,
  file: File,
  contentTypeOverride?: string
): Promise<UploadResult> {
  try {
    const ct = (contentTypeOverride || file.type || "application/octet-stream").trim() || "application/octet-stream";
    const response = await fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": ct,
      },
    });

    if (!response.ok) {
      return { url: null, error: `Ошибка загрузки в хранилище (HTTP ${response.status})` };
    }
    return { url: null, error: null };
  } catch (error) {
    console.error("S3 upload error:", error);
    return {
      url: null,
      error: "Сетевая ошибка при загрузке файла. Проверьте соединение и попробуйте снова.",
    };
  }
}

// Complete upload flow: get presigned URL, upload file, return CDN URL
export async function uploadFile(
  file: File,
  opts?: UploadFileOptions
): Promise<UploadResult> {
  const forReg = Boolean(opts?.forRegistration);
  const rawType = forReg ? guessImageContentType(file) : guessMediaContentType(file);
  const contentType = normalizeUploadContentType(rawType);
  const response = await getPresignedUploadUrl(contentType, file.size, forReg);
  
  if (!response.data) {
    console.error("Failed to get presigned URL:", response.error);
    return { url: null, error: response.error || "Не удалось получить ссылку для загрузки файла" };
  }
  
  // PUT Content-Type must match what was signed (same normalization as presign).
  const uploaded = await uploadFileToS3(response.data.uploadUrl, file, contentType);
  
  if (uploaded.error) {
    console.error("Failed to upload file to S3");
    return { url: null, error: uploaded.error };
  }
  
  // Return CDN URL
  return { url: response.data.fileUrl, error: null };
}

function guessApkContentType(file: File): string {
  const t = file.type?.trim();
  if (t === "application/vnd.android.package-archive" || t === "application/octet-stream") return t;
  const n = file.name.toLowerCase();
  if (n.endsWith(".apk")) return "application/vnd.android.package-archive";
  return "application/octet-stream";
}

export async function getPresignedMobileApkUploadUrl(
  contentType: string,
  fileSizeBytes: number
): Promise<ApiResponse<PresignUploadResponse>> {
  return apiFetch<PresignUploadResponse>("/api/upload/mobile-apk", {
    method: "POST",
    body: JSON.stringify({
      contentType,
      fileSizeBytes,
    }),
  });
}

/** Только admin JWT: загрузка APK в S3, возвращает публичный fileUrl. */
export async function uploadMobileApkFile(file: File): Promise<UploadResult> {
  const contentType = guessApkContentType(file);
  const response = await getPresignedMobileApkUploadUrl(contentType, file.size);
  if (!response.data) {
    return { url: null, error: response.error || "Не удалось получить ссылку для загрузки APK" };
  }
  const uploaded = await uploadFileToS3(response.data.uploadUrl, file, contentType);
  if (uploaded.error) {
    return { url: null, error: uploaded.error };
  }
  return { url: response.data.fileUrl, error: null };
}
