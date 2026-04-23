from fastapi.testclient import TestClient

from app.main import app


def test_health():
    with TestClient(app, base_url="http://localhost") as c:
        r = c.get("/health")
        assert r.status_code == 200
        assert r.json().get("status") == "ok"
