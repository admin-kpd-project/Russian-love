"""Apply in-app entitlements when a payment is confirmed paid."""

from __future__ import annotations

import logging
from datetime import UTC, datetime, timedelta
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.redis_client import get_redis
from app.db.models import Payment, User

log = logging.getLogger(__name__)


async def apply_paid_entitlement(db: AsyncSession, pay: Payment, user: User) -> None:
    if user.id != pay.user_id:
        log.warning("apply_paid_entitlement user mismatch")
        return
    kind = (pay.kind or "").lower()
    meta: dict = dict(pay.meta or {})
    if kind in {"subscription", "subscription_1m", "subscription_3m", "subscription_6m"} or kind.startswith("subscription"):
        months = int(meta.get("planMonths", meta.get("plan_months", 1)))
        days = int(meta.get("planDays", 30 * max(1, months)))
        end = datetime.now(UTC) + timedelta(days=days)
        if user.premium_until and user.premium_until > datetime.now(UTC):
            user.premium_until = user.premium_until + timedelta(days=days)
        else:
            user.premium_until = end
        user.is_premium = True
    elif kind in {"superlike_pack", "superlikes", "super_likes"}:
        n = int(meta.get("packAmount", meta.get("pack_amount", 5)))
        user.super_likes_balance = (user.super_likes_balance or 0) + max(0, n)
    elif kind in {"analysis", "detailed_analysis"}:
        raw = str(meta.get("targetUserId", meta.get("target_user_id", "")))
        if raw:
            ids: list = list(user.purchased_analysis_user_ids or [])
            if raw not in ids:
                ids.append(raw)
            user.purchased_analysis_user_ids = ids
    elif kind in {"analysis_unlimited", "detailed_analysis_unlimited"}:
        user.has_unlimited_analysis = True
    else:
        log.info("No profile entitlement for kind=%s", kind)

    r = await get_redis()
    await r.delete(f"profile:{user.id}")


def order_id_to_payment_uuid(order_id: str) -> UUID | None:
    try:
        return UUID(str(order_id).strip())
    except ValueError:
        return None
