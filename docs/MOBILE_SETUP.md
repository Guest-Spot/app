# Mobile Development Setup

Complete guide for setting up iOS and Android development with Capacitor.

---

## Prerequisites

### For Android Development

- [ ] macOS / Windows / Linux
- [ ] Node.js 18+
- [ ] JDK 11 or 17
- [ ] Android Studio
- [ ] Android SDK (API 30+)

### For iOS Development (macOS only)

- [ ] macOS 10.15+
- [ ] Xcode 14+
- [ ] Command Line Tools

---

## Step 1: Install Global Tools

```bash
npm install -g @quasar/cli @capacitor/cli
```

---

## Step 2: Setup Android

### 2.1 Install Android Studio

Download from [developer.android.com/studio](https://developer.android.com/studio)

### 2.2 Install SDK Components

Open Android Studio → **Preferences** → **Android SDK**:

- [ ] Android SDK Platform 34
- [ ] Android SDK Build-Tools 34.0.0
- [ ] Android SDK Platform-Tools

### 2.3 Set Environment Variables

Add to your `~/.zshrc` or `~/.bash_profile`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home
```

Then reload:

```bash
source ~/.zshrc
```

### 2.4 Add Android Platform

```bash
cd src-capacitor
npx cap add android
```

---

## Step 3: Setup iOS (macOS only)

### 3.1 Install Xcode

Download from App Store

### 3.2 Install Command Line Tools

```bash
xcode-select --install
```

### 3.3 Add iOS Platform

```bash
cd src-capacitor
npx cap add ios
```

---

## Step 4: Verify Installation

```bash
# Check versions
quasar info
npx cap --version

# Check platforms
cd src-capacitor
npx cap ls
```

---

## Development Commands

| Action | Command |
|--------|---------|
| Dev mode | `npm run capacitor:dev` |
| Run on Android | `npm run capacitor:run:android` |
| Run on iOS | `npm run capacitor:run:ios` |
| Build | `npm run capacitor:build` |
| Sync | `npx cap sync` |
| Open Android Studio | `npx cap open android` |
| Open Xcode | `npx cap open ios` |

---

## Project Configuration

### capacitor.config.json

Located at `src-capacitor/capacitor.config.json`:

```json
{
  "appId": "com.guestspot.app",
  "appName": "GuestSpot",
  "webDir": "www",
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 3000,
      "backgroundColor": "#ffffff"
    },
    "StatusBar": {
      "style": "dark"
    }
  }
}
```

### quasar.config.ts

Mobile config is minimal in Quasar v2:

```typescript
capacitor: {
  hideSplashscreen: true,
}
```

> **Note:** Detailed settings are in `src-capacitor/capacitor.config.json`

---

## Adding Plugins

```bash
# Install plugin
npm install @capacitor/camera

# Sync with native projects
npx cap sync
```

### Common Plugins

```bash
npm install @capacitor/app
npm install @capacitor/camera
npm install @capacitor/device
npm install @capacitor/filesystem
npm install @capacitor/geolocation
npm install @capacitor/haptics
npm install @capacitor/keyboard
npm install @capacitor/push-notifications
npm install @capacitor/splash-screen
npm install @capacitor/status-bar
```

---

## Troubleshooting

### "Platform not found"

```bash
cd src-capacitor
npx cap add android  # or ios
```

### "Plugin not found"

```bash
npm install @capacitor/[plugin-name]
npx cap sync
```

### Android: SDK not found

```bash
echo $ANDROID_HOME
# Should show: /Users/[you]/Library/Android/sdk
# If empty, set environment variable
```

### Android: Build failed with JDK error

```bash
java -version
# Should show Java 11 or 17
brew install openjdk@17
```

### iOS: Signing issues

1. Open project in Xcode: `npx cap open ios`
2. Set development team in project settings
3. Check provisioning profiles

### General: Sync issues

```bash
# Full rebuild
npx cap sync
npx cap copy
```

---

## Debug Commands

```bash
# Check health
npx cap doctor

# List platforms
npx cap ls

# Sync project
npx cap sync

# Copy web assets only
npx cap copy
```

---

## Next Steps

- [Android Build Guide](./ANDROID_BUILD.md) - Build APK/AAB for release
- [Google Auth Setup](./GOOGLE_AUTH_SETUP.md) - Configure Google Sign-In
- [Push Notifications](./FIREBASE_PUSH_NOTIFICATIONS_SETUP.md) - Setup Firebase FCM
