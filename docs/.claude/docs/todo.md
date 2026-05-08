# Civio — TODO

## Выполнил Задачу - перенёс вниз в конец раздела Готово

## QR-коды

- [ ] изменить вывод scan endpoint (после того как будут готовы пользовательские клиенты)

---

## Web-клиент

Стек: React + TypeScript + Vite (уже настроен).
Добавить: React Router, Axios, Zustand, Tailwind, shadcn/ui, React Hook Form + Zod, jsQR.
Промпты для дизайна страниц: `docs/.claude/docs/design-prompts.md`

### Фаза 0 — Инфраструктура



---

### Фаза 1 — Авторизация

- [ ] **Страница 1: Вход** `/login`
  - [ ] Вёрстка из файла дизайна
  - [ ] Форма: email + password (React Hook Form + Zod)
  - [ ] POST `/api/auth/login` → сохранить токен → редирект по роли
  - [ ] Если `PlatformAdmin` → `/admin/organizations`, иначе → `/`

- [ ] **Страница 2: Регистрация** `/register`
  - [ ] Вёрстка из файла дизайна
  - [ ] Форма: email, password, firstName, lastName, phone (опц.)
  - [ ] POST `/api/auth/register` → автологин → редирект на `/`

---

### Фаза 2 — Админ-панель

- [ ] **Страница 3: Список организаций** `/admin/organizations`
  - [ ] Вёрстка из файла дизайна
  - [ ] GET `/api/admin/organizations`
  - [ ] Таблица: название, город, статус, дата создания
  - [ ] Фильтр по статусу (pending / approved / rejected / blocked)
  - [ ] Клик по строке → `/admin/organizations/{id}`

- [ ] **Страница 4: Карточка организации** `/admin/organizations/:id`
  - [ ] Вёрстка из файла дизайна
  - [ ] Детали организации (все поля)
  - [ ] Текущий статус + история модерации
  - [ ] Кнопки действий: Одобрить / Отклонить / Заблокировать (с полем комментария)
  - [ ] POST `/api/admin/organizations/{id}/approve|reject|block`

---

### Фаза 3 — Панель организации

- [ ] **Страница 5: Мои организации** `/`
  - [ ] Вёрстка из файла дизайна
  - [ ] GET `/api/organizations/my`
  - [ ] Карточки организаций с статусом
  - [ ] Кнопка «Создать организацию»

- [ ] **Страница 6: Создание организации** `/organizations/new`
  - [ ] Вёрстка из файла дизайна
  - [ ] Форма: name, city, address, description, email, phone, website
  - [ ] POST `/api/organizations` → редирект на `/organizations/{id}`

- [ ] **Страница 7: Дашборд организации** `/organizations/:id`
  - [ ] Вёрстка из файла дизайна
  - [ ] GET `/api/organizations/{id}` — данные org
  - [ ] Навигация по разделам: Сотрудники / Услуги / Бронирования / Сканер QR
  - [ ] PUT `/api/organizations/{id}` — редактирование (inline/модалка)

- [ ] **Страница 8: Сотрудники** `/organizations/:id/employees`
  - [ ] Вёрстка из файла дизайна
  - [ ] GET `/api/organizations/{id}/employees`
  - [ ] Список: имя, должность, статус
  - [ ] POST `/api/organizations/{id}/employees` — форма создания
  - [ ] DELETE `/api/organizations/{id}/employees/{empId}`
  - [ ] Клик → `/organizations/{id}/employees/{empId}`

- [ ] **Страница 9: Карточка сотрудника** `/organizations/:id/employees/:empId`
  - [ ] Вёрстка из файла дизайна
  - [ ] Вкладка «Данные»: редактирование (PUT)
  - [ ] Вкладка «Услуги»: список привязанных + добавить/удалить
    - [ ] GET/POST/DELETE `/api/organizations/{id}/employees/{empId}/services/{serviceId}`
  - [ ] Вкладка «Рабочие дни»: список + форма создания
    - [ ] GET/POST/PUT/DELETE `/api/employees/{empId}/work-days`

- [ ] **Страница 10: Услуги** `/organizations/:id/services`
  - [ ] Вёрстка из файла дизайна
  - [ ] GET `/api/organizations/{id}/services`
  - [ ] POST/PUT `/api/organizations/{id}/services` — форма создания/редактирования
  - [ ] DELETE `/api/organizations/{id}/services/{serviceId}` — деактивация

- [ ] **Страница 11: Бронирования** `/organizations/:id/bookings`
  - [ ] Вёрстка из файла дизайна
  - [ ] GET `/api/organizations/{id}/bookings`
  - [ ] Таблица: клиент, услуга, сотрудник, время, статус
  - [ ] Фильтр по статусу
  - [ ] Клик → `/organizations/{id}/bookings/{bookingId}`

