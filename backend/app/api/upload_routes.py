import uuid
from urllib.parse import urlparse

import boto3
from botocore.client import Config
from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

from app.api.deps import get_current_user, get_current_user_optional, require_roles
from app.config.settings import get_settings
from app.core.envelope import Envelope
from app.db.models import User
from app.schemas.profile import UploadPresignBody

router = APIRouter(prefix="/api", tags=["Storage"])

_admin_only = require_roles("admin")

_APK_CT = frozenset({"application/vnd.android.package-archive", "application/octet-stream"})
_APK_MAX = 200 * 1024 * 1024

_LIMITS = {
    "image/jpeg": 10 * 1024 * 1024,
    "image/png": 10 * 1024 * 1024,
    "image/webp": 10 * 1024 * 1024,
    "image/gif": 10 * 1024 * 1024,
    "video/mp4": 100 * 1024 * 1024,
    "video/webm": 100 * 1024 * 1024,
    "audio/ogg": 20 * 1024 * 1024,
    "audio/webm": 20 * 1024 * 1024,
    "audio/mpeg": 20 * 1024 * 1024,
    "audio/mp4": 20 * 1024 * 1024,
    "audio/m4a": 20 * 1024 * 1024,
    "audio/aac": 20 * 1024 * 1024,
}


def _apk_upload_gate(user: User | None) -> JSONResponse | None:
    """None = OK. In public admin mode allow APK upload without JWT (dev only)."""
    s = get_settings()
    if s.admin_public_panel:
        return None
    if user is None:
        return JSONResponse(status_code=401, content=Envelope.err("Требуется вход"))
    role = getattr(user, "user_role", None) or "user"
    if role != "admin":
        return JSONResponse(status_code=403, content=Envelope.err("Недостаточно прав"))
    return None

# Presign для регистрации: без JWT; только картинки, ключ без user id.
_REG_UPLOAD_IMAGE_TYPES = frozenset(
    k for k in _LIMITS if k.startswith("image/")
)

_CONTENT_TYPE_ALIASES: dict[str, str] = {
    "image/jpg": "image/jpeg",
    "image/pjpeg": "image/jpeg",
    "image/x-png": "image/png",
    "audio/mp3": "audio/mpeg",
    "audio/x-mpeg": "audio/mpeg",
    "audio/x-mp3": "audio/mpeg",
}


def _normalize_upload_content_type(raw: str) -> str:
    """Lowercase, strip MIME parameters (e.g. audio/webm;codecs=opus), apply aliases."""
    c = (raw or "").strip().lower()
    if ";" in c:
        c = c.split(";", 1)[0].strip()
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


def _maybe_upgrade_public_to_https(base: str, force: bool) -> str:
    b = base.rstrip("/")
    if force and b.startswith("http://"):
        return f"https://{b[len('http://') :]}"
    return b


def _request_client_used_tls(request: Request) -> bool:
    """True if the browser used HTTPS for the app (even when the hop to this process is HTTP behind Nginx).

    Some setups omit or mis-set X-Forwarded-Proto; fetch from https:// still sends Origin: https://…
    """
    if request.url.scheme == "https":
        return True
    xfp = (request.headers.get("x-forwarded-proto") or "").split(",")[-1].strip().lower()
    if xfp == "https":
        return True
    o = (request.headers.get("origin") or "").strip().lower()
    if o.startswith("https://"):
        return True
    r = (request.headers.get("referer") or "").strip().lower()
    if r.startswith("https://"):
        return True
    return False


def _coerce_http_asset_url_for_tls_request(request: Request, url: str | None) -> str | None:
    """If the browser hit the API over TLS but presign/CDN base is http://public-host, use https:// for the same host.

    Presigned PUT must be generated with the same scheme the browser will use (mixed content otherwise).
    Skips localhost, minio, and other non-public hosts.
    """
    if not url or not url.startswith("http://"):
        return url
    if not _request_client_used_tls(request):
        return url
    host = (urlparse(url).hostname or "").lower()
    if not host or host in ("localhost", "127.0.0.1", "minio") or host.endswith(".local"):
        return url
    return f"https://{url[len('http://') :]}"


def _finalize_presign_cdn_bases(request: Request, presign: str | None, cdn: str) -> tuple[str | None, str]:
    return (
        _coerce_http_asset_url_for_tls_request(request, presign),
        _coerce_http_asset_url_for_tls_request(request, cdn) or cdn,
    )


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


def _align_public_origin_with_browser_https(request: Request, public: str) -> str:
    """If Nginx forwarded http://host but fetch Origin is https://same-host, use https for presign paths."""
    if not public.startswith("http://"):
        return public
    vis = _client_visible_base_url(request)
    if not vis or not vis.startswith("https://"):
        return public
    ph = (urlparse(public).hostname or "").lower()
    vh = (urlparse(vis).hostname or "").lower()
    if ph and vh and ph == vh:
        return f"https://{public[len('http://') :]}"
    return public


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
    explicit = (s.public_base_url or "").strip().rstrip("/")
    if explicit:
        pub = _maybe_upgrade_public_to_https(explicit, s.force_https_asset_urls)
        return _finalize_presign_cdn_bases(request, pub, f"{pub}/s3/{s.s3_bucket}")
    origin = (request.headers.get("origin") or "").strip().rstrip("/")
    vite = (request.headers.get("x-vite-s3-proxy") or "").strip().lower() in ("1", "true", "yes")
    gateway_base = s.s3_nginx_dev_gateway_url.strip().rstrip("/")
    if vite and gateway_base and origin.startswith(("http://", "https://")):
        origin_host = urlparse(origin).hostname or ""
        if origin_host in {"localhost", "127.0.0.1"}:
            # Nginx+MinIO: presign host must match the gateway; GET stays under /s3/<bucket>/...
            gb = _maybe_upgrade_public_to_https(gateway_base, s.force_https_asset_urls)
            return _finalize_presign_cdn_bases(request, gb, f"{gb}/s3/{s.s3_bucket}")
    public = _public_origin_from_nginx(request) or _client_visible_base_url(request)
    if public:
        public = _align_public_origin_with_browser_https(request, public)
        pub = _maybe_upgrade_public_to_https(public, s.force_https_asset_urls)
        return _finalize_presign_cdn_bases(request, pub, f"{pub}/s3/{s.s3_bucket}")
    return _finalize_presign_cdn_bases(request, presign, cdn)


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


@router.post("/upload/mobile-apk")
async def presign_mobile_apk(
    request: Request,
    body: UploadPresignBody,
    user: User | None = Depends(get_current_user_optional),
):
    """Admin JWT or public admin mode: загрузка APK в S3 для ссылки на лендинге."""
    gate = _apk_upload_gate(user)
    if gate is not None:
        return gate
    ct = _normalize_upload_content_type(body.content_type)
    if ct not in _APK_CT:
        return JSONResponse(
            status_code=400,
            content=Envelope.err("Допустимы только APK (application/vnd.android.package-archive или application/octet-stream)"),
        )
    if body.file_size_bytes > _APK_MAX or body.file_size_bytes < 1:
        return JSONResponse(status_code=400, content=Envelope.err("Размер APK вне допустимого диапазона (макс. 200 МБ)"))
    s = get_settings()
    key = f"releases/app/{uuid.uuid4()}.apk"
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
