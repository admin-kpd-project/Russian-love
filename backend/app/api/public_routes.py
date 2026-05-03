"""Публичные эндпоинты без авторизации (лендинг)."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.envelope import Envelope
from app.core.site_settings import KEY_MOBILE_APK_URL, get_site_value
from app.db.session import get_db

router = APIRouter(prefix="/api/public", tags=["Public"])


@router.get("/mobile-apk")
async def public_mobile_apk(db: AsyncSession = Depends(get_db)):
    url = await get_site_value(db, KEY_MOBILE_APK_URL)
    return Envelope.ok({"downloadUrl": url or ""})
