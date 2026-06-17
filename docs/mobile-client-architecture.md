# Mobile Client Architecture

`clients/Civio.Mobile` — Android, Kotlin, Jetpack Compose.

## Стек

| | |
|--|--|
| UI | Jetpack Compose + Material3 |
| DI | Hilt |
| HTTP | Retrofit + OkHttp + Gson |
| Navigation | Navigation Compose |
| Storage | EncryptedSharedPreferences (AES256) |
| Pattern | MVVM |

## Слои

```
data/
  api/          # CivioApi (Retrofit interface), DTO, interceptors
  local/        # TokenStorage, ApiUrlStorage
  repository/   # AuthRepository, BookingRepository, OrganizationRepository, NotificationRepository
di/
  NetworkModule # Hilt Singleton: OkHttpClient, Retrofit, CivioApi
ui/
  screens/      # Compose screens
  components/   # переиспользуемые: CivioButton, CivioCard, CivioTextField, StatusBadge, ...
  theme/
viewmodel/      # по одному на экран/флоу
navigation/     # NavGraph, Routes, BottomNavItem
```

## Scope (только Citizen)

Мобильный клиент покрывает **только гражданский сценарий**. Нет employee-интерфейса, нет org management, нет admin-панели.

## Навигация

Два вложенных графа: `AUTH_GRAPH` и `MAIN_GRAPH`.

**AUTH_GRAPH:** Login → Register → VerifyEmail

**MAIN_GRAPH (BottomNav: Catalog / Bookings / Notifications / Profile):**
- Catalog → OrganizationDetail → booking flow (вложенный граф)
  - `BOOKING_GRAPH`: BookService → SelectSlot → ConfirmBooking → BookingDetail
- BookingDetail → QrCodeScreen (показ QR гражданину)
- NotificationsScreen
- ProfileScreen (с logout)

`BookingFlowViewModel` — shared ViewModel на весь `BOOKING_GRAPH` через `getBackStackEntry`.

## HTTP

OkHttp interceptors (порядок важен):
1. `DynamicBaseUrlInterceptor` — runtime смена base URL (через `ApiUrlStorage`)
2. `AuthInterceptor` — добавляет `Authorization: Bearer` из `TokenStorage`
3. `UnauthorizedInterceptor` — 401 → `AuthEventBus.emit(logout)`
4. `HttpLoggingInterceptor` — BODY в Debug, NONE в Release

**`AuthEventBus`** — SharedFlow, `AuthViewModel` подписывается и навигирует на `AUTH_GRAPH`.

## Хранение токена

`TokenStorage` — `EncryptedSharedPreferences` с `AES256_GCM`, ключ `"jwt"`.

## API endpoints (реализовано)

Auth: login, register, verifyEmail, resendCode, getMe  
Orgs: getCatalog(?city), getOrganization, getOrganizationServices, getAvailableSlots  
Bookings: create, getMyBookings, getBooking, cancelBooking, getBookingQr  
Notifications: getMyNotifications
