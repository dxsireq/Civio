# Civio — TODO

## QR-коды

- [ ] изменить вывод scan endpoint (после того как будут готовы пользовательские клиенты)

---

## Web-клиент

Стек: React + TypeScript + Vite (уже настроен).
Добавить: React Router, Axios, Zustand (или Context), shadcn/ui + Tailwind, React Hook Form + Zod, jsQR (для сканера).

### Фаза 0 — Инфраструктура

- [ ] Установить зависимости: `react-router-dom`, `axios`, `zustand`, `tailwindcss`, `shadcn/ui`, `react-hook-form`, `zod`, `jsqr`
- [ ] API-клиент: `axios` instance, JWT из localStorage, интерцептор 401 → logout
- [ ] Auth store (Zustand): `token`, `user`, `login()`, `logout()`
- [ ] `ProtectedRoute` — редирект на `/login` если нет токена
- [ ] `AdminRoute` — редирект если нет роли `PlatformAdmin`
- [ ] Layout компоненты: `AppLayout` (сайдбар + хедер), `AuthLayout` (центрированная форма)
- [ ] Глобальный error handler (toast уведомления)

---

### Фаза 1 — Авторизация (общие страницы)

- [ ] **Страница 1: Вход** `/login`
  - Форма: email + password
  - POST `/api/auth/login` → сохранить токен → редирект по роли
  - Если `PlatformAdmin` → `/admin/organizations`, иначе → `/`

- [ ] **Страница 2: Регистрация** `/register`
  - Форма: email, password, firstName, lastName, phone (опц.)
  - POST `/api/auth/register` → автологин → редирект на `/`

---

### Фаза 2 — Админ-панель

- [ ] **Страница 3: Список организаций** `/admin/organizations`
  - GET `/api/admin/organizations`
  - Таблица: название, город, статус, дата создания
  - Фильтр по статусу (pending / approved / rejected / blocked)
  - Клик по строке → `/admin/organizations/{id}`

- [ ] **Страница 4: Карточка организации** `/admin/organizations/:id`
  - Детали организации (все поля)
  - Текущий статус + история модерации
  - Кнопки действий: Одобрить / Отклонить / Заблокировать (с полем комментария)
  - POST `/api/admin/organizations/{id}/approve|reject|block`

---

### Фаза 3 — Панель организации

- [ ] **Страница 5: Мои организации** `/` (root для owner)
  - GET `/api/organizations/my`
  - Карточки организаций с статусом
  - Кнопка «Создать организацию»

- [ ] **Страница 6: Создание организации** `/organizations/new`
  - Форма: name, city, address, description, email, phone, website
  - POST `/api/organizations` → редирект на `/organizations/{id}`

- [ ] **Страница 7: Дашборд организации** `/organizations/:id`
  - Обзор: название, статус, контакты
  - Навигация по разделам: Сотрудники / Услуги / Бронирования / Сканер QR
  - PUT `/api/organizations/{id}` — редактирование inline или модалка

- [ ] **Страница 8: Сотрудники** `/organizations/:id/employees`
  - GET `/api/organizations/{id}/employees`
  - Список сотрудников (имя, должность, статус)
  - Форма создания: firstName, lastName, position, phone, email, userId (опц.)
  - POST `/api/organizations/{id}/employees`
  - Кнопка удалить (DELETE)
  - Клик → `/organizations/{id}/employees/{empId}`

- [ ] **Страница 9: Карточка сотрудника** `/organizations/:id/employees/:empId`
  - Редактирование данных сотрудника (PUT)
  - Секция «Услуги»: список привязанных услуг + добавить/удалить
    - GET `/api/organizations/{id}/employees/{empId}/services`
    - POST/DELETE `/api/organizations/{id}/employees/{empId}/services/{serviceId}`
  - Секция «Рабочие дни»: список + форма создания
    - GET/POST/PUT/DELETE `/api/employees/{empId}/work-days`

- [ ] **Страница 10: Услуги** `/organizations/:id/services`
  - GET `/api/organizations/{id}/services`
  - Список: название, длительность, цена, статус
  - Форма создания/редактирования (inline или модалка)
  - POST/PUT/DELETE

- [ ] **Страница 11: Бронирования** `/organizations/:id/bookings`
  - GET `/api/organizations/{id}/bookings`
  - Таблица: клиент, услуга, сотрудник, время, статус
  - Фильтр по статусу
  - Клик → `/organizations/{id}/bookings/{bookingId}`

- [ ] **Страница 12: Карточка бронирования** `/organizations/:id/bookings/:bookingId`
  - Детали: клиент, услуга, сотрудник, слот, статус
  - История статусов
  - Кнопки действий по статусу:
    - `created` → Подтвердить / Отклонить
    - `confirmed` → Завершить

- [ ] **Страница 13: Сканер QR** `/organizations/:id/scan`
  - Камера через `getUserMedia` + `jsQR`
  - POST `/api/bookings/scan` с токеном
  - Показать карточку визита: имя клиента, услуга, время
  - Статус: успех / уже использован / истёк / не подтверждён

---

## Демо

- end-to-end сценарий:
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
- [x] Error handling middleware — глобальный обработчик, возврат `{ error, statusCode }`
- [x] Валидация моделей — DataAnnotations на всех Contracts + `AddProblemDetails()`
- [x] `GET /api/organizations/my`
- [x] `GET /api/organizations/{id}`
- [x] `PUT /api/organizations/{id}`
- [x] Доступ через `OrganizationAccess.IsOwner` / `IsEmployee` везде
- [x] `POST /api/organizations/{id}/employees`
- [x] `GET /api/organizations/{id}/employees`
- [x] `DELETE /api/organizations/{id}/employees/{employeeId}`
- [x] `GET /api/organizations/{orgId}/employees/{id}/services`
- [x] `POST /api/organizations/{orgId}/employees/{id}/services/{serviceId}`
- [x] `DELETE /api/organizations/{orgId}/employees/{id}/services/{serviceId}`
- [x] Seed data — `database/init.sql`
- [x] `POST /api/organizations/{id}/services`
- [x] `GET /api/organizations/{id}/services`
- [x] `PUT /api/organizations/{id}/services/{serviceId}`
- [x] `DELETE /api/organizations/{id}/services/{serviceId}`
- [x] `POST /api/employees/{id}/work-days`
- [x] `GET /api/employees/{id}/work-days`
- [x] `PUT /api/employees/{id}/work-days/{workDayId}`
- [x] `DELETE /api/employees/{id}/work-days/{workDayId}`
- [x] `POST /api/employees/{id}/schedule-templates`
- [x] `GET /api/organizations/{id}/available-slots?serviceId=&date=`
- [x] `SlotCalculationService` — чистая доменная логика, без БД
- [x] `POST /api/bookings`
- [x] `GET /api/bookings/my`
- [x] `GET /api/bookings/{id}`
- [x] `POST /api/bookings/{id}/cancel`
- [x] `GET /api/organizations/{id}/bookings`
- [x] `POST /api/bookings/{id}/confirm`
- [x] `POST /api/bookings/{id}/reject`
- [x] `POST /api/bookings/{id}/complete`
- [x] Все смены статуса → `booking_status_history`
- [x] `GET /api/bookings/{id}/qr`
- [x] `POST /api/bookings/scan`
- [x] Запись в `notifications` при каждой смене статуса
- [x] `GET /api/notifications/my`
- [x] email уведомления
- [x] `GET /api/admin/organizations`
- [x] `POST /api/admin/organizations/{id}/approve`
- [x] `POST /api/admin/organizations/{id}/reject`
- [x] `POST /api/admin/organizations/{id}/block`
