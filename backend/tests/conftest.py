"""Shared pytest configuration (fixtures; see tests/integration.py for markers)."""

import asyncio

import pytest
from fastapi.testclient import TestClient

from app.core.redis_client import close_redis_pool
from app.db.session import dispose_engine
from app.main import app


@pytest.fixture
def client():
    """One TestClient session per test so all requests share the same asyncio loop (Redis + asyncpg)."""
    with TestClient(app, base_url="http://localhost") as c:
        yield c


@pytest.fixture(autouse=True)
def reset_global_async_clients_after_test():
    """Drop module-level engine/redis pool so the next test does not reuse connections from a closed loop."""
    yield
    try:
        asyncio.run(_reset_pools())
    except RuntimeError:
        pass


async def _reset_pools() -> None:
    await close_redis_pool()
    await dispose_engine()
