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

### Ссылки в письмах (инвайты)

Ссылка приглашения = `{App__WebClientBaseUrl}/invite/{token}`. По умолчанию
`localhost` — с других устройств не откроется. Прописать URL туннеля в `.env`:

```bash
# .env
App__WebClientBaseUrl=https://<random>.trycloudflare.com
```

Применить (env читается при создании контейнера):

```bash
docker compose up -d --force-recreate api
```

> Рантайм-конфиг, не build-time — пересборка образа не нужна. Меняется
> туннель → правишь одну строку в `.env` + `--force-recreate api`.

## Мобильный APK — авто-URL через remote config (вариант B)

URL API в APK больше **не зашит намертво**. При старте приложение тянет
актуальный URL из текстового файла (GitHub raw) → кладёт в prefs →
OkHttp-интерсептор подменяет host каждого запроса. **APK собирается один раз**,
меняешь только файл.

### Один раз: настроить remote config

1. Создать публичный репозиторий (напр. `civio-config`), файл `api-url.txt`,
   одна строка — текущий URL туннеля:
   ```
   https://<random>.trycloudflare.com
   ```
2. В `app/build.gradle.kts` → `API_CONFIG_URL` вписать raw-ссылку файла:
   ```kotlin
   buildConfigField("String", "API_CONFIG_URL",
       "\"https://raw.githubusercontent.com/<user>/civio-config/main/api-url.txt\"")
   ```
3. Собрать APK **один раз**, раздать:
   ```bash
   cd clients/Civio.Mobile
   ./gradlew assembleRelease     # или assembleDebug
   ```

### При каждом новом туннеле

- Поднял туннель → правишь `api-url.txt` (одна строка) → commit.
- Перезапуск приложения на телефоне → новый URL подхватится. **APK не пересобирать.**

> - Тянется при `onCreate` приложения. Туннель сменился при открытом app —
>   перезапусти app.
> - GitHub raw кэшируется CDN ~5 мин — смена URL доезжает с задержкой.
> - Первый холодный старт: до завершения фетча используется fallback
>   (`API_BASE_URL`); экран логина обычно ждёт дольше, чем идёт фетч.

## Мобильный APK — ручная сборка (если без remote config)

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
