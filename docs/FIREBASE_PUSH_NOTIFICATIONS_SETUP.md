# Push Notifications Setup

Guide for setting up Firebase Cloud Messaging (FCM) for push notifications.

---

## Project Info

- **Firebase Project ID:** `comguestspotapp`
- **Package/Bundle ID:** `com.guestspot.app`

---

## Step 1: Register Apps in Firebase

### 1.1 Open Firebase Console

Go to [Firebase Console](https://console.firebase.google.com) → Select project `comguestspotapp`

### 1.2 Add Android App

1. Click **⚙️ Project settings** → **Your apps** → **Add app** → **Android**
2. Package name: `com.guestspot.app`
3. Download `google-services.json`
4. Place at `src-capacitor/android/app/google-services.json`

### 1.3 Add iOS App

1. Click **Add app** → **iOS**
2. Bundle ID: `com.guestspot.app`
3. Download `GoogleService-Info.plist`
4. Place at `src-capacitor/ios/App/App/GoogleService-Info.plist`

---

## Step 2: Enable Cloud Messaging

1. **⚙️ Project settings** → **Cloud Messaging**
2. Ensure Cloud Messaging API is enabled

---

## Step 3: Setup iOS APNs

Apple Push Notifications require additional setup for iOS.

### 3.1 Create APNs Key

1. Go to [Apple Developer Portal](https://developer.apple.com/account/resources/authkeys/list)
2. Click **+** to create new key
3. Select **Apple Push Notifications service (APNs)**
4. Download `.p8` file
5. Note the **Key ID**

### 3.2 Upload to Firebase

1. **⚙️ Project settings** → **Cloud Messaging** → **Apple app configuration**
2. Upload `.p8` file
3. Enter **Key ID**
4. Enter **Team ID** (from Apple Developer account)

---

## Step 4: Add Android Permission

In `src-capacitor/android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

---

## Step 5: Sync and Test

```bash
npx cap sync
```

### Send Test Notification

1. Firebase Console → **Cloud Messaging** → **Send your first message**
2. Enter title and text
3. Click **Send test message**
4. Enter device FCM token
5. Click **Test**

### Get FCM Token

Check console logs after app starts. Look for:
```
Push notification token registered: [token]
```

---

## Backend Integration

### Option A: Legacy Server Key

```javascript
const response = await fetch('https://fcm.googleapis.com/fcm/send', {
  method: 'POST',
  headers: {
    'Authorization': `key=YOUR_SERVER_KEY`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: 'DEVICE_FCM_TOKEN',
    notification: {
      title: 'Hello',
      body: 'World'
    }
  })
});
```

### Option B: Firebase Admin SDK (Recommended)

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

admin.messaging().send({
  notification: { title: 'Hello', body: 'World' },
  token: 'DEVICE_FCM_TOKEN'
});
```

Get service account key: **⚙️ Project settings** → **Service accounts** → **Generate new private key**

---

## Troubleshooting

### Notifications not received on Android

1. Check notification permission is granted (Android 13+)
2. Verify `google-services.json` is in place
3. Check logs: `adb logcat | grep -i firebase`

### Notifications not received on iOS

1. Verify APNs key is uploaded to Firebase
2. Check Bundle ID matches
3. Ensure notification permission is granted

### Token not registered

1. Verify Firebase is initialized
2. Check config files are in correct locations
3. Run `npx cap sync`

---

## Checklist

- [ ] Android app registered in Firebase
- [ ] iOS app registered in Firebase  
- [ ] `google-services.json` in `android/app/`
- [ ] `GoogleService-Info.plist` in `ios/App/App/`
- [ ] APNs key uploaded for iOS
- [ ] `POST_NOTIFICATIONS` permission added
- [ ] Test notification sent successfully
