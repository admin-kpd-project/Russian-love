"""Публичные эндпоинты без авторизации (лендинг)."""

from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.envelope import Envelope
from app.core.site_settings import KEY_MOBILE_APK_URL, get_site_value
from app.db.session import get_db

router = APIRouter(prefix="/api/public", tags=["Public"])
DEFAULT_APK_FILENAME = "RussianLove-app-release.apk"
DEFAULT_APK_PATH = Path(__file__).resolve().parents[3] / DEFAULT_APK_FILENAME


@router.get("/mobile-apk/file", name="public_mobile_apk_file")
async def public_mobile_apk_file():
    if not DEFAULT_APK_PATH.is_file():
        raise HTTPException(status_code=404, detail="APK file is not available")
    return FileResponse(
        path=DEFAULT_APK_PATH,
        media_type="application/vnd.android.package-archive",
        filename=DEFAULT_APK_FILENAME,
    )


@router.get("/mobile-apk")
async def public_mobile_apk(db: AsyncSession = Depends(get_db)):
    url = await get_site_value(db, KEY_MOBILE_APK_URL)
    fallback_url = "/api/public/mobile-apk/file"
    return Envelope.ok({"downloadUrl": (url or fallback_url).strip()})
