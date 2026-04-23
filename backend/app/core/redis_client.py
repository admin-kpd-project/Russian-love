import redis.asyncio as redis

from app.config.settings import get_settings

_pool: redis.ConnectionPool | None = None


async def get_redis_pool() -> redis.ConnectionPool:
    global _pool
    if _pool is None:
        s = get_settings()
        _pool = redis.ConnectionPool.from_url(
            str(s.redis_url),
            decode_responses=True,
        )
    return _pool


async def get_redis() -> redis.Redis:
    pool = await get_redis_pool()
    return redis.Redis(connection_pool=pool)


async def close_redis_pool() -> None:
    global _pool
    if _pool is not None:
        await _pool.disconnect()
        _pool = None
