# Running the Project

## Dev (локально)

### 1. База данных

```bash
docker compose up -d postgres
```

Postgres поднимается на `127.0.0.1:5432`. Схема инициализируется из `database/init.sql` при первом старте.

### 2. API

```bash
dotnet run --project src/Civio.Api
```

Читает `.env` через DotNetEnv (traversepath). Порт — из `ASPNETCORE_HTTP_PORTS` или дефолт Kestrel.  
Swagger: `http://localhost:{port}/swagger`

Минимальный `.env` для dev:
```
Jwt__Secret=<любая строка>
App__WebClientBaseUrl=http://localhost:5173
```

### 3. Web

```bash
cd clients/Civio.Web
npm install
npm run dev   # Vite на :5173 (или :5174)
```

`clients/Civio.Web/.env`:
```
VITE_API_BASE_URL=http://localhost:5214
```

### 4. Mobile

Android Studio → Run (эмулятор или устройство).

- **Эмулятор**: `BuildConfig.API_BASE_URL = "http://10.0.2.2:5214/"` (маппинг на host localhost).
- **Реальное устройство**: при запуске приложение фетчит `API_CONFIG_URL` (gist) и перезаписывает base URL. Обновить gist-файл под нужный адрес.

---

## Prod (Docker Compose, полный стек)

### Подготовка веб-клиента

Web-контейнер **не собирает** JS — только раздаёт готовый `dist/` через nginx.  
Перед `docker compose up` нужно собрать вручную:

```bash
cd clients/Civio.Web
# Установить VITE_API_BASE_URL в .env на прод-адрес
npm ci
npm run build
cd ../..
```

### Переменные окружения

Скопировать `.env.example` → `.env`, заполнить:

| Переменная | Описание |
|------------|----------|
| `Jwt__Secret` | **Обязательно сменить.** `openssl rand -base64 48` |
| `ASPNETCORE_ENVIRONMENT` | `Production` (скрывает детальные ошибки) |
| `SITE_ADDRESS` | Домен для auto-TLS Caddy (пусто → `:8080` без TLS) |
| `App__WebClientBaseUrl` | Публичный URL фронта (для invite-ссылок в письмах) |
| `Email__*` | SMTP-крелы (без них письма пропускаются, не падают) |

### Запуск

```bash
docker compose up -d
```

Поднимает 4 сервиса:

| Сервис | Образ | Сеть | Порт |
|--------|-------|------|------|
| `postgres` | postgres:16 | bridge | `127.0.0.1:5432` |
| `api` | build from `src/Civio.Api/Dockerfile` | **host** | `:5214` |
| `web` | build from `clients/Civio.Web` (nginx) | bridge | `127.0.0.1:8081` |
| `caddy` | caddy:2-alpine | **host** | `:8080` (dev) / `:443` (prod с доменом) |

### Caddy (reverse proxy)

```
/api/*        → localhost:5214 (API)
/swagger/*    → localhost:5214
/openapi/*    → localhost:5214
/health/*     → localhost:5214
/*            → localhost:8081 (Web)
```

`SITE_ADDRESS` пуст → `:8080` без TLS.  
`SITE_ADDRESS=example.com` → Caddy автоматически получает Let's Encrypt сертификат на `:443`.

### Почему host network для api и caddy

API нужен доступ к VPN-туннелю (tun-интерфейс) для SMTP через Gmail. В bridge-режиме контейнер не маршрутизирует адреса VPN. Caddy на host network, чтобы добраться до API (`:5214`) и web (`:8081`) через loopback.

### Проверка

```bash
curl http://localhost:8080/health/db    # dev без домена
curl https://example.com/health/db     # prod с доменом
```

### Мобильный клиент (прод)

Обновить содержимое gist по адресу `API_CONFIG_URL` в `app/build.gradle.kts` — одна строка с прод-URL (например `https://example.com/`). Приложение подтянет при следующем запуске без пересборки.
