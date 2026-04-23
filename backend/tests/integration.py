"""Markers and helpers for DB-backed integration tests."""

import os

import pytest


def integration_db_enabled() -> bool:
    if os.environ.get("GITHUB_ACTIONS") == "true":
        return True
    v = os.environ.get("DATING_RUN_INTEGRATION", "").strip().lower()
    return v in ("1", "true", "yes")


requires_postgres = pytest.mark.skipif(
    not integration_db_enabled(),
    reason=(
        "Integration tests need Postgres+Redis+migrations. "
        "In CI they run automatically; locally set DATING_RUN_INTEGRATION=1 "
        "after `docker compose up -d postgres redis` and `alembic upgrade head`."
    ),
)
