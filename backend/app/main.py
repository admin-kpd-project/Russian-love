import json
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from starlette.middleware.base import BaseHTTPMiddleware

from app.api import (
    admin_routes,
    auth_routes,
    chat_routes,
    feed_routes,
    payments_routes,
    public_routes,
    reports_routes,
    social_routes,
    upload_routes,
    user_support_routes,
    users_routes,
)
from app.config.settings import get_settings
from app.core.envelope import Envelope
from app.core.rate_limit import allow_request
from app.core.redis_client import close_redis_pool
from app.db.session import dispose_engine

logger = logging.getLogger("dating.api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.basicConfig(level=logging.INFO)
    yield
    await close_redis_pool()
    await dispose_engine()


app = FastAPI(title="Dating API", lifespan=lifespan)


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        if path.startswith("/api/auth"):
            ok = await allow_request(request, key_prefix="rl:auth", max_per_second=10)
        elif path.startswith("/api"):
            ok = await allow_request(request, key_prefix="rl:api", max_per_second=200)
        else:
            ok = True
        if not ok:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content=Envelope.err("Слишком много запросов"),
            )
        return await call_next(request)


app.add_middleware(RateLimitMiddleware)

_s = get_settings()
_origins = [o.strip() for o in _s.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
_hosts = [h.strip() for h in _s.trusted_hosts.split(",") if h.strip()]
if _hosts and "*" not in _hosts:
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=_hosts)


@app.exception_handler(HTTPException)
async def http_exc_handler(_: Request, exc: HTTPException):
    detail = exc.detail
    if isinstance(detail, list):
        detail = json.dumps(detail, ensure_ascii=False)
    return JSONResponse(
        status_code=exc.status_code,
        content=Envelope.err(str(detail)),
        headers=exc.headers,
    )


@app.exception_handler(RequestValidationError)
async def validation_exc_handler(_: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=Envelope.err(json.dumps(exc.errors(), ensure_ascii=False)),
    )


@app.exception_handler(SQLAlchemyError)
async def db_exc_handler(_: Request, exc: SQLAlchemyError):
    logger.exception("database error", exc_info=exc)
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content=Envelope.err("База данных временно недоступна"),
    )


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/ready")
async def ready():
    from sqlalchemy import text

    from app.core.redis_client import get_redis
    from app.db.session import get_session_factory

    try:
        async with get_session_factory()() as session:
            await session.execute(text("SELECT 1"))
    except Exception as e:
        logger.exception("readiness db failed")
        return JSONResponse(status_code=503, content={"ready": False, "error": str(e)})
    try:
        r = await get_redis()
        await r.ping()
    except Exception as e:
        logger.exception("readiness redis failed")
        return JSONResponse(status_code=503, content={"ready": False, "error": str(e)})
    return {"ready": True}


app.include_router(public_routes.router)
app.include_router(auth_routes.router)
app.include_router(users_routes.router)
app.include_router(chat_routes.router)
app.include_router(upload_routes.router)
app.include_router(feed_routes.router)
app.include_router(social_routes.router)
app.include_router(payments_routes.router)
app.include_router(user_support_routes.router)
app.include_router(reports_routes.router)
app.include_router(admin_routes.router)
