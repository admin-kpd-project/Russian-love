from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_completed_user
from app.core.envelope import Envelope
from app.db.models import FeedProfile, Like, User
from app.db.session import get_db
from app.schemas.profile import user_to_profile

router = APIRouter(prefix="/api", tags=["Feed"])


@router.get("/feed")
async def get_feed(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_completed_user),
):
    liked_rows = (
        await db.execute(select(Like.to_user_id).where(Like.from_user_id == user.id))
    ).scalars().all()
    liked_ids = set(liked_rows)

    curated = await db.execute(
        select(User)
        .join(FeedProfile, FeedProfile.user_id == User.id)
        .where(FeedProfile.is_active.is_(True), User.id != user.id)
        .order_by(FeedProfile.sort_order.asc())
    )
    users = [u for u in curated.scalars().all() if u.id not in liked_ids and u.is_active]

    if not users:
        fallback = await db.execute(
            select(User).where(User.id != user.id, User.is_active.is_(True)).order_by(User.created_at.desc())
        )
        users = [u for u in fallback.scalars().all() if u.id not in liked_ids]
    return Envelope.ok([user_to_profile(u).model_dump(by_alias=True) for u in users])
