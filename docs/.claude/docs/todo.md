# Civio — TODO

## Выполнил Задачу - перенёс вниз в конец раздела Готово

## QR-коды

- [ ] изменить вывод scan endpoint (после того как будут готовы пользовательские клиенты)

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

- [x] Создать Android проект (Kotlin + Compose + Hilt)
- [x] Подключить зависимости: Retrofit, OkHttp, Hilt, Navigation Compose, ZXing, EncryptedSharedPreferences, Coroutines
- [x] `ApiClient` — Retrofit instance, OkHttp interceptor: добавлять `Authorization: Bearer <token>`, 401 → logout
- [x] `TokenStorage` — сохранение/чтение JWT из EncryptedSharedPreferences
- [x] `AuthViewModel` — `StateFlow<AuthState>`, `login()`, `logout()`, `register()`
- [x] `NavGraph` — граф навигации: auth-граф + main-граф (bottom nav)
- [x] Общие Compose-компоненты: `CivioButton`, `CivioTextField`, `CivioCard`, `StatusBadge`, `LoadingBox`, `EmptyState`
- [x] Тема: Material 3, цвета (indigo primary, surface, error)

---

### Фаза 1 — Авторизация

- [x] **Экран 1: Вход** `LoginScreen`
  - [x] Вёрстка из файла дизайна
  - [x] `TextField`: Email, Password (visualTransformation)
  - [x] Кнопка «Войти» → POST `/api/auth/login` → TokenStorage → navigate to main
  - [x] Ссылка «Зарегистрироваться»
  - [x] Ошибка под полем при неверных данных

- [x] **Экран 2: Регистрация** `RegisterScreen`
  - [x] Вёрстка из файла дизайна
  - [x] Поля: Имя, Фамилия, Email, Телефон (опц.), Пароль
  - [x] Кнопка «Создать аккаунт» → POST `/api/auth/register` → автологин → main
  - [x] Ссылка «Уже есть аккаунт»

---

### Фаза 2 — Каталог организаций

- [x] **Экран 3: Каталог** `OrganizationsScreen` (tab: Каталог)
  - [x] Вёрстка из файла дизайна
  - [x] `SearchBar` — фильтр по названию на клиенте
  - [x] `LazyColumn` карточек: название, город, описание
  - [x] GET `/api/organizations` (авторизованный, status=approved, ?city=)
  - [x] `SwipeRefresh` — pull-to-refresh
  - [x] Tap → `OrganizationDetailScreen`
  - [x] Пустое состояние

- [x] **Экран 4: Детали организации** `OrganizationDetailScreen`
  - [x] Вёрстка из файла дизайна
  - [x] Название, описание, адрес, контакты
  - [x] Секция «Услуги»: `LazyColumn` — название, длительность, цена
  - [x] GET `/api/organizations/{id}/services`
  - [x] Кнопка «Записаться» → `BookServiceScreen`

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

- ~~**Публичный каталог**: нет `GET /api/organizations` (публично).~~ Добавлен авторизованный `GET /api/organizations?city=` (status=approved). `GET /api/organizations/{id}` теперь доступен любому авторизованному, если status=approved.
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
- [x] **Страница 1: Вход** `/login`
  - [x] Вёрстка из файла дизайна
  - [x] Форма: email + password (React Hook Form + Zod)
  - [x] POST `/api/auth/login` → сохранить токен → редирект по роли
  - [x] Если `PlatformAdmin` → `/admin/organizations`, иначе → `/`
- [x] **Страница 2: Регистрация** `/register`
  - [x] Вёрстка из файла дизайна
  - [x] Форма: email, password, firstName, lastName, phone (опц.)
  - [x] POST `/api/auth/register` → автологин → редирект на `/`
- [x] **Страница 3: Список организаций** `/admin/organizations`
  - [x] Вёрстка из файла дизайна
  - [x] GET `/api/admin/organizations`
  - [x] Таблица: название, город, статус, дата создания
  - [x] Фильтр по статусу (pending / approved / rejected / blocked)
  - [x] Клик по строке → `/admin/organizations/{id}`
