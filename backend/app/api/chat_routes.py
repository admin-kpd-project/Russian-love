from datetime import UTC, datetime
from uuid import UUID

from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_completed_user
from app.core.chat_ws import chat_ws_manager
from app.core.security import decode_access_token
from app.config.settings import get_settings
from app.core.envelope import Envelope
from app.db.models import Conversation, ConversationMember, Match, Message, Notification, User
from app.db.session import get_db
from app.schemas.profile import CreateConversationBody, MarkConversationsReadBody, SendMessageBody

router = APIRouter(prefix="/api", tags=["Conversations", "Messages"])


def _validate_media_url(url: str | None) -> bool:
    if not url:
        return True
    from urllib.parse import urlparse

    s = get_settings()
    p = urlparse(url)
    if p.scheme not in ("http", "https"):
        return False
    c = urlparse(s.cdn_public_base_url)
    b = s.s3_bucket
    allowed_netlocs: set[str] = set()
    if c.netloc:
        allowed_netlocs.add(c.netloc.lower())
    pb = (s.public_base_url or "").strip()
    if pb:
        pu = urlparse(pb if "://" in pb else f"https://{pb}")
        if pu.netloc:
            allowed_netlocs.add(pu.netloc.lower())
    if allowed_netlocs and p.netloc.lower() in allowed_netlocs:
        return True
    if p.path.startswith(f"/s3/{b}/") or p.path.startswith(f"/s3/{b}?"):
        return True
    if p.path.startswith(f"/{b}/") or p.path.startswith(f"/{b}?"):
        return True
    return False


def _msg_time(dt: datetime) -> str:
    u = dt.astimezone(UTC)
    return u.strftime("%H:%M")


def _format_duration_str(sec: int | None) -> str | None:
    if sec is None or sec < 0:
        return None
    m, s = divmod(min(sec, 3600), 60)
    return f"{m}:{s:02d}"


async def _has_unread_from_peer(
    db: AsyncSession,
    conversation_id: UUID,
    peer_id: UUID,
    last_read_at: datetime | None,
) -> bool:
    q = select(Message.id).where(
        Message.conversation_id == conversation_id,
        Message.sender_id == peer_id,
        Message.is_deleted.is_(False),
    )
    if last_read_at is not None:
        q = q.where(Message.created_at > last_read_at)
    return (await db.execute(q.limit(1))).scalar_one_or_none() is not None


async def _find_direct_conversation(db: AsyncSession, a: UUID, b: UUID) -> Conversation | None:
    result = await db.execute(
        select(Conversation)
        .options(selectinload(Conversation.members))
        .join(ConversationMember)
        .where(ConversationMember.user_id.in_((a, b)))
    )
    for conv in result.scalars().unique().all():
        ids = {m.user_id for m in conv.members}
        if ids == {a, b} and len(conv.members) == 2:
            return conv
    return None


def _pair_ids(a: UUID, b: UUID) -> tuple[UUID, UUID]:
    return (a, b) if str(a) < str(b) else (b, a)


async def _has_mutual_match(db: AsyncSession, a: UUID, b: UUID) -> bool:
    x, y = _pair_ids(a, b)
    row = (
        await db.execute(
            select(Match.id).where(Match.user_a_id == x, Match.user_b_id == y).limit(1)
        )
    ).scalar_one_or_none()
    return row is not None


