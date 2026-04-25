import { apiFetch, ApiResponse } from "./api";

export type UploadFileOptions = {
  /** Регистрация / приглашение: presign без JWT. */
  forRegistration?: boolean;
};

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
  file: File
): Promise<UploadResult> {
  try {
    const response = await fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
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
  const contentType = forReg ? guessImageContentType(file) : guessMediaContentType(file);
  const response = await getPresignedUploadUrl(contentType, file.size, forReg);
  
  if (!response.data) {
    console.error("Failed to get presigned URL:", response.error);
    return { url: null, error: response.error || "Не удалось получить ссылку для загрузки файла" };
  }
  
  // Upload to S3
  const uploaded = await uploadFileToS3(response.data.uploadUrl, file);
  
  if (uploaded.error) {
    console.error("Failed to upload file to S3");
    return { url: null, error: uploaded.error };
  }
  
  // Return CDN URL
  return { url: response.data.fileUrl, error: null };
}
