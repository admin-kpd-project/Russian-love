"""Staff admin API (web admin panel). Roles: admin, moderator, support."""

from datetime import UTC, date, datetime
from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user_optional, require_roles
from app.config.settings import get_settings
from app.core.envelope import Envelope
from app.core.security import hash_password
from app.core.site_settings import KEY_MOBILE_APK_URL, get_site_value, set_site_value
from app.db.models import SiteSetting, SupportTicket, User, UserReport
from app.db.session import get_db
from app.schemas.profile import user_to_profile
from app.schemas.support import AdminPatchReportBody, AdminPatchTicketBody, report_to_out, ticket_to_out

router = APIRouter(prefix="/api/admin", tags=["Admin"])

_staff = require_roles("admin", "moderator", "support")
_mod = require_roles("admin", "moderator")
_admin_only = require_roles("admin")

_DEFAULT_AVATAR = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400"


def _read_gate(user: User | None, *, need_mod: bool) -> JSONResponse | None:
    """None = OK. When admin_public_panel is off, require staff JWT."""
    s = get_settings()
    if s.admin_public_panel:
        return None
    if user is None:
        return JSONResponse(status_code=401, content=Envelope.err("Требуется вход"))
    role = getattr(user, "user_role", None) or "user"
    if need_mod:
        if role not in ("admin", "moderator"):
            return JSONResponse(status_code=403, content=Envelope.err("Недостаточно прав"))
    elif role not in ("admin", "moderator", "support"):
        return JSONResponse(status_code=403, content=Envelope.err("Недостаточно прав"))
    return None


class AdminPublicCreateUserBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    email: EmailStr
    password: str = Field(min_length=6, max_length=200)
    name: str = Field(min_length=1, max_length=200)
    role: Literal["user", "admin", "moderator", "support"] = "user"


class MobileApkSettingBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    download_url: str | None = Field(default=None, alias="downloadUrl", max_length=4000)


@router.get("/mobile-apk")
async def admin_get_mobile_apk(
    _: User = Depends(_admin_only),
    db: AsyncSession = Depends(get_db),
):
    row = (await db.execute(select(SiteSetting).where(SiteSetting.key == KEY_MOBILE_APK_URL))).scalar_one_or_none()
    url = (row.value or "").strip() if row and row.value else ""
    updated = None
    if row and row.updated_at is not None:
        updated = row.updated_at.astimezone(UTC).isoformat().replace("+00:00", "Z")
    return Envelope.ok({"downloadUrl": url or None, "updatedAt": updated})


@router.patch("/mobile-apk")
async def admin_patch_mobile_apk(
    body: MobileApkSettingBody,
    _: User = Depends(_admin_only),
    db: AsyncSession = Depends(get_db),
):
    raw = body.download_url
    if raw is not None and not str(raw).strip():
        raw = None
    elif raw is not None:
        raw = str(raw).strip()
    await set_site_value(db, KEY_MOBILE_APK_URL, raw)
    url = await get_site_value(db, KEY_MOBILE_APK_URL)
    return Envelope.ok({"downloadUrl": url or None})


@router.post("/public/users", status_code=201)
async def admin_public_create_user(
    body: AdminPublicCreateUserBody,
    db: AsyncSession = Depends(get_db),
):
    if not get_settings().admin_public_user_create:
        return JSONResponse(status_code=404, content=Envelope.err("Not found"))
    email = str(body.email).strip().lower()
    exists = await db.execute(select(User).where(User.email == email))
    if exists.scalar_one_or_none():
        return JSONResponse(status_code=409, content=Envelope.err("Email уже занят"))
    user = User(
        email=email,
        password_hash=hash_password(body.password),
        display_name=body.name.strip()[:200],
        birth_date=date(1990, 1, 1),
        gender="male",
        phone=None,
        profile_completed=True,
        avatar_url=_DEFAULT_AVATAR,
        photos=[],
        bio="",
        interests=[],
        user_role=body.role,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return Envelope.ok(
        {
            "user": user_to_profile(user).model_dump(by_alias=True),
        }
    )


@router.get("/stats")
async def admin_stats(
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_current_user_optional),
):
    gate = _read_gate(user, need_mod=False)
    if gate is not None:
        return gate
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
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_current_user_optional),
):
    gate = _read_gate(user, need_mod=False)
    if gate is not None:
        return gate
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
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_current_user_optional),
):
    gate = _read_gate(user, need_mod=True)
    if gate is not None:
        return gate
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
