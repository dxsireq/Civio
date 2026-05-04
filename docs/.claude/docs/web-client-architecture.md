# Web-клиент Civio — Архитектура

## Стек

| Слой | Технология |
|------|-----------|
| Сборщик | Vite + TypeScript |
| UI | React 19 |
| Роутинг | React Router v7 |
| Состояние | Zustand (auth store) |
| Формы | React Hook Form + Zod |
| HTTP | Axios |
| Иконки | lucide-react |
| Стили | `src/design/styles.css` (кастомная дизайн-система) |

Нет Tailwind, нет shadcn/ui — вся система классов уже в `styles.css`.

---

## Дизайн-система (`src/design/styles.css`)

Все CSS-переменные и классы компонентов уже определены. Использовать напрямую.

### CSS-переменные
```css
--bg, --bg-soft, --bg-muted          /* фоны */
--border, --border-strong             /* рамки */
--text, --text-soft, --text-muted    /* текст */
--indigo-500/600/700/800             /* акцент */
--green-600, --orange-600, --red-600 /* статусы */
--r-sm, --r, --r-lg                  /* border-radius */
--shadow-sm, --shadow, --shadow-lg   /* тени */
```

### Готовые классы
```
.civio          — обёртка страницы (font, color, reset)
.btn            — базовая кнопка
.btn-primary    — индиго кнопка
.btn-secondary  — серая кнопка
.btn-danger     — красная кнопка
.btn-ghost      — прозрачная кнопка
.btn-sm / .btn-lg / .btn-block
.card           — карточка с тенью и border-radius
.input          — поле ввода
.input.has-error — поле с ошибкой
.input-group    — поле + кнопка справа
.field          — враппер поля (label + input + error)
.field-label    — лейбл поля
.field-error    — текст ошибки
.field-help     — подсказка
.badge          — статусный бейдж
.badge-pending / .badge-approved / .badge-rejected / .badge-blocked
.badge-created / .badge-confirmed / .badge-cancelled / .badge-completed
.table          — таблица
.table-row      — строка таблицы с hover
.sidebar        — боковая панель (тёмная)
.sidebar-item   — пункт меню
.sidebar-item.active — активный пункт
.topnav         — верхняя навигация
.avatar         — аватар с инициалами
.stat-card      — карточка статистики
.empty-state    — пустое состояние
.modal-overlay / .modal — модальное окно
.drawer         — выдвижная панель
.tabs / .tab    — вкладки
.timeline       — история событий
```

---

## Иконки

`src/design/icons.jsx` содержит кастомный набор. **Заменить на `lucide-react`** — тот же SVG-стиль.

Маппинг (design → lucide):
```
I.building      → Building2
I.users         → Users
I.calendar      → Calendar
I.qr            → QrCode
I.home          → Home
I.list          → List
I.shield        → Shield
I.plus          → Plus
I.search        → Search
I.eye           → Eye
I.edit          → Pencil
I.trash         → Trash2
I.check         → Check
I.x             → X
I.alertCircle   → AlertCircle
I.chevronRight  → ChevronRight
I.logout        → LogOut
I.camera        → Camera
I.scan          → ScanLine
I.filter        → Filter
I.rotate        → RotateCw
```

---

## Структура файлов

```
src/
├── design/              — референс дизайна (не трогать)
│   ├── styles.css       — импортировать в main.tsx
│   ├── screens-auth.jsx
│   ├── screens-admin.jsx
│   ├── screens-org-mgmt.jsx
│   ├── screens-emp-svc.jsx
│   ├── screens-bookings.jsx
│   ├── screens-scanner.jsx
│   └── layout.jsx
│
├── api/
│   ├── client.ts        — axios instance + JWT interceptor
│   ├── auth.ts          — auth endpoints
│   ├── organizations.ts
│   ├── employees.ts
│   ├── bookings.ts
│   └── admin.ts
│
├── store/
│   └── auth.ts          — Zustand: token, user, login(), logout()
│
├── components/
│   ├── ProtectedRoute.tsx
│   ├── AdminRoute.tsx
│   ├── AppLayout.tsx    — OrgSidebar + outlet
│   ├── AdminLayout.tsx  — AdminSidebar + outlet
│   └── AuthLayout.tsx   — центрированная форма
│
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── admin/
│   │   ├── AdminOrgsPage.tsx
│   │   └── AdminOrgDetailPage.tsx
│   └── org/
│       ├── MyOrgsPage.tsx
│       ├── CreateOrgPage.tsx
│       ├── OrgDashboardPage.tsx
│       ├── EmployeesPage.tsx
│       ├── EmployeeDetailPage.tsx
│       ├── ServicesPage.tsx
│       ├── BookingsPage.tsx
│       ├── BookingDetailPage.tsx
│       └── ScannerPage.tsx
│
├── App.tsx              — роутер
└── main.tsx             — импорт styles.css
```

