# Архитектура Civio

## Слои и зависимости

```
Api → Application ← Infrastructure
       ↓
     Domain
       ↑
  Contracts (DTO)
```

**Правило зависимостей:** стрелки внутрь. `Infrastructure` реализует интерфейсы `Application`. `Api` знает только `Application`.

---

## Слой Api (`Civio.Api`)

Только orchestration. Бизнес-логики нет.

```csharp
// ✅ Правильно
app.MapPost("/api/organizations", async (
    CreateOrganizationRequest request,
    IOrganizationService svc,
    ClaimsPrincipal user) =>
{
    var userId = Guid.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
    var result = await svc.CreateAsync(userId, request);
    return Results.Created($"/api/organizations/{result.Id}", result);
});

// ❌ Запрещено — прямой DbContext в Api
app.MapPost("/api/organizations", async (AppDbContext db, ...) => { ... });
```

Endpoints организованы в файлы `*Endpoints.cs`, подключаются через extension methods в `Program.cs`.

**Коды ответов:**
- `400` — ошибка валидации
- `401` — не авторизован
- `403` — нет доступа
- `404` — не найдено
- `201/200` — успех

---

## Слой Application (`Civio.Application`)

Интерфейсы сервисов. Логика use-case в Infrastructure-реализациях.

Пространства имён по доменам:
- `Civio.Application.Auth` — `IAuthService`, `IJwtTokenGenerator`
- `Civio.Application.Bookings` — `IBookingService`
- `Civio.Application.Organizations` — `IOrganizationService`
- `Civio.Application.Employees` — `IEmployeeService`
- `Civio.Application.Services` — `IServiceService`
- `Civio.Application.Schedule` — `IWorkDayService`, `IScheduleTemplateService`
- `Civio.Application.Slots` — `IAvailableSlotsService`, `SlotCalculationService`
- `Civio.Application.Notifications` — `INotificationService`, `IEmailSender`
- `Civio.Application.Admin` — `IAdminService`

---

## Слой Infrastructure (`Civio.Infrastructure`)

Реализует интерфейсы `Application`. Содержит `AppDbContext`, конфигурации EF, сервисы.

**Регистрация зависимостей — только здесь** (`DependecyInjection.cs`, опечатка намеренно сохранена):

```csharp
public static IServiceCollection AddInfrastructure(
    this IServiceCollection services,
    IConfiguration configuration)
{
    services.AddDbContext<AppDbContext>(...);
    services.Configure<EmailOptions>(configuration.GetSection("Email"));
    services.AddScoped<IEmailSender, SmtpEmailSender>();
    services.AddScoped<INotificationService, NotificationService>();
    services.AddScoped<IAdminService, AdminService>();
    services.AddScoped<IOrganizationService, OrganizationService>();
    // ...остальные сервисы
    return services;
}
```

**Все EF-конфигурации** в одном файле: `Persistence/Configurations/CivioEntityConfigurations.cs` (~674 строки, 25 sealed классов, `ApplyConfigurationsFromAssembly`).

---

## Contracts (`Civio.Contracts`)

Только DTO. Зависимостей от Domain или Infrastructure нет.

```csharp
// ✅ Правильно
public record OrganizationResponse(Guid Id, string Name, string Status);

// ❌ Запрещено — Entity из endpoint
app.MapGet("/orgs/{id}", async (...) =>
    Results.Ok(await db.Organizations.FindAsync(id)));
```

---

## Работа с БД

```csharp
// Чтение — всегда AsNoTracking
var orgs = await _db.Organizations
    .AsNoTracking()
    .Where(o => o.OwnerUserId == userId)
    .ToListAsync();

// Запись — обычный трекинг
var org = new Organization { ... };
_db.Organizations.Add(org);
await _db.SaveChangesAsync();
```

Lazy loading отключён. Связи грузить явно через `.Include()`.

### Баг: HasDefaultValue(true) + IsActive = false

Сущности с `HasDefaultValue(true)` на `IsActive`: `organizations`, `employees`, `services`, `booking_slots`, `schedule_templates`, `work_days`, `device_push_tokens`.

