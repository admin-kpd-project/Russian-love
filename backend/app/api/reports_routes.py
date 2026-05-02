"""User-submitted reports about other users."""

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.envelope import Envelope
from app.db.models import User, UserReport
from app.db.session import get_db
from app.schemas.support import CreateUserReportBody, report_to_out

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.post("")
async def create_report(
    body: CreateUserReportBody,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if body.reported_user_id == user.id:
        return JSONResponse(status_code=400, content=Envelope.err("Нельзя пожаловаться на себя"))
    exists = await db.execute(select(User).where(User.id == body.reported_user_id))
    target = exists.scalar_one_or_none()
    if target is None:
        return JSONResponse(status_code=404, content=Envelope.err("Пользователь не найден"))
    r = UserReport(
        reporter_id=user.id,
        reported_user_id=body.reported_user_id,
        reason=body.reason.strip()[:4000],
        status="open",
    )
    db.add(r)
    await db.flush()
    await db.refresh(r)
    return Envelope.ok(report_to_out(r).model_dump(by_alias=True))


@router.get("")
async def list_my_reports(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(UserReport).where(UserReport.reporter_id == user.id).order_by(UserReport.created_at.desc())
    )
    rows = result.scalars().all()
    return Envelope.ok([report_to_out(r).model_dump(by_alias=True) for r in rows])
