from datetime import date
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator

from app.db.models import User


class ProfileResponse(BaseModel):
    id: str
    name: str
    age: int
    email: str | None = None
    phone: str | None = None
    gender: str | None = None
    bio: str
    interests: list[str]
    location: str
    photo: str
    photos: list[str] = []
    birthDate: str
    profileCompleted: bool = False
    personality: dict[str, Any] | None = None
    astrology: dict[str, Any] | None = None
    numerology: dict[str, Any] | None = None
    isPremium: bool = False
    premiumUntil: str | None = None
    superLikesBalance: int = 0
    hasUnlimitedAnalysis: bool = False
    purchasedAnalysisUserIds: list[str] = []
    role: str = "user"

    model_config = {"populate_by_name": True}


def user_to_profile(u: User) -> ProfileResponse:
    from datetime import UTC, datetime

    bd = ""
    if u.birth_date:
        bd = u.birth_date.isoformat()
    from app.core.security import age_from_birth

    now = datetime.now(UTC)
    until = u.premium_until
    is_prem = (until is not None and until > now) or (bool(getattr(u, "is_premium", False)) and until is None)
    puntil: str | None = None
    if until is not None:
        puntil = until.astimezone(UTC).isoformat().replace("+00:00", "Z")
    pids: list[str] = []
    raw = getattr(u, "purchased_analysis_user_ids", None)
    if isinstance(raw, list):
        pids = [str(x) for x in raw]
    return ProfileResponse(
        id=str(u.id),
        name=u.display_name,
        age=age_from_birth(u.birth_date),
        email=u.email,
        phone=u.phone,
        gender=u.gender,
        bio=u.bio or "",
        interests=list(u.interests or []),
        location=u.location or "",
        photo=u.avatar_url or "",
        photos=list(u.photos or []),
        birthDate=bd,
        profileCompleted=bool(u.profile_completed),
        personality=u.personality,
        astrology=u.astrology,
        numerology=u.numerology,
        isPremium=bool(is_prem),
        premiumUntil=puntil,
        superLikesBalance=int(getattr(u, "super_likes_balance", 5) or 0),
        hasUnlimitedAnalysis=bool(getattr(u, "has_unlimited_analysis", False)),
        purchasedAnalysisUserIds=pids,
        role=str(getattr(u, "user_role", None) or "user"),
    )


class ProfilePatch(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str | None = None
    email: EmailStr | None = None
    birth_date: date | None = Field(default=None, alias="birthDate")
    bio: str | None = None
    location: str | None = None
    avatar_url: str | None = Field(default=None, alias="avatarUrl")
    photos: list[str] | None = None
    interests: list[str] | None = None
    personality: dict[str, Any] | None = None
    astrology: dict[str, Any] | None = None
    numerology: dict[str, Any] | None = None


class RegisterBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    auth_method: Literal["email", "phone"] = Field(default="email", alias="authMethod")
    email: EmailStr | None = None
    login_phone: str | None = Field(default=None, alias="loginPhone")
    password: str = Field(min_length=6)
    agree_privacy: bool | None = Field(default=None, alias="agreeToPrivacy")
    agree_terms: bool | None = Field(default=None, alias="agreeToTerms")
    agree_offer: bool | None = Field(default=None, alias="agreeToOffer")
    agree_adult: bool = Field(alias="agreeToAge18")
    name: str = Field(min_length=1, max_length=200)
    birth_date: date = Field(alias="birthDate")
    gender: str
    avatar_url: str = Field(min_length=1, alias="avatarUrl")
    photos: list[str] | None = None
    bio: str | None = None
    interests: list[str] | None = None

    @field_validator("gender")
    @classmethod
    def register_gender(cls, v: str) -> str:
        g = v.strip().lower()
        if g not in {"male", "female"}:
            raise ValueError("Пол должен быть male или female")
        return g

    @model_validator(mode="after")
    def require_email_or_phone(self):
        if self.auth_method == "email":
            if self.email is None:
                raise ValueError("Укажите email")
        else:
            if not (self.login_phone and str(self.login_phone).strip()):
                raise ValueError("Укажите номер телефона")
        return self


class CompleteProfileBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    birth_date: date = Field(alias="birthDate")
    gender: str
    avatar_url: str = Field(alias="avatarUrl")
    photos: list[str] | None = None
    bio: str | None = None
    interests: list[str] | None = None

    @property
    def normalized_gender(self) -> str:
        g = self.gender.strip().lower()
        if g not in {"male", "female"}:
            raise ValueError("gender must be male or female")
        return g


class LoginBody(BaseModel):
    """Поле `email` в JSON — логин: email или номер телефона (как вводит пользователь)."""

    model_config = ConfigDict(populate_by_name=True)
    email: str = Field(..., description="Email или телефон")
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
    duration_sec: int | None = Field(default=None, alias="durationSec", ge=0, le=3600)


class MarkConversationsReadBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    all: bool = False
    conversation_ids: list[UUID] | None = Field(default=None, alias="conversationIds")


class UploadPresignBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    content_type: str = Field(alias="contentType")
    file_size_bytes: int = Field(alias="fileSizeBytes", ge=1)
