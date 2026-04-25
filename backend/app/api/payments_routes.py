import hashlib
import hmac
import logging
import uuid
from datetime import UTC, datetime
from typing import Any
from uuid import UUID

import httpx
from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.config.settings import get_settings
from app.core.envelope import Envelope
from app.core.payment_entitlements import apply_paid_entitlement, order_id_to_payment_uuid
from app.core.tbank import tbank_token, tinkoff_init
from app.db.models import Payment, User
from app.db.session import get_db

log = logging.getLogger(__name__)

router = APIRouter(prefix="/api/payments", tags=["Payments"])


class CreatePaymentBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    kind: str = Field(default="subscription")
    amount_minor: int = Field(alias="amountMinor", ge=1)
    currency: str = Field(default="RUB")
    metadata: dict | None = None


def _tinkoff_base() -> str:
    s = get_settings()
    if s.tbank_base_url:
        return s.tbank_base_url.rstrip("/")
    if s.tbank_sandbox:
        return "https://rest-api-test.tinkoff.ru"
    return "https://securepay.tinkoff.ru"


def _verify_tinkoff_notification_token(body: dict[str, Any], password: str) -> bool:
    if "Token" not in body:
        return False
    expect = str(body.get("Token", ""))
    calc = tbank_token({k: v for k, v in body.items() if k != "Token"}, password)
    return hmac.compare_digest(expect.lower(), calc.lower())


