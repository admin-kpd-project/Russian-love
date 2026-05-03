"""Superlike optional message + notification payload (needs Postgres)."""

import uuid

from fastapi.testclient import TestClient

from tests.integration import requires_postgres


def _register(client: TestClient, name: str) -> tuple[str, str]:
    email = f"ci_{uuid.uuid4().hex[:10]}@example.com"
    r = client.post(
        "/api/auth/register",
        json={
            "name": name,
            "birthDate": "1990-01-01",
            "email": email,
            "password": "secret12",
            "gender": "male",
            "avatarUrl": "https://example.com/ci-avatar.jpg",
            "agreeToPrivacy": True,
            "agreeToTerms": True,
            "agreeToOffer": True,
            "agreeToAge18": True,
        },
    )
    assert r.status_code == 201, r.text
    data = r.json()["data"]
    return data["accessToken"], data["user"]["id"]


@requires_postgres
def test_superlike_message_in_notifications(client: TestClient):
    tok_a, id_a = _register(client, "Super A")
    tok_b, id_b = _register(client, "Super B")

    note = "Привет! У нас похожие интересы."
    sl = client.post(
        "/api/superlikes",
        headers={"Authorization": f"Bearer {tok_a}"},
        json={"userId": id_b, "message": note},
    )
    assert sl.status_code == 200, sl.text
    body = sl.json()
    assert body.get("error") is None
    assert body["data"]["ok"] is True

    nres = client.get("/api/notifications", headers={"Authorization": f"Bearer {tok_b}"})
    assert nres.status_code == 200, nres.text
    items = nres.json()["data"]
    super_items = [x for x in items if x.get("type") == "superlike"]
    assert super_items, items
    top = super_items[0]
    assert top.get("superMessage") == note
    # Текст к суперлайку только в superMessage; message — короткая строка без дублирования.
    assert note not in (top.get("message") or "")
    assert "суперлайк" in (top.get("message") or "").lower()

    dup = client.post(
        "/api/superlikes",
        headers={"Authorization": f"Bearer {tok_a}"},
        json={"userId": id_b, "message": "Второе сообщение"},
    )
    assert dup.status_code == 409, dup.text