---

## Конвертация дизайн-экрана в страницу

Алгоритм для каждой страницы:

### Шаг 1 — Создать файл страницы

Открыть `src/design/screens-*.jsx`, найти нужный компонент (например `LoginScreen`). Создать `src/pages/auth/LoginPage.tsx`.

### Шаг 2 — Скопировать JSX

```tsx
// LoginPage.tsx
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, AlertCircle } from 'lucide-react'
import { login } from '../../api/auth'
import { useAuthStore } from '../../store/auth'

// 1. Вставить JSX из LoginScreen
// 2. Заменить I.xxx на lucide компоненты
// 3. Заменить статичные данные на register() из useForm
// 4. Заменить <a> на <Link>
// 5. onSubmit → вызов API
```

### Шаг 3 — Заменить статичные данные

```tsx
// ДО (дизайн):
<input className="input has-error" type="email" defaultValue="anna@beautysalon.ru" />
<div className="field-error"><I.alertCircle size={13} /> Неверный email или пароль</div>

// ПОСЛЕ (функционал):
<input className="input" {...register('email')} type="email" />
{errors.email && (
  <div className="field-error">
    <AlertCircle size={13} />
    {errors.email.message}
  </div>
)}
```

### Шаг 4 — Подключить API

```tsx
const onSubmit = async (data: FormData) => {
  const response = await login(data.email, data.password)
  useAuthStore.getState().setAuth(response.token, response)
  navigate(isAdmin ? '/admin/organizations' : '/')
}
```

---

## Роутинг (`App.tsx`)

```tsx
<Routes>
  {/* Public */}
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />

  {/* Admin */}
  <Route element={<AdminRoute />}>
    <Route element={<AdminLayout />}>
      <Route path="/admin/organizations" element={<AdminOrgsPage />} />
      <Route path="/admin/organizations/:id" element={<AdminOrgDetailPage />} />
    </Route>
  </Route>

  {/* Org */}
  <Route element={<ProtectedRoute />}>
    <Route path="/" element={<MyOrgsPage />} />
    <Route path="/organizations/new" element={<CreateOrgPage />} />
    <Route element={<AppLayout />}>
      <Route path="/organizations/:id" element={<OrgDashboardPage />} />
      <Route path="/organizations/:id/employees" element={<EmployeesPage />} />
      <Route path="/organizations/:id/employees/:empId" element={<EmployeeDetailPage />} />
      <Route path="/organizations/:id/services" element={<ServicesPage />} />
      <Route path="/organizations/:id/bookings" element={<BookingsPage />} />
      <Route path="/organizations/:id/bookings/:bookingId" element={<BookingDetailPage />} />
      <Route path="/organizations/:id/scan" element={<ScannerPage />} />
    </Route>
  </Route>
</Routes>
```

---

## Auth Store (Zustand)

```ts
interface AuthState {
  token: string | null
  user: { id: string; email: string; firstName: string; roles: string[] } | null
  setAuth: (token: string, user: AuthState['user']) => void
  logout: () => void
  isAdmin: () => boolean
}
```

Токен хранится в `localStorage`. При инициализации — читать из localStorage.

---

## API Client (Axios)

```ts
// Интерцептор: добавить Authorization header
instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Интерцептор: 401 → logout + редирект
instance.interceptors.response.use(null, error => {
  if (error.response?.status === 401) {
    useAuthStore.getState().logout()
    window.location.href = '/login'
  }
  return Promise.reject(error)
})
```

---

## QR Сканер (`ScannerPage.tsx`)

```tsx
import jsQR from 'jsqr'

// getUserMedia → canvas → jsQR.decode(imageData) → token
// POST /api/bookings/scan → показать карточку визита
// 3 состояния: scanning | success | error
```

---

## Импорт стилей (`main.tsx`)

```tsx
import './design/styles.css'  // дизайн-система
import './index.css'           // глобальные сбросы (если нужны)
```

Обёртка `.civio` нужна на каждой странице (уже есть в дизайн-шаблонах).
