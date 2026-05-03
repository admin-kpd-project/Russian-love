from collections.abc import AsyncGenerator

from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config.settings import get_settings

_engine = None
_session_factory: async_sessionmaker[AsyncSession] | None = None


def get_engine():
    global _engine
    if _engine is None:
        s = get_settings()
        db_url = str(s.database_url)
        connect_args: dict[str, object] = {}
        url = make_url(db_url)
        # asyncpg defaults to SSL negotiation; local PostgreSQL often runs without SSL.
        if url.drivername.endswith("+asyncpg"):
            has_ssl_param = "ssl" in url.query or "sslmode" in url.query
            if not has_ssl_param:
                connect_args["ssl"] = False
        _engine = create_async_engine(
            db_url,
            echo=s.debug,
            pool_pre_ping=True,
            connect_args=connect_args,
        )
    return _engine


def get_session_factory() -> async_sessionmaker[AsyncSession]:
    global _session_factory
    if _session_factory is None:
        _session_factory = async_sessionmaker(
            get_engine(),
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
        )
    return _session_factory


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    factory = get_session_factory()
    async with factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def dispose_engine() -> None:
    global _engine, _session_factory
    if _engine is not None:
        await _engine.dispose()
        _engine = None
        _session_factory = None
