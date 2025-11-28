# 🔔 Настройка Push-уведомлений в Firebase Console

Пошаговая инструкция по настройке Firebase Cloud Messaging (FCM) для Android и iOS.

## 📋 Текущая конфигурация проекта

- **Firebase Project ID**: `comguestspotapp`
- **Project Number**: `693188820206`
- **Android Package**: `com.guestspot.app`
- **iOS Bundle ID**: `com.guestspot.app`

## 🔧 Шаг 1: Проверка регистрации приложений

### 1.1 Откройте Firebase Console
1. Перейдите на https://console.firebase.google.com/
2. Выберите проект **comguestspotapp**

### 1.2 Проверьте Android приложение
1. Перейдите в **⚙️ Project settings** (шестеренка вверху)
2. Прокрутите до раздела **Your apps**
3. Убедитесь, что Android приложение зарегистрировано:
   - **Package name**: `com.guestspot.app`
   - **App ID**: `1:693188820206:android:a73ac7c9b39f05ec8c47ff`
4. Если приложения нет — добавьте его:
   - Нажмите **Add app** → **Android**
   - Введите Package name: `com.guestspot.app`
   - Скачайте `google-services.json` и замените файл в `src-capacitor/android/app/`

### 1.3 Проверьте iOS приложение
1. В том же разделе **Your apps** проверьте iOS приложение:
   - **Bundle ID**: `com.guestspot.app`
   - **App ID**: `1:693188820206:ios:23dc5d1d3d9b81d88c47ff`
2. Если приложения нет — добавьте его:
   - Нажмите **Add app** → **iOS**
   - Введите Bundle ID: `com.guestspot.app`
   - Скачайте `GoogleService-Info.plist` и замените файл в `src-capacitor/ios/App/App/`

## 🔔 Шаг 2: Настройка Cloud Messaging

### 2.1 Включите Cloud Messaging API
1. Перейдите в **⚙️ Project settings** → **Cloud Messaging**
2. Убедитесь, что Cloud Messaging включен
3. Если не включен — нажмите **Enable**

### 2.2 Получите Server Key (для отправки с бэкенда)
1. В разделе **Cloud Messaging** найдите:
   - **Cloud Messaging API (Legacy)** — Server key
   - Или создайте **Service Account** (рекомендуется)

#### Вариант A: Server Key (Legacy)
1. Найдите **Server key** в разделе Cloud Messaging
2. Скопируйте ключ (начинается с `AAAA...`)
3. Сохраните его на бэкенде для отправки уведомлений

#### Вариант B: Service Account (рекомендуется)
1. Перейдите в **⚙️ Project settings** → **Service accounts**
2. Нажмите **Generate new private key**
3. Скачайте JSON-файл с ключами
4. Используйте этот файл на бэкенде (например, с `firebase-admin` SDK)

## 📱 Шаг 3: Настройка iOS (APNs)

### 3.1 Загрузите APNs сертификат/ключ
Для iOS нужен APNs (Apple Push Notification service) сертификат:

1. **В Firebase Console**:
   - Перейдите в **⚙️ Project settings** → **Cloud Messaging** → **Apple app configuration**
   - Найдите раздел **APNs Authentication Key** или **APNs Certificates**

2. **Создайте APNs Key в Apple Developer**:
   - Перейдите на https://developer.apple.com/account/resources/authkeys/list
   - Нажмите **+** для создания нового ключа
   - Выберите **Apple Push Notifications service (APNs)**
   - Скачайте `.p8` файл (сохраните Key ID)
   - Загрузите ключ в Firebase Console:
     - **APNs Authentication Key**: загрузите `.p8` файл
     - **Key ID**: введите ID ключа
     - **Team ID**: введите ваш Apple Team ID

### 3.2 Альтернатива: APNs Certificate
Если используете сертификат вместо ключа:
1. Создайте сертификат в Apple Developer Portal
2. Экспортируйте как `.p12` файл
3. Загрузите в Firebase Console

## ✅ Шаг 4: Проверка конфигурации

### 4.1 Проверьте файлы конфигурации

**Android** (`src-capacitor/android/app/google-services.json`):
```json
{
  "project_info": {
    "project_id": "comguestspotapp",
    "project_number": "693188820206"
  },
  "client": [{
    "client_info": {
      "android_client_info": {
        "package_name": "com.guestspot.app"
      }
    }
  }]
}
```

