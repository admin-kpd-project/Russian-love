from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class CreateSupportTicketBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    subject: str = Field(min_length=1, max_length=500)
    message: str = Field(min_length=1, max_length=8000)


class SupportTicketOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    userId: str
    subject: str
    message: str
    status: str
    staffReply: str | None = None
    createdAt: str
    updatedAt: str | None = None


class AdminPatchTicketBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    status: Literal["open", "in_progress", "closed"] | None = None
    staffReply: str | None = Field(default=None, alias="staffReply", max_length=8000)


class CreateUserReportBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    reported_user_id: UUID = Field(alias="reportedUserId")
    reason: str = Field(min_length=1, max_length=4000)


class UserReportOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    reporterId: str
    reportedUserId: str
    reason: str
    status: str
    createdAt: str
    resolvedAt: str | None = None
    resolvedById: str | None = None


class AdminPatchReportBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    status: Literal["open", "resolved", "dismissed"]


def ticket_to_out(t) -> SupportTicketOut:
    from datetime import UTC

    created = t.created_at
    updated = getattr(t, "updated_at", None)
    ca = created.astimezone(UTC).isoformat().replace("+00:00", "Z")
    ua = None
    if updated is not None:
        ua = updated.astimezone(UTC).isoformat().replace("+00:00", "Z")
    return SupportTicketOut(
        id=str(t.id),
        userId=str(t.user_id),
        subject=t.subject,
        message=t.message,
        status=t.status,
        staffReply=t.staff_reply,
        createdAt=ca,
        updatedAt=ua,
    )


def report_to_out(r) -> UserReportOut:
    from datetime import UTC

    ca = r.created_at.astimezone(UTC).isoformat().replace("+00:00", "Z")
    ra = None
    if r.resolved_at is not None:
        ra = r.resolved_at.astimezone(UTC).isoformat().replace("+00:00", "Z")
    rb = str(r.resolved_by_id) if r.resolved_by_id else None
    return UserReportOut(
        id=str(r.id),
        reporterId=str(r.reporter_id),
        reportedUserId=str(r.reported_user_id),
        reason=r.reason,
        status=r.status,
        createdAt=ca,
        resolvedAt=ra,
        resolvedById=rb,
    )
