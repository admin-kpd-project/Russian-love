"""Conversation + messages integration (Postgres + Redis in CI)."""

import uuid

from fastapi.testclient import TestClient

from tests.integration import requires_postgres


def _register(client: TestClient, prefix: str) -> tuple[str, str]:
    email = f"{prefix}_{uuid.uuid4().hex[:10]}@example.com"
    r = client.post(
        "/api/auth/register",
        json={
            "name": f"User {prefix}",
            "birthDate": "1992-06-15",
            "email": email,
            "password": "secret12",
            "agreeToPrivacy": True,
            "agreeToTerms": True,
            "agreeToOffer": True,
        },
    )
    assert r.status_code == 201, r.text
    body = r.json()["data"]
    return body["accessToken"], body["user"]["id"]


@requires_postgres
def test_conversation_create_and_messages_roundtrip(client: TestClient):
    _, user_b_id = _register(client, "b")
    token_a, _ = _register(client, "a")

    rc = client.post(
        "/api/conversations",
        json={"user_id": user_b_id},
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert rc.status_code == 200, rc.text
    conv_id = rc.json()["data"]["id"]

    rm = client.post(
        f"/api/conversations/{conv_id}/messages",
        json={"text": "Привет из CI"},
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert rm.status_code == 201, rm.text
    sent = rm.json()["data"]
    assert sent.get("text") == "Привет из CI"

    rg = client.get(
        f"/api/conversations/{conv_id}/messages?page=1&limit=20",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert rg.status_code == 200, rg.text
    msgs = rg.json()["data"]
    assert isinstance(msgs, list)
    assert any(m.get("text") == "Привет из CI" for m in msgs)
