import secrets
import urllib.parse
from datetime import UTC, datetime

import httpx
from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.settings import get_settings
from app.core.envelope import Envelope
from app.core.redis_client import get_redis
from app.core.security import (
    create_access_token,
    hash_password,
    hash_refresh_token,
    new_refresh_token,
    refresh_expires_at,
    verify_password,
)
from app.db.models import RefreshToken, User
from app.db.session import get_db
from app.schemas.profile import LoginBody, LogoutBody, RefreshBody, RegisterBody, user_to_profile

router = APIRouter(prefix="/api/auth", tags=["Auth"])


def _auth_response(user: User, access: str, refresh_plain: str) -> dict:
    return {
        "accessToken": access,
        "refreshToken": refresh_plain,
        "user": user_to_profile(user).model_dump(by_alias=True),
    }


async def _issue_tokens(db: AsyncSession, user: User) -> tuple[str, str]:
    access = create_access_token(user.id)
    plain, th = new_refresh_token()
    rt = RefreshToken(
        user_id=user.id,
        token_hash=th,
        expires_at=refresh_expires_at(),
    )
    db.add(rt)
    await db.flush()
    return access, plain


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(body: RegisterBody, db: AsyncSession = Depends(get_db)):
    if body.agree_privacy is False or body.agree_terms is False or body.agree_offer is False:
        return JSONResponse(
            status_code=400,
            content=Envelope.err("Необходимо согласие с условиями"),
        )
    email = str(body.email).strip().lower()
    exists = await db.execute(select(User).where(User.email == email))
    if exists.scalar_one_or_none():
        return JSONResponse(status_code=409, content=Envelope.err("Email уже занят"))
    user = User(
        email=email,
        password_hash=hash_password(body.password),
        display_name=body.name.strip(),
        birth_date=body.birth_date,
        phone=body.phone,
    )
    db.add(user)
    await db.flush()
    access, refresh_plain = await _issue_tokens(db, user)
    await db.refresh(user)
    return Envelope.ok(_auth_response(user, access, refresh_plain))


@router.post("/login")
async def login(body: LoginBody, db: AsyncSession = Depends(get_db)):
    email = str(body.email).strip().lower()
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user is None or not verify_password(body.password, user.password_hash):
        return JSONResponse(status_code=401, content=Envelope.err("неверный email или пароль"))
    access, refresh_plain = await _issue_tokens(db, user)
    return Envelope.ok(_auth_response(user, access, refresh_plain))


@router.post("/refresh")
async def refresh_token(body: RefreshBody, db: AsyncSession = Depends(get_db)):
    if not body.refresh_token:
        return JSONResponse(status_code=400, content=Envelope.err("refreshToken обязателен"))
    th = hash_refresh_token(body.refresh_token)
    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.token_hash == th,
            RefreshToken.revoked_at.is_(None),
            RefreshToken.expires_at > datetime.now(tz=UTC),
        )
    )
    row = result.scalar_one_or_none()
    if row is None:
        return JSONResponse(status_code=401, content=Envelope.err("Токен недействителен или истёк"))
    row.revoked_at = datetime.now(tz=UTC)
    user_result = await db.execute(select(User).where(User.id == row.user_id))
    user = user_result.scalar_one()
    access, refresh_plain = await _issue_tokens(db, user)
    return Envelope.ok({"accessToken": access, "refreshToken": refresh_plain})


@router.post("/logout")
async def logout(body: LogoutBody, db: AsyncSession = Depends(get_db)):
    if not body.refresh_token:
        return JSONResponse(status_code=400, content=Envelope.err("refreshToken обязателен"))
    th = hash_refresh_token(body.refresh_token)
    result = await db.execute(select(RefreshToken).where(RefreshToken.token_hash == th))
    row = result.scalar_one_or_none()
    if row and row.revoked_at is None:
        row.revoked_at = datetime.now(tz=UTC)
    return Envelope.ok({"ok": True})


@router.get("/yandex")
async def yandex_oauth_start():
    s = get_settings()
    if not s.yandex_client_id or not s.yandex_redirect_uri:
        return JSONResponse(
            status_code=503,
            content=Envelope.err("Yandex OAuth не настроен (DATING_YANDEX_CLIENT_ID / REDIRECT_URI)"),
        )
    state = secrets.token_urlsafe(32)
    r = await get_redis()
    await r.setex(f"oauth:yandex:state:{state}", 600, "1")
    params = {
        "response_type": "code",
        "client_id": s.yandex_client_id,
        "redirect_uri": s.yandex_redirect_uri,
        "scope": "login:email login:info login:avatar",
        "state": state,
    }
    url = "https://oauth.yandex.ru/authorize?" + urllib.parse.urlencode(params)
    return RedirectResponse(url=url, status_code=307)


@router.get("/yandex/callback")
async def yandex_callback(code: str, state: str, db: AsyncSession = Depends(get_db)):
    r = await get_redis()
    if not await r.get(f"oauth:yandex:state:{state}"):
        return JSONResponse(status_code=400, content=Envelope.err("Неверный или истёкший state"))
    await r.delete(f"oauth:yandex:state:{state}")
    s = get_settings()
    if not s.yandex_client_secret or not s.yandex_redirect_uri:
        return JSONResponse(status_code=500, content=Envelope.err("Сервер не настроен"))
    async with httpx.AsyncClient() as client:
        tr = await client.post(
            "https://oauth.yandex.ru/token",
            data={
                "grant_type": "authorization_code",
                "code": code,
                "client_id": s.yandex_client_id,
                "client_secret": s.yandex_client_secret.get_secret_value(),
                "redirect_uri": s.yandex_redirect_uri,
            },
        )
        if tr.status_code != 200:
            return JSONResponse(status_code=400, content=Envelope.err("Ошибка обмена кода Yandex"))
        access_y = tr.json().get("access_token")
        info_r = await client.get(
            "https://login.yandex.ru/info?format=json",
            headers={"Authorization": f"OAuth {access_y}"},
        )
        if info_r.status_code != 200:
            return JSONResponse(status_code=502, content=Envelope.err("Ошибка профиля Yandex"))
        info = info_r.json()
    yid = str(info.get("id", ""))
    if not yid:
        return JSONResponse(status_code=502, content=Envelope.err("Пустой профиль Yandex"))
    email = (info.get("default_email") or info.get("login") or f"{yid}@yandex.oauth")[:320]
    display = info.get("display_name") or info.get("real_name") or email.split("@")[0]
    avatar = info.get("default_avatar_id") and f"https://avatars.yandex.net/get-yapic/{info['default_avatar_id']}/islands-200"
    result = await db.execute(select(User).where(User.yandex_id == yid))
    user = result.scalar_one_or_none()
    if user is None:
        user = User(
            yandex_id=yid,
            email=email.lower(),
            display_name=display[:200],
            password_hash=None,
            avatar_url=avatar,
        )
        db.add(user)
    else:
        user.display_name = display[:200]
        user.avatar_url = avatar or user.avatar_url
        user.email = email.lower()
    await db.flush()
    access, refresh_plain = await _issue_tokens(db, user)
    await db.refresh(user)
    return Envelope.ok(_auth_response(user, access, refresh_plain))


@router.get("/messenger")
async def messenger_stub():
    return JSONResponse(
        status_code=501,
        content=Envelope.err("MESSENGER_PROVIDER не настроен"),
    )


@router.get("/messenger/callback")
async def messenger_callback_stub():
    return JSONResponse(
        status_code=501,
        content=Envelope.err("MESSENGER_PROVIDER не настроен"),
    )
