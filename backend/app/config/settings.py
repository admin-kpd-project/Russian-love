from functools import lru_cache
from typing import Literal

from pydantic import Field, PostgresDsn, RedisDsn, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="DATING_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Dating API"
    debug: bool = False

    database_url: PostgresDsn = Field(
        # Local dev default; production values are expected via DATING_DATABASE_URL.
        default="postgresql+asyncpg://dating:dating@127.0.0.1:5432/dating"
    )
    redis_url: RedisDsn = Field(default="redis://localhost:6379/0")

    jwt_secret: SecretStr = Field(default=SecretStr("change-me-in-production-min-32-chars!!"))
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 30

    cors_origins: str = Field(
        default="http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173",
        description="Comma-separated list",
    )
    trusted_hosts: str = Field(default="localhost,127.0.0.1,api")

    s3_endpoint_url: str = Field(
        default="",
        description="Custom S3 API base URL. Empty = Amazon S3 in s3_region (boto3 default endpoint).",
    )
    s3_access_key: str = Field(
        default="",
        description="IAM access key. Empty = default credential chain (e.g. IAM role on AWS).",
    )
    s3_secret_key: SecretStr = Field(
        default=SecretStr(""),
        description="IAM secret. Empty = default credential chain (e.g. IAM role on AWS).",
    )
    s3_bucket: str = Field(default="dating-media")
    s3_region: str = Field(default="us-east-1")
    s3_addressing_style: Literal["path", "virtual", "auto"] = Field(
        default="virtual",
        description="path: MinIO, Yandex Object Storage (buckets with dots), path-style. virtual: AWS S3. Yandex: prefer path (docs).",
    )
    s3_yandex_object_storage: bool = Field(
        default=False,
        description="True: defaults for Yandex Object Storage (storage.yandexcloud.net, ru-central1, path public URL). Override with DATING_S3_* as needed.",
    )
    cdn_public_base_url: str = Field(
        default="https://your-bucket.s3.amazonaws.com",
        description="Public GET base for fileUrl (S3, CloudFront, MinIO, or path-style e.g. https://storage.yandexcloud.net/bucket). Must match mediaUrl host in chat_routes check.",
    )
    s3_presign_endpoint_url: str = Field(
        default="",
        description="Host embedded in presigned PUT URLs for the browser. Empty = same as s3_endpoint (AWS/MinIO).",
    )
    s3_nginx_dev_gateway_url: str = Field(
        default="",
        description="If set (e.g. http://localhost:8080), Vite dev + X-Vite-S3-Proxy can presign via Nginx/MinIO stack.",
    )

    yandex_client_id: str | None = None
    yandex_client_secret: SecretStr | None = None
    yandex_redirect_uri: str | None = Field(
        default=None,
        description="Registered redirect URI for Yandex OAuth (e.g. https://api.example.com/api/auth/yandex/callback)",
    )

    rate_limit_auth_rps: int = 5
    rate_limit_auth_burst: int = 10
    rate_limit_api_rps: int = 100
    rate_limit_api_burst: int = 200

    telegram_bot_token: SecretStr | None = None
    telegram_bot_username: str | None = None

    tbank_terminal_key: str | None = None
    tbank_password: SecretStr | None = None
    tbank_webhook_secret: str | None = None
    tbank_sandbox: bool = Field(
        default=False,
        description="True → test API host rest-api-test.tinkoff.ru",
    )
    tbank_base_url: str = Field(
        default="",
        description="Override v2 base (default: securepay or test host by sandbox).",
    )
    public_web_url: str = Field(
        default="http://localhost:5173",
        description="Web app origin for payment return URLs",
    )
    public_api_url: str = Field(
        default="http://localhost:8080",
        description="Public base URL of this API (NotificationURL for Tinkoff)",
    )

    secrets_dir: str | None = Field(
        default=None,
        description="If set, pydantic can load Docker secrets from this path",
    )


def _apply_yandex_object_storage(s: Settings) -> Settings:
    """
    Yandex Object Storage: S3-compatible (SigV4, path/ virtual URLs), see
    https://yandex.cloud/docs/storage/
    """
    if not s.s3_yandex_object_storage:
        return s
    yc = "https://storage.yandexcloud.net"
    upd: dict[str, object] = {"s3_addressing_style": "path"}
    if not s.s3_endpoint_url.strip():
        upd["s3_endpoint_url"] = yc
    if not s.s3_presign_endpoint_url.strip():
        ep = str(upd.get("s3_endpoint_url") or s.s3_endpoint_url).strip() or yc
        upd["s3_presign_endpoint_url"] = ep
    if s.s3_region == "us-east-1":
        upd["s3_region"] = "ru-central1"
    cdn = s.cdn_public_base_url.strip()
    if cdn in ("", "https://your-bucket.s3.amazonaws.com"):
        upd["cdn_public_base_url"] = f"{yc.rstrip('/')}/{s.s3_bucket}"
    return s.model_copy(update=upd)


@lru_cache
def get_settings() -> Settings:
    s = Settings()
    return _apply_yandex_object_storage(s)
