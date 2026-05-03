# AGENTS.md

## Cursor Cloud specific instructions

This is a Russian-language dating platform with a FastAPI backend (`backend/`), React+Vite web frontend (`web/`), and React Native mobile app (`mobile-app/`).

### Services overview

| Service | How to run | Notes |
|---|---|---|
| PostgreSQL 16 | `docker compose up -d postgres` | Port 5432, user/pass/db = `dating` |
| Redis 7 | `docker compose up -d redis` | Port 6379 |
| MinIO (S3) | `docker compose up -d minio minio-init` | Port 9000 (API), 9001 (console), creds: minioadmin/minioadmin |
| Backend API | See below | Port 8000 |
| Web frontend | `cd web && npm run dev` | Port 5173, proxies `/api` to backend |

### Starting infrastructure

```bash
dockerd &>/var/log/dockerd.log &
sleep 3
docker compose up -d postgres redis minio minio-init
```

Docker runs nested (Docker-in-Docker inside Firecracker VM). The daemon config at `/etc/docker/daemon.json` uses `fuse-overlayfs` storage driver and `iptables-legacy` is required.

### Backend

```bash
cd backend
source .venv/bin/activate
export DATING_DATABASE_URL="postgresql+asyncpg://dating:dating@localhost:5432/dating"
export DATING_REDIS_URL="redis://localhost:6379/0"
export DATING_JWT_SECRET="dev-jwt-secret-change-in-production-min-32-chars"
export DATING_S3_ENDPOINT_URL="http://localhost:9000"
export DATING_S3_PRESIGN_ENDPOINT_URL="http://localhost:9000"
export DATING_S3_ACCESS_KEY="minioadmin"
export DATING_S3_SECRET_KEY="minioadmin"
export DATING_S3_BUCKET="dating-media"
export DATING_S3_ADDRESSING_STYLE="path"
export DATING_CORS_ORIGINS="http://localhost:5173,http://127.0.0.1:5173,http://localhost:8080"
export DATING_TRUSTED_HOSTS="localhost,127.0.0.1"
export DATING_CDN_PUBLIC_BASE_URL="http://localhost:9000/dating-media"
# Админка /admin без JWT и публичное создание пользователей (только dev; в проде не задавать или false)
export DATING_ADMIN_PUBLIC_PANEL="true"
export DATING_ADMIN_PUBLIC_USER_CREATE="true"

# Run migrations
alembic upgrade head

# Seed test data (idempotent, safe to re-run)
python -m app.seed

# Start dev server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- **Lint**: `ruff check app tests`
- **Tests**: `pytest -q` (health test only without `DATING_RUN_INTEGRATION=1`)
- **Integration tests**: `DATING_RUN_INTEGRATION=1 pytest -q` (requires running Postgres + Redis)
- The `passlib`/`bcrypt` version mismatch warning is harmless — ignore it.

### Web frontend

```bash
cd web
npm install
VITE_DEV_PROXY_API="http://localhost:8000" npm run dev
```

- **Build**: `npm run build`
- The Vite dev server proxies `/api` requests to the backend (configured in `vite.config.ts` via `VITE_DEV_PROXY_API`).
- Lint is a no-op (`echo "no lint configured"` in package.json).

### Gotchas

- **HTTPS:** Presigned uploads and `fileUrl` must use **https** when the site is HTTPS (mixed content). Set `DATING_PUBLIC_BASE_URL=https://your-public-host` (same host as Nginx with `/s3/<bucket>/`), or ensure the reverse proxy sends `X-Forwarded-Proto` (see `deploy/nginx.conf` `map` + `$dating_forwarded_proto`). Docker API image uses `uvicorn --proxy-headers --forwarded-allow-ips` (override with `FORWARDED_ALLOW_IPS` if needed). Optional `DATING_FORCE_HTTPS_ASSET_URLS=true` if the edge is TLS but the inferred URL is still `http://`.
- The backend requires **all four** consent fields for registration: `agreeToAge18`, `agreeToTerms`, `agreeToPrivacy`, `agreeToOffer`.
- The `docker-compose.yml` references Yandex Container Registry images (`cr.yandex/...`) for the `api`, `worker`, and `web` services. For local dev, run services natively instead of via Docker Compose (only use compose for infrastructure: postgres, redis, minio).
- Integration tests share the same database as the dev server — running them while the server is up is fine but may add test data.
