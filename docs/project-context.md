# Project Context

## Реализовано

### Auth (`/api/auth`)
- `POST /register` — регистрация, роль `Citizen` по умолчанию, отправка email-кода подтверждения
- `POST /verify-email` — подтверждение email по коду, возвращает JWT
- `POST /resend-code` — повторная отправка кода
- `POST /login` — вход, проверка IsActive + IsEmailVerified
- `GET /me` — текущий пользователь
- `PUT /me` — обновление профиля
- `POST /me/change-password`

### Organizations (`/api/organizations`)
- Каталог с фильтром по городу (`?city=`) — публичный endpoint
- CRUD (без DELETE): create, get by id, update
- `GET /my` — организации текущего пользователя (владелец)
- Создание → статус `pending`, требует модерации

### Employees (`/api/organizations/{orgId}/employees`)
- CRUD: create, list, get by id, update, deactivate (soft delete)
- `GET /api/employees/me` — все employee-записи текущего пользователя
- Assign/unassign services: `POST/DELETE /{id}/services/{serviceId}`
- Invitation: resend, revoke

### Invitations (`/api/invitations`)
- `GET /{token}` — публичный, инфо для pre-fill формы
- `POST /{token}/accept-register` — публичный, регистрация + принятие в одном шаге
- `POST /{token}/accept` — авторизованный, существующий пользователь принимает

### Services (`/api/organizations/{orgId}/services`)
- `GET /` — публичный
- `POST /`, `PUT /{serviceId}`, `DELETE /{serviceId}` (soft deactivate) — auth required

### Schedule (`/api/employees/{employeeId}/...`)
- WorkDays: CRUD (`work-days`)
- ScheduleTemplates: только `POST` (`schedule-templates`), GET/PUT/DELETE не реализованы

### Slots (`/api/organizations/{orgId}/available-slots`)
- Публичный endpoint, `?serviceId=&date=`
- Вычисление через `SlotCalculationService` (Application layer)

### Bookings (`/api/bookings`)
- `POST /` — создание записи
- `GET /my` — мои записи
- `GET /{id}`, `GET /{id}/qr` — детали и QR-код
- `POST /scan` — сканирование QR (для сотрудника)
- Управление статусом: `cancel`, `confirm`, `reject`, `complete`
- `GET /api/organizations/{orgId}/bookings` — записи организации

Booking statuses: `created → confirmed/cancelled/rejected → completed`

### Notifications (`/api/notifications/my`)
- Хранятся в БД с трекингом статуса (created → sent/failed)
- Триггер: изменение статуса бронирования (created, confirmed, cancelled, completed)
- Канал: email через SMTP (`SmtpEmailSender`)
- Тихий режим: если SMTP не сконфигурирован — логирует, не падает

### Admin (`/api/admin`, требует роль `PlatformAdmin`)
- **Organizations**: список всех, `approve`, `reject`, `block`
- **Users**: список (фильтр: search, role, isActive), детали, update roles, block/unblock
- **Statistics**: платформа (`GET /statistics`), организация (`GET /organizations/{orgId}/statistics`)
- **Activity log**: `GET /activity-log` (фильтр: entityType, actorId, from, to, page, pageSize)
  - Логирует: изменения статуса организации (из `OrganizationModerationHistory`) и статуса бронирований (из `BookingStatusHistory`)

### Org Statistics (`/api/organizations/{orgId}/statistics`)
- Владелец или admin (bypassOwnerCheck)

## Техдолг / не реализовано

- Refresh tokens — нет
- `DevicePushToken` entity есть в домене, API endpoint нет
- `ScheduleTemplate` — только создание, нет get/update/delete
- `AppDbContext` двойная регистрация в `Program.cs` и `DependencyInjection.cs`
- HTTPS redirection закомментирована
- `ActivityLog` агрегирует в памяти (не SQL), может быть медленно при большом объёме
