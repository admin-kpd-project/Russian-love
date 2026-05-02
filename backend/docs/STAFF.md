# Роли staff (веб-админка)

В таблице `users` поле `user_role` определяет доступ к `/api/admin/*` и веб-странице `/admin`.

- `user` (по умолчанию) — обычный пользователь.
- `support` — обращения (тикеты), без блокировок пользователей.
- `moderator` — тикеты + жалобы, блокировка (`POST /api/admin/users/{id}/deactivate`).
- `admin` — то же, плюс разблокировка (`POST /api/admin/users/{id}/activate`).

Назначение роли вручную в БД (после миграции `0008`):

```sql
UPDATE users SET user_role = 'admin' WHERE email = 'you@example.com';
```

Обновите сессию: повторный вход или `GET /api/users/me` уже вернёт `role` в профиле.
