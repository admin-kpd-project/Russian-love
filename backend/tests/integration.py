"""Markers and helpers for DB-backed integration tests."""

import os
from urllib.parse import urlparse

import pytest


def integration_db_enabled() -> bool:
    if os.environ.get("GITHUB_ACTIONS") == "true":
        return True
    v = os.environ.get("DATING_RUN_INTEGRATION", "").strip().lower()
    if v not in ("1", "true", "yes"):
        return False
    return _local_postgres_ready()


def _local_postgres_ready() -> bool:
    """Best-effort guard: skip integration tests if DB is unreachable locally."""
    dsn = os.environ.get(
        "DATING_DATABASE_URL",
        "postgresql+asyncpg://dating:dating@127.0.0.1:5432/dating",
    )
    # psycopg2 expects "postgresql://" scheme, not SQLAlchemy async driver URLs.
    dsn = dsn.replace("postgresql+asyncpg://", "postgresql://", 1).replace(
        "postgresql+psycopg://", "postgresql://", 1
    )
    p = urlparse(dsn)
    try:
        import psycopg2  # type: ignore

        conn = psycopg2.connect(
            host=p.hostname or "127.0.0.1",
            port=p.port or 5432,
            user=p.username or "dating",
            password=p.password or "dating",
            dbname=(p.path or "/dating").lstrip("/"),
            connect_timeout=2,
            sslmode="disable",
        )
        conn.close()
        return True
    except Exception:
        return False


requires_postgres = pytest.mark.skipif(
    not integration_db_enabled(),
    reason=(
        "Integration tests need Postgres+Redis+migrations. "
        "In CI they run automatically; locally set DATING_RUN_INTEGRATION=1 "
        "after `docker compose up -d postgres redis` and `alembic upgrade head`."
    ),
)
