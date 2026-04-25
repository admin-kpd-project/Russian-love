import asyncio
import json
from collections import defaultdict
from uuid import UUID

from fastapi import WebSocket


class ChatConnectionManager:
    def __init__(self) -> None:
        self._lock = asyncio.Lock()
        self._by_conversation: dict[str, set[WebSocket]] = defaultdict(set)

    async def connect(self, conversation_id: UUID, ws: WebSocket) -> None:
        await ws.accept()
        async with self._lock:
            self._by_conversation[str(conversation_id)].add(ws)

    async def disconnect(self, conversation_id: UUID, ws: WebSocket) -> None:
        async with self._lock:
            key = str(conversation_id)
            if key in self._by_conversation and ws in self._by_conversation[key]:
                self._by_conversation[key].remove(ws)
            if key in self._by_conversation and not self._by_conversation[key]:
                del self._by_conversation[key]

    async def broadcast(self, conversation_id: UUID, payload: dict) -> None:
        key = str(conversation_id)
        data = json.dumps(payload, ensure_ascii=False)
        async with self._lock:
            sockets = list(self._by_conversation.get(key, set()))
        for ws in sockets:
            try:
                await ws.send_text(data)
            except Exception:
                await self.disconnect(conversation_id, ws)


chat_ws_manager = ChatConnectionManager()
