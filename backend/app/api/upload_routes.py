import uuid
from urllib.parse import urlparse

import boto3
from botocore.client import Config
from fastapi import APIRouter, Depends, Request
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
    "audio/mp4": 20 * 1024 * 1024,
    "audio/m4a": 20 * 1024 * 1024,
    "audio/aac": 20 * 1024 * 1024,
}

# Presign для регистрации: без JWT; только картинки, ключ без user id.
_REG_UPLOAD_IMAGE_TYPES = frozenset(
    k for k in _LIMITS if k.startswith("image/")
)

_CONTENT_TYPE_ALIASES: dict[str, str] = {
    "image/jpg": "image/jpeg",
    "image/pjpeg": "image/jpeg",
    "image/x-png": "image/png",
}


def _normalize_upload_content_type(raw: str) -> str:
    c = (raw or "").strip().lower()
    return _CONTENT_TYPE_ALIASES.get(c, c)


def _s3_base_client(endpoint_url: str | None):
    s = get_settings()
    style = s.s3_addressing_style
    if style == "auto":
        s3cfg = {"addressing_style": "auto"}
    else:
        s3cfg = {"addressing_style": style}
    cfg = Config(signature_version="s3v4", s3=s3cfg)
    key = s.s3_access_key.strip()
    sec = s.s3_secret_key.get_secret_value()
    use_keys = bool(key and sec)
    kwargs: dict = {
        "region_name": s.s3_region,
        "config": cfg,
    }
    if endpoint_url is not None:
        kwargs["endpoint_url"] = endpoint_url
    if use_keys:
        kwargs["aws_access_key_id"] = key
        kwargs["aws_secret_access_key"] = sec
    return boto3.client("s3", **kwargs)


def _resolved_s3_endpoints() -> tuple[str | None, str | None]:
    s = get_settings()
    end = s.s3_endpoint_url.strip() or None
    pre = s.s3_presign_endpoint_url.strip() or end
    return end, pre


def _public_origin_from_nginx(request: Request) -> str | None:
    """Nginx: proxy_set_header X-Forwarded-Host; не подставляйте из сырого Host без доверенного прокси."""
    xfh = (request.headers.get("x-forwarded-host") or "").strip()
    if not xfh:
        return None
    if "," in xfh:
        xfh = xfh.split(",")[-1].strip()
    xfp = (request.headers.get("x-forwarded-proto") or "http").strip()
    if "," in xfp:
        xfp = xfp.split(",")[-1].strip() or "http"
    if not xfp:
        xfp = "http"
    return f"{xfp}://{xfh}".rstrip("/")


def _client_visible_base_url(request: Request) -> str | None:
    """Публичный base URL, если X-Forwarded-* нет (внешний балансировщик не прокидывает).

    Same-origin `fetch` с сайта (например `http://81.26.181.58:8080`) шлёт `Origin` с этим
    хостом — presign в MinIO совпадёт с PUT, иначе в ответе остаётся `localhost` из .env.
    `localhost` / `127.0.0.1` сюда не подставляем: для них presign остаётся на env/прокси.
    """
    for key in ("origin", "referer"):
        s = (request.headers.get(key) or "").strip()
        if not s or s in ("null", "None"):
            continue
        p = urlparse(s)
        if p.scheme not in ("http", "https") or not p.netloc:
            continue
        host = (p.hostname or "").lower()
        if host in ("", "localhost", "127.0.0.1"):
            continue
        return f"{p.scheme}://{p.netloc}".rstrip("/")
    return None


def _presign_bases_for_request(request: Request) -> tuple[str | None, str]:
    """Returns (presign endpoint for boto3, cdn public base) for fileUrl."""
    s = get_settings()
    _, presign = _resolved_s3_endpoints()
    cdn = s.cdn_public_base_url.rstrip("/")
    origin = (request.headers.get("origin") or "").strip().rstrip("/")
    vite = (request.headers.get("x-vite-s3-proxy") or "").strip().lower() in ("1", "true", "yes")
    gateway_base = s.s3_nginx_dev_gateway_url.strip().rstrip("/")
    if vite and gateway_base and origin.startswith(("http://", "https://")):
        origin_host = urlparse(origin).hostname or ""
        if origin_host in {"localhost", "127.0.0.1"}:
            # Nginx+MinIO: presign host must match the gateway; GET stays under /s3/<bucket>/...
            return gateway_base, f"{gateway_base}/s3/{s.s3_bucket}"
    public = _public_origin_from_nginx(request) or _client_visible_base_url(request)
    if public:
        return public, f"{public}/s3/{s.s3_bucket}"
    return presign, cdn


@router.post("/upload")
async def presign_upload(
    request: Request,
    body: UploadPresignBody,
    user: User = Depends(get_current_user),
):
    ct = _normalize_upload_content_type(body.content_type)
    if ct not in _LIMITS:
        return JSONResponse(status_code=400, content=Envelope.err("Неподдерживаемый contentType"))
    mx = _LIMITS[ct]
    if body.file_size_bytes > mx or body.file_size_bytes < 1:
        return JSONResponse(status_code=400, content=Envelope.err("Размер файла вне допустимого диапазона"))
    s = get_settings()
    ext = ct.split("/")[-1].replace("jpeg", "jpg")
    key = f"media/{user.id}/{uuid.uuid4()}.{ext}"
    presign_base, cdn_base = _presign_bases_for_request(request)
    client = _s3_base_client(presign_base)
    upload_url = client.generate_presigned_url(
        ClientMethod="put_object",
        Params={
            "Bucket": s.s3_bucket,
            "Key": key,
            "ContentType": ct,
        },
        ExpiresIn=900,
        HttpMethod="PUT",
    )
    file_url = f"{cdn_base}/{key}"
    return Envelope.ok({"uploadUrl": upload_url, "fileUrl": file_url})


@router.post("/upload/registration")
async def presign_upload_registration(request: Request, body: UploadPresignBody):
    """Presign для аватара/фото на шаге регистрации (пользователь ещё не авторизован)."""
    ct = _normalize_upload_content_type(body.content_type)
    if ct not in _REG_UPLOAD_IMAGE_TYPES:
        return JSONResponse(
            status_code=400,
            content=Envelope.err("Для регистрации доступны только изображения (JPEG, PNG, WebP, GIF)"),
        )
    mx = _LIMITS[ct]
    if body.file_size_bytes > mx or body.file_size_bytes < 1:
        return JSONResponse(status_code=400, content=Envelope.err("Размер файла вне допустимого диапазона"))
    s = get_settings()
    ext = ct.split("/")[-1].replace("jpeg", "jpg")
    key = f"media/register/{uuid.uuid4()}.{ext}"
    presign_base, cdn_base = _presign_bases_for_request(request)
    client = _s3_base_client(presign_base)
    upload_url = client.generate_presigned_url(
        ClientMethod="put_object",
        Params={
            "Bucket": s.s3_bucket,
            "Key": key,
            "ContentType": ct,
        },
        ExpiresIn=900,
        HttpMethod="PUT",
    )
    file_url = f"{cdn_base}/{key}"
    return Envelope.ok({"uploadUrl": upload_url, "fileUrl": file_url})
