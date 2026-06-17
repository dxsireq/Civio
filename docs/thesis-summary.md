# Thesis / Domain Summary

Платформа для записи граждан на услуги организаций.

## Роли

| Роль | Описание |
|------|----------|
| `Citizen` | Записывается на услуги (default при регистрации) |
| `OrgOwner` | Создаёт организацию, управляет сотрудниками/услугами |
| `Employee` | Сотрудник организации, обслуживает записи |
| `PlatformAdmin` | Модерация организаций, управление пользователями |

Роли хранятся в `roles` + `user_roles` (many-to-many).

## Domain entities

**Организация**
- Статусы: `pending → approved / rejected`, `approved → blocked`
- Модерация через `OrganizationModerationHistory` (кто, когда, комментарий)
- Поля: name, city, address, legalName, inn, website, phone, email

**Сотрудник (Employee)**
- Привязан к организации и пользователю
- Приглашение через email-токен (`EmployeeInvitation`)
- Может быть назначен на несколько услуг (`EmployeeService`)

**Услуга (Service)**
- Принадлежит организации
- Soft delete (IsActive)
- Привязана к `ServiceCategory`

**Расписание**
- `WorkDay` — конкретный рабочий день сотрудника (date, startTime, endTime, breakStart, breakEnd)
- `ScheduleTemplate` — шаблон недельного расписания

**Бронирование (Booking)**
- Гражданин → услуга → сотрудник (опционально) → слот
- Статусы: `created`, `confirmed`, `rejected`, `cancelled`, `completed`
- История статусов (`BookingStatusHistory`)
- QR-код (`BookingQrCode`) для подтверждения визита

**Уведомления**
- `Notification` — запись в БД
- `NotificationType`: booking_created, booking_confirmed, booking_cancelled, booking_completed
- `NotificationChannel`: email (единственный реализованный)
- `NotificationStatus`: created, sent, failed

**Прочее**
- `EmailVerificationCode` — код подтверждения email при регистрации
- `DevicePushToken` — сущность для push-уведомлений (не используется в API)
