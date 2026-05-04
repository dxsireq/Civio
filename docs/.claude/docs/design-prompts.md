# Civio — Промпты для Claude Design

Платформа онлайн-записи на услуги. Два интерфейса: **админ-панель** (модерация организаций) и **панель организации** (управление сотрудниками, услугами, бронированиями, QR-сканер).

Стиль: современный SaaS, светлая тема, акцентный цвет — индиго/синий. Шрифт sans-serif. Плотная информация, минимум декора.

---

## Страница 1 — Вход `/login`

Design a clean login page for a SaaS booking platform called "Civio". Light theme. Centered card layout on a subtle gray background. The card contains: a logo/wordmark "Civio" at the top, a heading "Войти в систему", email input field, password input field with show/hide toggle, a primary "Войти" button (full width, indigo), a link "Нет аккаунта? Зарегистрироваться" below the button. Show inline validation error state under the email field ("Неверный email или пароль"). No decorative illustrations. Compact, professional feel.

---

## Страница 2 — Регистрация `/register`

Design a registration page for "Civio" SaaS platform. Same centered card layout as login. Heading "Создать аккаунт". Fields: Имя (firstName), Фамилия (lastName), Email, Телефон (optional, with placeholder "+7 (___) ___-__-__"), Пароль, Подтвердить пароль. Primary "Зарегистрироваться" button. Link "Уже есть аккаунт? Войти". Light theme, indigo accent.

---

## Страница 3 — Список организаций (Админ) `/admin/organizations`

Design an admin dashboard page for a SaaS platform. Full-width layout with a left sidebar (dark, narrow). Sidebar contains: logo "Civio Admin", menu item "Организации" (active). Main content area: heading "Организации", status filter tabs at the top ("Все", "На модерации", "Одобрены", "Отклонены", "Заблокированы") with a count badge on "На модерации". Below: a data table with columns — Название, Город, Владелец (email), Статус (colored badge: orange=pending, green=approved, red=rejected/blocked), Дата создания, Actions (view button). Table has hover state. Pagination at bottom. Light theme, indigo accent.

---

## Страница 4 — Карточка организации (Админ) `/admin/organizations/:id`

Design an admin organization detail page. Same sidebar layout. Back breadcrumb "← Организации". Two-column layout: left column (wider) shows organization details in labeled fields — Название, Юридическое название, ИНН, Город, Адрес, Email, Телефон, Сайт, Описание, Владелец, Дата создания. Right column (narrower): current status badge at top, moderation action card with textarea "Комментарий модератора" and three action buttons — "Одобрить" (green), "Отклонить" (red), "Заблокировать" (dark gray). Below actions: moderation history timeline — each entry shows date, moderator, old status → new status arrow, comment.

---

## Страница 5 — Мои организации `/`

Design a dashboard home page for organization owners. Top navigation bar with logo "Civio", user avatar + name on the right, logout. Main content: heading "Мои организации", "+ Создать организацию" button top-right. Grid of organization cards (2-3 columns). Each card: organization name (bold), city, status badge (color-coded), short description, "Открыть" button. Empty state: illustration placeholder + text "У вас пока нет организаций" + "Создать первую" button. Light theme.

---

## Страница 6 — Создание организации `/organizations/new`

Design a multi-field form page for creating an organization. Top nav bar. Centered form container (max-width ~640px). Heading "Новая организация". Form sections: Basic info section — Название организации (required), Юридическое название, ИНН; Contact section — Email, Телефон, Сайт; Location section — Город (required), Адрес (required); Description section — Описание (textarea). Bottom action bar: "Отмена" (ghost button) + "Создать организацию" (primary button). Note text: "После создания организация будет отправлена на модерацию". Light theme.

---

## Страница 7 — Дашборд организации `/organizations/:id`

