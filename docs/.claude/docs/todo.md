# Civio — TODO

> Приоритет: сверху вниз. Завершил — перемести в `## Готово`, не удаляй.

---

## В работе
_(сюда переносить задачу когда начал)_

---

## Инфраструктура (сделать до всего остального)

- [ ] Error handling middleware — глобальный обработчик, возврат `{ error, statusCode }`
- [ ] Валидация моделей — DataAnnotations на всех Contracts + `AddProblemDetails()`
- [ ] Seed data — `database/test-data.sql`: пользователь, организация, сотрудник, услуга, рабочий день

---

## Organizations

- [ ] `GET /api/organizations/my` — список организаций юзера (owner_user_id из JWT, AsNoTracking)
- [ ] `GET /api/organizations/{id}` — по id, доступ: owner/employee, 403 иначе
- [ ] `PUT /api/organizations/{id}` — редактировать, только owner
- [ ] Доступ через `OrganizationAccess.IsOwner` / `IsEmployee` везде

---

## Employees

- [ ] `POST /api/organizations/{id}/employees` — создать сотрудника, только owner, `user_id` обязателен (существующий юзер)
- [ ] `GET /api/organizations/{id}/employees` — список сотрудников, только owner
- [ ] `DELETE /api/organizations/{id}/employees/{employeeId}` — удалить сотрудника, только owner

---

## Services (услуги)

- [ ] `POST /api/organizations/{id}/services` — создать услугу (name, description, duration_minutes, price), только owner
- [ ] `GET /api/organizations/{id}/services` — список услуг, публично
- [ ] `PUT /api/organizations/{id}/services/{serviceId}` — редактировать, только owner
- [ ] `DELETE /api/organizations/{id}/services/{serviceId}` — деактивировать (`is_active = false`), только owner

---

## Schedule (расписание)

- [ ] `POST /api/employees/{id}/work-days` — создать рабочий день (work_date, start_time, end_time, break_start?, break_end?), owner или сотрудник
- [ ] `GET /api/employees/{id}/work-days` — рабочие дни сотрудника
- [ ] `PUT /api/employees/{id}/work-days/{workDayId}` — редактировать
- [ ] `DELETE /api/employees/{id}/work-days/{workDayId}` — удалить (каскад: booking_slots)
- [ ] `POST /api/employees/{id}/schedule-templates` — шаблон по дням недели (опционально, упрощает work_days)

---

## Slots (доступное время)

- [ ] `GET /api/organizations/{id}/available-slots?serviceId=&date=` — доступные слоты на дату
  - work_days сотрудников с нужной услугой
  - минус bookings
  - окна кратные `service.duration_minutes`
- [ ] `SlotCalculationService.GetAvailableSlots(workDay, existingBookings, durationMinutes)` — чистая доменная логика, без БД

---

## Bookings (бронирования)

- [ ] `POST /api/bookings` — создать (organizationId, serviceId, employeeId, startAt)
  - проверить слот
  - `SELECT FOR UPDATE` на work_days строку
  - booking статус `created`
  - создать booking_slot
  - booking_qr_code (JWT: bookingId + userId + expiresAt)
- [ ] `GET /api/bookings/my` — бронирования юзера (citizen)
- [ ] `GET /api/bookings/{id}` — детали, доступ: citizen-владелец или employee
- [ ] `POST /api/bookings/{id}/cancel` — отмена клиентом, статус → `cancelled`, → booking_status_history
- [ ] `GET /api/organizations/{id}/bookings` — бронирования организации, owner/employee
- [ ] `POST /api/bookings/{id}/confirm` — подтвердить, статус → `confirmed`
- [ ] `POST /api/bookings/{id}/reject` — отклонить, статус → `rejected`
- [ ] `POST /api/bookings/{id}/complete` — завершить, статус → `completed`
- [ ] Все смены статуса → `booking_status_history`

---

## QR-коды

- [ ] `GET /api/bookings/{id}/qr` — QR (PNG или токен), только владелец
- [ ] `POST /api/bookings/scan` — валидация при сканировании
  - найти по token
  - проверить expires_at > UtcNow
  - проверить booking.status = `confirmed`
  - записать used_at
  - вернуть данные

---

## Notifications (минимум для диплома)

- [ ] Запись в `notifications` при каждой смене статуса
- [ ] `GET /api/notifications/my` — уведомления юзера
- [ ] email/push — опционально

---

## Moderation (Admin)

- [ ] `GET /api/admin/organizations` — все организации, только PlatformAdmin
- [ ] `POST /api/admin/organizations/{id}/approve` — статус → `approved`, → `organization_moderation_history`
- [ ] `POST /api/admin/organizations/{id}/reject` — статус → `rejected`
- [ ] `POST /api/admin/organizations/{id}/block` — статус → `blocked`

---

## Branches (филиалы, низкий приоритет)

- [ ] `POST /api/organizations/{id}/branches` — создать филиал
- [ ] `GET /api/organizations/{id}/branches` — список филиалов

---

## Postman / Демо

- [ ] Postman collection, end-to-end сценарий:
  1. Регистрация owner
  2. Создание организации
  3. Создание сотрудника
  4. Создание услуги
  5. Создание рабочего дня
  6. Регистрация клиента
  7. Запрос доступных слотов
  8. Создание бронирования
  9. Подтверждение сотрудником
  10. Получение QR-кода
  11. Сканирование QR

---

## Готово

- [x] Архитектура (Clean Architecture, слои, DI)
- [x] Схема БД (`database/init.sql`)
- [x] Docker Compose (PostgreSQL)
- [x] `POST /api/auth/register`
- [x] `POST /api/auth/login`
- [x] `GET /api/auth/me`
- [x] `POST /api/organizations`
- [x] Решение: модель доступа owner/employee
- [x] Решение: расписание on-demand (без pre-generated slots)
- [x] Решение: QR-код как подписанный токен
- [x] Документация (CLAUDE.md, architecture.md, project-context.md, thesis-summary.md)