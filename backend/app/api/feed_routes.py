from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.envelope import Envelope
from app.db.models import FeedProfile, User
from app.db.session import get_db
from app.schemas.profile import user_to_profile

router = APIRouter(prefix="/api", tags=["Feed"])


@router.get("/feed")
async def get_feed(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(User)
        .join(FeedProfile, FeedProfile.user_id == User.id)
        .where(FeedProfile.is_active.is_(True), User.id != user.id)
        .order_by(FeedProfile.sort_order.asc())
    )
    users = result.scalars().all()
    return Envelope.ok([user_to_profile(u).model_dump(by_alias=True) for u in users])
