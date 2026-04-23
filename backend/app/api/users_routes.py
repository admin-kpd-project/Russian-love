from uuid import UUID

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.envelope import Envelope
from app.db.models import User
from app.db.session import get_db
from app.schemas.profile import ProfilePatch, user_to_profile

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/me")
async def me(user: User = Depends(get_current_user)):
    return Envelope.ok(user_to_profile(user).model_dump(by_alias=True))


@router.patch("/me")
async def patch_me(
    body: ProfilePatch,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if body.name is not None:
        user.display_name = body.name.strip()[:200]
    if body.bio is not None:
        user.bio = body.bio
    if body.location is not None:
        user.location = body.location[:200]
    if body.avatar_url is not None:
        user.avatar_url = body.avatar_url
    if body.interests is not None:
        user.interests = body.interests
    if body.personality is not None:
        user.personality = body.personality
    if body.astrology is not None:
        user.astrology = body.astrology
    if body.numerology is not None:
        user.numerology = body.numerology
    await db.flush()
    from app.core.redis_client import get_redis

    r = await get_redis()
    await r.delete(f"profile:{user.id}")
    return Envelope.ok(user_to_profile(user).model_dump(by_alias=True))


@router.get("/{user_id}")
async def get_user_profile(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    from app.core.redis_client import get_redis

    r = await get_redis()
    cache_key = f"profile:{user_id}"
    cached = await r.get(cache_key)
    if cached:
        import json

        return Envelope.ok(json.loads(cached))
    result = await db.execute(select(User).where(User.id == user_id))
    u = result.scalar_one_or_none()
    if u is None:
        return JSONResponse(status_code=404, content=Envelope.err("Пользователь не найден"))
    payload = user_to_profile(u).model_dump(by_alias=True)
    import json

    await r.setex(cache_key, 300, json.dumps(payload, default=str))
    return Envelope.ok(payload)
