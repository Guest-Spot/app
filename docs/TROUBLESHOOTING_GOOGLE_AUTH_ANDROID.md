# Исправление ошибки [16] Account reauth failed на Android

## Пошаговая проверка и исправление

### Шаг 1: Получение SHA-1 отпечатка для тестовой сборки

Для тестового режима (debug) нужно получить SHA-1 из debug keystore:

```bash
cd src-capacitor/android
./gradlew signingReport
```

Или напрямую через keytool:

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**Что искать:** В выводе найдите строку `SHA1:` и скопируйте значение (формат: `XX:XX:XX:...`)

---

### Шаг 2: Проверка GOOGLE_WEB_CLIENT_ID

Убедитесь, что переменная окружения установлена правильно:

1. Проверьте файл `.env` или `.env.local` в корне проекта:
   ```
   GOOGLE_WEB_CLIENT_ID=ваш-web-client-id.apps.googleusercontent.com
   ```

2. Убедитесь, что это именно **Web Client ID**, а не Android Client ID

3. Проверьте, что значение соответствует тому, что в Google Cloud Console:
   - Откройте [Google Cloud Console](https://console.cloud.google.com)
   - APIs & Services → Credentials
   - Найдите OAuth 2.0 Client ID типа **Web application**
   - Сравните `client_id` с вашим `GOOGLE_WEB_CLIENT_ID`

---

### Шаг 3: Проверка Android OAuth Client ID в Google Cloud Console

1. Откройте [Google Cloud Console](https://console.cloud.google.com)
2. Выберите ваш проект
3. Перейдите в **APIs & Services → Credentials**
4. Найдите или создайте **OAuth 2.0 Client ID** типа **Android**
5. Проверьте:
   - **Package name** должен быть: `com.guestspot.app`
   - **SHA-1 certificate fingerprint** должен содержать SHA-1 из Шага 1

**Важно:** Если SHA-1 нет в списке, добавьте его:
- Нажмите "Edit" на Android OAuth Client
- В поле "SHA-1 certificate fingerprint" добавьте SHA-1 из Шага 1
- Сохраните изменения

---

### Шаг 4: Проверка google-services.json

1. Убедитесь, что файл существует:
   - `src-capacitor/android/app/google-services.json`
   - `src-capacitor/android/google-services.json` (если есть)

2. Проверьте структуру файла:
   ```json
   {
     "client": [
       {
         "client_info": {
           "android_client_info": {
             "package_name": "com.guestspot.app"
           }
         },
         "oauth_client": [
           {
             "client_id": "ваш-web-client-id.apps.googleusercontent.com",
             "client_type": 3
           }
         ]
       }
     ]
   }
   ```

3. **Если `oauth_client` пустой:**
   - Перегенерируйте `google-services.json` в Firebase Console
   - Или добавьте Web application в Firebase Project Settings
   - Скачайте обновленный файл и замените существующий

---

### Шаг 5: Проверка инициализации плагина

Убедитесь, что `initializeGoogleAuth()` вызывается до попытки входа:

1. Проверьте, что функция вызывается при запуске приложения (например, в `main.ts` или `App.vue`)
2. Проверьте консоль на наличие ошибок инициализации
3. Убедитесь, что `GOOGLE_WEB_CLIENT_ID` не пустой в момент инициализации

---

### Шаг 6: Проверка package name

Убедитесь, что package name везде одинаковый:

1. `src-capacitor/capacitor.config.json` → `appId: "com.guestspot.app"`
2. `src-capacitor/android/app/build.gradle` → `applicationId "com.guestspot.app"`
3. Google Cloud Console → Android OAuth Client → Package name
4. `google-services.json` → `package_name: "com.guestspot.app"`

---

### Шаг 7: Очистка и пересборка

После внесения изменений:

```bash
# Очистка проекта
cd src-capacitor/android
./gradlew clean

# Синхронизация Capacitor
cd ../..
npx cap sync android

# Пересборка приложения
cd src-capacitor/android
./gradlew assembleDebug
```

Или через Android Studio:
- Build → Clean Project
- Build → Rebuild Project

---

### Шаг 8: Очистка кэша на устройстве

1. На устройстве: **Настройки → Приложения → Google Play Services**
2. Нажмите **Очистить кэш**
3. Перезапустите приложение

---

### Шаг 9: Проверка тестового пользователя

Если приложение в тестовом режиме (не опубликовано):

1. В Google Cloud Console: **APIs & Services → OAuth consent screen**
2. Убедитесь, что ваш Google аккаунт добавлен в **Test users**
3. Если нет — добавьте email вашего тестового аккаунта

---

### Шаг 10: Проверка времени ожидания

После изменений в Google Cloud Console подождите **5-10 минут** для распространения изменений.

---

## Быстрая диагностика

Если ошибка все еще возникает, проверьте логи:

```bash
# В Android Studio или через adb
adb logcat | grep -i "google\|oauth\|signin"
```

Ищите:
- Ошибки инициализации Google Sign-In
- Несоответствие package name
- Проблемы с SHA-1

---

## Частые ошибки

1. **Используется Android Client ID вместо Web Client ID**
   - ❌ Неправильно: `GOOGLE_ANDROID_CLIENT_ID` в `webClientId`
   - ✅ Правильно: `GOOGLE_WEB_CLIENT_ID` в `webClientId`

2. **SHA-1 не добавлен в Google Cloud Console**
   - Обязательно добавьте SHA-1 из debug keystore для тестирования

3. **Неправильный package name**
   - Все места должны использовать `com.guestspot.app`

4. **Пустой oauth_client в google-services.json**
   - Перегенерируйте файл в Firebase Console

---

## Проверочный список

- [ ] SHA-1 получен и скопирован
- [ ] SHA-1 добавлен в Android OAuth Client в Google Cloud Console
- [ ] GOOGLE_WEB_CLIENT_ID установлен в .env
- [ ] GOOGLE_WEB_CLIENT_ID соответствует Web Client ID из Google Cloud Console
- [ ] Package name везде одинаковый: `com.guestspot.app`
- [ ] google-services.json содержит oauth_client с client_type: 3
- [ ] initializeGoogleAuth() вызывается при запуске
- [ ] Тестовый пользователь добавлен в OAuth consent screen (если приложение не опубликовано)
- [ ] Проект очищен и пересобран
- [ ] Кэш Google Play Services очищен
- [ ] Прошло 5-10 минут после изменений в Google Cloud Console