@router.post("/tbank/init")
async def tbank_init(
    body: CreatePaymentBody,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    settings = get_settings()
    order_key = str(uuid.uuid4())
    pay = Payment(
        user_id=user.id,
        provider="tbank",
        kind=body.kind,
        status="pending",
        amount_minor=body.amount_minor,
        currency=body.currency,
        external_payment_id=order_key,
        meta=body.metadata or {},
    )
    db.add(pay)
    await db.flush()
    public_web = settings.public_web_url.rstrip("/")
    public_api = settings.public_api_url.rstrip("/")
    payment_id_str = str(pay.id)
    success_url = f"{public_web}/payment/confirm?paymentId={payment_id_str}"
    fail_url = f"{public_web}/payment/confirm?paymentId={payment_id_str}&status=failed"
    notif = f"{public_api}/api/payments/tbank/webhook"

    tk = (settings.tbank_terminal_key or "").strip()
    pwd = (settings.tbank_password.get_secret_value() if settings.tbank_password else "") or ""
    if tk and pwd:
        # OrderId in Tinkoff: must be unique; use our payment UUID
        new_order = payment_id_str
        pay.external_payment_id = new_order
        try:
            desc = f"Оплата {body.kind} ({user.display_name})"
            result = await tinkoff_init(
                base_url=_tinkoff_base(),
                terminal_key=tk,
                password=pwd,
                order_id=new_order,
                amount_minor=body.amount_minor,
                description=desc[:200],
                success_url=success_url,
                fail_url=fail_url,
                notification_url=notif,
            )
        except (httpx.RequestError, RuntimeError) as e:
            log.exception("Tinkoff Init failed: %s", e)
            return JSONResponse(
                status_code=502, content=Envelope.err("Платёжный шлюз недоступен. Попробуйте позже.")
            )
        err_init = int(result.get("ErrorCode") or 0)
        if result.get("Success") is False or err_init != 0:
            msg = str(result.get("Message") or result.get("Details") or "Ошибка T-Bank")
            log.warning("Tinkoff Init err: %s", result)
            return JSONResponse(status_code=400, content=Envelope.err(msg))
        purl = result.get("PaymentURL")
        if not purl:
            return JSONResponse(status_code=400, content=Envelope.err("Нет ссылки на оплату (PaymentURL)"))
        meta = dict(pay.meta or {})
        if result.get("PaymentId") is not None:
            meta["tinkoffPaymentId"] = result.get("PaymentId")
        pay.meta = meta
        return Envelope.ok(
            {
                "paymentId": str(pay.id),
                "orderId": new_order,
                "provider": "tbank",
                "paymentUrl": purl,
                "status": pay.status,
            }
        )

    return Envelope.ok(
        {
            "paymentId": str(pay.id),
            "orderId": order_key,
            "provider": "tbank",
            "paymentUrl": f"{public_web}/payment/confirm?paymentId={payment_id_str}",
            "status": pay.status,
        }
    )


@router.get("/{payment_id}")
async def get_payment(
    payment_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        pid = uuid.UUID(payment_id)
    except ValueError:
        return JSONResponse(status_code=400, content=Envelope.err("Некорректный payment_id"))
    pay = (await db.execute(select(Payment).where(Payment.id == pid))).scalar_one_or_none()
    if pay is None or pay.user_id != user.id:
        return JSONResponse(status_code=404, content=Envelope.err("Платеж не найден"))
    return Envelope.ok(
        {
            "id": str(pay.id),
            "provider": pay.provider,
            "status": pay.status,
            "kind": pay.kind,
            "amountMinor": pay.amount_minor,
            "currency": pay.currency,
            "orderId": pay.external_payment_id,
            "metadata": pay.meta or {},
            "updatedAt": pay.updated_at.astimezone(UTC).isoformat().replace("+00:00", "Z"),
        }
    )


@router.post("/tbank/webhook")
async def tbank_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    settings = get_settings()
    raw = await request.body()
    try:
        import json

        body = json.loads(raw.decode("utf-8") or "{}")
    except Exception:
        return JSONResponse(status_code=400, content=Envelope.err("Invalid JSON"))
    if not body:
        return JSONResponse(status_code=400, content=Envelope.err("Empty body"))
    sig = request.headers.get("X-TBank-Signature", "")
    secret = (settings.tbank_webhook_secret or "").encode()
    if secret and len(sig) > 0:
        expected = hmac.new(secret, raw, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(expected, sig):
            return JSONResponse(status_code=401, content=Envelope.err("Invalid signature"))
    pwd = (settings.tbank_password.get_secret_value() if settings.tbank_password else "") or ""
    if pwd and body.get("TerminalKey") and "Token" in body:
        if not _verify_tinkoff_notification_token({str(k): v for k, v in body.items()}, pwd):
            log.warning("Tinkoff Token mismatch in webhook")
            return JSONResponse(status_code=401, content=Envelope.err("Invalid Tinkoff token"))
    order_id = str(
        body.get("OrderId") or body.get("orderId") or body.get("OrderID") or ""
    ).strip()
    st_up = str(body.get("Status") or body.get("status") or "").upper()
    success = body.get("Success")
    try:
        err_code = int(body.get("ErrorCode") or 0)
    except (TypeError, ValueError):
        err_code = 0

    if err_code != 0 and success is not True and st_up != "CONFIRMED":
        internal = "failed"
    elif st_up == "CONFIRMED" and err_code == 0:
        internal = "paid"
    elif st_up in ("CANCELED", "CANCELLED", "REJECTED", "REVERSED", "DEADLINE_EXPIRED", "REJECTED", "CANCELLED"):
        internal = "failed"
    elif success is True and err_code == 0 and st_up in ("AUTHORIZED", "CONFIRMED", ""):
        internal = "paid"
    elif success is False:
        internal = "failed"
    else:
        internal = "pending"
    if not order_id:
        return JSONResponse(status_code=400, content=Envelope.err("OrderId required"))
    oid = order_id_to_payment_uuid(order_id) or order_id
    if isinstance(oid, UUID):
        pay = (await db.execute(select(Payment).where(Payment.id == oid))).scalar_one_or_none()
    else:
        pay = (await db.execute(select(Payment).where(Payment.external_payment_id == order_id))).scalar_one_or_none()
    if not pay:
        return JSONResponse(status_code=404, content=Envelope.err("Payment not found"))
    user = (await db.execute(select(User).where(User.id == pay.user_id))).scalar_one_or_none()
    if not user:
        return JSONResponse(status_code=404, content=Envelope.err("User not found"))
    if internal is None and pay.status == "pending":
        internal = "pending"
    if internal == "paid" and pay.status != "paid":
        pay.status = "paid"
        pay.updated_at = datetime.now(tz=UTC)
        tmeta = dict(pay.meta or {})
        if "PaymentId" in body or body.get("PaymentId") is not None:
            tmeta["tinkoffPaymentId"] = body.get("PaymentId")
        pay.meta = tmeta
        await apply_paid_entitlement(db, pay, user)
    elif internal == "failed" and pay.status not in ("paid",):
        pay.status = "failed"
        pay.updated_at = datetime.now(tz=UTC)
    return Envelope.ok({"ok": True, "status": pay.status})


# Alias for Tinkoff docs that use different path
@router.post("/tbank/notify")
async def tbank_notify(request: Request, db: AsyncSession = Depends(get_db)):
    return await tbank_webhook(request, db)
