"""Public admin bootstrap endpoints (gated by settings)."""

import uuid

import pytest
from fastapi.testclient import TestClient

from app.config.settings import get_settings

from tests.integration import requires_postgres


@pytest.fixture(autouse=True)
def _clear_settings_cache():
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


def test_public_create_user_404_when_disabled(monkeypatch, client: TestClient):
    monkeypatch.setenv("DATING_ADMIN_PUBLIC_USER_CREATE", "false")
    get_settings.cache_clear()
    r = client.post(
        "/api/admin/public/users",
        json={
            "email": f"u_{uuid.uuid4().hex[:8]}@example.com",
            "password": "secret12",
            "name": "Test",
            "role": "user",
        },
    )
    assert r.status_code == 404


@requires_postgres
def test_public_create_user_201_when_enabled(monkeypatch, client: TestClient):
    monkeypatch.setenv("DATING_ADMIN_PUBLIC_USER_CREATE", "true")
    get_settings.cache_clear()
    email = f"staff_{uuid.uuid4().hex[:10]}@example.com"
    r = client.post(
        "/api/admin/public/users",
        json={"email": email, "password": "secret12", "name": "Staff Bot", "role": "moderator"},
    )
    assert r.status_code == 201, r.text
    data = r.json()
    assert data.get("error") is None
    assert data["data"]["user"]["email"] == email
    assert data["data"]["user"]["role"] == "moderator"