@router.get("/conversations")
async def list_conversations(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_completed_user),
):
    result = await db.execute(
        select(Conversation)
        .join(ConversationMember, ConversationMember.conversation_id == Conversation.id)
        .where(ConversationMember.user_id == user.id)
        .options(selectinload(Conversation.members))
    )
    convs = list(result.scalars().unique().all())
    out = []
    for c in convs:
        my_mem = next((m for m in c.members if m.user_id == user.id), None)
        if my_mem is None:
            continue
        other_id = next((m.user_id for m in c.members if m.user_id != user.id), None)
        if other_id is None:
            continue
        ou = (await db.execute(select(User).where(User.id == other_id))).scalar_one()
        last_msg = (
            await db.execute(
                select(Message)
                .where(Message.conversation_id == c.id, Message.is_deleted.is_(False))
                .order_by(desc(Message.created_at))
                .limit(1)
            )
        ).scalar_one_or_none()
        last_text = ""
        ts = c.updated_at or datetime.now(tz=UTC)
        if last_msg:
            last_text = last_msg.body or ""
            ts = last_msg.created_at
        unread = await _has_unread_from_peer(db, c.id, other_id, my_mem.last_read_at)
        peer_ls = getattr(ou, "last_seen_at", None)
        peer_last_seen = (
            peer_ls.astimezone(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")
            if peer_ls
            else None
        )
        out.append(
            {
                "id": str(c.id),
                "peerUserId": str(other_id),
                "name": ou.display_name,
                "avatar": ou.avatar_url or "",
                "peerLastSeenAt": peer_last_seen,
                "lastMessage": last_text,
                "timestamp": ts.astimezone(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
                "unread": unread,
            }
        )
    out.sort(key=lambda x: x["timestamp"], reverse=True)
    return Envelope.ok(out)


@router.post("/conversations")
async def create_conversation(
    body: CreateConversationBody,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_completed_user),
):
    if body.user_id == user.id:
        return JSONResponse(status_code=400, content=Envelope.err("Нельзя открыть беседу с самим собой"))
    other = (await db.execute(select(User).where(User.id == body.user_id))).scalar_one_or_none()
    if other is None:
        return JSONResponse(status_code=400, content=Envelope.err("Пользователь не найден"))
    if not await _has_mutual_match(db, user.id, body.user_id):
        return JSONResponse(
            status_code=403,
            content=Envelope.err("Чат доступен только после взаимного мэтча"),
        )
    existing = await _find_direct_conversation(db, user.id, body.user_id)
    if existing:
        return Envelope.ok({"id": str(existing.id)})
    conv = Conversation(updated_at=datetime.now(tz=UTC))
    db.add(conv)
    await db.flush()
    db.add_all(
        [
            ConversationMember(conversation_id=conv.id, user_id=user.id),
            ConversationMember(conversation_id=conv.id, user_id=body.user_id),
        ]
    )
    await db.flush()
    return Envelope.ok({"id": str(conv.id)})


@router.post("/conversations/mark-read")
async def mark_conversations_read(
    body: MarkConversationsReadBody,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_completed_user),
):
    if body.all:
        r = await db.execute(
            select(ConversationMember).where(ConversationMember.user_id == user.id)
        )
        for m in r.scalars().all():
            m.last_read_at = datetime.now(tz=UTC)
        await db.flush()
        return Envelope.ok({"ok": True})
    ids = body.conversation_ids or []
    if not ids:
        return JSONResponse(
            status_code=400, content=Envelope.err("Укажите all или conversationIds")
        )
    now = datetime.now(tz=UTC)
    for cid in ids:
        mem = (
            await db.execute(
                select(ConversationMember).where(
                    ConversationMember.conversation_id == cid,
                    ConversationMember.user_id == user.id,
                )
            )
        ).scalar_one_or_none()
        if mem is not None:
            mem.last_read_at = now
    await db.flush()
    return Envelope.ok({"ok": True})


@router.post("/conversations/{conversation_id}/read")
async def mark_conversation_read(
    conversation_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_completed_user),
):
    mem = (
        await db.execute(
            select(ConversationMember).where(
                ConversationMember.conversation_id == conversation_id,
                ConversationMember.user_id == user.id,
            )
        )
    ).scalar_one_or_none()
    if mem is None:
        return JSONResponse(status_code=403, content=Envelope.err("Нет доступа к беседе"))
    mem.last_read_at = datetime.now(tz=UTC)
    await db.flush()
    return Envelope.ok({"ok": True})


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_completed_user),
):
    conv = (
        await db.execute(
            select(Conversation).where(Conversation.id == conversation_id)
        )
    ).scalar_one_or_none()
    if conv is None:
        return JSONResponse(status_code=404, content=Envelope.err("Беседа не найдена"))
    mem = (
        await db.execute(
            select(ConversationMember).where(
                ConversationMember.conversation_id == conversation_id,
                ConversationMember.user_id == user.id,
            )
        )
    ).scalar_one_or_none()
    if mem is None:
        return JSONResponse(status_code=403, content=Envelope.err("Нет доступа к беседе"))
    await db.delete(conv)
    await db.flush()
    return Envelope.ok({"ok": True})


@router.get("/conversations/{conversation_id}/messages")
async def get_messages(
    conversation_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_completed_user),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    mem = (
        await db.execute(
            select(ConversationMember).where(
                ConversationMember.conversation_id == conversation_id,
                ConversationMember.user_id == user.id,
            )
        )
    ).scalar_one_or_none()
    if mem is None:
        return JSONResponse(status_code=403, content=Envelope.err("Нет доступа к беседе"))
    offset = (page - 1) * limit
    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id, Message.is_deleted.is_(False))
        .order_by(desc(Message.created_at))
        .offset(offset)
        .limit(limit)
    )
    rows = list(result.scalars().all())
    rows.reverse()
    items = []
    for m in rows:
        mtype = "text"
        if m.media_url:
            mtype = m.media_type or "image"
        items.append(
            {
                "id": str(m.id),
                "text": m.body,
                "type": mtype,
                "sender": "me" if m.sender_id == user.id else "other",
                "senderUserId": str(m.sender_id),
                "time": _msg_time(m.created_at),
                "mediaUrl": m.media_url,
                "duration": _format_duration_str(m.duration_seconds),
            }
        )
    return Envelope.ok(items)


