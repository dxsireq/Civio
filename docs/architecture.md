# Architecture

## Layers

```
Api → Application (interfaces) ← Infrastructure (implementations)
         ↓
       Domain (entities, no logic)
         ↓
       Contracts (DTOs, separate project)
```

- `Api` — только routing + orchestration. Никакого EF, никаких entities.
- `Application` — интерфейсы сервисов, domain exceptions, `SlotCalculationService` (pure logic).
- `Infrastructure` — реализации сервисов, EF `AppDbContext`, email.
- `Domain` — POCO entities + `OrganizationAccess` (static helper для проверки прав).
- `Contracts` — request/response DTOs. Никогда не возвращать `Domain.Entities` из endpoints.

## Endpoints

Каждый модуль = статический класс `XxxEndpoints` с extension method `MapXxxEndpoints(IEndpointRouteBuilder)`.
Все методы — private static async. Регистрация в `Program.cs`.

## DI

Все сервисы — `AddScoped`. Регистрация в `Infrastructure/DependecyInjection.cs`.
> ⚠️ `AppDbContext` зарегистрирован дважды: в `Program.cs` (legacy) и в `DependencyInjection.cs`. Нужно убрать из `Program.cs`.

## Auth

JWT Bearer, `ClockSkew = TimeSpan.Zero`, `MapInboundClaims = true`.  
`userId` извлекается из `ClaimTypes.NameIdentifier` во всех endpoints вручную.  
Политика `PlatformAdmin` — `RequireRole("PlatformAdmin")`.

## Error handling

`GlobalExceptionHandler` (IExceptionHandler):

| Exception | HTTP |
|-----------|------|
| `KeyNotFoundException` | 404 |
| `InvalidOperationException` | 409 |
| `ArgumentException` | 400 |
| `UnauthorizedAccessException` | 403 |
| `EmailNotVerifiedException` | 403 + code `email_not_verified` |
| `InvalidCredentialsException` | 401 + code `invalid_credentials` |
| `InactiveUserException` | 403 + code `user_inactive` |
| прочие | 500 |

Ответ: `ErrorResponse(message, statusCode, code?)`.

## Validation

`AddValidation()` — встроенная ASP.NET Core валидация Data Annotations.  
Сообщения об ошибках переводятся на русский в `Program.cs` через `CustomizeProblemDetails`.

## Authorization model

`OrganizationAccess.IsOwner(userId, org)` — проверка владельца.  
`OrganizationAccess.IsEmployee(userId, orgId, employees)` — проверка сотрудника.  
Используется в сервисах вручную, не через middleware.

## Правила

- `AsNoTracking()` на всех читающих запросах
- Время — `DateTimeOffset.UtcNow`, в БД `TIMESTAMPTZ`
- Схема БД — только через `database/init.sql`, migrations не используются
- CORS: `localhost:5173`, `localhost:5174`
