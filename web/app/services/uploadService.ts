import { apiFetch, ApiResponse } from "./api";

// Presigned upload response
export interface PresignUploadResponse {
  uploadUrl: string;
  fileUrl: string;
}

// Get presigned URL for file upload (contract: contentType + fileSizeBytes per OpenAPI)
export async function getPresignedUploadUrl(
  contentType: string,
  fileSizeBytes: number
): Promise<ApiResponse<PresignUploadResponse>> {
  return apiFetch<PresignUploadResponse>("/api/upload", {
    method: "POST",
    body: JSON.stringify({
      contentType,
      fileSizeBytes,
    }),
  });
}

// Upload file to S3 using presigned URL
export async function uploadFileToS3(
  presignedUrl: string,
  file: File
): Promise<boolean> {
  try {
    const response = await fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });
    
    return response.ok;
  } catch (error) {
    console.error("S3 upload error:", error);
    return false;
  }
}

// Complete upload flow: get presigned URL, upload file, return CDN URL
export async function uploadFile(file: File): Promise<string | null> {
  // Get presigned URL
  const response = await getPresignedUploadUrl(file.type, file.size);
  
  if (!response.data) {
    console.error("Failed to get presigned URL:", response.error);
    return null;
  }
  
  // Upload to S3
  const uploaded = await uploadFileToS3(response.data.uploadUrl, file);
  
  if (!uploaded) {
    console.error("Failed to upload file to S3");
    return null;
  }
  
  // Return CDN URL
  return response.data.fileUrl;
}
