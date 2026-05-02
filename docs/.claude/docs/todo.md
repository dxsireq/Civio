# Civio — TODO

> Приоритет: сверху вниз внутри каждой секции.
> Claude Code: при завершении задачи — перемещай в `## Готово`, не удаляй.

---

## В работе
_(сюда переносить задачу когда начал)_

---

## Инфраструктура (сделать до всего остального)

- [ ] Error handling middleware — глобальный обработчик исключений, возврат `{ error, statusCode }`
- [ ] Валидация моделей — DataAnnotations на всех Contracts + `AddProblemDetails()`
- [ ] Seed data — `database/test-data.sql` с пользователями, организацией, сотрудником, услугой, рабочим днём

---

## Organizations

- [ ] `GET /api/organizations/my` — список организаций текущего пользователя (owner_user_id из JWT, AsNoTracking)
- [ ] `GET /api/organizations/{id}` — получение по id, доступ: owner или employee, 403 если нет доступа
- [ ] `PUT /api/organizations/{id}` — редактирование, только owner
- [ ] Проверка доступа через `OrganizationAccess.IsOwner` / `IsEmployee` на всех endpoints

---

## Employees

- [ ] `POST /api/organizations/{id}/employees` — создать сотрудника, только owner, `user_id` обязателен (существующий пользователь)
- [ ] `GET /api/organizations/{id}/employees` — список сотрудников, доступ: owner
- [ ] `DELETE /api/organizations/{id}/employees/{employeeId}` — удалить сотрудника, только owner

---

## Services (услуги)

- [ ] `POST /api/organizations/{id}/services` — создать услугу (name, description, duration_minutes, price), только owner
- [ ] `GET /api/organizations/{id}/services` — список услуг организации, публичный доступ
- [ ] `PUT /api/organizations/{id}/services/{serviceId}` — редактировать услугу, только owner
- [ ] `DELETE /api/organizations/{id}/services/{serviceId}` — деактивировать услугу (`is_active = false`), только owner

---

## Schedule (расписание)

- [ ] `POST /api/employees/{id}/work-days` — создать рабочий день (work_date, start_time, end_time, break_start?, break_end?), owner или сам сотрудник
- [ ] `GET /api/employees/{id}/work-days` — список рабочих дней сотрудника
- [ ] `PUT /api/employees/{id}/work-days/{workDayId}` — редактировать рабочий день
- [ ] `DELETE /api/employees/{id}/work-days/{workDayId}` — удалить рабочий день (каскадно удаляет booking_slots)
- [ ] `POST /api/employees/{id}/schedule-templates` — создать шаблон расписания по дням недели (опционально, упрощает заполнение work_days)

---

## Slots (доступное время)

- [ ] `GET /api/organizations/{id}/available-slots?serviceId=&date=` — вычислить доступные слоты на дату
  - взять work_days сотрудников умеющих оказывать услугу
  - вычесть существующие bookings
  - вернуть окна кратные `service.duration_minutes`
- [ ] Реализовать `SlotCalculationService.GetAvailableSlots(workDay, existingBookings, durationMinutes)` — чистая доменная логика без БД

---

## Bookings (бронирования)

- [ ] `POST /api/bookings` — создать бронирование (organizationId, serviceId, employeeId, startAt)
  - проверить доступность слота
  - `SELECT FOR UPDATE` на work_days строку
  - создать booking со статусом `created`
  - создать booking_slot
  - создать booking_qr_code (токен = подписанный JWT: bookingId + userId + expiresAt)
- [ ] `GET /api/bookings/my` — список бронирований текущего пользователя (citizen)
- [ ] `GET /api/bookings/{id}` — детали бронирования, доступ: citizen-владелец или сотрудник организации
- [ ] `POST /api/bookings/{id}/cancel` — отмена клиентом, статус → `cancelled`, запись в booking_status_history
- [ ] `GET /api/organizations/{id}/bookings` — список бронирований организации, доступ: owner или employee
- [ ] `POST /api/bookings/{id}/confirm` — подтверждение сотрудником, статус → `confirmed`
- [ ] `POST /api/bookings/{id}/reject` — отклонение сотрудником, статус → `rejected`
- [ ] `POST /api/bookings/{id}/complete` — завершение сотрудником, статус → `completed`
- [ ] Все смены статуса пишут запись в `booking_status_history`

---

## QR-коды

- [ ] `GET /api/bookings/{id}/qr` — вернуть QR-код (PNG или строку токена) для бронирования, доступ: только владелец бронирования
- [ ] `POST /api/bookings/scan` — валидация QR при сканировании сотрудником
  - найти по token
  - проверить expires_at > UtcNow
  - проверить booking.status = `confirmed`
  - записать used_at
  - вернуть данные бронирования

---

## Notifications (минимум для диплома)

- [ ] Создавать запись в таблице `notifications` при каждой смене статуса бронирования
- [ ] `GET /api/notifications/my` — список уведомлений текущего пользователя
- [ ] Реальная отправка (email/push) — опционально, можно показать таблицу с данными

---

## Moderation (Admin)

- [ ] `GET /api/admin/organizations` — список всех организаций, только PlatformAdmin
- [ ] `POST /api/admin/organizations/{id}/approve` — статус → `approved`, запись в `organization_moderation_history`
- [ ] `POST /api/admin/organizations/{id}/reject` — статус → `rejected`
- [ ] `POST /api/admin/organizations/{id}/block` — статус → `blocked`

---

## Branches (филиалы, низкий приоритет)

- [ ] `POST /api/organizations/{id}/branches` — создать филиал
- [ ] `GET /api/organizations/{id}/branches` — список филиалов

---

## Postman / Демо

- [ ] Postman collection с готовым end-to-end сценарием:
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
