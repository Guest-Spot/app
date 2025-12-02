# Quick Start

Get the mobile app running in 5 minutes.

---

## 1. Install Tools

```bash
npm install -g @quasar/cli @capacitor/cli
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Add Mobile Platform

```bash
cd src-capacitor

# Android
npx cap add android

# iOS (macOS only)
npx cap add ios
```

---

## 4. Run App

```bash
# Android
npm run capacitor:run:android

# iOS
npm run capacitor:run:ios
```

---

## Commands Reference

| What | Command |
|------|---------|
| Development | `npm run capacitor:dev` |
| Run Android | `npm run capacitor:run:android` |
| Run iOS | `npm run capacitor:run:ios` |
| Build | `npm run capacitor:build` |
| Sync | `npx cap sync` |

---

## Requirements

### Android
- Android Studio
- Android SDK 30+
- JDK 11 or 17

### iOS (macOS only)
- Xcode 14+
- Command Line Tools: `xcode-select --install`

---

## Common Issues

| Problem | Solution |
|---------|----------|
| Mode not found | `npx cap add android` or `npx cap add ios` |
| Build failed | `npx cap sync` then retry |
| Plugin error | `npm install @capacitor/[plugin]` + `npx cap sync` |

---

## Next Steps

- **Full Setup** → [MOBILE_SETUP.md](./MOBILE_SETUP.md)
- **Build for Release** → [ANDROID_BUILD.md](./ANDROID_BUILD.md)
- **Google Sign-In** → [GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md)
- **Push Notifications** → [FIREBASE_PUSH_NOTIFICATIONS_SETUP.md](./FIREBASE_PUSH_NOTIFICATIONS_SETUP.md)
- **Error Tracking** → [SENTRY_SETUP.md](./SENTRY_SETUP.md)
