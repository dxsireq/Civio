# Контекст проекта Civio

## Реализованный функционал

### Auth (`/api/auth`)
| Endpoint | Описание |
|---------|--------|
| `POST /register` | Регистрация, роль `Citizen` по умолчанию |
| `POST /login` | JWT токен с ролями |
| `GET /me` | Текущий пользователь + роли |

JWT: `PasswordHasher`, роли из `user_roles`, `MapInboundClaims = true`, `RoleClaimType` mapped.

---

### Organizations (`/api/organizations`)
| Endpoint | Доступ |
|---------|--------|
| `POST /` | Auth |
| `GET /my` | Auth (owner) |
| `GET /{id}` | Owner / Employee |
| `PUT /{id}` | Owner only |

Создаётся со статусом `pending`. Статус меняет только PlatformAdmin через `/api/admin`.

---

### Employees (`/api/organizations/{orgId}/employees`)
| Endpoint | Доступ |
|---------|--------|
| `POST /` | Owner |
| `GET /` | Owner / Employee |
| `GET /{id}` | Owner / Employee |
| `PUT /{id}` | Owner |
| `DELETE /{id}` | Owner (soft: `is_active = false`) |
| `GET /{id}/services` | Owner / Employee |
| `POST /{id}/services/{serviceId}` | Owner — привязать услугу |
| `DELETE /{id}/services/{serviceId}` | Owner — отвязать услугу |

`user_id` nullable — сотрудник может не быть зарегистрирован в системе.
`employee_services` **не создаётся автоматически** при создании сотрудника — нужна явная привязка.

---

### Services (`/api/organizations/{orgId}/services`)
| Endpoint | Доступ |
|---------|--------|
| `POST /` | Owner |
| `GET /` | Публично |
| `PUT /{id}` | Owner |
| `DELETE /{id}` | Owner (soft: `is_active = false`) |

---

### Schedule
| Endpoint | Доступ |
|---------|--------|
| `POST /api/employees/{id}/work-days` | Owner / Employee |
| `GET /api/employees/{id}/work-days` | Owner / Employee |
| `PUT /api/employees/{id}/work-days/{wdId}` | Owner / Employee |
| `DELETE /api/employees/{id}/work-days/{wdId}` | Owner / Employee |
| `POST /api/employees/{id}/schedule-templates` | Owner / Employee |
| `GET /api/organizations/{id}/available-slots?serviceId=&date=` | Публично |

Слоты вычисляются on-demand: `work_days` минус `booking_slots`, окна кратные `duration_minutes`.
Только сотрудники с `employee_services` для данной услуги попадают в результат.

---

### Bookings (`/api/bookings`)
| Endpoint | Доступ |
|---------|--------|
| `POST /` | Auth (Citizen) |
| `GET /my` | Auth (Citizen) |
| `GET /{id}` | Citizen-владелец / Org member |
| `POST /{id}/cancel` | Citizen-владелец |
| `POST /{id}/confirm` | Org member |
| `POST /{id}/reject` | Org member |
| `POST /{id}/complete` | Org member |
| `GET /{id}/qr` | Citizen-владелец |
| `POST /scan` | Org member |
| `GET /api/organizations/{id}/bookings` | Owner / Employee |

При создании: `SELECT FOR UPDATE` на `work_days`, двойная проверка слота, создаёт `booking_slot` + `booking_qr_code`.
При каждой смене статуса → `booking_status_history` + `notifications`.

#### QR-код
Токен = CSPRNG base64url (32 байта, URL-safe). Не JWT.
`POST /scan` проверяет: `expires_at > now`, `used_at == null`, `status == confirmed`, org access.
При успехе: `used_at = now`, статус → `completed`.

---

### Notifications (`/api/notifications`)
| Endpoint | Доступ |
|---------|--------|
| `GET /my` | Auth |

Уведомление создаётся при каждой смене статуса бронирования (`created/confirmed/cancelled/completed`). `rejected` — без уведомления (нет типа в seed).
Email через `System.Net.Mail.SmtpClient`. Конфиг в `.env` (`Email__*` переменные). Если `Host/Username/From` пусты — только запись в DB.

