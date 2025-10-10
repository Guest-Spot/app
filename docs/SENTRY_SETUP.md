# Настройка мониторинга Sentry

Документ описывает действующую интеграцию Sentry для веб-версии (Quasar/Vue) и мобильных сборок (Capacitor) проекта GuestSpot. Используйте его как шпаргалку при настройке новых окружений, выпуске сборок и диагностике интеграции.

## Подключённые пакеты

| Пакет | Назначение |
| --- | --- |
| `@sentry/vue` | Клиентская SDK для Vue 3/Quasar |
| `@sentry/capacitor` | Бридж к нативным SDK iOS/Android для Capacitor |

> Пакеты уже добавлены в `package.json` проекта и `src-capacitor/package.json`. При переустановке зависимостей дополнительных шагов не требуется.

## Переменные окружения

### Настройка переменных окружения

1. **Скопируйте файл `.env.example` в `.env`:**
   ```bash
   cp .env.example .env
   ```

2. **Заполните необходимые значения в `.env`:**
   - Обязательно укажите `SENTRY_DSN` для активации Sentry
   - Остальные переменные опциональны и имеют значения по умолчанию

3. **Для продакшен-сборок создайте `.env.production`:**
   - Этот файл будет автоматически загружен при `quasar build`
   - Храните чувствительные данные (токены, DSN) только в `.env` файлах
   - **Важно:** Файлы `.env`, `.env.local*`, `.env.production` уже добавлены в `.gitignore` и не будут коммититься

### Описание переменных

| Переменная | Обязательность | Описание |
| --- | --- | --- |
| `SENTRY_DSN` | ✅ | DSN проекта в Sentry. При отсутствии интеграция не активируется. |
| `SENTRY_ENVIRONMENT` | ⚙️ | Имя окружения (например, `development`, `staging`, `production`). По умолчанию берётся из `MODE`/`NODE_ENV`. |
| `SENTRY_RELEASE` | ⚙️ | Строка версии релиза. Если не задана, формируется как `guest-spot@<package.json.version>`. |
| `SENTRY_TRACES_SAMPLE_RATE` | ⚙️ | Доля (0..1) запросов для трассировок. Задайте, если хотите включить Performance Monitoring. |
| `SENTRY_DEBUG` | ⚙️ | `true` для включения debug-логов SDK (по умолчанию `false`). |
| `SENTRY_ORG` | 🔒 | Slug организации в Sentry. Используется при загрузке sourcemap-ов. |
| `SENTRY_PROJECT` | 🔒 | Slug проекта в Sentry. |
| `SENTRY_AUTH_TOKEN` | 🔒 | Auth token с правами `project:releases` (и опционально `org:read`). Держите токен вне репозитория. |

Дополнительно доступна переменная `APP_VERSION`, передаваемая в клиент как fallback для номера приложения.

## Веб-интеграция (Quasar/Vue)

Основная логика находится в `src/boot/sentry.ts`:

- Boot-файл автоматически подхватывается благодаря настройке `boot: ['sentry', ...]` в `quasar.config.ts`.
- SDK инициализируется только при наличии `SENTRY_DSN`.
- Автоматически подключаются:
  - Трассировка роутера через `Sentry.browserTracingIntegration({ router })`.
  - Тег `capacitor-platform` для разделения веб/нативных платформ.
  - Глобальный доступ к SDK через `this.$sentry` / `app.config.globalProperties.$sentry`.
- Параметры `environment`, `release`, `tracesSampleRate`, `sendClientReports` читаются из переменных окружения.

### Использование в коде

```ts
const sentry = getCurrentInstance()?.appContext.config.globalProperties.$sentry;
sentry?.captureException(new Error('Test error'));
```

## Загрузка sourcemap-ов

Vite-плагин Sentry подключён в `quasar.config.ts`. Он автоматически запускается при `quasar build`/`npm run build`, если:

- Сборка выполняется в прод-режиме (`ctx.dev === false`);
- Установлены `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`;
- Определён `SENTRY_RELEASE` (или вычислен из `package.json`).

### Что делает плагин

- Загружает sourcemap-ы из `dist/spa/**` для веб-сборки и `dist/capacitor/**` для мобильной.
- Создаёт (или обновляет) релиз и деплой в Sentry (`setCommits.auto = true`, `deploy.env = SENTRY_ENVIRONMENT`).
- Привязывает релиз к той же версии, что и фронтенд (`guest-spot@<version>`).

