# Web Client Architecture

`clients/Civio.Web` — React 19 + TypeScript + Vite.

## Стек

| | |
|--|--|
| Routing | react-router-dom v7 |
| State | zustand (только auth) |
| HTTP | axios |
| Forms | react-hook-form + zod |
| Charts | recharts |
| Icons | lucide-react |
| Toasts | react-hot-toast |
| QR scan | jsqr |

## Структура

```
src/
  api/          # по одному файлу на домен (auth.ts, bookings.ts, ...)
  store/        # auth.ts — zustand store
  lib/          # утилиты: bookingStatus.ts, orgStatus.ts, employeeStatus.ts
  components/   # layouts + route guards
  pages/        # admin/, auth/, employee/, invite/, org/, profile/
  design/       # дизайн-канвас (dev only, /design)
```

## Routing

Три layout-зоны:

| Zone | Guard | Страницы |
|------|-------|---------|
| `AuthLayout` | без auth | `/login`, `/register`, `/register/verify`, `/invite/:token` |
| `AdminRoute` → `AdminLayout` | роль `PlatformAdmin` | `/admin/organizations`, `/admin/users`, `/admin/activity-log`, `/admin/statistics` |
| `ProtectedRoute` | auth required | всё остальное |

Внутри protected:
- `/` → `MyOrgsPage`
- `/organizations/:id` → `AppLayout` (org management): employees, services, bookings, scan, stats
- `/employee/:id` → `EmployeeLayout`: dashboard, schedule, bookings, scan
- `/profile`

## HTTP / Auth

`src/api/client.ts` — axios instance, `baseURL = VITE_API_BASE_URL`.

Request interceptor: берёт токен из `localStorage('token')`, ставит `Authorization: Bearer`.

Response interceptor:
- 401 на не-auth эндпоинте → `logout()` + `window.location.href = '/login'`
- 500+ → `toast.error(getErrorMessage(error))`

`getErrorMessage` резолвит ошибку: code → statusCode → `error`/`detail`/`title` → дефолт.

## Auth store (`src/store/auth.ts`)

zustand, персистится в `localStorage` (ключи `token`, `user`).  
`isAdmin()` — проверяет `roles.includes('PlatformAdmin')`.  
`isLoggingOut` — флаг для подавления лишних редиректов.

## Конфиг

`.env`: `VITE_API_BASE_URL=...`

## Запуск

```bash
cd clients/Civio.Web
npm install
npm run dev     # Vite dev server, обычно :5173
npm run build   # tsc + vite build
```
