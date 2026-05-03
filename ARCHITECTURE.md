# Архитектура (Russian-love)

## Клиенты

- **Web** (React + Vite): SPA в каталоге `web/`, собирается в `dist/`, в проде за reverse proxy.
- **Мобильное приложение** (React Native): каталог `mobile-app/`, тот же REST API и base URL (см. `mobile-app/README.md`).

## Сервер

- **Один** бэкенд **FastAPI** (`backend/app/`), модульный монолит: роутеры в `app/api/`, модели SQLAlchemy в `app/db/`, общие схемы в `app/schemas/`, настройки `pydantic-settings` в `app/config/settings.py`.
- **PostgreSQL**: пользователи, refresh-токены, беседы, участники, сообщения, таблица `feed_profiles` для ленты.
- **Redis**: rate limit (грубое окно по IP), OAuth state Yandex, кэш профиля `GET /api/users/{id}`.
- **Dramatiq** (`app/worker_tasks.py`): фоновая очистка истёкших refresh-токенов; брокер Redis.
- **MinIO** (S3-совместимый): медиа, presigned PUT из `POST /api/upload`.

## Контракт API

- Источник правды: схемы Pydantic + роутеры в `backend/app/`; машиночитаемая спека — `GET /openapi.json` у запущенного API (или `/docs`).
- Ответы в обёртке `{ "data": ..., "error": null }` (или `data: null` при ошибке).

## Деплой (VPS)

- **Docker Compose** в корне: `postgres`, `redis`, `minio`, `minio-init`, `api`, `worker`, `web`, `nginx`.
- **Nginx** (`deploy/nginx.conf`): `/api` → API, остальное → статика web; TLS настраивается на хосте (certbot) поверх порта 80/443 по стандартной схеме.

## Наблюдаемость

- `GET /health` — процесс жив.
- `GET /ready` — проверка PostgreSQL и Redis.

## Резервные копии

- См. раздел «Бэкапы» в [README.md](README.md): логика `pg_dump` на VPS и краткий runbook восстановления.
