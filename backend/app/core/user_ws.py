import asyncio
import json
from collections import defaultdict
from uuid import UUID

from fastapi import WebSocket


class UserConnectionManager:
    def __init__(self) -> None:
        self._lock = asyncio.Lock()
        self._by_user: dict[str, set[WebSocket]] = defaultdict(set)

    async def connect(self, user_id: UUID, ws: WebSocket) -> None:
        await ws.accept()
        async with self._lock:
            self._by_user[str(user_id)].add(ws)

    async def disconnect(self, user_id: UUID, ws: WebSocket) -> None:
        async with self._lock:
            key = str(user_id)
            if key in self._by_user and ws in self._by_user[key]:
                self._by_user[key].remove(ws)
            if key in self._by_user and not self._by_user[key]:
                del self._by_user[key]

    async def broadcast(self, user_id: UUID, payload: dict) -> None:
        key = str(user_id)
        data = json.dumps(payload, ensure_ascii=False)
        async with self._lock:
            sockets = list(self._by_user.get(key, set()))
        for ws in sockets:
            try:
                await ws.send_text(data)
            except Exception:
                await self.disconnect(user_id, ws)


user_ws_manager = UserConnectionManager()