- [ ] **Страница 12: Карточка бронирования** `/organizations/:id/bookings/:bookingId`
  - [ ] Вёрстка из файла дизайна
  - [ ] GET `/api/bookings/{id}`
  - [ ] История статусов
  - [ ] Кнопки по статусу: confirm / reject / complete
  - [ ] POST `/api/bookings/{id}/confirm|reject|complete`

- [ ] **Страница 13: Сканер QR** `/organizations/:id/scan`
  - [ ] Вёрстка из файла дизайна (3 состояния: сканирование / успех / ошибка)
  - [ ] Камера через `getUserMedia` + `jsQR`
  - [ ] POST `/api/bookings/scan` с токеном
  - [ ] Показать карточку визита: имя клиента, услуга, время
  - [ ] Обработка ошибок: уже использован / истёк / не подтверждён

---

## Мобильный клиент (гражданин)

Стек: Android + Kotlin + Jetpack Compose.
Промпты для дизайна экранов: `docs/.claude/docs/design-prompts-mobile.md`

| Слой | Технология |
|------|-----------|
| UI | Jetpack Compose + Material 3 |
| Навигация | Navigation Compose |
| HTTP | Retrofit 2 + OkHttp + Gson |
| Асинхронность | Coroutines + Flow |
| State | ViewModel + StateFlow |
| DI | Hilt |
| Хранение JWT | EncryptedSharedPreferences |
| QR | ZXing (`zxing-android-embedded`) |

Навигация: Bottom Navigation Bar (Каталог | Записи | Уведомления | Профиль) + вложенный NavHost.

e2e гражданина: регистрация → поиск организации → выбор услуги и слота → создание записи → QR-код → отмена (опц.).

### Фаза 0 — Инфраструктура

- [ ] Создать Android проект (Kotlin + Compose + Hilt)
- [ ] Подключить зависимости: Retrofit, OkHttp, Hilt, Navigation Compose, ZXing, EncryptedSharedPreferences, Coroutines
- [ ] `ApiClient` — Retrofit instance, OkHttp interceptor: добавлять `Authorization: Bearer <token>`, 401 → logout
- [ ] `TokenStorage` — сохранение/чтение JWT из EncryptedSharedPreferences
- [ ] `AuthViewModel` — `StateFlow<AuthState>`, `login()`, `logout()`, `register()`
- [ ] `NavGraph` — граф навигации: auth-граф + main-граф (bottom nav)
- [ ] Общие Compose-компоненты: `CivioButton`, `CivioTextField`, `CivioCard`, `StatusBadge`, `LoadingBox`, `EmptyState`
- [ ] Тема: Material 3, цвета (indigo primary, surface, error)

---

### Фаза 1 — Авторизация

- [ ] **Экран 1: Вход** `LoginScreen`
  - [ ] Вёрстка из файла дизайна
  - [ ] `TextField`: Email, Password (visualTransformation)
  - [ ] Кнопка «Войти» → POST `/api/auth/login` → TokenStorage → navigate to main
  - [ ] Ссылка «Зарегистрироваться»
  - [ ] Ошибка под полем при неверных данных

- [ ] **Экран 2: Регистрация** `RegisterScreen`
  - [ ] Вёрстка из файла дизайна
  - [ ] Поля: Имя, Фамилия, Email, Телефон (опц.), Пароль
  - [ ] Кнопка «Создать аккаунт» → POST `/api/auth/register` → автологин → main
  - [ ] Ссылка «Уже есть аккаунт»

---

### Фаза 2 — Каталог организаций

- [ ] **Экран 3: Каталог** `OrganizationsScreen` (tab: Каталог)
  - [ ] Вёрстка из файла дизайна
  - [ ] `SearchBar` — фильтр по названию на клиенте
  - [ ] `LazyColumn` карточек: название, город, описание
  - [ ] GET `/api/organizations/my` (временно, нужен публичный endpoint — см. заметки)
  - [ ] `SwipeRefresh` — pull-to-refresh
  - [ ] Tap → `OrganizationDetailScreen`
  - [ ] Пустое состояние

- [ ] **Экран 4: Детали организации** `OrganizationDetailScreen`
  - [ ] Вёрстка из файла дизайна
  - [ ] Название, описание, адрес, контакты
  - [ ] Секция «Услуги»: `LazyColumn` — название, длительность, цена
  - [ ] GET `/api/organizations/{id}/services`
  - [ ] Кнопка «Записаться» → `BookServiceScreen`

---

### Фаза 3 — Создание записи

