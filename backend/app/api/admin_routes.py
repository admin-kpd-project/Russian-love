"""Staff admin API (web admin panel). Roles: admin, moderator, support."""

from datetime import UTC, datetime
from uuid import UUID

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_roles
from app.core.envelope import Envelope
from app.db.models import SupportTicket, User, UserReport
from app.db.session import get_db
from app.schemas.support import AdminPatchReportBody, AdminPatchTicketBody, report_to_out, ticket_to_out

router = APIRouter(prefix="/api/admin", tags=["Admin"])

_staff = require_roles("admin", "moderator", "support")
_mod = require_roles("admin", "moderator")
_admin_only = require_roles("admin")


@router.get("/stats")
async def admin_stats(
    _: User = Depends(_staff),
    db: AsyncSession = Depends(get_db),
):
    open_tickets = await db.scalar(select(func.count()).select_from(SupportTicket).where(SupportTicket.status == "open"))
    open_reports = await db.scalar(select(func.count()).select_from(UserReport).where(UserReport.status == "open"))
    return Envelope.ok(
        {
            "openTickets": int(open_tickets or 0),
            "openReports": int(open_reports or 0),
        }
    )


@router.get("/tickets")
async def list_all_tickets(
    _: User = Depends(_staff),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(SupportTicket).order_by(SupportTicket.created_at.desc()))
    rows = result.scalars().all()
    return Envelope.ok([ticket_to_out(t).model_dump(by_alias=True) for t in rows])


@router.patch("/tickets/{ticket_id}")
async def patch_ticket(
    ticket_id: UUID,
    body: AdminPatchTicketBody,
    _: User = Depends(_staff),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(SupportTicket).where(SupportTicket.id == ticket_id))
    t = result.scalar_one_or_none()
    if t is None:
        return JSONResponse(status_code=404, content=Envelope.err("Обращение не найдено"))
    if body.status is not None:
        t.status = body.status
    if body.staff_reply is not None:
        t.staff_reply = body.staff_reply.strip()[:8000]
    t.updated_at = datetime.now(UTC)
    await db.flush()
    await db.refresh(t)
    return Envelope.ok(ticket_to_out(t).model_dump(by_alias=True))


@router.get("/reports")
async def list_all_reports(
    _: User = Depends(_mod),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(UserReport).order_by(UserReport.created_at.desc()))
    rows = result.scalars().all()
    return Envelope.ok([report_to_out(r).model_dump(by_alias=True) for r in rows])


@router.patch("/reports/{report_id}")
async def patch_report(
    report_id: UUID,
    body: AdminPatchReportBody,
    moderator: User = Depends(_mod),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(UserReport).where(UserReport.id == report_id))
    r = result.scalar_one_or_none()
    if r is None:
        return JSONResponse(status_code=404, content=Envelope.err("Жалоба не найдена"))
    r.status = body.status
    if body.status in {"resolved", "dismissed"}:
        r.resolved_at = datetime.now(UTC)
        r.resolved_by_id = moderator.id
    await db.flush()
    await db.refresh(r)
    return Envelope.ok(report_to_out(r).model_dump(by_alias=True))


@router.post("/users/{user_id}/deactivate")
async def deactivate_user(
    user_id: UUID,
    _: User = Depends(_mod),
    db: AsyncSession = Depends(get_db),
):
    """Moderator/admin: block user account (support role cannot call)."""
    result = await db.execute(select(User).where(User.id == user_id))
    target = result.scalar_one_or_none()
    if target is None:
        return JSONResponse(status_code=404, content=Envelope.err("Пользователь не найден"))
    target.is_active = False
    await db.flush()
    return Envelope.ok({"ok": True, "userId": str(user_id)})


@router.post("/users/{user_id}/activate")
async def activate_user(
    user_id: UUID,
    _: User = Depends(_admin_only),
    db: AsyncSession = Depends(get_db),
):
    """Admin only: restore account."""
    result = await db.execute(select(User).where(User.id == user_id))
    target = result.scalar_one_or_none()
    if target is None:
        return JSONResponse(status_code=404, content=Envelope.err("Пользователь не найден"))
    target.is_active = True
    await db.flush()
    return Envelope.ok({"ok": True, "userId": str(user_id)})
