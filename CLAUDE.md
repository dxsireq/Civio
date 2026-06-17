# Civio

Платформа для записи граждан на услуги организаций. Три клиента: веб (React), мобильный (Android), backend API (.NET).

## Стек

**Backend**
- .NET 10, ASP.NET Core Minimal API
- EF Core (без migrations, SQL-first), PostgreSQL
- JWT Bearer (без refresh tokens)

**Web** — React 19 + TypeScript + Vite, Zustand, Axios, react-router-dom v7

**Mobile** — Android, Kotlin, Jetpack Compose, Hilt, Retrofit

**Инфра** — Docker Compose, Caddy (reverse proxy + auto-TLS)

## Структура

```
Civio.sln
├── src/
│   ├── Civio.Api/            # Endpoints (только orchestration)
│   ├── Civio.Application/    # Интерфейсы + use-cases
│   ├── Civio.Domain/         # Сущности
│   ├── Civio.Infrastructure/ # EF Core, сервисы, DI
│   └── Civio.Contracts/      # DTO (request/response)
├── clients/
│   ├── Civio.Web/            # React SPA
│   └── Civio.Mobile/         # Android app (Citizen-only)
└── database/
    └── init.sql              # Полная схема БД
```

## Запуск

Подробно — `.claude/docs/running.md`. Кратко:

```bash
# Dev
docker compose up -d postgres
dotnet run --project src/Civio.Api

# Web dev
cd clients/Civio.Web && npm run dev

# Prod (полный стек)
cd clients/Civio.Web && npm run build && cd ../..
docker compose up -d
```

Swagger: `http://localhost:{port}/swagger`

## Документация

| Файл | Содержание |
|------|-----------|
| `docs/architecture.md` | Слои, паттерны, error handling, правила |
| `docs/project-context.md` | Все реализованные endpoints, техдолг |
| `docs/thesis-summary.md` | Доменная модель, роли, бизнес-сущности |
| `docs/web-client-architecture.md` | React: routing, auth store, axios interceptors |
| `docs/mobile-client-architecture.md` | Android: MVVM, Hilt, навигация, scope |
| `docs/running.md` | Dev и prod запуск, env vars, Caddy, Docker |
| `docs/architecture-diagram.drawio` | Диаграмма архитектуры |

## Ключевые правила (не нарушать)

- `DbContext` — **только** в `Infrastructure`, никогда в `Api`
- `Entity` — **никогда** не возвращать из endpoints, только `Contracts`
- Время — только `DateTimeOffset.UtcNow`, БД — `TIMESTAMPTZ`
- Чтение — всегда `AsNoTracking()`

## Правила для Claude Code

- Не запускать `dotnet run`, `dotnet watch`, `docker compose up`, любые long-running процессы
- Не запускать миграции, не менять схему БД
- Сборка для проверки: `dotnet build` — допустима
- Запуск окружения — спрашивать
