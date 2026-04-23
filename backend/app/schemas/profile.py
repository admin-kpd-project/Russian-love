from datetime import date
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.db.models import User


class ProfileResponse(BaseModel):
    id: str
    name: str
    age: int
    bio: str
    interests: list[str]
    location: str
    photo: str
    birthDate: str
    personality: dict[str, Any] | None = None
    astrology: dict[str, Any] | None = None
    numerology: dict[str, Any] | None = None

    model_config = {"populate_by_name": True}


def user_to_profile(u: User) -> ProfileResponse:
    bd = ""
    if u.birth_date:
        bd = u.birth_date.isoformat()
    from app.core.security import age_from_birth

    return ProfileResponse(
        id=str(u.id),
        name=u.display_name,
        age=age_from_birth(u.birth_date),
        bio=u.bio or "",
        interests=list(u.interests or []),
        location=u.location or "",
        photo=u.avatar_url or "",
        birthDate=bd,
        personality=u.personality,
        astrology=u.astrology,
        numerology=u.numerology,
    )


class ProfilePatch(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str | None = None
    bio: str | None = None
    location: str | None = None
    avatar_url: str | None = Field(default=None, alias="avatarUrl")
    interests: list[str] | None = None
    personality: dict[str, Any] | None = None
    astrology: dict[str, Any] | None = None
    numerology: dict[str, Any] | None = None


class RegisterBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str
    birth_date: date = Field(alias="birthDate")
    email: EmailStr
    phone: str | None = None
    password: str = Field(min_length=6)
    agree_privacy: bool | None = Field(default=None, alias="agreeToPrivacy")
    agree_terms: bool | None = Field(default=None, alias="agreeToTerms")
    agree_offer: bool | None = Field(default=None, alias="agreeToOffer")


class LoginBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    email: EmailStr
    password: str


class RefreshBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    refresh_token: str = Field(alias="refreshToken")


class LogoutBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    refresh_token: str = Field(alias="refreshToken")


class CreateConversationBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    user_id: UUID = Field(alias="user_id")


class SendMessageBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    text: str | None = None
    media_url: str | None = Field(default=None, alias="mediaUrl")
    media_type: str | None = Field(default=None, alias="mediaType")


class UploadPresignBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    content_type: str = Field(alias="contentType")
    file_size_bytes: int = Field(alias="fileSizeBytes", ge=1)