---

### Admin (`/api/admin/organizations`)
| Endpoint | Доступ |
|---------|--------|
| `GET /` | PlatformAdmin |
| `POST /{id}/approve` | PlatformAdmin |
| `POST /{id}/reject` | PlatformAdmin |
| `POST /{id}/block` | PlatformAdmin |

Каждое действие → запись в `organization_moderation_history`. Body: `{ "comment": "..." }` (опционально).
Роль `PlatformAdmin` назначается вручную через `user_roles` в БД.

---

## Архитектурные решения

### QR токен
Изменён с JWT на opaque CSPRNG: `Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))` с URL-safe заменой символов. Причина: меньше QR, токен не раскрывает данные, одноразовость через `used_at`.

### .env загрузка
`DotNetEnv.Env.TraversePath().Load()` вызывается до `WebApplication.CreateBuilder`. Traverse ищет `.env` от рабочей директории вверх до корня репо. Переменные с `__` как разделитель секций (`Email__Host` → `Email:Host`).

### JWT роли
`MapInboundClaims = true` явно в `AddJwtBearer`. В .NET 10 дефолт мог поменяться → `role` не маппился в `ClaimTypes.Role` → `RequireRole` не работал. Named policy `"PlatformAdmin"` зарегистрирована в `AddAuthorization`.

---

## Технический долг

| Проблема | Приоритет |
|---------|-----------|
| JWT без refresh tokens | Средний |
| Нет unit/integration тестов | Средний |
| Нет rate limiting | Низкий |
| `System.Net.Mail.SmtpClient` deprecated | Низкий (заменить на MailKit) |
| `DependecyInjection.cs` — опечатка в имени файла | Низкий |

---

## e2e сценарий (все шаги реализованы)

1. `POST /api/auth/register` — owner
2. `POST /api/organizations` — создать org (статус `pending`)
3. `POST /api/organizations/{id}/employees` — создать сотрудника
4. `POST /api/organizations/{id}/services` — создать услугу
5. `POST /api/organizations/{orgId}/employees/{id}/services/{serviceId}` — привязать услугу к сотруднику ⚠️ обязательно
6. `POST /api/employees/{id}/work-days` — создать рабочий день
7. `POST /api/auth/register` — клиент
8. `GET /api/organizations/{id}/available-slots?serviceId=&date=` — получить слоты
9. `POST /api/bookings` — создать бронирование
10. `POST /api/bookings/{id}/confirm` — подтвердить (owner/employee)
11. `GET /api/bookings/{id}/qr` — получить токен QR
12. `POST /api/bookings/scan` — сканирование → статус `completed`

---

## Схема БД

Полная схема в `database/init.sql`.

```
users                           — пользователи платформы
roles                           — глобальные роли (Citizen, OrganizationEmployee, PlatformAdmin)
user_roles                      — связь users ↔ roles
organizations                   — организации (owner_user_id = владелец)
organization_statuses           — pending, approved, rejected, blocked
organization_moderation_history — история решений модератора
employees                       — сотрудники (user_id → nullable)
employee_services               — какие услуги оказывает сотрудник (явная привязка)
service_categories              — категории услуг
services                        — услуги (duration_minutes определяет размер слота)
schedule_templates              — шаблон расписания по дням недели
work_days                       — фактические рабочие дни сотрудника
booking_slots                   — занятые интервалы (создаются только при бронировании)
booking_statuses                — created, confirmed, cancelled, rejected, completed
bookings                        — бронирования
booking_status_history          — история смены статусов
booking_qr_codes                — токены QR-кодов  used_at)
notifications                   — уведомления
notification_types/channels/statuses — справочники
device_push_tokens              — FCM токены устройств
```

### Важные решения по схеме
`booking_slots` — не pre-generated, создаются только при бронировании
`work_days.break_*` имеет приоритет над `schedule_templates.break_*`
`employees.user_id` nullable — сотрудник может не быть зарегистрирован
EF migrations не используются — только `init.sql`