- [ ] **Экран 5: Выбор услуги и даты** `BookServiceScreen`
  - [ ] Вёрстка из файла дизайна
  - [ ] `RadioGroup` выбор услуги из списка
  - [ ] Горизонтальный `LazyRow` выбора даты (ближайшие 14 дней)
  - [ ] Кнопка «Посмотреть слоты» → `SelectSlotScreen`

- [ ] **Экран 6: Выбор слота** `SelectSlotScreen`
  - [ ] Вёрстка из файла дизайна
  - [ ] GET `/api/organizations/{id}/available-slots?serviceId=&date=`
  - [ ] `FlowRow` / сетка временных слотов (сотрудник + время)
  - [ ] Tap → выделить выбранный слот
  - [ ] Кнопка «Продолжить» → `ConfirmBookingScreen`
  - [ ] Пустое состояние: «Нет свободных слотов»

- [ ] **Экран 7: Подтверждение** `ConfirmBookingScreen`
  - [ ] Вёрстка из файла дизайна
  - [ ] Итог: услуга, сотрудник, дата/время, цена
  - [ ] `OutlinedTextField` комментарий (опц.)
  - [ ] Кнопка «Подтвердить запись» → POST `/api/bookings`
  - [ ] При успехе → `BookingDetailScreen(id)`

---

### Фаза 4 — Мои записи

- [ ] **Экран 8: Список записей** `BookingsScreen` (tab: Записи)
  - [ ] Вёрстка из файла дизайна
  - [ ] GET `/api/bookings/my`
  - [ ] Горизонтальные чипы-фильтры: Все / Активные / Завершённые / Отменённые
  - [ ] `LazyColumn`: услуга, организация, дата/время, `StatusBadge`
  - [ ] `SwipeRefresh`
  - [ ] Tap → `BookingDetailScreen`
  - [ ] Пустое состояние

- [ ] **Экран 9: Детали записи** `BookingDetailScreen`
  - [ ] Вёрстка из файла дизайна
  - [ ] GET `/api/bookings/{id}`
  - [ ] Карточка: организация, услуга, сотрудник, дата/время, статус
  - [ ] Таймлайн истории статусов
  - [ ] Кнопка «Показать QR-код» (статус `confirmed`) → `QrCodeScreen`
  - [ ] Кнопка «Отменить запись» (статус `created`) → AlertDialog + POST `/api/bookings/{id}/cancel`

- [ ] **Экран 10: QR-код** `QrCodeScreen`
  - [ ] Вёрстка из файла дизайна
  - [ ] GET `/api/bookings/{id}/qr` → токен
  - [ ] ZXing `BarcodeEncoder` → `Bitmap` QR-кода → `Image` (Compose)
  - [ ] QR крупный, на большую часть экрана, белый фон
  - [ ] Имя, услуга, дата/время под QR
  - [ ] Кнопка «Назад»

---

### Фаза 5 — Уведомления и профиль

- [ ] **Экран 11: Уведомления** `NotificationsScreen` (tab: Уведомления)
  - [ ] Вёрстка из файла дизайна
  - [ ] GET `/api/notifications/my`
  - [ ] `LazyColumn`: иконка типа, заголовок, текст, дата
  - [ ] `SwipeRefresh`
  - [ ] Пустое состояние

- [ ] **Экран 12: Профиль** `ProfileScreen` (tab: Профиль)
  - [ ] Вёрстка из файла дизайна
  - [ ] GET `/api/auth/me` → имя, email, телефон
  - [ ] Кнопка «Выйти» → AlertDialog → TokenStorage.clear() → navigate to login

---

### Заметки

- **Публичный каталог**: нет `GET /api/organizations` (публично). Нужно добавить backend endpoint `GET /api/organizations?city=` без авторизации, либо показывать каталог только авторизованным.
- **QR отображение**: ZXing генерирует Bitmap на стороне клиента из токена. Не нужна камера — только показ QR.
- **Push-уведомления**: Firebase Cloud Messaging — опционально, можно добавить после основного функционала.
- **Deeplink для QR**: QR кодирует токен (строку), не URL — мобильный клиент показывает QR, а не сканирует.

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
- [x] Установить зависимости: `react-router-dom`, `axios`, `zustand`, `tailwindcss`, `shadcn/ui`, `react-hook-form`, `zod`, `jsqr`
- [x] API-клиент: `axios` instance, JWT из localStorage, интерцептор 401 → logout
- [x] Auth store (Zustand): `token`, `user`, `login()`, `logout()`
- [x] `ProtectedRoute` — редирект на `/login` если нет токена
- [x] `AdminRoute` — редирект если нет роли `PlatformAdmin`
- [x] Layout компоненты: `AppLayout` (сайдбар + хедер), `AuthLayout` (центрированная форма)
- [x] Глобальный error handler (toast уведомления)
