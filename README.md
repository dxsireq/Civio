<h1 align="center">Civio</h1>

<p align="center">
  Платформа управления организациями и записью на услуги
</p>

<p align="center">
  <img src="https://img.shields.io/badge/.NET-10-512BD4?style=flat-square&logo=dotnet" alt=".NET 10"/>
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/Android-Kotlin-7F52FF?style=flat-square&logo=kotlin&logoColor=white" alt="Android"/>
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"/>
</p>

---

## Обзор

Civio — система для управления организациями, сотрудниками и онлайн-записью граждан на услуги. Включает REST API, веб-панель и мобильное Android-приложение.

**Роли пользователей:**
- **PlatformAdmin** — модерация организаций, управление пользователями
- **OrganizationOwner** — управление своей организацией, сотрудниками, расписанием и услугами
- **OrganizationEmployee** — просмотр записей, управление слотами
- **Citizen** — поиск организаций, запись на услуги

---

## Стек технологий

| Слой | Технологии |
|------|-----------|
| **Backend** | .NET 10 · ASP.NET Core Minimal API · EF Core · JWT Bearer |
| **База данных** | PostgreSQL 16 · SQL-first (без migrations) |
| **Веб-клиент** | React 19 · TypeScript · Vite · TailwindCSS |
| **Мобильный клиент** | Android · Kotlin · Jetpack Compose |
| **Инфраструктура** | Docker · Docker Compose |

---

## Архитектура

Бэкенд построен по **Clean Architecture**:

```
Civio.sln
├── src/
│   ├── Civio.Api/            # Endpoints — только оркестрация
│   ├── Civio.Application/    # Интерфейсы + use-cases
│   ├── Civio.Domain/         # Сущности и бизнес-правила
│   ├── Civio.Infrastructure/ # EF Core, реализации сервисов, DI
│   └── Civio.Contracts/      # DTO (request / response)
├── clients/
│   ├── Civio.Web/            # React веб-клиент
│   └── Civio.Mobile/         # Android приложение
└── database/
    └── init.sql              # Полная схема БД
```

---

## Быстрый старт

### Предварительные требования

