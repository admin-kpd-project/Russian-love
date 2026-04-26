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
            "gender": "male",
            "avatarUrl": "https://example.com/avatar.jpg",
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


@requires_postgres
def test_conversation_unread_and_mark_read(client: TestClient):
    token_b, user_b_id = _register(client, "unr_b")
    token_a, _ = _register(client, "unr_a")

    rc2 = client.post(
        "/api/conversations",
        json={"user_id": user_b_id},
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert rc2.status_code == 200, rc2.text
    conv_id = rc2.json()["data"]["id"]

    client.post(
        f"/api/conversations/{conv_id}/messages",
        json={"text": "Ping"},
        headers={"Authorization": f"Bearer {token_a}"},
    )

    lst = client.get("/api/conversations", headers={"Authorization": f"Bearer {token_b}"})
    assert lst.status_code == 200, lst.text
    rows = lst.json()["data"]
    row = next((x for x in rows if x["id"] == conv_id), None)
    assert row is not None
    assert row.get("unread") is True

    mr = client.post(
        f"/api/conversations/{conv_id}/read",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert mr.status_code == 200, mr.text

    lst2 = client.get("/api/conversations", headers={"Authorization": f"Bearer {token_b}"})
    rows2 = lst2.json()["data"]
    row2 = next((x for x in rows2 if x["id"] == conv_id), None)
    assert row2 is not None
    assert row2.get("unread") is False

    m_all = client.post(
        "/api/conversations/mark-read",
        json={"all": True},
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert m_all.status_code == 200, m_all.text

    delr = client.delete(
        f"/api/conversations/{conv_id}",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert delr.status_code == 200, delr.text

    delr2 = client.delete(
        f"/api/conversations/{conv_id}",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert delr2.status_code == 404, delr2.text
