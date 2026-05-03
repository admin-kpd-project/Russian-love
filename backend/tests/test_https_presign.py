"""Presign/CDN public base resolution for HTTPS and reverse-proxy (no DB)."""

import pytest
from starlette.requests import Request

from app.api.upload_routes import _presign_bases_for_request
from app.config.settings import get_settings


def _minimal_scope(*, headers: list[tuple[bytes, bytes]]) -> dict:
    return {
        "type": "http",
        "asgi": {"version": "3.0", "spec_version": "2.3"},
        "http_version": "1.1",
        "method": "POST",
        "path": "/api/upload",
        "raw_path": b"/api/upload",
        "root_path": "",
        "scheme": "http",
        "query_string": b"",
        "headers": headers,
        "client": ("127.0.0.1", 12345),
        "server": ("127.0.0.1", 8000),
    }


@pytest.fixture(autouse=True)
def _clear_settings_cache():
    yield
    get_settings.cache_clear()


def test_public_base_url_overrides_forwarded(monkeypatch):
    monkeypatch.setenv("DATING_PUBLIC_BASE_URL", "https://cdn.example.org")
    monkeypatch.setenv("DATING_S3_BUCKET", "dating-media")
    get_settings.cache_clear()
    req = Request(
        _minimal_scope(
            headers=[
                (b"x-forwarded-proto", b"http"),
                (b"x-forwarded-host", b"wrong.example"),
            ],
        ),
    )
    pre, cdn = _presign_bases_for_request(req)
    assert pre == "https://cdn.example.org"
    assert cdn == "https://cdn.example.org/s3/dating-media"


def test_tls_inferred_from_origin_when_forwarded_proto_missing(monkeypatch):
    """Nginx→API may be HTTP; browser still sends Origin: https://… — presign must use https."""
    monkeypatch.delenv("DATING_PUBLIC_BASE_URL", raising=False)
    monkeypatch.delenv("DATING_FORCE_HTTPS_ASSET_URLS", raising=False)
    monkeypatch.setenv("DATING_S3_ENDPOINT_URL", "http://dev.forruss.ru")
    monkeypatch.setenv("DATING_S3_PRESIGN_ENDPOINT_URL", "http://dev.forruss.ru")
    monkeypatch.setenv("DATING_CDN_PUBLIC_BASE_URL", "http://dev.forruss.ru/dating-media")
    monkeypatch.setenv("DATING_S3_BUCKET", "dating-media")
    get_settings.cache_clear()
    req = Request(
        _minimal_scope(
            headers=[
                (b"origin", b"https://dev.forruss.ru"),
            ],
        ),
    )
    pre, cdn = _presign_bases_for_request(req)
    assert pre == "https://dev.forruss.ru"
    assert cdn == "https://dev.forruss.ru/s3/dating-media"


def test_nginx_forwarded_http_overridden_when_origin_https_same_host(monkeypatch):
    monkeypatch.delenv("DATING_PUBLIC_BASE_URL", raising=False)
    monkeypatch.delenv("DATING_FORCE_HTTPS_ASSET_URLS", raising=False)
    monkeypatch.setenv("DATING_S3_ENDPOINT_URL", "http://dev.forruss.ru")
    monkeypatch.setenv("DATING_S3_PRESIGN_ENDPOINT_URL", "http://dev.forruss.ru")
    monkeypatch.setenv("DATING_CDN_PUBLIC_BASE_URL", "http://dev.forruss.ru/dating-media")
    monkeypatch.setenv("DATING_S3_BUCKET", "dating-media")
    get_settings.cache_clear()
    req = Request(
        _minimal_scope(
            headers=[
                (b"x-forwarded-host", b"dev.forruss.ru"),
                (b"x-forwarded-proto", b"http"),
                (b"origin", b"https://dev.forruss.ru"),
            ],
        ),
    )
    pre, cdn = _presign_bases_for_request(req)
    assert pre == "https://dev.forruss.ru"
    assert cdn == "https://dev.forruss.ru/s3/dating-media"


def test_tls_request_upgrades_fallback_http_endpoints(monkeypatch):
    """Env has http:// public host; API sees TLS via X-Forwarded-Proto → presign/CDN must be https."""
    monkeypatch.delenv("DATING_PUBLIC_BASE_URL", raising=False)
    monkeypatch.delenv("DATING_FORCE_HTTPS_ASSET_URLS", raising=False)
    monkeypatch.setenv("DATING_S3_ENDPOINT_URL", "http://forruss.ru")
    monkeypatch.setenv("DATING_S3_PRESIGN_ENDPOINT_URL", "http://forruss.ru")
    monkeypatch.setenv("DATING_CDN_PUBLIC_BASE_URL", "http://forruss.ru/dating-media")
    monkeypatch.setenv("DATING_S3_BUCKET", "dating-media")
    get_settings.cache_clear()
    req = Request(
        _minimal_scope(
            headers=[
                (b"x-forwarded-proto", b"https"),
            ],
        ),
    )
    pre, cdn = _presign_bases_for_request(req)
    assert pre == "https://forruss.ru"
    assert cdn == "https://forruss.ru/dating-media"


def test_force_https_upgrades_inferred_public(monkeypatch):
    monkeypatch.delenv("DATING_PUBLIC_BASE_URL", raising=False)
    monkeypatch.setenv("DATING_FORCE_HTTPS_ASSET_URLS", "true")
    monkeypatch.setenv("DATING_S3_BUCKET", "dating-media")
    get_settings.cache_clear()
    req = Request(
        _minimal_scope(
            headers=[
                (b"x-forwarded-proto", b"http"),
                (b"x-forwarded-host", b"dev.example.com"),
            ],
        ),
    )
    pre, cdn = _presign_bases_for_request(req)
    assert pre == "https://dev.example.com"
    assert cdn == "https://dev.example.com/s3/dating-media"
