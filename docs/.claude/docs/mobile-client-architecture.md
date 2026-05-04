# Мобильный клиент Civio — Архитектура

## Стек

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

---

## Дизайн-система

Дизайн-файлы: `clients/Civio.Mobile/design/`

| Файл | Содержание |
|------|-----------|
| `md3.jsx` | Токены (`CIVIO`), компоненты: `TextField`, `Button`, `Chip`, `BottomNav`, `TopBar`, `Icon`, `Phone` |
| `screens-1-4.jsx` | Login, Register, Catalog, OrgDetail |
| `screens-5-8.jsx` | BookService, SelectSlot, ConfirmBooking, Bookings |
| `screens-9-12.jsx` | BookingDetail, QrCode, Notifications, Profile |
| `android-frame.jsx` | Обёртка телефона для превью |

### Цветовые токены → Material Theme

```kotlin
// ui/theme/Color.kt
val Primary = Color(0xFF4F46E5)          // CIVIO.primary
val PrimaryContainer = Color(0xFFE0E7FF) // CIVIO.primaryContainer
val OnPrimaryContainer = Color(0xFF1E1B4B)
val Surface = Color(0xFFFFFFFF)          // CIVIO.surface
val SurfaceDim = Color(0xFFF6F7FB)       // CIVIO.surfaceDim
val SurfaceContainer = Color(0xFFF2F3F8) // CIVIO.surfaceContainer
val OnSurface = Color(0xFF1B1B1F)        // CIVIO.onSurface
val OnSurfaceVariant = Color(0xFF46464F) // CIVIO.onSurfaceVar
val OnSurfaceMuted = Color(0xFF73737E)   // CIVIO.onSurfaceMuted
val Outline = Color(0xFFC7C7D1)          // CIVIO.outline
val OutlineVariant = Color(0xFFE4E4EC)   // CIVIO.outlineVariant
val Error = Color(0xFFB3261E)            // CIVIO.error
val ErrorContainer = Color(0xFFFCE9E7)
val Success = Color(0xFF1F8F4E)          // CIVIO.success
val SuccessContainer = Color(0xFFDCF2E4)
val Warning = Color(0xFFC2620C)          // CIVIO.warning
val WarningContainer = Color(0xFFFCEBD8)

// ui/theme/Theme.kt
val CivioColorScheme = lightColorScheme(
    primary = Primary,
    primaryContainer = PrimaryContainer,
    onPrimaryContainer = OnPrimaryContainer,
    surface = Surface,
    onSurface = OnSurface,
    onSurfaceVariant = OnSurfaceVariant,
    outline = Outline,
    error = Error,
    errorContainer = ErrorContainer,
)
```

---

## Маппинг компонентов JSX → Compose

| Дизайн (JSX) | Compose |
|---|---|
| `TextField` | `OutlinedTextField` |
| `Button` (filled) | `Button` |
| `Button` (outlined) | `OutlinedButton` |
| `Button` (text) | `TextButton` |
| `Chip` (selected) | `FilterChip(selected=true)` |
| `Chip` (outlined) | `FilterChip(selected=false)` |
| `BottomNav` | `NavigationBar` + `NavigationBarItem` |
| `TopBar` | `TopAppBar` / `CenterAlignedTopAppBar` |
| `Icon` | `Icon` + Vector drawable / `ImageVector` |
| `Phone` | не нужен — реальное устройство |
| `LogoMark` | `Box` + `Text("C")` с rounded corner + indigo bg |
| `OrgCard` | `Card` + `Column` + `Row` |
| `ServiceRow` | `Card` + `Column` |
| `StatusBadge` | `SuggestionChip` или кастомный `Box` |
| `TimelineEntry` | кастомный `Row` + vertical line |
| `SlotChip` | `FilterChip` |
| `DateChip` | `FilterChip` горизонтальный |

### Иконки

Дизайн использует кастомные SVG (`Icon` компонент). В Compose — два варианта:

1. **`androidx.compose.material.icons`** — стандартные Material Symbols (подходит для большинства)
2. **Кастомные vector drawables** — для иконок без аналогов (scissors, pin, badge)

Маппинг:

```kotlin
// Стандартные
ArrowBack, Search, Home, CalendarToday, Notifications, Person,
Phone, Email, AccessTime, Sell, CheckCircle, Close, Add,
Shield, Logout, Delete, Refresh, Visibility, VisibilityOff, Error

// Кастомные (нарисовать как VectorDrawable или ImageVector)
Icons.Custom.Pin     // location pin
Icons.Custom.Scissors // scissors / services
Icons.Custom.Badge   // badge
```

---

## Структура проекта