- [Docker](https://docs.docker.com/get-docker/) + Docker Compose
- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js](https://nodejs.org/) 20+
- Android Studio (для мобильного клиента)

### 1. Клонирование и настройка

```bash
git clone https://github.com/dxsireq/Civio.git
cd Civio
cp .env.example .env
```

### 2. База данных

> Для локальной разработки поднимается **только** PostgreSQL.

```bash
docker compose up -d postgres

# Проверка
docker ps
docker exec -it civio-system-postgres psql -U civio_user -d civio_system -c "\dt"
```

### 3. Backend API

```bash
dotnet restore
dotnet build
dotnet run --project src/Civio.Api/Civio.Api.csproj
```

Swagger UI доступен по адресу: `http://localhost:5214/swagger`

### 4. Веб-клиент

```bash
cd clients/Civio.Web
npm install
cp .env.example .env
npm run dev
```

Открыть: `http://localhost:5173`

### 5. Мобильный клиент (Waydroid / устройство) | Или использовать Android Studio

```bash
# Запуск эмулятора Waydroid
waydroid session start
waydroid show-full-ui

# Настройка сети (если нужен ADB через Waydroid)
sudo lxc-attach -P /var/lib/waydroid/lxc -n waydroid -- /system/bin/ifconfig eth0 192.168.240.100 netmask 255.255.255.0
sudo lxc-attach -P /var/lib/waydroid/lxc -n waydroid -- /system/bin/ip route add default via 192.168.240.1
adb connect 192.168.240.100:5555

# Проброс порта API
adb reverse tcp:5214 tcp:5214

# Сборка и установка
cd clients/Civio.Mobile
./gradlew assembleDebug
adb install app/build/outputs/apk/debug/app-debug.apk
```

### Альтернатива: Весь стек в Docker

Вместо шагов 2–4 — поднять postgres + API + web за единым reverse-proxy
(Caddy) одной командой. Один origin, без CORS.

```bash
# 1. собрать веб на хосте (контейнер раздаёт готовый dist)
cd clients/Civio.Web && npm install && npm run build && cd ../..

# 2. поднять всё: postgres + api + web + caddy
docker compose up -d --build
docker compose ps
```

- Веб: `http://localhost:8080`
- Swagger: `http://localhost:8080/swagger`
- API: `http://localhost:8080/api/...`

`.env` оставить с пустыми прод-переменными (`SITE_ADDRESS`,
`ASPNETCORE_ENVIRONMENT`, `Jwt__Secret`) — Caddy биндит `:8080` без TLS, API
стартует в `Development`.

> Измёнен веб — пересобрать `dist` (`npm run build`) и
> `docker compose up -d --build web`.


## API

| Группа | Endpoints |
|--------|-----------|
| Auth | Регистрация, вход, профиль |
| Organizations | CRUD организаций, модерация |
| Services | Услуги организации |
| Employees | Сотрудники и привязка к организации |
| Schedule | Шаблоны расписания, рабочие дни |
| Slots | Временные слоты для записи |
| Bookings | Создание и управление записями |
| Notifications | Уведомления пользователя |
| Admin | Управление пользователями, лог активности |

Полная документация: `http://localhost:5214/swagger`

---

## Тестовые аккаунты

Все аккаунты используют пароль: `Test1234!`

| Email | Роль | Описание |
|-------|------|----------|
| `admin@civio.test` | PlatformAdmin | Администратор платформы |
| `owner@civio.test` | OrganizationOwner | Владелец org1 «Студия красоты Civio» и org2 «Барбершоп Civio» (approved) |
| `owner2@civio.test` | OrganizationOwner | Владелец org3 «Маникюрный салон Pending» (на модерации) |
| `owner3@civio.test` | OrganizationOwner | Владелец org4 «Спа-салон Rejected» (отклонена) |
| `owner4@civio.test` | OrganizationOwner | Владелец org5 «Студия Blocked» (заблокирована) |
| `owner5@civio.test` | OrganizationOwner | Владелец org6 «Тату-студия InkArt» (на модерации) |
| `owner6@civio.test` | OrganizationOwner | Владелец org7 «Фотостудия Кадр» (на модерации) |
| `owner7@civio.test` | OrganizationOwner | Владелец org8 «Фитнес-студия Тонус» (approved) |
| `owner8@civio.test` | OrganizationOwner | Владелец org9 «Автосервис Мотор» (approved) |
| `owner9@civio.test` | OrganizationOwner | Владелец org10 «Стоматология Дента» (approved) |
| `employee@civio.test` | OrganizationEmployee | Сотрудник org1 (парикмахер) |
| `employee2@civio.test` | OrganizationEmployee | Сотрудник org1 (мастер маникюра) |
| `employee3@civio.test` | OrganizationEmployee | Сотрудник org2 (барбер) |
| `client@civio.test` | Citizen | Записи в нескольких организациях |
| `client2@civio.test` | Citizen | Записи в нескольких организациях |
| `client3@civio.test` | Citizen | Нет записей |
| `client4@civio.test` | Citizen | Записи в нескольких организациях |
| `client5@civio.test` | Citizen | Записи в нескольких организациях |
| `client6@civio.test` | Citizen | Записи в нескольких организациях |

### Сотрудники с подтверждёнными аккаунтами (роль OrganizationEmployee)

У каждой организации минимум 2 сотрудника с подтверждённым аккаунтом — могут войти на платформу (логин = email сотрудника, пароль `Test1234!`), имеют назначенные услуги, дни работы и записи.

| Организация | Логины сотрудников |
|-------------|--------------------|
| org1 «Студия красоты Civio» | `employee@civio.test` (парикмахер), `employee2@civio.test` (мастер маникюра) |
| org2 «Барбершоп Civio» | `employee3@civio.test`, `t.nazarov@civio.test` (барберы) |
| org3 «Маникюрный салон» | `s.krylova@civio.test`, `v.tikhonova@civio.test` (мастера маникюра) |
| org4 «Спа-салон» | `p.safonov@civio.test` (массажист), `d.melnikova@civio.test` (косметолог) |
| org5 «Студия Blocked» | `k.bogdanov@civio.test`, `l.vlasova@civio.test` (парикмахеры) |
| org6 «Тату-студия InkArt» | `g.zhukov@civio.test`, `n.polyakova@civio.test` (тату-мастера) |
| org7 «Фотостудия Кадр» | `m.solovyov@civio.test`, `a.kovaleva@civio.test` (фотографы) |
| org8 «Фитнес-студия Тонус» | `m.volkov@civio.test` (тренер), `n.kiseleva@civio.test` (массажист), `a.gusev@civio.test` (тренер) |
| org9 «Автосервис Мотор» | `o.titov@civio.test`, `d.ershov@civio.test` (механики) |
| org10 «Стоматология Дента» | `a.markova@civio.test` (стоматолог), `y.klimova@civio.test` (гигиенист) |

### Неподтверждённые сотрудники org1 (приглашение ожидает принятия)

Аккаунта нет, войти нельзя — приглашение в статусе `pending` («Ожидает принятия»):

`t.orlova@civio.test` (администратор), `p.zaytsev@civio.test` (стилист), `i.belyaeva@civio.test` (косметолог).

Итого организаций: 3 на модерации (org3, org6, org7), 5 одобренных (org1, org2, org8, org9, org10), 2 отменённых (org4 отклонена, org5 заблокирована). У каждой — минимум 2 сотрудника с подтверждённым аккаунтом, услуги с привязкой к сотрудникам и **минимум 10 записей**, покрывающих все статусы (created, confirmed, completed, cancelled, rejected).

---

## Установка зависимостей (Arch Linux)

```bash
sudo pacman -Syu
sudo pacman -S git docker docker-compose dotnet-sdk aspnet-runtime nodejs npm

# Docker без sudo
sudo usermod -aG docker $USER
sudo systemctl enable --now docker

# Waydroid (Android эмулятор)
yay -S waydroid
sudo waydroid init
sudo systemctl enable --now waydroid-container

reboot
```
