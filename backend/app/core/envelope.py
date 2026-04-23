from typing import Any, Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class Envelope(BaseModel, Generic[T]):
    data: T | None = None
    error: str | None = None

    @staticmethod
    def ok(data: Any) -> dict[str, Any]:
        return {"data": data, "error": None}

    @staticmethod
    def err(message: str) -> dict[str, Any]:
        return {"data": None, "error": message}
