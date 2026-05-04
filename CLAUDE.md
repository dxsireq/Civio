# Civio

Backend-платформа: управление организациями, запись на услуги.

## Стек

- **Runtime:** .NET 10, ASP.NET Core Minimal API
- **ORM:** EF Core (без migrations, SQL-first)
- **БД:** PostgreSQL (Docker), схема через `database/init.sql`
- **Auth:** JWT Bearer (без refresh tokens, пока)
- **Контейнеризация:** Docker Compose

## Структура проекта

```
Civio.sln
├── src/
│   ├── Civio.Api/            # Endpoints (только orchestration)
│   ├── Civio.Application/    # Интерфейсы + use-cases
│   ├── Civio.Domain/         # Сущности
│   ├── Civio.Infrastructure/ # EF Core, сервисы, DI
│   └── Civio.Contracts/      # DTO (request/response)
└── database/
    └── init.sql              # Полная схема БД
```

## Запуск локально

```bash
docker compose up -d        # PostgreSQL
dotnet run --project src/Civio.Api
```

Swagger: `https://localhost:{port}/swagger`

## Документация

| Файл | Содержание |
|------|-----------|
| `.claude/docs/architecture.md` | Clean Architecture конвенции, соглашения по коду |
| `.claude/docs/project-context.md` | Текущее состояние, что реализовано, техдолг |
| `.claude/docs/thesis-summary.md` | Доменная модель, бизнес-требования из диплома |
| `.claude/docs/web-client-architecture.md` | Архитектура веб-клиента |

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
