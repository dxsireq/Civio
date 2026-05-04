# Civio Mobile — Промпты для Claude Design

Android-приложение для граждан (клиентов). Онлайн-запись на услуги организаций.

Стиль: Material Design 3, светлая тема, акцентный цвет — индиго (#4F46E5). Шрифт sans-serif (Roboto). Стандартные Android UI-паттерны: bottom navigation, cards, chips, FAB, снекбары. Размер экрана — стандартный Android телефон (~390×844 dp). Все тексты на русском языке.

---

## Экран 1 — Вход `LoginScreen`

Design a mobile login screen for an Android app called "Civio" (online service booking platform). Material Design 3, light theme, indigo accent. Layout from top to bottom: large "C" logo mark (indigo rounded square) with "Civio" wordmark centered at top third of screen. Below: heading "Войти в систему", subtitle "Запись на услуги онлайн". Then: outlined TextField for email with label "Email", outlined TextField for password with label "Пароль" and eye icon to toggle visibility. Error state shown under email: red text "Неверный email или пароль" with error icon. Primary filled button "Войти" full width. Text link centered below: "Нет аккаунта? Зарегистрироваться" in indigo. Bottom: copyright "© 2026 Civio". White background, subtle top illustration or gradient is optional.

---

## Экран 2 — Регистрация `RegisterScreen`

Design a mobile registration screen for "Civio" Android app. Material Design 3, light theme. Top bar with back arrow and title "Создать аккаунт". Scrollable form: outlined TextField "Имя" (required), outlined TextField "Фамилия" (required), outlined TextField "Email" (required, keyboard type email), outlined TextField "Телефон" with placeholder "+7 (___) ___-__-__" and helper text "Необязательно", outlined TextField "Пароль" with eye toggle. Each required field marked with asterisk in label. Primary button "Зарегистрироваться" pinned to bottom (or at end of form). Below button: text "Уже есть аккаунт? Войти" link in indigo. Show one field in error state (Имя empty, red border + "Обязательное поле").

---

## Экран 3 — Каталог организаций `OrganizationsScreen`

Design the main catalogue screen of a mobile booking app "Civio". Material Design 3, light theme, indigo accent. Bottom navigation bar with 4 tabs: "Каталог" (active, home icon), "Записи" (calendar icon), "Уведомления" (bell icon), "Профиль" (person icon). Top: large heading "Каталог". Search bar below heading: outlined search field with search icon, placeholder "Поиск организации...". Below: vertical list of organization cards (Material Card, slightly elevated): bold org name, city + address in gray, short description (2 lines truncated), indigo chip with category or service count. Show 3-4 cards. One card with a subtle indigo left border accent. Pull-to-refresh indicator at top. FAB is absent here.

---

## Экран 4 — Детали организации `OrganizationDetailScreen`

Design an organization detail screen for "Civio" Android app. Material Design 3. Top app bar with back arrow and org name (collapsing toolbar style). Below: org name as large heading, city and address with location pin icon, phone and email rows with icons. Section divider. "Услуги" section heading. List of service cards: service name (bold), duration chip ("60 мин"), price ("1 500 ₽"), short description in gray. Show 3 services. Bottom: large primary button "Записаться" pinned to bottom of screen, full width, indigo. Light background, cards with subtle shadow.

---

## Экран 5 — Выбор услуги и даты `BookServiceScreen`

Design a service and date selection screen for "Civio" booking app. Material Design 3. Top app bar: back arrow, title "Выбор услуги и даты". Content in two sections. Section 1 "Услуга": list of 3 services as selectable cards with RadioButton — service name, duration, price. One card selected (indigo border + indigo radio). Section 2 "Дата": horizontal scrollable row of date chips for next 14 days — each chip shows day of week abbreviation (Пн, Вт, ...) and date number. Selected date chip is filled indigo. Today's chip labeled "Сегодня" instead of day name. Bottom: primary button "Посмотреть слоты" (enabled only when service + date selected).

---

## Экран 6 — Выбор слота `SelectSlotScreen`

Design a time slot selection screen for "Civio" Android booking app. Material Design 3. Top app bar: back arrow, title "Выбор времени". Below top bar: summary chips showing selected service name and selected date (dismissible chips, indigo outlined). Section "Доступные слоты". Grid layout (3 columns) of time slot chips: each shows time like "10:00", "10:30", "11:00" etc. Available slots — outlined chip. Selected slot — filled indigo chip. Unavailable slots — grayed out, not tappable. Show ~12 slots with some unavailable. Below one slot: employee name small text ("Мария И."). Empty state variant: centered illustration placeholder + "На эту дату нет свободных слотов" text + "Выбрать другую дату" button. Bottom: "Продолжить" button (active when slot selected).

---

## Экран 7 — Подтверждение записи `ConfirmBookingScreen`

Design a booking confirmation screen for "Civio" Android app. Material Design 3. Top app bar: back arrow, title "Подтверждение". Elevated summary card: organization name (bold, large), then labeled rows with icons — scissors icon + "Стрижка" (service), person icon + "Мария Иванова" (employee), calendar icon + "Понедельник, 5 мая 2026" (date), clock icon + "10:00 — 11:00" (time), tag icon + "1 500 ₽" (price). Section "Комментарий": outlined multiline TextField, placeholder "Ваши пожелания (необязательно)". Indigo info banner: "После создания запись ожидает подтверждения от организации". Bottom: large primary button "Подтвердить запись". Clean white background.

---

## Экран 8 — Список записей `BookingsScreen`

Design the "My Bookings" tab screen for "Civio" Android app. Bottom navigation with "Записи" tab active. Top: heading "Мои записи". Horizontal scrollable filter chips below heading: "Все" (selected, filled indigo), "Активные", "Завершённые", "Отменённые". Below: LazyColumn of booking cards. Each card: org name (bold), service name, date+time, colored status badge (pill shape: orange="Ожидает", green="Подтверждена", gray="Завершена", red="Отменена"). Tap area indicator (chevron right). Show 4 cards with different statuses. Empty state for "Завершённые" tab: centered icon + "Нет завершённых записей". Pull-to-refresh hint at top.

---

## Экран 9 — Детали записи `BookingDetailScreen`

Design a booking detail screen for "Civio" Android app. Material Design 3. Top app bar: back arrow, title "Запись #1234". Large status chip at top of content (green filled "Подтверждена"). Info card: org name, then rows — service + duration, employee name + position, date, time range, price, comment (if present). Section "История". Timeline: vertical line with dots — each entry shows status badge, date+time, small "кем изменено" text. Show 2 timeline entries. Action section at bottom: for "confirmed" status — large indigo button "Показать QR-код" + outlined red button "Отменить запись" below it. For other statuses show appropriate buttons or nothing.

---

## Экран 10 — QR-код `QrCodeScreen`

Design a QR code display screen for "Civio" Android app. Material Design 3. Top app bar: back arrow, title "QR-код для записи". White card centered on screen taking most of the width: large QR code image placeholder (black on white, ~260×260dp), "Предъявите сотруднику на стойке" hint text above QR in gray italic. Below QR inside card: org name (bold), service name, date and time, employee name. Outside card: indigo info chip "Действителен до 6 мая 2026". Subtle light gray background. Bottom: outlined button "Назад к записи". Screen background is slightly darker than card to make card stand out for scanning. No bottom navigation on this screen (full-screen focused mode).

---

## Экран 11 — Уведомления `NotificationsScreen`

Design the notifications tab screen for "Civio" Android app. Bottom navigation with "Уведомления" tab active (with badge "3"). Top: heading "Уведомления". List of notification items (no card borders, just dividers): left — colored icon circle (green for confirmed, orange for created, red for cancelled, gray for completed), right — bold title "Запись подтверждена", subtitle "Стрижка · Студия Civio · 5 мая, 10:00", timestamp "2 ч назад" small gray. Unread notifications have slightly blue-tinted background. Tapping marks as read. Show 4 notifications, 2 unread. Empty state: bell icon + "Нет уведомлений". Swipe to dismiss (show red background with trash icon on swipe).

---

## Экран 12 — Профиль `ProfileScreen`

Design the profile tab screen for "Civio" Android app. Bottom navigation with "Профиль" tab active. Top: large avatar circle with user initials "АС" (indigo background), user full name bold below, email in gray. Section "Личные данные": list items with icon — person icon + "Алексей Сидоров", email icon + "client@civio.test", phone icon + "+7 900 000-00-03". Section divider. Section "Аккаунт": list item — bell icon + "Уведомления" with chevron, shield icon + "Безопасность" with chevron. Divider. Large outlined red button "Выйти из аккаунта" at bottom with logout icon. Confirmation dialog overlay: "Выйти?" modal with "Отмена" and "Выйти" (red) buttons.
