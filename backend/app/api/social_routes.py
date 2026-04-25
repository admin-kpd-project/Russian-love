from datetime import UTC, datetime
from uuid import UUID

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_completed_user
from app.core.envelope import Envelope
from app.core.redis_client import get_redis
from app.db.models import InviteCode, Like, Match, Notification, ProfileRecommendation, User, UserFavorite
from app.db.session import get_db
from app.schemas.profile import user_to_profile

router = APIRouter(prefix="/api", tags=["Social"])


class LikeBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    user_id: UUID = Field(alias="userId")


class InviteCreateBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    code: str | None = None


class RecommendBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    to_user_id: UUID = Field(alias="toUserId")
    target_user_id: UUID = Field(alias="targetUserId")


def _pair(a: UUID, b: UUID) -> tuple[UUID, UUID]:
    return (a, b) if str(a) < str(b) else (b, a)


async def _create_notification(
    db: AsyncSession,
    *,
    user_id: UUID,
    n_type: str,
    title: str,
    message: str,
    payload: dict | None = None,
) -> None:
    db.add(
        Notification(
            user_id=user_id,
            type=n_type,
            title=title,
            message=message,
            payload=payload,
        )
    )
    await db.flush()


@router.post("/likes")
async def like_user(
    body: LikeBody,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_completed_user),
):
    if body.user_id == user.id:
        return JSONResponse(status_code=400, content=Envelope.err("Нельзя лайкнуть себя"))
    target = (await db.execute(select(User).where(User.id == body.user_id))).scalar_one_or_none()
    if target is None:
        return JSONResponse(status_code=404, content=Envelope.err("Пользователь не найден"))

    existing = (
        await db.execute(
            select(Like).where(Like.from_user_id == user.id, Like.to_user_id == body.user_id)
        )
    ).scalar_one_or_none()
    if not existing:
        db.add(Like(from_user_id=user.id, to_user_id=body.user_id, is_super=False))
        await _create_notification(
            db,
            user_id=body.user_id,
            n_type="like",
            title="Новый лайк",
            message=f"{user.display_name} поставил(а) вам лайк",
            payload={"peerUserId": str(user.id)},
        )

    reverse = (
        await db.execute(
            select(Like).where(Like.from_user_id == body.user_id, Like.to_user_id == user.id)
        )
    ).scalar_one_or_none()

    matched = False
    match_id: str | None = None
    if reverse:
        a, b = _pair(user.id, body.user_id)
        m = (
            await db.execute(select(Match).where(Match.user_a_id == a, Match.user_b_id == b))
        ).scalar_one_or_none()
        if not m:
            m = Match(user_a_id=a, user_b_id=b)
            db.add(m)
            await db.flush()
            await _create_notification(
                db,
                user_id=user.id,
                n_type="match",
                title="Новый match!",
                message=f"У вас взаимная симпатия с {target.display_name}",
                payload={"peerUserId": str(target.id)},
            )
            await _create_notification(
                db,
                user_id=target.id,
                n_type="match",
                title="Новый match!",
                message=f"У вас взаимная симпатия с {user.display_name}",
                payload={"peerUserId": str(user.id)},
            )
        matched = True
        match_id = str(m.id)

    return Envelope.ok({"liked": True, "matched": matched, "matchId": match_id})


def _is_premium_effective(u: User) -> bool:
    if getattr(u, "is_premium", False) and getattr(u, "premium_until", None) is None:
        return True
    until = getattr(u, "premium_until", None)
    if until is not None:
        return bool(until and until > datetime.now(UTC))
    return False


