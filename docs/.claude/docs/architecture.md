# Архитектура Civio

## Слои и зависимости

```
Api → Application ← Infrastructure
       ↓
     Domain
       ↑
  Contracts (DTO)
```

**Правило зависимостей:** стрелки смотрят внутрь. `Infrastructure` реализует интерфейсы `Application`. `Api` знает только про `Application`.

---

## Слой Api (`Civio.Api`)

Только orchestration. Никакой бизнес-логики.

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

**Коды ответов:**
- `400` — ошибка валидации
- `401` — не авторизован
- `403` — нет доступа
- `404` — не найдено
- `201/200` — успех

---

## Слой Application (`Civio.Application`)

Интерфейсы сервисов + use-case логика.

```csharp
public interface IOrganizationService
{
    Task<OrganizationResponse> CreateAsync(Guid ownerId, CreateOrganizationRequest request);
    Task<OrganizationResponse?> GetByIdAsync(Guid id, Guid requesterId);
    Task<IReadOnlyList<OrganizationResponse>> GetMyAsync(Guid ownerId);
}
```

---

## Слой Infrastructure (`Civio.Infrastructure`)

Реализует интерфейсы `Application`. Содержит `AppDbContext`, Fluent configurations, сервисы.

**Регистрация зависимостей — только здесь:**

```csharp
// Infrastructure/DependencyInjection.cs
public static IServiceCollection AddInfrastructure(
    this IServiceCollection services,
    IConfiguration configuration)
{
    services.AddDbContext<AppDbContext>(...);
    services.AddScoped<IOrganizationService, OrganizationService>();
    return services;
}
```

---

## Contracts (`Civio.Contracts`)

Только DTO. Никаких зависимостей от Domain или Infrastructure.

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

Lazy loading отключён. Связи загружать явно через `.Include()`.

---

## Модель доступа

Owner и Employee определяются без отдельных таблиц ролей:

```csharp
// Owner — через organizations.owner_user_id
bool isOwner = org.OwnerUserId == currentUserId;

// Employee — через наличие записи в employees
bool isEmployee = await _db.Employees
    .AsNoTracking()
    .AnyAsync(e => e.UserId == currentUserId && e.OrganizationId == orgId);
```

Подробная матрица прав — в `project-context.md`.

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

Nullable только там, где поле реально может отсутствовать в домене:

```csharp
// ❌ Если поле обязательно
public Guid? OwnerUserId { get; set; }

// ✅
public Guid OwnerUserId { get; set; }
```

---

## Как добавить новый модуль (пример: Bookings)

1. **Domain:** `Booking.cs` в `Civio.Domain/Entities/`
2. **Infrastructure:** `BookingConfiguration.cs` (Fluent API), `DbSet<Booking>` в `AppDbContext`
3. **Contracts:** `CreateBookingRequest.cs` + `BookingResponse.cs`
4. **Application:** `IBookingService.cs`
5. **Infrastructure:** `BookingService.cs`, зарегистрировать в `AddInfrastructure()`
6. **Api:** `BookingEndpoints.cs`, подключить в `Program.cs`
7. **БД:** добавить таблицу в `database/init.sql`
