"""Ключ-значение для публичных настроек сайта (лендинг и т.п.)."""

from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import SiteSetting

KEY_MOBILE_APK_URL = "mobile_apk_url"


async def get_site_value(db: AsyncSession, key: str) -> str | None:
    row = (await db.execute(select(SiteSetting).where(SiteSetting.key == key))).scalar_one_or_none()
    if row is None or row.value is None:
        return None
    v = row.value.strip()
    return v or None


async def set_site_value(db: AsyncSession, key: str, value: str | None) -> None:
    cleaned = None if value is None else ((value or "").strip() or None)
    row = (await db.execute(select(SiteSetting).where(SiteSetting.key == key))).scalar_one_or_none()
    now = datetime.now(tz=UTC)
    if row is None:
        db.add(SiteSetting(key=key, value=cleaned, updated_at=now))
    else:
        row.value = cleaned
        row.updated_at = now
    await db.flush()
