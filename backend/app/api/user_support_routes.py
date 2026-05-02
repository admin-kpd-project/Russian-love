"""User-facing support tickets (authenticated)."""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.envelope import Envelope
from app.db.models import SupportTicket, User
from app.db.session import get_db
from app.schemas.support import CreateSupportTicketBody, ticket_to_out

router = APIRouter(prefix="/api/support", tags=["Support"])


@router.post("/tickets")
async def create_ticket(
    body: CreateSupportTicketBody,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    t = SupportTicket(
        user_id=user.id,
        subject=body.subject.strip()[:500],
        message=body.message.strip()[:8000],
        status="open",
    )
    db.add(t)
    await db.flush()
    await db.refresh(t)
    return Envelope.ok(ticket_to_out(t).model_dump(by_alias=True))


@router.get("/tickets")
async def list_my_tickets(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SupportTicket).where(SupportTicket.user_id == user.id).order_by(SupportTicket.created_at.desc())
    )
    rows = result.scalars().all()
    return Envelope.ok([ticket_to_out(t).model_dump(by_alias=True) for t in rows])
