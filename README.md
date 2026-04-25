# Russian-love

Дейтинг: веб-клиент (`web/`) и общий бэкенд API (`backend/`) для будущего мобильного приложения.

## Быстрый старт (Docker)

```bash
docker compose up --build
```

- API: http://localhost:8000  
- Веб (через nginx-шлюз): http://localhost:8080  
- Веб напрямую (контейнер): http://localhost:5173  
- MinIO консоль: http://localhost:9001 (minioadmin / minioadmin)

Переменные окружения API см. [backend/.env.example](backend/.env.example) (префикс `DATING_`).

## Локальная разработка

**Бэкенд**

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
copy .env.example .env   # отредактировать при необходимости
# поднять Postgres + Redis + MinIO (или docker compose up postgres redis minio)
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Интеграционные pytest-тесты (регистрация + лента) по умолчанию **пропускаются** без CI. Чтобы гонять их локально после поднятия БД:

```bash
set DATING_RUN_INTEGRATION=1
pytest -q
```

**Воркер Dramatiq**

```bash
cd backend
dramatiq app.worker_tasks
```

**Фронт**

```bash
cd web
npm install
set VITE_API_BASE_URL=http://localhost:8000   # Windows CMD
npm run dev
```

Если `VITE_API_BASE_URL` не задан, фронт ходит в API **относительными** URL (`/api/...`) — тот же origin, что и страница (удобно для Docker/nginx на VPS).

### Ручная проверка (чек-лист)

1. Запустите `docker compose up --build` и дождитесь готовности Postgres/Redis.
2. Откройте веб через **шлюз nginx**: **http://localhost:8080** (сборка без абсолютного API URL — запросы идут на `/api` того же origin).
3. Зарегистрируйте минимум двух пользователей (вторая вкладка инкогнито) для проверки лайков/матчей/чатов.
4. Лента: карточки приходят с **GET /api/feed**.
5. Чаты: список — **GET /api/conversations**; переписка — история + отправка через REST и realtime через WebSocket.
6. Локально без Docker (`npm run dev` в `web/`): создайте **`web/.env.local`** с `VITE_API_BASE_URL=http://localhost:8080` (через nginx) или `http://localhost:8000` (прямо в API; в `DATING_CORS_ORIGINS` должен быть origin Vite, например `http://localhost:5173`).

**TLS на VPS:** в репозитории [deploy/nginx.conf](deploy/nginx.conf) только порт 80. Для HTTPS добавьте `listen 443 ssl`, пути к сертификату и ключу (Let's Encrypt / certbot или свой провайдер) и при необходимости редирект с 80 на 443 — секреты в репозиторий не коммитьте.

## Бэкапы PostgreSQL (VPS)

1. **Снимок** (пример, раз в сутки по cron):

   ```bash
   PGPASSWORD=... pg_dump -h localhost -U dating -d dating -Fc -f /backup/dating-$(date +%F).dump
   ```

2. **Восстановление** (проверено хотя бы один раз вручную на копии):

   ```bash
   pg_restore -h localhost -U dating -d dating_clean --clean /backup/dating-YYYY-MM-DD.dump
   ```

Храните бэкапы **вне** того же диска, что и БД, когда появится продакшен.

## Документация

- [ARCHITECTURE.md](ARCHITECTURE.md) — схема для инвесторов / онбординга.
- OpenAPI: [mobile/backend/docs/dating-api-spec.yaml](mobile/backend/docs/dating-api-spec.yaml).
- Эволюция чата: [backend/docs/CHAT_EVOLUTION.md](backend/docs/CHAT_EVOLUTION.md).

## Персональные данные (MVP)

- Данные пользователей в PostgreSQL; согласия при регистрации — поля в теле запроса по спеке.
- Удаление аккаунта: до появления self-service эндпоинта — по запросу администратору / SQL (опишите процесс для своей команды).
- Не логируйте пароли и токены; минимизируйте PII в логах.