@router.post("/conversations/{conversation_id}/messages", status_code=201)
async def post_message(
    conversation_id: UUID,
    body: SendMessageBody,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_completed_user),
):
    mem = (
        await db.execute(
            select(ConversationMember).where(
                ConversationMember.conversation_id == conversation_id,
                ConversationMember.user_id == user.id,
            )
        )
    ).scalar_one_or_none()
    if mem is None:
        return JSONResponse(status_code=403, content=Envelope.err("Нет доступа к беседе"))
    peer_id = (
        await db.execute(
            select(ConversationMember.user_id).where(
                ConversationMember.conversation_id == conversation_id,
                ConversationMember.user_id != user.id,
            )
        )
    ).scalar_one_or_none()
    if peer_id is None:
        return JSONResponse(status_code=400, content=Envelope.err("Некорректная беседа"))
    if not await _has_mutual_match(db, user.id, peer_id):
        return JSONResponse(
            status_code=403,
            content=Envelope.err("Писать можно только после взаимного мэтча"),
        )
    text = (body.text or "").strip() or None
    media = body.media_url
    if not text and not media:
        return JSONResponse(status_code=400, content=Envelope.err("Нужен text или mediaUrl"))
    if media and not _validate_media_url(media):
        return JSONResponse(status_code=400, content=Envelope.err("Недопустимый mediaUrl"))
    if media and not body.media_type:
        return JSONResponse(status_code=400, content=Envelope.err("Укажите mediaType для медиа"))
    dsec: int | None = body.duration_sec
    if dsec is not None and body.media_type not in ("voice", "video"):
        dsec = None
    msg = Message(
        conversation_id=conversation_id,
        sender_id=user.id,
        body=text,
        media_url=media,
        media_type=body.media_type,
        duration_seconds=dsec,
    )
    db.add(msg)
    conv = (await db.execute(select(Conversation).where(Conversation.id == conversation_id))).scalar_one()
    conv.updated_at = datetime.now(tz=UTC)
    await db.flush()
    await db.refresh(msg)
    mtype = "text" if not media else (body.media_type or "image")
    payload = {
        "id": str(msg.id),
        "text": msg.body,
        "type": mtype,
        "sender": "me",
        "senderUserId": str(user.id),
        "time": _msg_time(msg.created_at),
        "mediaUrl": msg.media_url,
        "duration": _format_duration_str(msg.duration_seconds),
    }
    # Create notification for conversation peers
    members = (
        await db.execute(
            select(ConversationMember).where(ConversationMember.conversation_id == conversation_id)
        )
    ).scalars().all()
    for member in members:
        if member.user_id == user.id:
            continue
        db.add(
            Notification(
                user_id=member.user_id,
                type="message",
                title="Новое сообщение",
                message=f"{user.display_name}: {(msg.body or 'медиа')[:120]}",
                payload={
                    "conversationId": str(conversation_id),
                    "peerUserId": str(user.id),
                },
            )
        )
    await chat_ws_manager.broadcast(
        conversation_id,
        {
            "event": "message",
            "conversationId": str(conversation_id),
            "message": {
                **payload,
                "sender": "other",
            },
        },
    )
    return Envelope.ok(payload)


@router.delete("/messages/{message_id}")
async def delete_message(
    message_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_completed_user),
):
    msg = (await db.execute(select(Message).where(Message.id == message_id))).scalar_one_or_none()
    if msg is None:
        return JSONResponse(status_code=400, content=Envelope.err("Сообщение не найдено"))
    if msg.sender_id != user.id:
        return JSONResponse(status_code=403, content=Envelope.err("Нельзя удалить чужое сообщение"))
    mem = (
        await db.execute(
            select(ConversationMember).where(
                ConversationMember.conversation_id == msg.conversation_id,
                ConversationMember.user_id == user.id,
            )
        )
    ).scalar_one_or_none()
    if mem is None:
        return JSONResponse(status_code=403, content=Envelope.err("Нет доступа"))
    msg.is_deleted = True
    await db.flush()
    return Envelope.ok({"ok": True})


@router.websocket("/ws/chats/{conversation_id}")
async def chat_ws(conversation_id: UUID, websocket: WebSocket):
    token = websocket.query_params.get("token") or ""
    uid = decode_access_token(token)
    if uid is None:
        await websocket.close(code=4401)
        return

    from app.db.session import get_session_factory

    async with get_session_factory()() as db:
        mem = (
            await db.execute(
                select(ConversationMember).where(
                    ConversationMember.conversation_id == conversation_id,
                    ConversationMember.user_id == uid,
                )
            )
        ).scalar_one_or_none()
        if mem is None:
            await websocket.close(code=4403)
            return
    await chat_ws_manager.connect(conversation_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        await chat_ws_manager.disconnect(conversation_id, websocket)