Design an organization management dashboard. Left sidebar with org name, nav items: Обзор (active), Сотрудники, Услуги, Бронирования, Сканер QR. Main content: org name as heading, status badge. Two rows: top row — 3 stat cards (Сотрудников: N, Услуг: N, Бронирований сегодня: N). Below: organization details in a card with edit button — contact info, address, description. "Редактировать" opens inline edit mode with save/cancel. Right side: recent bookings mini-list (last 5, with status badges).

---

## Страница 8 — Сотрудники `/organizations/:id/employees`

Design an employees management page. Same org sidebar. Heading "Сотрудники", "+ Добавить сотрудника" button. Employee list as cards or table rows: avatar initials circle, ФИО, должность, email/phone, status dot (active/inactive), "Открыть" link. Add employee: slide-in drawer or inline form at top — fields: Имя, Фамилия, Должность, Телефон, Email, ID пользователя (optional, with help tooltip "Оставьте пустым если сотрудник не зарегистрирован в системе"). Save button. Delete with confirmation dialog. Light theme.

---

## Страница 9 — Карточка сотрудника `/organizations/:id/employees/:empId`

Design an employee detail page. Org sidebar. Back breadcrumb. Employee name as heading, position subtitle. Three tabbed sections: "Данные" tab — editable fields (Имя, Фамилия, Отчество, Должность, Телефон, Email) with Save button; "Услуги" tab — list of assigned services (name, duration, price, remove button), "Добавить услугу" dropdown/select from org services list, "Добавить" button; "Рабочие дни" tab — calendar-style or table list of work days (date, start time, end time, break interval, actions), "+ Добавить рабочий день" opens inline form with date picker and time inputs.

---

## Страница 10 — Услуги `/organizations/:id/services`

Design a services management page. Org sidebar. Heading "Услуги", "+ Добавить услугу" button. Services displayed as a table: Название, Описание (truncated), Длительность (e.g. "60 мин"), Цена (e.g. "1 500 ₽"), Статус badge, Actions (edit, deactivate). Add/edit via slide-in drawer or modal: fields — Название (required), Описание, Длительность в минутах (number input), Цена (decimal input), Категория (optional select). Deactivate shows confirmation. Deactivated services shown with muted style and "Активировать" option.

---

## Страница 11 — Бронирования `/organizations/:id/bookings`

Design a bookings management page. Org sidebar. Heading "Бронирования". Filter row: status tabs ("Все", "Создана", "Подтверждена", "Завершена", "Отменена", "Отклонена") with counts. Date range filter. Table: Клиент (name + email), Услуга, Сотрудник, Дата и время, Статус (colored badge), Actions column. Row click → detail page. Quick action buttons in row for pending bookings: ✓ Подтвердить, ✗ Отклонить. Pagination. Light theme.

---

## Страница 12 — Карточка бронирования `/organizations/:id/bookings/:bookingId`

Design a booking detail page. Org sidebar. Back breadcrumb. Two-column layout. Left: booking details card — large status badge at top, sections: Клиент (ФИО, email, phone), Услуга (name, duration, price), Сотрудник (name, position), Дата и время (start–end), Комментарий клиента. Right: action card (depends on status) — for "created": "Подтвердить" (green) + "Отклонить" (red) buttons; for "confirmed": "Завершить" (indigo) button; for terminal statuses: read-only. Below action card: status history timeline — each step shows status badge, who changed, when, comment.

---

## Страница 13 — Сканер QR `/organizations/:id/scan`

Design a QR code scanner page. Org sidebar. Heading "Сканер QR". Two states:

State 1 (scanning): centered camera viewfinder rectangle with corner markers, "Наведите камеру на QR-код клиента" hint text below, "Включить камеру" button if permission not granted yet.

State 2 (result — success): camera replaced by result card — green checkmark icon, "Визит подтверждён" heading, client name (bold), service name, appointment time (date + start–end), "Сканировать следующий" button.

State 3 (result — error): red X icon, error message ("QR-код уже использован" / "QR-код истёк" / "Запись не подтверждена"), "Попробовать снова" button.
