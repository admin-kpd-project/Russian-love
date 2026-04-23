import hashlib
import secrets
from datetime import UTC, date, datetime, timedelta
from uuid import UUID

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config.settings import get_settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str | None) -> bool:
    if not hashed:
        return False
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: UUID) -> str:
    s = get_settings()
    expire = datetime.now(tz=UTC) + timedelta(minutes=s.access_token_expire_minutes)
    payload = {"sub": str(user_id), "exp": expire, "typ": "access"}
    return jwt.encode(
        payload,
        s.jwt_secret.get_secret_value(),
        algorithm=s.jwt_algorithm,
    )


def decode_access_token(token: str) -> UUID | None:
    s = get_settings()
    try:
        payload = jwt.decode(
            token,
            s.jwt_secret.get_secret_value(),
            algorithms=[s.jwt_algorithm],
        )
        if payload.get("typ") != "access":
            return None
        sub = payload.get("sub")
        if not sub:
            return None
        return UUID(str(sub))
    except (JWTError, ValueError):
        return None


def new_refresh_token() -> tuple[str, str]:
    """Return (plain_token, sha256_hex_hash)."""
    plain = secrets.token_urlsafe(48)
    h = hashlib.sha256(plain.encode()).hexdigest()
    return plain, h


def hash_refresh_token(plain: str) -> str:
    return hashlib.sha256(plain.encode()).hexdigest()


def refresh_expires_at() -> datetime:
    s = get_settings()
    return datetime.now(tz=UTC) + timedelta(days=s.refresh_token_expire_days)


def age_from_birth(birth: date | None) -> int:
    if not birth:
        return 0
    today = date.today()
    years = today.year - birth.year
    if (today.month, today.day) < (birth.month, birth.day):
        years -= 1
    return max(0, years)
