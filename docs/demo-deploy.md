# Демо-деплой для защиты (бесплатно, Cloudflare Tunnel)

Весь стек — в Docker за единым reverse-proxy (Caddy). Один публичный URL, без CORS.

```
cloudflared → Caddy ─┬─ /        → web (nginx, vite build)
                     ├─ /api/*   → api (.NET 10 :8080)
                     └─ api      → postgres
```

## Один раз: установить cloudflared

```bash
# Arch
sudo pacman -S cloudflared
# или бинарь: https://github.com/cloudflare/cloudflared/releases
```

## Запуск стека

Веб собирается **на хосте** (npm-сборка в Docker падала по OOM/сети),
контейнер только раздаёт готовый `dist/`.

```bash
# 1. собрать веб на хосте (использует .env.production -> относительный /api)
cd clients/Civio.Web && npm run build && cd ../..

# 2. поднять стек
docker compose up -d --build      # postgres + api + web + caddy
docker compose ps                 # все healthy/up
curl http://localhost:8080/health/db   # проверка API через прокси
```

> Меняешь веб-клиент — пересобери `dist` (`npm run build`) и
> `docker compose up -d --build web`.

Локально проверить: открыть `http://localhost:8080` — веб-клиент.

## Публичный доступ (с других устройств)

```bash
cloudflared tunnel --url http://localhost:8080
```

Выведет URL вида `https://<random>.trycloudflare.com`. Это и есть точка доступа.

- **Веб**: дать ссылку `https://<random>.trycloudflare.com` — открывается с любого устройства.
- **Swagger**: `https://<random>.trycloudflare.com/swagger`
- **API**: `https://<random>.trycloudflare.com/api/...`

## Мобильный APK

URL `trycloudflare` случайный и держится, пока жив процесс `cloudflared`.
Поэтому: сперва поднять туннель, потом собрать APK с этим URL.

1. В `clients/Civio.Mobile/app/build.gradle.kts` заменить все три
   `API_BASE_URL` на:
   ```kotlin
   buildConfigField("String", "API_BASE_URL", "\"https://<random>.trycloudflare.com/api/\"")
   ```
2. Собрать и установить:
   ```bash
   cd clients/Civio.Mobile
   ./gradlew assembleRelease     # или assembleDebug
   # APK: app/build/outputs/apk/...
   ```
3. Раздать APK на телефоны.

> HTTPS-туннель — валидный сертификат, `network_security_config` (cleartext)
> не нужен. URL `https`, всё работает из коробки.

## Важно на защите

- **Не перезапускать** `cloudflared` после сборки APK — URL сменится, APK перестанет работать.
- Держать ноутбук от сна: `systemd-inhibit --what=sleep sleep infinity &` или настройки питания.
- Бэкап-сеть: телефон-хотспот на случай блокировки wifi площадки.

## Остановка

```bash
docker compose down        # стек
# Ctrl+C в окне cloudflared — туннель
```

## Деплой на VPS позже (если захочется)

Тот же `docker compose up -d --build` на сервере. Заменить туннель на
проброс порта/домена в Caddy. Переработки кода — ноль.
