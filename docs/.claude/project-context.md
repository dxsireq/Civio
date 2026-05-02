# Контекст проекта Civio

## Что реализовано

### Auth (`/api/auth`)
| Endpoint | Статус |
|---------|--------|
| `POST /register` | ✅ |
| `POST /login` | ✅ |
| `GET /me` | ✅ |

Детали: JWT, `PasswordHasher`, роли из БД, Swagger Bearer.

---

### Organizations (`/api/organizations`)
| Endpoint | Статус |
|---------|--------|
| `POST /` | ✅ |
| `GET /my` | ❌ |
| `GET /{id}` | ❌ |

Детали реализованного `POST`:
- Только для авторизованных
- `owner_user_id` берётся из JWT (`ClaimTypes.NameIdentifier`)
- Статус по умолчанию = `"pending"` (через таблицу `organization_statuses`)
- Валидация: name required, trim, ограничение длины
- Возвращает DTO, не Entity

---

### Infrastructure
- `AppDbContext` настроен, все конфигурации синхронизированы с БД
- PostgreSQL через Docker работает
- `AddInfrastructure()` зарегистрирован

---

## Принятые архитектурные решения

### Модель доступа: Owner vs Employee

Две роли внутри организации — без отдельных таблиц ролей.

**Owner** определяется через `organizations.owner_user_id` — не через `employees`.
**Employee** определяется через наличие записи в `employees.user_id`.

```csharp
public static class OrganizationAccess
{
    public static bool IsOwner(Guid userId, Organization org) =>
        org.OwnerUserId == userId;

    public static bool IsEmployee(Guid userId, Guid organizationId,
        IEnumerable<Employee> employees) =>
        employees.Any(e => e.UserId == userId && e.OrganizationId == organizationId);
}
```

| Действие | Owner | Employee |
|---------|-------|----------|
| Управление организацией | ✅ | ❌ |
| Управление сотрудниками | ✅ | ❌ |
| Управление услугами | ✅ | ❌ |
| Управление расписанием | ✅ | ✅ только своим |
| Просмотр бронирований | ✅ | ✅ только своих |
| Смена статуса бронирования | ✅ | ✅ только своих |

**Почему не таблица ролей:** роли статичны, кастомизация не нужна. Полноценный RBAC добавляется позже если появится требование.

---

### Расписание и слоты

**Подход: on-demand вычисление, без pre-generated slots.**

`work_days` = источник правды о рабочем времени сотрудника.
Свободные окна вычисляются при запросе — `work_days` минус существующие `bookings`.
`booking_slots` создаётся **только при бронировании** как фиксация занятого времени.

```
GET /available-slots:
  взять work_days сотрудника на дату
  вычесть bookings на это время
  вернуть окна кратные duration_minutes услуги
```

```csharp
public IReadOnlyList<TimeSlot> GetAvailableSlots(
    WorkDay workDay,
    IEnumerable<Booking> existingBookings,
    int serviceDurationMinutes)
{
    var slots = new List<TimeSlot>();
    var current = workDay.StartTime;
    var end = workDay.EndTime;
    var duration = TimeSpan.FromMinutes(serviceDurationMinutes);

    while (current + duration <= end)
    {
        // пропускаем перерыв
        if (workDay.BreakStart.HasValue &&
            current < workDay.BreakEnd &&
            current + duration > workDay.BreakStart)
        {
            current = workDay.BreakEnd!.Value;
            continue;
        }

        var isFree = !existingBookings.Any(b =>
            b.StartAt < current + duration && b.EndAt > current);

        if (isFree)
            slots.Add(new TimeSlot(current, current + duration));

        current += duration;
    }

    return slots;
}
```

**Race condition** — `SELECT FOR UPDATE` в транзакции бронирования:

```csharp
await _db.Database.ExecuteSqlRawAsync(
    "SELECT id FROM work_days WHERE id = {0} FOR UPDATE", workDayId);
// после этого — проверка доступности и создание booking
```

**Приоритет при конфликте break:** `work_days.break_start/end` имеет приоритет над `schedule_templates`. Шаблон — заготовка, рабочий день — факт.

---

### QR-код бронирования

Токен = подписанная строка: `{ bookingId, userId, expiresAt }`.
Валидация при сканировании — один endpoint, проверяет подпись + статус бронирования.

```csharp
// При создании бронирования
var token = GenerateToken(booking.Id, userId, expiresAt);
_db.BookingQrCodes.Add(new BookingQrCode
{
    BookingId = booking.Id,
    Token = token,
    ExpiresAt = expiresAt
});

// При сканировании (POST /bookings/scan):
// 1. Найти запись по token
// 2. Проверить expires_at > UtcNow
// 3. Проверить booking.status = 'confirmed'
// 4. Записать used_at = UtcNow
```

---

## Что не реализовано (приоритет)

### Ближайшие задачи

**`GET /api/organizations/my`**
- список организаций текущего пользователя
- `owner_user_id` из JWT, `AsNoTracking()`

**`GET /api/organizations/{id}`**
- доступ: owner или employee организации
- `403` если нет доступа

**End-to-end сценарий бронирования**
Минимум для демонстрации:
1. Owner создаёт организацию + услугу + рабочий день сотрудника
2. Клиент запрашивает доступные слоты
3. Клиент создаёт бронирование
4. Сотрудник меняет статус на `confirmed`
5. Генерируется QR-код

---

### Будущие модули
- Schedules / Slots (расписание, генерация слотов)
- Bookings (записи на услуги)
- Notifications (push + email через FCM)
- Employees (управление сотрудниками)
- Services (услуги организации)

### Auth
- Refresh tokens — не реализованы
- Server-side logout — не реализован

---

## Технический долг

| Проблема | Приоритет |
|---------|-----------|
| Нет централизованного error handling middleware | Высокий |
| Нет end-to-end сценария для демонстрации | Высокий |
| Нет rate limiting | Средний |
| Нет unit/integration тестов | Средний |
| JWT без refresh tokens | Средний |
| Валидация частично в сервисах | Низкий |
| Нет CQRS / read-write разделения | Низкий |
| Нет caching слоя | Низкий |

---

## Схема БД

Полная схема в `database/init.sql`.

### Ключевые таблицы

```
users                           — пользователи платформы
roles                           — глобальные роли (Citizen, OrganizationEmployee, PlatformAdmin)
organizations                   — организации (owner_user_id = владелец)
organization_statuses           — pending, approved, rejected, blocked
organization_moderation_history — история решений модератора
branches                        — филиалы организации
employees                       — сотрудники (user_id → связь с users, nullable)
employee_services               — какие услуги оказывает сотрудник
service_categories              — категории услуг
services                        — услуги (duration_minutes определяет размер слота)
schedule_templates              — шаблон расписания по дням недели
work_days                       — фактические рабочие дни сотрудника
booking_slots                   — занятые интервалы (создаются только при бронировании)
booking_statuses                — created, confirmed, cancelled, rejected, completed
bookings                        — бронирования
booking_status_history          — история смены статусов
booking_qr_codes                — токены QR-кодов
notifications                   — уведомления
notification_types/channels/statuses — справочники
device_push_tokens              — FCM токены устройств
```

### Важные решения по схеме
- `booking_slots` — не pre-generated, создаются только при бронировании
- `work_days.break_*` имеет приоритет над `schedule_templates.break_*`
- `employees.user_id` nullable — сотрудник может быть не зарегистрирован в системе
- Схема не меняется — все решения реализуются на уровне логики приложения

> При добавлении новых таблиц — только через `init.sql`. EF migrations не используются.
