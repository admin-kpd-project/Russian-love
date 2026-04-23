"""Per-IP fixed 1-second window using Redis INCR (burst ≈ max events per second)."""

from fastapi import Request

from app.core.redis_client import get_redis


async def allow_request(request: Request, *, key_prefix: str, max_per_second: int) -> bool:
    client_ip = request.client.host if request.client else "unknown"
    import time

    bucket = int(time.time())
    key = f"{key_prefix}:{client_ip}:{bucket}"
    r = await get_redis()
    n = await r.incr(key)
    if n == 1:
        await r.expire(key, 2)
    return n <= max_per_second
