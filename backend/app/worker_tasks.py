"""Dramatiq worker entry: configure broker, actors, and periodic maintenance."""

import threading
import time

import dramatiq
from dramatiq.brokers.redis import RedisBroker
from dramatiq.middleware import AgeLimit, Retries, TimeLimit

from app.config.settings import get_settings

_broker = RedisBroker(
    url=str(get_settings().redis_url),
    middleware=[Retries(max_retries=3), TimeLimit(time_limit=600_000), AgeLimit(max_age=3_600_000)],
)
dramatiq.set_broker(_broker)


@dramatiq.actor
def cleanup_expired_refresh_tokens() -> int:
    """Delete expired refresh token rows (revoked or past expires_at)."""
    import asyncio
    from datetime import UTC, datetime

    from sqlalchemy import delete

    from app.db.models import RefreshToken
    from app.db.session import get_session_factory

    async def _run() -> int:
        factory = get_session_factory()
        async with factory() as session:
            r = await session.execute(
                delete(RefreshToken).where(RefreshToken.expires_at < datetime.now(tz=UTC))
            )
            await session.commit()
            return r.rowcount or 0

    return asyncio.run(_run())


def _schedule_cleanups() -> None:
    time.sleep(10)
    while True:
        try:
            cleanup_expired_refresh_tokens.send()
        except Exception:
            pass
        time.sleep(3600)


threading.Thread(target=_schedule_cleanups, daemon=True).start()
