# Android Build Guide

Guide for building and signing Android APK/AAB files for GuestSpot.

---

## Prerequisites

Before you start, make sure you have:

- [ ] Node.js and npm installed
- [ ] Android SDK (build tools 34.0.0+)
- [ ] JDK (Java Development Kit)
- [ ] Keystore file for signing

---

## Step 1: Setup Environment

### 1.1 Create `.env` file

Create a `.env` file in the project root:

```env
API_URL=https://your-api-url.com
```

### 1.2 Create Keystore (first time only)

If you don't have a keystore, generate one:

```bash
keytool -genkey -v \
  -keystore src-capacitor/android/guest-spot-key.jks \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias guest-spot-alias
```

> **Important:** Save your keystore password! You'll need it for all future builds.

### 1.3 Create `local.properties`

Create `src-capacitor/android/local.properties`:

```properties
RELEASE_STORE_PASSWORD=your_keystore_password
RELEASE_KEY_PASSWORD=your_key_password
```

> **Security:** Never commit `local.properties` or keystore files to git.

---

## Step 2: Build

### Option A: NPM Script (Recommended)

```bash
npm run capacitor:build:aab
```

This creates both AAB (for Play Store) and APK (for testing).

### Option B: Automated Script

```bash
./scripts/build-aab.sh
```

### Option C: Manual Build

```bash
# Build web app
npm run capacitor:build:android

# Build AAB
cd src-capacitor/android
./gradlew bundleRelease

# Build APK
./gradlew assembleRelease
```

---

## Step 3: Find Built Files

After successful build, files are located at:

| File | Location | Purpose |
|------|----------|---------|
| AAB | `temp/app-release-signed.aab` | Upload to Google Play Store |
| APK | `temp/app-release-signed.apk` | Install on devices for testing |
| Mapping | `temp/mapping.txt` | Upload to Play Console for crash reports |

---

## Step 4: Upload to Google Play Store

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app → **Release** → **Production**
3. Upload `app-release-signed.aab`
4. In **App bundle explorer**, upload `mapping.txt`
5. Complete the release

---

## File Structure

```
project/
├── .env                           # API config (don't commit)
├── scripts/
│   └── build-aab.sh              # Build script
├── temp/                          # Build output
│   ├── app-release-signed.aab
│   ├── app-release-signed.apk
│   └── mapping.txt
└── src-capacitor/android/
    ├── guest-spot-key.jks        # Keystore (don't commit)
    ├── local.properties          # Passwords (don't commit)
    └── gradle.properties         # Key alias config
```

---

## Troubleshooting

### "Keystore file not found"

Check that keystore exists at `src-capacitor/android/guest-spot-key.jks`

### "Keystore password was incorrect"

Verify password in `src-capacitor/android/local.properties`

### ".env file not found"

Create `.env` file in project root with `API_URL=https://...`

### "Build failed with an exception"

```bash
# Clean and rebuild
cd src-capacitor/android
./gradlew clean
cd ../..
npm run capacitor:build:android
```

---

## Security Checklist

- [ ] Keystore stored securely and backed up
- [ ] Passwords saved in password manager
- [ ] `local.properties` in `.gitignore`
- [ ] `*.jks` files in `.gitignore`
- [ ] `.env` files in `.gitignore`