```
app/src/main/java/com/civio/app/
│
├── ui/
│   ├── theme/
│   │   ├── Color.kt         — цветовые токены
│   │   ├── Theme.kt         — CivioTheme
│   │   └── Type.kt          — типографика (Roboto)
│   │
│   ├── components/          — общие Compose-компоненты
│   │   ├── CivioTextField.kt
│   │   ├── CivioButton.kt
│   │   ├── StatusBadge.kt
│   │   ├── LoadingBox.kt
│   │   └── EmptyState.kt
│   │
│   └── screens/
│       ├── auth/
│       │   ├── LoginScreen.kt
│       │   └── RegisterScreen.kt
│       ├── catalog/
│       │   ├── OrganizationsScreen.kt
│       │   └── OrganizationDetailScreen.kt
│       ├── booking/
│       │   ├── BookServiceScreen.kt
│       │   ├── SelectSlotScreen.kt
│       │   └── ConfirmBookingScreen.kt
│       ├── mybookings/
│       │   ├── BookingsScreen.kt
│       │   ├── BookingDetailScreen.kt
│       │   └── QrCodeScreen.kt
│       ├── notifications/
│       │   └── NotificationsScreen.kt
│       └── profile/
│           └── ProfileScreen.kt
│
├── navigation/
│   ├── NavGraph.kt          — NavHost, composable routes
│   └── Routes.kt            — константы маршрутов
│
├── data/
│   ├── api/
│   │   ├── CivioApi.kt      — Retrofit interface
│   │   └── dto/             — data classes для JSON
│   │       ├── AuthDto.kt
│   │       ├── OrganizationDto.kt
│   │       ├── BookingDto.kt
│   │       └── NotificationDto.kt
│   ├── repository/
│   │   ├── AuthRepository.kt
│   │   ├── OrganizationRepository.kt
│   │   ├── BookingRepository.kt
│   │   └── NotificationRepository.kt
│   └── local/
│       └── TokenStorage.kt  — EncryptedSharedPreferences
│
├── domain/
│   └── model/               — доменные модели (опц. для диплома)
│
├── viewmodel/
│   ├── AuthViewModel.kt
│   ├── OrganizationsViewModel.kt
│   ├── OrgDetailViewModel.kt
│   ├── BookingFlowViewModel.kt  — shared ViewModel для flow записи
│   ├── BookingsViewModel.kt
│   ├── BookingDetailViewModel.kt
│   └── NotificationsViewModel.kt
│
└── di/
    ├── NetworkModule.kt     — Retrofit, OkHttp, Hilt @Module
    └── StorageModule.kt     — EncryptedSharedPreferences
```

---

## Навигация

```kotlin
// Routes.kt
object Routes {
    const val LOGIN = "login"
    const val REGISTER = "register"
    const val CATALOG = "catalog"
    const val ORG_DETAIL = "org/{orgId}"
    const val BOOK_SERVICE = "org/{orgId}/book"
    const val SELECT_SLOT = "org/{orgId}/slots"
    const val CONFIRM = "org/{orgId}/confirm"
    const val BOOKINGS = "bookings"
    const val BOOKING_DETAIL = "bookings/{bookingId}"
    const val QR_CODE = "bookings/{bookingId}/qr"
    const val NOTIFICATIONS = "notifications"
    const val PROFILE = "profile"
}
```

Два вложенных графа:
- **Auth граф** (`login`, `register`) — без BottomBar
- **Main граф** (остальные) — с `NavigationBar` (Каталог | Записи | Уведомления | Профиль)

```kotlin
// NavGraph.kt
NavHost(startDestination = if (token != null) Routes.CATALOG else Routes.LOGIN) {
    // Auth (no bottom bar)
    composable(Routes.LOGIN) { LoginScreen(...) }
    composable(Routes.REGISTER) { RegisterScreen(...) }

    // Main scaffold with bottom bar
    composable(Routes.CATALOG) { OrganizationsScreen(...) }
    composable(Routes.ORG_DETAIL) { OrgDetailScreen(...) }
    composable(Routes.BOOK_SERVICE) { BookServiceScreen(...) }
    composable(Routes.SELECT_SLOT) { SelectSlotScreen(...) }
    composable(Routes.CONFIRM) { ConfirmBookingScreen(...) }
    composable(Routes.BOOKINGS) { BookingsScreen(...) }
    composable(Routes.BOOKING_DETAIL) { BookingDetailScreen(...) }
    composable(Routes.QR_CODE) { QrCodeScreen(...) }
    composable(Routes.NOTIFICATIONS) { NotificationsScreen(...) }
    composable(Routes.PROFILE) { ProfileScreen(...) }
}
```

---

## Data Layer

### Retrofit API

