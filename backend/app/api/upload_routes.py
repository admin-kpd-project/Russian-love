import uuid

import boto3
from botocore.client import Config
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from app.api.deps import get_current_user
from app.config.settings import get_settings
from app.core.envelope import Envelope
from app.db.models import User
from app.schemas.profile import UploadPresignBody

router = APIRouter(prefix="/api", tags=["Storage"])

_LIMITS = {
    "image/jpeg": 10 * 1024 * 1024,
    "image/png": 10 * 1024 * 1024,
    "image/webp": 10 * 1024 * 1024,
    "image/gif": 10 * 1024 * 1024,
    "video/mp4": 100 * 1024 * 1024,
    "audio/ogg": 20 * 1024 * 1024,
    "audio/webm": 20 * 1024 * 1024,
    "audio/mpeg": 20 * 1024 * 1024,
}


def _s3_client():
    s = get_settings()
    return boto3.client(
        "s3",
        endpoint_url=s.s3_endpoint_url,
        aws_access_key_id=s.s3_access_key,
        aws_secret_access_key=s.s3_secret_key.get_secret_value(),
        region_name=s.s3_region,
        config=Config(signature_version="s3v4", s3={"addressing_style": "path"}),
    )


@router.post("/upload")
async def presign_upload(
    body: UploadPresignBody,
    user: User = Depends(get_current_user),
):
    ct = body.content_type
    if ct not in _LIMITS:
        return JSONResponse(status_code=400, content=Envelope.err("Неподдерживаемый contentType"))
    mx = _LIMITS[ct]
    if body.file_size_bytes > mx or body.file_size_bytes < 1:
        return JSONResponse(status_code=400, content=Envelope.err("Размер файла вне допустимого диапазона"))
    s = get_settings()
    ext = ct.split("/")[-1].replace("jpeg", "jpg")
    key = f"media/{user.id}/{uuid.uuid4()}.{ext}"
    client = _s3_client()
    upload_url = client.generate_presigned_url(
        ClientMethod="put_object",
        Params={
            "Bucket": s.s3_bucket,
            "Key": key,
            "ContentType": ct,
            "ContentLength": body.file_size_bytes,
        },
        ExpiresIn=900,
        HttpMethod="PUT",
    )
    base = s.cdn_public_base_url.rstrip("/")
    file_url = f"{base}/{key}"
    return Envelope.ok({"uploadUrl": upload_url, "fileUrl": file_url})