- [x] **Страница 4: Карточка организации** `/admin/organizations/:id`
  - [x] Вёрстка из файла дизайна
  - [x] Детали организации (все поля)
  - [x] Текущий статус + история модерации
  - [x] Кнопки действий: Одобрить / Отклонить / Заблокировать (с полем комментария)
  - [x] POST `/api/admin/organizations/{id}/approve|reject|block`
- [x] **Страница 5: Мои организации** `/`
  - [x] Вёрстка из файла дизайна
  - [x] GET `/api/organizations/my`
  - [x] Карточки организаций с статусом
  - [x] Кнопка «Создать организацию»
- [x] **Страница 6: Создание организации** `/organizations/new`
  - [x] Вёрстка из файла дизайна
  - [x] Форма: name, city, address, description, email, phone, website
  - [x] POST `/api/organizations` → редирект на `/organizations/{id}`
- [x] **Страница 7: Дашборд организации** `/organizations/:id`
  - [x] Вёрстка из файла дизайна
  - [x] GET `/api/organizations/{id}` — данные org
  - [x] Навигация по разделам: Сотрудники / Услуги / Бронирования / Сканер QR
  - [x] PUT `/api/organizations/{id}` — редактирование (inline/модалка)
- [x] **Страница 8: Сотрудники** `/organizations/:id/employees`
  - [x] Вёрстка из файла дизайна
  - [x] GET `/api/organizations/{id}/employees`
  - [x] Список: имя, должность, статус
  - [x] POST `/api/organizations/{id}/employees` — форма создания
  - [x] DELETE `/api/organizations/{id}/employees/{empId}`
  - [x] Клик → `/organizations/{id}/employees/{empId}`
- [x] **Страница 9: Карточка сотрудника** `/organizations/:id/employees/:empId`
  - [x] Вёрстка из файла дизайна
  - [x] Вкладка «Данные»: редактирование (PUT)
  - [x] Вкладка «Услуги»: список привязанных + добавить/удалить
  - [x] GET/POST/DELETE `/api/organizations/{id}/employees/{empId}/services/{serviceId}`
  - [x] Вкладка «Рабочие дни»: список + форма создания
  - [x] GET/POST/PUT/DELETE `/api/employees/{empId}/work-days`
- [x] **Страница 10: Услуги** `/organizations/:id/services`
  - [x] Вёрстка из файла дизайна
  - [x] GET `/api/organizations/{id}/services`
  - [x] POST/PUT `/api/organizations/{id}/services` — форма создания/редактирования
  - [x] DELETE `/api/organizations/{id}/services/{serviceId}` — деактивация
- [x] **Страница 11: Бронирования** `/organizations/:id/bookings`
  - [x] Вёрстка из файла дизайна
  - [x] GET `/api/organizations/{id}/bookings`
  - [x] Таблица: клиент, услуга, сотрудник, время, статус
  - [x] Фильтр по статусу
  - [x] Клик → `/organizations/{id}/bookings/{bookingId}`
- [x] **Страница 12: Карточка бронирования** `/organizations/:id/bookings/:bookingId`
  - [x] Вёрстка из файла дизайна
  - [x] GET `/api/bookings/{id}`
  - [x] История статусов
  - [x] Кнопки по статусу: confirm / reject / complete
  - [x] POST `/api/bookings/{id}/confirm|reject|complete`
- [x] **Страница 13: Сканер QR** `/organizations/:id/scan`
  - [x] Вёрстка из файла дизайна (3 состояния: сканирование / успех / ошибка)
  - [x] Камера через `getUserMedia` + `jsQR`
  - [x] POST `/api/bookings/scan` с токеном
  - [x] Показать карточку визита: имя клиента, услуга, время
  - [x] Обработка ошибок: уже использован / истёк / не подтверждён
