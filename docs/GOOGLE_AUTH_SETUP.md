# Настройка нативной авторизации Google в GuestSpot

Ниже собраны шаги для повторного развёртывания проекта с нативным входом Google через Capacitor. План рассчитан на тех, кто поднимает мобильные сборки iOS/Android с нуля или переносит проект на новую машину.

## 1. Подготовка окружения
- Убедитесь, что установлены Node.js (>=20.19), npm и глобально доступен `npx`.
- В корне проекта (`/app`) выполните установку зависимостей:
  ```bash
  npm install
  ```
- Добавьте платформы Capacitor, работая из папки `src-capacitor`:
  ```bash
  cd src-capacitor
  npm install @capacitor/ios @capacitor/android
  npx cap add ios
  npx cap add android
  ```

## 2. Конфигурация окружения
Заполните файл `.env` (либо `.env.local`) значениями, полученными в Google Cloud Console:
```
API_URL=...
API_KEY=...
GOOGLE_WEB_CLIENT_ID=...
GOOGLE_IOS_CLIENT_ID=...
GOOGLE_ANDROID_CLIENT_ID=...
GOOGLE_SERVER_CLIENT_ID=... # опционально, нужен для offline access
```

Эти переменные автоматически прокидываются в фронтенд: см. `quasar.config.ts` и `src/config/constants.ts`.

## 3. Google Cloud Console
1. Создайте проект или используйте существующий.
2. Перейдите в **APIs & Services → OAuth consent screen**:
   - Тип: External.
   - Заполните сведения о приложении.
   - Добавьте тестовых пользователей, пока приложение не опубликовано.
3. В **Credentials → Create credentials → OAuth client ID** создайте три клиента:
   - **Web application** — сохраните `client_id` и `client_secret`, значение идёт в `GOOGLE_WEB_CLIENT_ID`. Если на бэкенде будете обменивать `serverAuthCode`, используйте этот ID в `GOOGLE_SERVER_CLIENT_ID`.
   - **iOS** — укажите Bundle ID `org.guestspot.app`. Скачайте `GoogleService-Info.plist`.
   - **Android** — добавьте пакет `org.guestspot.app` и SHA-1/SHA-256 подписи (для debug можно взять `~/.android/debug.keystore`, для release — ключ из CI). Скачайте `google-services.json`.

## 4. Капаситорная конфигурация
1. Отредактируйте блок `plugins.GoogleAuth` в `src-capacitor/capacitor.config.json`, заполнив clientId/iosClientId/androidClientId/serverClientId.
2. Выполните синхронизацию (всё так же из `src-capacitor`):
   ```bash
  npx cap sync ios
  npx cap sync android
   ```

## 5. iOS
1. Поместите файл, который приходит из Google (обычно он называется `client_<...>.apps.googleusercontent.com.plist`), в `src-capacitor/ios/App/App` и переименуйте в `GoogleService-Info.plist` — именно это имя ожидает Xcode/Google SDK.
2. Запустите `npx cap open ios`, затем в Xcode:
   - В Project Navigator перетащите `GoogleService-Info.plist` в группу `App → App`. В диалоге добавления включите `Copy items if needed` и отметьте таргет `App`. Это гарантирует появление файла в Build Phases → Copy Bundle Resources.
   - В **Info → URL Types** добавьте `REVERSED_CLIENT_ID` из plist как схему (для обратных редиректов).
   - При необходимости добавьте `LSApplicationQueriesSchemes` с `com.googleusercontent.apps.<id>` (для совместимости со старыми SDK).
3. Соберите проект на устройстве/симуляторе, проверьте вход.

## 6. Android
1. Поместите `google-services.json` в `src-capacitor/android/app`.
2. Убедитесь, что в Google Play Console зарегистрированы SHA-1 релизного ключа и подпись от Google Play (если используете App Signing).
3. Запустите `npx cap open android` и убедитесь, что Google Play Services подключаются без ошибок.

## 7. Проверка работы
1. В веб-версии (quasar dev) кнопка Google ведёт по старой схеме: редирект на `${API_URL}/api/connect/google`.
2. В нативных сборках плагин `@codetrix-studio/capacitor-google-auth` выполняет вход:
   - При успешном signIn возвращается `accessToken`, который отправляется на бэкенд через `connect`.
   - Пользователь сохраняется в Pinia, выполняется переход на `/profile`.
3. В консоли Xcode/Android Studio убедитесь, что нет ошибок `Missing Google access token`.

## 8. Troubleshooting
- **Missing appId for new platform:** команда `npx cap add` должна выполняться из папки `src-capacitor`, где расположен `capacitor.config.json`.
- **ENOTFOUND npm при установке плагинов:** в песочнице требуется флаг `with_escalated_permissions` или offline зеркало. На реальной машине нужно восстановить доступ к npm registry.
- **App-Bound Domains (iOS 17+):** Capacitor конфиг содержит `ios.limitsNavigationsToAppBoundDomains = true`. Благодаря нативному плагину авторизация не уходит в браузер и работает корректно.
- **Не приходит refresh token:** включите `grantOfflineAccess` в модуле и задайте `GOOGLE_SERVER_CLIENT_ID`, затем реализуйте обработку `serverAuthCode` на бэкенде.

## 9. Полезные команды
- `npm run lint` — проверка линтером.
- `npm run build` или `quasar build -m capacitor -T ios` — полноценная сборка.
- `quasar dev -m capacitor -T ios` — запуск dev-режима с hot reload в симуляторе.
- `npx cap sync` — подтягивает все изменения Capacitor/плагинов в нативные проекты.

Храните этот файл в репозитории (`docs/GOOGLE_AUTH_SETUP.md`) и обновляйте при появлении новых провайдеров авторизации (Apple, Facebook и т.д.), следуя той же структуре.