@router.post("/superlikes")
async def superlike_user(
    body: LikeBody,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_completed_user),
):
    if body.user_id == user.id:
        return JSONResponse(status_code=400, content=Envelope.err("Нельзя лайкнуть себя"))
    target = (await db.execute(select(User).where(User.id == body.user_id))).scalar_one_or_none()
    if target is None:
        return JSONResponse(status_code=404, content=Envelope.err("Пользователь не найден"))
    prem = _is_premium_effective(user)
    bal = int(getattr(user, "super_likes_balance", 0) or 0)
    if not prem and bal <= 0:
        return JSONResponse(status_code=402, content=Envelope.err("Нет суперлайков. Купите пакет или оформите подписку."))
    if not prem and bal > 0:
        user.super_likes_balance = bal - 1
    existing = (
        await db.execute(
            select(Like).where(Like.from_user_id == user.id, Like.to_user_id == body.user_id)
        )
    ).scalar_one_or_none()
    if existing:
        existing.is_super = True
    else:
        db.add(Like(from_user_id=user.id, to_user_id=body.user_id, is_super=True))
    await _create_notification(
        db,
        user_id=body.user_id,
        n_type="superlike",
        title="Суперлайк",
        message=f"{user.display_name} отправил(а) вам суперлайк",
        payload={"peerUserId": str(user.id)},
    )
    r = await get_redis()
    await r.delete(f"profile:{user.id}")
    return Envelope.ok(
        {
            "ok": True,
            "superLikesBalance": int(getattr(user, "super_likes_balance", 0) or 0),
        }
    )


@router.get("/favorites")
async def list_favorites(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_completed_user),
):
    rows = (
        await db.execute(select(UserFavorite).where(UserFavorite.user_id == user.id))
    ).scalars().all()
    out = []
    for row in rows:
        target = (await db.execute(select(User).where(User.id == row.target_user_id))).scalar_one_or_none()
        if not target:
            continue
        out.append(
            {
                "id": str(row.id),
                "createdAt": row.created_at.astimezone(UTC).isoformat().replace("+00:00", "Z") if row.created_at else None,
                "user": user_to_profile(target).model_dump(by_alias=True),
            }
        )
    return Envelope.ok(out)


@router.post("/favorites")
async def add_favorite(
    body: LikeBody,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_completed_user),
):
    if body.user_id == user.id:
        return JSONResponse(status_code=400, content=Envelope.err("Нельзя добавить себя в избранное"))
    target = (await db.execute(select(User).where(User.id == body.user_id))).scalar_one_or_none()
    if not target:
        return JSONResponse(status_code=404, content=Envelope.err("Пользователь не найден"))
    exists = (
        await db.execute(
            select(UserFavorite).where(
                UserFavorite.user_id == user.id, UserFavorite.target_user_id == body.user_id
            )
        )
    ).scalar_one_or_none()
    if not exists:
        from uuid import uuid4

        db.add(UserFavorite(id=uuid4(), user_id=user.id, target_user_id=body.user_id))
    r = await get_redis()
    await r.delete(f"profile:{user.id}")
    return Envelope.ok({"ok": True, "userId": str(body.user_id)})


@router.delete("/favorites/{user_id}")
async def remove_favorite(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_completed_user),
):
    if user_id == user.id:
        return JSONResponse(status_code=400, content=Envelope.err("Некорректный запрос"))
    row = (
        await db.execute(
            select(UserFavorite).where(
                UserFavorite.user_id == user.id, UserFavorite.target_user_id == user_id
            )
        )
    ).scalar_one_or_none()
    if row:
        await db.delete(row)
    r = await get_redis()
    await r.delete(f"profile:{user.id}")
    return Envelope.ok({"ok": True})


