from functools import lru_cache

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
        default="postgresql+asyncpg://dating:dating@localhost:5432/dating"
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

    s3_endpoint_url: str = Field(default="http://localhost:9000")
    s3_access_key: str = Field(default="minioadmin")
    s3_secret_key: SecretStr = Field(default=SecretStr("minioadmin"))
    s3_bucket: str = Field(default="dating-media")
    s3_region: str = Field(default="us-east-1")
    cdn_public_base_url: str = Field(
        default="http://localhost:9000/dating-media",
        description="Public URL prefix for uploaded objects (must match mediaUrl host check)",
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

    secrets_dir: str | None = Field(
        default=None,
        description="If set, pydantic can load Docker secrets from this path",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
