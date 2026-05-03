"""Обновление last_seen_at для текущего пользователя (с троттлингом)."""

from datetime import UTC, datetime, timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import User

_TOUCH_INTERVAL = timedelta(seconds=45)


async def touch_user_presence(db: AsyncSession, user: User) -> None:
    """Пишет last_seen_at не чаще чем раз в _TOUCH_INTERVAL; сбрасывает кэш профиля в Redis."""
    now = datetime.now(UTC)
    ls = getattr(user, "last_seen_at", None)
    if ls is not None:
        try:
            lu = ls if ls.tzinfo else ls.replace(tzinfo=UTC)
            if (now - lu.astimezone(UTC)) < _TOUCH_INTERVAL:
                return
        except Exception:
            pass
    user.last_seen_at = now
    await db.flush()
    try:
        from app.core.redis_client import get_redis

        r = await get_redis()
        await r.delete(f"profile:{user.id}")
    except Exception:
        pass