### Требования

1. Создайте в Sentry auth token с правами `project:releases` (лучше отдельный токен для CI).
2. Экспортируйте секреты перед сборкой:
   ```bash
   export SENTRY_AUTH_TOKEN=...
   export SENTRY_ORG=guestspot
   export SENTRY_PROJECT=guestspot-app
   ```
3. Убедитесь, что переменные не попадают в git и не логируются.

> Локально секреты можно хранить в `.env.local`/`.env.build` (не коммитить). В CI используйте секреты пайплайна.

## Нативная интеграция (Capacitor)

Файл `src-capacitor/capacitor.config.ts`:

- Загружает `.env` из корня проекта с помощью `dotenv` и пробрасывает настройки плагина `Sentry`.
- При наличии `SENTRY_DSN` в переменных окружения автоматически добавляет блок конфигурации:

```ts
plugins: {
  // ...
  Sentry: {
    dsn: process.env.SENTRY_DSN!,       // обязательный параметр
    debug: process.env.SENTRY_DEBUG === 'true',
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
    release: process.env.SENTRY_RELEASE || `guest-spot@${process.env.npm_package_version}`
  }
}
```

- Конфигурация динамически формируется из переменных окружения, что позволяет использовать разные настройки для разных окружений.
- На нативных платформах boot-файл вызывает `initSentryCapacitor(...)`, чтобы синхронизировать параметры веб-SDK с нативным плагином.
- **Важно:** DSN и другие чувствительные данные хранятся только в `.env` файлах и никогда не коммитятся в репозиторий.

## Сборка и синхронизация нативных проектов

После изменения зависимостей или переменных окружения:

```bash
# пересобрать веб-проект
npm run build

# синхронизировать Capacitor-проекты
npm run capacitor:sync:ios
npm run capacitor:sync:android

# открыть нативные IDE при необходимости
npm run capacitor:open:ios
npm run capacitor:open:android

# загрузить sourcemap-ы (если заданы переменные окружения)
npm run build    # для SPA/Capacitor
```

Во время разработки можно запускать `npm run capacitor:dev` для быстрой проверки на подключённом устройстве.

## Проверка интеграции

1. Запустите приложение (веб или устройство), убедившись, что `SENTRY_DSN` задан.
2. В консоли вызовите:
   ```js
   window.$q?.app?.config?.globalProperties?.$sentry?.captureException(new Error('Sentry smoke test'));
   ```
   или выбросьте исключение в коде.
3. Через 1–2 минуты событие должно появиться в Sentry → Issues.
4. Для нативных устройств: после `npx cap sync` соберите проект в Xcode/Android Studio, запустите на устройстве и повторите тест.

## Рекомендации

- **Переменные окружения.** Используйте `.env.example` как шаблон для создания локального `.env` файла. Никогда не коммитьте файлы с реальными секретами.
- **Capacitor конфигурация.** Редактируйте только `src-capacitor/capacitor.config.ts`. Файлы `capacitor.config.json` в папках `android/app/src/main/assets/` и `ios/App/App/` генерируются автоматически при sync/build и не должны редактироваться вручную.
- **Source maps.** Для продакшен-сборок поддерживается авто-загрузка через Vite-плагин (см. раздел выше). Убедитесь, что секреты заданы перед `npm run build`.
- **Performance.** Если включаете `SENTRY_TRACES_SAMPLE_RATE`, начните с небольших значений (`0.1`) и увеличивайте по необходимости.
- **Debug.** Включайте `SENTRY_DEBUG=true` только локально — в продакшене это может раскрыть лишнюю информацию в логах.
- **Privacy.** Убедитесь, что в событиях нет персональных данных. При необходимости используйте фильтры/скрамблинг.
- **CI.** Добавьте шаг в пайплайн, который устанавливает секреты и запускает `npm run build` / `npm run capacitor:build`. Плагин сам позаботится о загрузке sourcemap-ов.

При обновлении SDK сверяйтесь с официальной документацией:

- https://docs.sentry.io/platforms/javascript/guides/vue/
- https://docs.sentry.io/platforms/capacitor/

Если понадобится расширить интеграцию (например, добавить offline-кэш или фильтры), начните с обновления данного файла и boot-логики.