**iOS** (`src-capacitor/ios/App/App/GoogleService-Info.plist`):
- `PROJECT_ID`: `comguestspotapp`
- `BUNDLE_ID`: `com.guestspot.app`
- `GCM_SENDER_ID`: `693188820206`

### 4.2 Проверьте разрешения в AndroidManifest.xml
Убедитесь, что есть разрешение:
```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

## 🧪 Шаг 5: Тестирование

### 5.1 Тестовая отправка через Firebase Console
1. Перейдите в **Cloud Messaging** → **Send your first message**
2. Введите:
   - **Notification title**: "Test Notification"
   - **Notification text**: "This is a test"
3. Нажмите **Send test message**
4. Введите **FCM registration token** вашего устройства
5. Нажмите **Test**

### 5.2 Как получить FCM token
1. Запустите приложение на устройстве
2. Проверьте логи в консоли разработчика:
   - Должно быть сообщение: `Push notification token registered`
   - Токен будет отправлен на бэкенд через `/api/device-tokens`
3. Или добавьте временный лог в `usePushNotifications.ts`:
   ```typescript
   PushNotifications.addListener('registration', (token: Token) => {
     console.log('FCM Token:', token.value);
   });
   ```

### 5.3 Проверка работы на устройстве
1. **Android**:
   - Убедитесь, что разрешение на уведомления предоставлено
   - Проверьте, что канал `guestspot-default` создан
   - Отправьте тестовое уведомление

2. **iOS**:
   - Убедитесь, что разрешение на уведомления предоставлено
   - Проверьте, что APNs настроен
   - Отправьте тестовое уведомление

## 🔐 Шаг 6: Настройка бэкенда

### 6.1 Использование Server Key
```javascript
// Пример отправки через HTTP API
const response = await fetch('https://fcm.googleapis.com/fcm/send', {
  method: 'POST',
  headers: {
    'Authorization': `key=YOUR_SERVER_KEY`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: 'DEVICE_FCM_TOKEN',
    notification: {
      title: 'Notification Title',
      body: 'Notification Body'
    }
  })
});
```

### 6.2 Использование Service Account (рекомендуется)
```javascript
// Node.js с firebase-admin
const admin = require('firebase-admin');
const serviceAccount = require('./path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const message = {
  notification: {
    title: 'Notification Title',
    body: 'Notification Body'
  },
  token: 'DEVICE_FCM_TOKEN'
};

admin.messaging().send(message);
```

## 📝 Чеклист настройки

- [ ] Android приложение зарегистрировано в Firebase
- [ ] iOS приложение зарегистрировано в Firebase
- [ ] Cloud Messaging API включен
- [ ] Server Key или Service Account получен
- [ ] APNs ключ/сертификат загружен для iOS
- [ ] `google-services.json` обновлен для Android
- [ ] `GoogleService-Info.plist` обновлен для iOS
- [ ] Разрешение `POST_NOTIFICATIONS` добавлено в AndroidManifest.xml
- [ ] Тестовое уведомление отправлено успешно

## 🚨 Частые проблемы

### Проблема: Уведомления не приходят на Android
**Решение**:
1. Проверьте, что разрешение предоставлено (Android 13+)
2. Убедитесь, что канал уведомлений создан
3. Проверьте логи: `adb logcat | grep -i firebase`

### Проблема: Уведомления не приходят на iOS
**Решение**:
1. Проверьте, что APNs настроен в Firebase Console
2. Убедитесь, что используется правильный Bundle ID
3. Проверьте, что разрешение на уведомления предоставлено
4. Для production нужен production APNs сертификат/ключ

### Проблема: Token не регистрируется
**Решение**:
1. Проверьте, что Firebase инициализирован в `MainActivity` (Android)
2. Проверьте, что Firebase настроен в `AppDelegate` (iOS)
3. Убедитесь, что `google-services.json` / `GoogleService-Info.plist` актуальны

## 📚 Дополнительные ресурсы

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Capacitor Push Notifications Plugin](https://capacitorjs.com/docs/apis/push-notifications)
- [Android Notification Channels](https://developer.android.com/develop/ui/views/notifications/channels)
