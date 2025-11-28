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
   - **Web application** — **ОБЯЗАТЕЛЬНО** для Android и iOS! Сохраните `client_id`, значение идёт в `GOOGLE_WEB_CLIENT_ID`. 
     - Для Android: используется плагином `@capgo/capacitor-social-login` для получения access token (см. `useGoogleAuth.ts`, строка 42: `webClientId: GOOGLE_WEB_CLIENT_ID`)
     - Для iOS: также используется для получения токенов
     - Если на бэкенде будете обменивать `serverAuthCode`, используйте этот же ID в `GOOGLE_SERVER_CLIENT_ID`
   - **iOS** — укажите Bundle ID `com.guestspot.app`. Скачайте `GoogleService-Info.plist`.
   - **Android** — добавьте пакет `com.guestspot.app` и SHA-1/SHA-256 подписи (для debug можно взять `~/.android/debug.keystore`, для release — ключ из CI). Скачайте `google-services.json`.
   
   **Важно:** Web Client ID используется для получения access token, а Android Client ID — для идентификации приложения и проверки SHA-1 отпечатков. Оба нужны для работы Google Sign-In на Android!

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

### 6.1. Получение SHA-1 отпечатков

#### Для Debug сборки:
```bash
cd src-capacitor/android
./gradlew signingReport
```

Или используйте keytool напрямую:
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

#### Для Release сборки:
```bash
cd src-capacitor/android
./gradlew signingReport
```

Или используйте keytool с вашим release keystore:
```bash
keytool -list -v -keystore src-capacitor/android/guest-spot-key.jks -alias guest-spot-alias
```

### 6.2. Проверка Play App Signing и получение SHA-1 из Play Console

**Play App Signing** — это функция Google Play, которая позволяет Google управлять ключом подписи вашего приложения. Если она включена, Google Play переподписывает ваше приложение своим ключом перед распространением.

#### Как проверить, включен ли Play App Signing:

