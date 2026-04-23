"""Auth + feed integration tests (require Postgres + Redis from CI services)."""

import uuid

from fastapi.testclient import TestClient

from tests.integration import requires_postgres


@requires_postgres
def test_register_login_feed(client: TestClient):
    email = f"ci_{uuid.uuid4().hex[:10]}@example.com"
    r = client.post(
        "/api/auth/register",
        json={
            "name": "CI User",
            "birthDate": "1990-01-01",
            "email": email,
            "password": "secret12",
            "agreeToPrivacy": True,
            "agreeToTerms": True,
            "agreeToOffer": True,
        },
    )
    assert r.status_code == 201, r.text
    data = r.json()["data"]
    assert data["accessToken"]
    token = data["accessToken"]

    r2 = client.get("/api/feed", headers={"Authorization": f"Bearer {token}"})
    assert r2.status_code == 200
    body = r2.json()
    assert body.get("error") is None
    assert isinstance(body.get("data"), list)
