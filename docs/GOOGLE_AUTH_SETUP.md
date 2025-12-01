# Google Auth Setup

Guide for setting up Google Sign-In on iOS and Android with Capacitor.

---

## Prerequisites

- [ ] Google Cloud Console account
- [ ] Firebase project (optional, for analytics)
- [ ] Mobile platforms added (`npx cap add ios/android`)

---

## Step 1: Setup Environment Variables

Create or update `.env` file:

```env
GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
```

> **Important:** `GOOGLE_WEB_CLIENT_ID` is required for both Android and iOS!

---

## Step 2: Google Cloud Console Setup

### 2.1 Create OAuth Consent Screen

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. **APIs & Services** → **OAuth consent screen**
3. Choose **External** type
4. Fill app information
5. Add test users (while app is not published)

### 2.2 Create OAuth Credentials

Go to **Credentials** → **Create credentials** → **OAuth client ID**

#### Web Application (Required!)

1. Type: **Web application**
2. Name: `GuestSpot Web`
3. Save and copy **Client ID** → use as `GOOGLE_WEB_CLIENT_ID`

> This ID is used by the plugin for token exchange on both platforms.

#### iOS Application

1. Type: **iOS**
2. Bundle ID: `com.guestspot.app`
3. Download the plist file (named `client_xxx.apps.googleusercontent.com.plist`)

#### Android Application

1. Type: **Android**
2. Package name: `com.guestspot.app`
3. Add SHA-1 fingerprints (see Step 3)

---

## Step 3: Get SHA-1 Fingerprints (Android)

### For Debug builds

```bash
cd src-capacitor/android
./gradlew signingReport
```

Or:

```bash
keytool -list -v \
  -keystore ~/.android/debug.keystore \
  -alias androiddebugkey \
  -storepass android
```

### For Release builds

```bash
keytool -list -v \
  -keystore src-capacitor/android/guest-spot-key.jks \
  -alias guest-spot-alias
```

### For Play Store (if Play App Signing enabled)

1. Go to [Google Play Console](https://play.google.com/console)
2. Your app → **Setup** → **App Integrity**
3. Copy SHA-1 from **App signing key certificate**

> **Important:** Add ALL SHA-1s to Google Cloud Console!

### Add SHA-1 to Google Cloud Console

1. **APIs & Services** → **Credentials**
2. Edit **Android** OAuth client
3. Add each SHA-1 fingerprint
4. Save

---

## Step 4: iOS Configuration

### 4.1 Add Config File

1. Rename downloaded plist to `GoogleService-Info.plist`
2. Place at `src-capacitor/ios/App/App/GoogleService-Info.plist`

### 4.2 Configure Xcode

```bash
npx cap open ios
```

In Xcode:

1. Drag `GoogleService-Info.plist` to **App → App** group
2. Check **Copy items if needed**
3. Check target **App**

### 4.3 Add URL Scheme

In **Info** → **URL Types**, add:

- URL Schemes: `REVERSED_CLIENT_ID` value from plist

---

## Step 5: Android Configuration

### 5.1 Add Config File

Place `google-services.json` at:
- `src-capacitor/android/app/google-services.json`

### 5.2 Verify Package Name

Check that package name matches everywhere:

```bash
# capacitor.config.json
"appId": "com.guestspot.app"

# android/app/build.gradle
applicationId "com.guestspot.app"

# google-services.json
"package_name": "com.guestspot.app"
```

---

## Step 6: Update Capacitor Config

In `src-capacitor/capacitor.config.json`:

```json
{
  "plugins": {
    "GoogleAuth": {
      "scopes": ["profile", "email"],
      "serverClientId": "your-web-client-id.apps.googleusercontent.com",
      "forceCodeForRefreshToken": true
    }
  }
}
```

---

## Step 7: Sync and Test

```bash
npx cap sync
npx cap run android  # or ios
```

---

## Troubleshooting

### Error [16] Account reauth failed

**Cause:** SHA-1 fingerprint not added or wrong Client ID.

**Fix:**
1. Get SHA-1: `./gradlew signingReport`
2. Add to Google Cloud Console → Android OAuth Client
3. Wait 5-10 minutes
4. Clear cache on device: Settings → Apps → Google Play Services → Clear cache

### Error [10] DEVELOPER_ERROR

**Cause:** Wrong OAuth Client ID or SHA-1.

**Fix:**
1. Verify `GOOGLE_WEB_CLIENT_ID` is Web Client ID (not Android)
2. Check all SHA-1s are added (debug, release, Play Store)
3. Verify package name matches everywhere

### Error [7] NETWORK_ERROR

**Cause:** Network or Google Play Services issue.

**Fix:**
1. Check internet connection
2. Update Google Play Services on device

### Token not received

**Cause:** Missing or wrong Web Client ID.

**Fix:**
1. Ensure `GOOGLE_WEB_CLIENT_ID` is set
2. Verify it's the Web Application client ID
3. Check `google-services.json` has `oauth_client` with `client_type: 3`

### iOS: Sign-in doesn't open

**Fix:**
1. Check `GoogleService-Info.plist` is in Xcode project
2. Verify URL scheme is added (REVERSED_CLIENT_ID)
3. Run `npx cap sync ios`

---

## Quick Checklist

- [ ] Web Client ID created and saved to `.env`
- [ ] iOS Client ID created, plist file placed
- [ ] Android Client ID created with all SHA-1s
- [ ] `google-services.json` in android/app/
- [ ] `GoogleService-Info.plist` in ios/App/App/
- [ ] Package name matches everywhere: `com.guestspot.app`
- [ ] Capacitor config updated
- [ ] Test user added to OAuth consent screen
- [ ] `npx cap sync` executed

---

## Debug

### Check initialization

Add to your code:

```typescript
console.log('Web Client ID:', process.env.GOOGLE_WEB_CLIENT_ID);
```

### Check Android logs

```bash
adb logcat | grep -i "google\|oauth\|signin"
```

### Check iOS logs

Open Xcode → Debug area → Console