1. Откройте [Google Play Console](https://play.google.com/console)
2. Выберите ваше приложение
3. Перейдите в раздел **Setup** (Настройка) → **App Integrity** (Целостность приложения)
4. В разделе **App signing** (Подпись приложения) вы увидите:
   - **App signing by Google Play** — если включено, будет показан статус "Active"
   - Если включено, вы увидите два ключа:
     - **Upload key certificate** — ваш локальный ключ (для загрузки AAB/APK)
     - **App signing key certificate** — ключ Google Play (используется для финальной подписи)

#### Как получить SHA-1 из Play Console (если Play App Signing включен):

1. В Google Play Console перейдите в **Setup** → **App Integrity**
2. В разделе **App signing** найдите секцию **App signing key certificate**
3. Скопируйте **SHA-1 certificate fingerprint** (SHA-1 отпечаток сертификата)
4. Этот SHA-1 нужно добавить в Google Cloud Console для Android OAuth Client ID

#### Если Play App Signing НЕ включен:

Используйте SHA-1 от вашего локального release keystore (см. раздел 6.1).

### 6.3. Добавление SHA-1 в Google Cloud Console

1. Откройте [Google Cloud Console](https://console.cloud.google.com)
2. Выберите ваш проект
3. Перейдите в **APIs & Services** → **Credentials**
4. Найдите или создайте **OAuth 2.0 Client ID** типа **Android**
5. В поле **Package name** укажите: `com.guestspot.app`
6. В поле **SHA-1 certificate fingerprint** добавьте:
   - SHA-1 из debug keystore (для тестирования)
   - SHA-1 из release keystore (для production)
   - **SHA-1 из Play Console** (если Play App Signing включен) — это самый важный!
7. Сохраните изменения

**Важно:** Если Play App Signing включен, обязательно добавьте SHA-1 из Play Console, иначе Google Sign-In не будет работать на устройствах с приложением из Play Store.

### 6.4. Финальная настройка

1. Поместите `google-services.json` в `src-capacitor/android/app`.
2. Убедитесь, что все необходимые SHA-1 отпечатки добавлены в Google Cloud Console.
3. Запустите `npx cap open android` и убедитесь, что Google Play Services подключаются без ошибок.

## 7. Проверка работы
1. В веб-версии (quasar dev) кнопка Google ведёт по старой схеме: редирект на `${API_URL}/api/connect/google`.
2. В нативных сборках плагин `@codetrix-studio/capacitor-google-auth` выполняет вход:
   - При успешном signIn возвращается `accessToken`, который отправляется на бэкенд через `connect`.
   - Пользователь сохраняется в Pinia, выполняется переход на `/profile`.
3. В консоли Xcode/Android Studio убедитесь, что нет ошибок `Missing Google access token`.

## 8. Troubleshooting

### Общие проблемы

- **Missing appId for new platform:** команда `npx cap add` должна выполняться из папки `src-capacitor`, где расположен `capacitor.config.json`.
- **ENOTFOUND npm при установке плагинов:** в песочнице требуется флаг `with_escalated_permissions` или offline зеркало. На реальной машине нужно восстановить доступ к npm registry.
- **App-Bound Domains (iOS 17+):** Capacitor конфиг содержит `ios.limitsNavigationsToAppBoundDomains = true`. Благодаря нативному плагину авторизация не уходит в браузер и работает корректно.
- **Не приходит refresh token:** включите `grantOfflineAccess` в модуле и задайте `GOOGLE_SERVER_CLIENT_ID`, затем реализуйте обработку `serverAuthCode` на бэкенде.

### Ошибка [16] Account reauth failed

Эта ошибка обычно возникает из-за неправильной конфигурации SHA-1 отпечатков в Google Cloud Console.

**Возможные причины:**

1. **SHA-1 отпечатки не добавлены в Google Cloud Console**
   - Убедитесь, что добавлены SHA-1 для debug и release keystore
   - Если Play App Signing включен, обязательно добавьте SHA-1 из Play Console (см. раздел 6.2)

2. **Используется неправильный SHA-1**
   - Для приложений из Play Store с включенным Play App Signing нужен SHA-1 из Play Console
   - Для локальных сборок используйте SHA-1 из вашего keystore

3. **Неправильный OAuth Client ID**
   - Убедитесь, что `GOOGLE_WEB_CLIENT_ID` соответствует Web Client ID из Google Cloud Console
   - Проверьте, что Android OAuth Client ID создан с правильным package name

4. **Проблемы с Google Play Services**
   - Обновите Google Play Services на устройстве
   - Проверьте подключение к интернету

**Решение:**

1. Получите все необходимые SHA-1 отпечатки (см. раздел 6.1 и 6.2)
2. Добавьте их в Google Cloud Console (см. раздел 6.3)
3. Подождите несколько минут для распространения изменений
4. Пересоберите и переустановите приложение
5. Очистите кэш Google Play Services на устройстве (Настройки → Приложения → Google Play Services → Очистить кэш)

### Другие коды ошибок Google Sign-In

- **[10] DEVELOPER_ERROR:** Неправильная конфигурация OAuth Client ID или SHA-1 отпечатков
- **[7] NETWORK_ERROR:** Проблемы с сетью или Google Play Services
- **[4] SIGN_IN_REQUIRED:** Требуется повторный вход пользователя

## 9. Полезные команды
- `npm run lint` — проверка линтером.
- `npm run build` или `quasar build -m capacitor -T ios` — полноценная сборка.
- `quasar dev -m capacitor -T ios` — запуск dev-режима с hot reload в симуляторе.
- `npx cap sync` — подтягивает все изменения Capacitor/плагинов в нативные проекты.

Храните этот файл в репозитории (`docs/GOOGLE_AUTH_SETUP.md`) и обновляйте при появлении новых провайдеров авторизации (Apple, Facebook и т.д.), следуя той же структуре.
