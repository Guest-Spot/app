# GuestSpot

Quasar mobile app for iOS and Android.

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Start development server

```bash
# Web
npm run dev

# Mobile
npm run capacitor:dev
```

### 3. Run on device

```bash
# Android
npm run capacitor:run:android

# iOS
npm run capacitor:run:ios
```

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start web development server |
| `npm run build` | Build for production |
| `npm run capacitor:dev` | Mobile development mode |
| `npm run capacitor:run:android` | Run on Android |
| `npm run capacitor:run:ios` | Run on iOS |
| `npm run capacitor:build:aab` | Build Android AAB/APK for release |
| `npm run capacitor:sync` | Sync web code with native projects |
| `npm run capacitor:open:android` | Open Android Studio |
| `npm run capacitor:open:ios` | Open Xcode |

---

## Requirements

### Android
- Node.js 18+
- Android Studio
- Android SDK 30+
- JDK 11 or 17

### iOS (macOS only)
- Xcode 14+
- Command Line Tools

---

## Documentation

### Getting Started

| Guide | Description |
|-------|-------------|
| [Quick Start](./docs/QUICK_START.md) | Get running in 5 minutes |
| [Mobile Setup](./docs/MOBILE_SETUP.md) | Full mobile development setup |

### Building & Release

| Guide | Description |
|-------|-------------|
| [Android Build](./docs/ANDROID_BUILD.md) | Build and sign APK/AAB for release |

### Integrations

| Guide | Description |
|-------|-------------|
| [Google Auth](./docs/GOOGLE_AUTH_SETUP.md) | Google Sign-In setup |
| [Push Notifications](./docs/FIREBASE_PUSH_NOTIFICATIONS_SETUP.md) | Firebase FCM setup |
| [Sentry](./docs/SENTRY_SETUP.md) | Error monitoring setup |

### Features

| Guide | Description |
|-------|-------------|
| [Payment Flow](./docs/PAYMENT_FLOW.md) | Stripe payment integration |

---

## Project Structure

```
├── src/                    # Vue/Quasar source code
├── src-capacitor/          # Capacitor native projects
│   ├── android/           # Android project
│   ├── ios/               # iOS project
│   └── capacitor.config.json
├── docs/                   # Documentation
├── scripts/                # Build scripts
└── quasar.config.ts        # Quasar configuration
```

---

## Generate Icons

```bash
npx @quasar/icongenie generate -m capacitor \
  -i ./public/logo-primary.png \
  --png-color 000 \
  --splashscreen-color 000 \
  --splashscreen-icon-ratio 35 \
  --padding 20,20 \
  --skip-trim
```

---

## Resources

- [Quasar Framework](https://quasar.dev)
- [Capacitor](https://capacitorjs.com/docs)
- [Android Developer](https://developer.android.com)
- [Apple Developer](https://developer.apple.com)