```kotlin
interface CivioApi {
    // Auth
    @POST("api/auth/login")
    suspend fun login(@Body body: LoginRequest): AuthResponse

    @POST("api/auth/register")
    suspend fun register(@Body body: RegisterRequest): AuthResponse

    @GET("api/auth/me")
    suspend fun getMe(): UserResponse

    // Organizations
    @GET("api/organizations/my")
    suspend fun getMyOrganizations(): List<OrganizationResponse>

    @GET("api/organizations/{id}/services")
    suspend fun getServices(@Path("id") orgId: String): List<ServiceResponse>

    @GET("api/organizations/{id}/available-slots")
    suspend fun getAvailableSlots(
        @Path("id") orgId: String,
        @Query("serviceId") serviceId: String,
        @Query("date") date: String  // "yyyy-MM-dd"
    ): List<SlotResponse>

    // Bookings
    @GET("api/bookings/my")
    suspend fun getMyBookings(): List<BookingSummaryResponse>

    @GET("api/bookings/{id}")
    suspend fun getBooking(@Path("id") bookingId: String): BookingResponse

    @POST("api/bookings")
    suspend fun createBooking(@Body body: CreateBookingRequest): BookingResponse

    @POST("api/bookings/{id}/cancel")
    suspend fun cancelBooking(@Path("id") bookingId: String): BookingResponse

    @GET("api/bookings/{id}/qr")
    suspend fun getQr(@Path("id") bookingId: String): BookingQrResponse

    // Notifications
    @GET("api/notifications/my")
    suspend fun getNotifications(): List<NotificationResponse>
}
```

### OkHttp Auth Interceptor

```kotlin
class AuthInterceptor(private val tokenStorage: TokenStorage) : Interceptor {
    override fun intercept(chain: Chain): Response {
        val token = tokenStorage.getToken()
        val request = if (token != null) {
            chain.request().newBuilder()
                .addHeader("Authorization", "Bearer $token")
                .build()
        } else chain.request()
        return chain.proceed(request)
    }
}
```

---

## ViewModel паттерн

```kotlin
// Пример: OrganizationsViewModel.kt
@HiltViewModel
class OrganizationsViewModel @Inject constructor(
    private val repository: OrganizationRepository
) : ViewModel() {

    private val _state = MutableStateFlow<OrgsState>(OrgsState.Loading)
    val state: StateFlow<OrgsState> = _state.asStateFlow()

    init { load() }

    fun load() = viewModelScope.launch {
        _state.value = OrgsState.Loading
        runCatching { repository.getMyOrganizations() }
            .onSuccess { _state.value = OrgsState.Success(it) }
            .onFailure { _state.value = OrgsState.Error(it.message ?: "Ошибка") }
    }
}

sealed class OrgsState {
    object Loading : OrgsState()
    data class Success(val orgs: List<Organization>) : OrgsState()
    data class Error(val message: String) : OrgsState()
}
```

---

## Конвертация экрана из дизайна

Алгоритм для каждого экрана:

### Шаг 1 — Найти компонент в дизайн-файле

`screens-1-4.jsx` → `LoginScreen`, `RegisterScreen`, `OrganizationsScreen`, `OrganizationDetailScreen`
`screens-5-8.jsx` → `BookServiceScreen`, `SelectSlotScreen`, `ConfirmBookingScreen`, `BookingsScreen`
`screens-9-12.jsx` → `BookingDetailScreen`, `QrCodeScreen`, `NotificationsScreen`, `ProfileScreen`

### Шаг 2 — Перенести структуру разметки

```kotlin
// JSX (дизайн):
<div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
  <TextField label="Email" value="..." />
  <TextField label="Пароль" type="password" />
</div>

// Compose:
Column(verticalArrangement = Arrangement.spacedBy(20.dp)) {
    OutlinedTextField(value = email, onValueChange = { email = it }, label = { Text("Email") })
    OutlinedTextField(value = password, onValueChange = { password = it },
        label = { Text("Пароль") },
        visualTransformation = PasswordVisualTransformation())
}
```

### Шаг 3 — Заменить статичные данные

```kotlin
// Дизайн: value="alex@civio.test"
// Compose: value = uiState.email (из StateFlow ViewModel)
```

### Шаг 4 — Подключить ViewModel + API

```kotlin
@Composable
fun LoginScreen(viewModel: AuthViewModel = hiltViewModel(), onSuccess: () -> Unit) {
    val state by viewModel.state.collectAsState()
    // ...
    Button(onClick = { viewModel.login(email, password) }) { Text("Войти") }
    LaunchedEffect(state) {
        if (state is AuthState.Success) onSuccess()
    }
}
```

---

## QR-код

ZXing генерирует `Bitmap` из токена:

```kotlin
fun generateQrBitmap(token: String, size: Int = 800): Bitmap {
    val bits = QRCodeWriter().encode(token, BarcodeFormat.QR_CODE, size, size)
    return Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888).also { bmp ->
        for (x in 0 until size) for (y in 0 until size)
            bmp.setPixel(x, y, if (bits[x, y]) Color.BLACK else Color.WHITE)
    }
}

// В Compose:
Image(bitmap = qrBitmap.asImageBitmap(), contentDescription = "QR", modifier = Modifier.size(280.dp))
```

---

## Важные замечания

- **Публичный каталог** — нет `GET /api/organizations` без авторизации. Нужно добавить backend endpoint или работать только с авторизованными пользователями.
- **Booking flow** — экраны 5-7 (выбор услуги → слота → подтверждение) используют shared `BookingFlowViewModel`, не три отдельных.
- **401 handling** — OkHttp interceptor: при 401 очистить токен и перейти на Login. Реализовать через `Authenticator` или response interceptor.
- **Offline** — для диплома не нужен. Никакого Room/кеширования.