@router.post("/recommendations")
async def create_recommendation(
    body: RecommendBody,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_completed_user),
):
    if body.to_user_id == user.id or body.target_user_id == user.id:
        return JSONResponse(status_code=400, content=Envelope.err("Некорректные пользователи"))
    if body.to_user_id == body.target_user_id:
        return JSONResponse(status_code=400, content=Envelope.err("Получатель и профиль не должны совпадать"))
    to_u = (await db.execute(select(User).where(User.id == body.to_user_id))).scalar_one_or_none()
    t_u = (await db.execute(select(User).where(User.id == body.target_user_id))).scalar_one_or_none()
    if not to_u or not t_u:
        return JSONResponse(status_code=404, content=Envelope.err("Пользователь не найден"))
    from uuid import uuid4

    db.add(
        ProfileRecommendation(
            id=uuid4(),
            from_user_id=user.id,
            to_user_id=body.to_user_id,
            target_user_id=body.target_user_id,
        )
    )
    await _create_notification(
        db,
        user_id=body.to_user_id,
        n_type="new",
        title="Рекомендация",
        message=f"{user.display_name} рекомендует вам: {t_u.display_name}",
        payload={
            "fromUserId": str(user.id),
            "targetUserId": str(body.target_user_id),
        },
    )
    return Envelope.ok({"ok": True})


@router.get("/matches")
async def list_matches(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_completed_user),
):
    rows = (
        await db.execute(
            select(Match).where(or_(Match.user_a_id == user.id, Match.user_b_id == user.id))
        )
    ).scalars().all()
    out = []
    for m in rows:
        peer_id = m.user_b_id if m.user_a_id == user.id else m.user_a_id
        peer = (await db.execute(select(User).where(User.id == peer_id))).scalar_one_or_none()
        if not peer:
            continue
        out.append(
            {
                "id": str(m.id),
                "createdAt": m.created_at.astimezone(UTC).isoformat().replace("+00:00", "Z"),
                "peer": user_to_profile(peer).model_dump(by_alias=True),
            }
        )
    out.sort(key=lambda x: x["createdAt"], reverse=True)
    return Envelope.ok(out)


@router.get("/notifications")
async def list_notifications(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_completed_user),
):
    rows = (
        await db.execute(
            select(Notification)
            .where(Notification.user_id == user.id)
            .order_by(Notification.created_at.desc())
            .limit(100)
        )
    ).scalars().all()
    out = []
    for n in rows:
        payload = n.payload or {}
        peer_name = None
        peer_avatar = None
        peer_id_raw = payload.get("peerUserId")
        if peer_id_raw:
            try:
                peer_id = UUID(str(peer_id_raw))
            except ValueError:
                peer_id = None
            if peer_id is not None:
                peer = (await db.execute(select(User).where(User.id == peer_id))).scalar_one_or_none()
                if peer:
                    peer_name = peer.display_name
                    peer_avatar = peer.avatar_url or ""
        out.append(
            {
                "id": str(n.id),
                "type": n.type,
                "title": n.title,
                "message": n.message,
                "timestamp": n.created_at.astimezone(UTC).isoformat().replace("+00:00", "Z"),
                "read": n.read_at is not None,
                "avatar": peer_avatar,
                "userName": peer_name,
                "peerUserId": payload.get("peerUserId"),
                "conversationId": payload.get("conversationId"),
            }
        )
    return Envelope.ok(out)


@router.post("/notifications/read")
async def mark_notifications_read(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_completed_user),
):
    now = datetime.now(tz=UTC)
    rows = (
        await db.execute(
            select(Notification).where(
                and_(Notification.user_id == user.id, Notification.read_at.is_(None))
            )
        )
    ).scalars().all()
    for n in rows:
        n.read_at = now
    return Envelope.ok({"ok": True})


@router.post("/invites")
async def create_invite(
    body: InviteCreateBody,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_completed_user),
):
    code = (body.code or "").strip().lower()
    if not code:
        code = str(user.id).replace("-", "")[:12]
    exists = (await db.execute(select(InviteCode).where(InviteCode.code == code))).scalar_one_or_none()
    if exists and exists.inviter_user_id != user.id:
        return JSONResponse(status_code=409, content=Envelope.err("Код приглашения занят"))
    if not exists:
        db.add(InviteCode(code=code, inviter_user_id=user.id))
    return Envelope.ok({"code": code, "url": f"/invite/{user.id}", "inviterUserId": str(user.id)})