EF Core использует `false` (CLR default для bool) как sentinel → `IsActive = false` воспринимается как "не задано" → пропускается в UPDATE.

**Фикс при деактивации:**

```csharp
entity.IsActive = false;
entity.UpdatedAt = DateTimeOffset.UtcNow;
_dbContext.Entry(entity).Property(e => e.IsActive).IsModified = true;
await _dbContext.SaveChangesAsync(cancellationToken);
```

### Конфликт имён: EmployeeService

`Civio.Infrastructure.Employees.EmployeeService` (класс сервиса) конфликтует с `Civio.Domain.Entities.EmployeeService` (join-entity).

При создании `employee_services` записи использовать полный namespace:

```csharp
_dbContext.EmployeeServices.Add(new Domain.Entities.EmployeeService
{
    EmployeeId = employeeId,
    ServiceId = serviceId
});
```

---

## Модель доступа

Owner и Employee без отдельных таблиц ролей:

```csharp
// Owner — через organizations.owner_user_id
bool isOwner = org.OwnerUserId == currentUserId;

// Employee — через наличие записи в employees
bool isEmployee = employees.Any(e => e.UserId == userId && e.OrganizationId == orgId);
```

`OrganizationAccess` static helper в `Civio.Domain.Authorization`. Матрица прав — в `project-context.md`.

---

## Уведомления

`INotificationService.NotifyBookingStatusChangedAsync` вызывается из `BookingService` после каждой смены статуса. Маппинг: `created/confirmed/cancelled/completed` → тип уведомления. `rejected` — пропускается.

```
NotificationService:
  1. Найти тип по коду (если нет — return)
  2. Загрузить email channel + created status + user.Email
  3. Сохранить Notification в DB
  4. Вызвать IEmailSender.SendAsync
  5. Обновить статус → sent / failed
```

`SmtpEmailSender` использует `System.Net.Mail.SmtpClient`. Если `Host/Username/From` пусты — логирует и пропускает без исключения.

---

## Конфигурация

`.env` в корне репо (в `.gitignore`). Загружается через `DotNetEnv.Env.TraversePath().Load()` до `CreateBuilder`.

```
Email__Host=smtp.gmail.com
Email__Port=587
Email__Username=...
Email__Password=...   # Gmail App Password
Email__From=...
Email__EnableSsl=true
```

---

## JWT и авторизация

```csharp
options.MapInboundClaims = true;  // явно — в .NET 10 дефолт ненадёжен
```

Named policy для admin endpoints:
```csharp
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("PlatformAdmin", policy => policy.RequireRole("PlatformAdmin"));
});
```

Endpoint группа: `.RequireAuthorization("PlatformAdmin")`.

Роль `PlatformAdmin` назначается вручную через `user_roles` — регистрация всегда даёт `Citizen`.

---

## Конвенции именования

| Контекст | Стиль |
|---------|-------|
| C# классы, свойства | `PascalCase` |
| C# параметры, переменные | `camelCase` |
| БД таблицы и колонки | `snake_case` |
| EF Fluent mapping | `HasColumnName("snake_case")` |

---

## Время

```csharp
// ✅ Всегда
var now = DateTimeOffset.UtcNow;

// ❌ Никогда
var now = DateTime.Now;
var now = DateTime.UtcNow;
```

БД: всегда `TIMESTAMPTZ`.

---

## Nullable

Nullable только если поле реально может отсутствовать.

---

## Как добавить новый модуль

1. **Domain:** `Entity.cs` в `Civio.Domain/Entities/`
2. **Infrastructure:** конфигурация в `CivioEntityConfigurations.cs`, `DbSet<T>` в `AppDbContext`
3. **Contracts:** `CreateRequest.cs` + `Response.cs`
4. **Application:** `IService.cs`
5. **Infrastructure:** `Service.cs`, зарегистрировать в `DependecyInjection.cs`
6. **Api:** `Endpoints.cs`, подключить в `Program.cs`
7. **БД:** таблица в `database/init.sql` (migrations не используются)
