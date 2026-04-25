"""T-Bank (Tinkoff) Acquiring API v2: request signing and HTTP init."""

from __future__ import annotations

import hashlib
import json
import logging
from typing import Any

import httpx

log = logging.getLogger(__name__)

# Root keys that must not participate in Token (Tinkoff e2c v2)
_TOKEN_EXCLUDE = frozenset(
    {
        "Token",
        "token",
        "Receipt",
        "Shops",
        "DATA",
        "Data",
        "Receipts",
    }
)


def tbank_token(params: dict[str, Any], password: str) -> str:
    """
    Tinkoff v2: sort root keys A–Z, concatenate *values* only, append Password, SHA-256 hex.
    Nested objects are typically excluded; only scalar root values are included.
    """
    parts: list[tuple[str, str]] = []
    for k, v in params.items():
        if k in _TOKEN_EXCLUDE:
            continue
        if isinstance(v, (dict, list)):
            continue
        if v is None:
            continue
        if v is False:
            parts.append((k, "false"))
        elif v is True:
            parts.append((k, "true"))
        else:
            parts.append((k, str(v)))
    parts.sort(key=lambda x: x[0])
    concat = "".join(p[1] for p in parts) + password
    return hashlib.sha256(concat.encode("utf-8")).hexdigest()


async def tinkoff_init(
    *,
    base_url: str,
    terminal_key: str,
    password: str,
    order_id: str,
    amount_minor: int,
    description: str,
    success_url: str,
    fail_url: str,
    notification_url: str | None,
) -> dict[str, Any]:
    """
    POST /v2/Init. Returns parsed JSON (Success, PaymentURL, ErrorCode, Message, ...).
    """
    path = base_url.rstrip("/") + "/v2/Init" if "://" in base_url else f"https://{base_url.rstrip('/')}/v2/Init"
    payload: dict[str, Any] = {
        "TerminalKey": terminal_key,
        "Amount": int(amount_minor),
        "OrderId": order_id,
        "Description": (description or "Оплата")[:250],
        "SuccessURL": success_url,
        "FailURL": fail_url,
    }
    if notification_url:
        payload["NotificationURL"] = notification_url
    payload["Token"] = tbank_token({**payload}, password)
    log.debug("Tinkoff Init OrderId=%s", order_id)
    async with httpx.AsyncClient(timeout=40.0) as client:
        r = await client.post(path, json=payload, headers={"Content-Type": "application/json"})
    try:
        data = r.json()
    except json.JSONDecodeError as e:
        log.warning("Tinkoff Init non-JSON: %s", r.text[:200])
        raise RuntimeError("Некорректный ответ T-Bank") from e
    if not r.is_success and not isinstance(data, dict):
        r.raise_for_status()
    return data
