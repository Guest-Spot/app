# 🚀 Quick Start - Mobile Development

## ⚡ Fast Setup (5 minutes)

### 1. Install Global Tools
```bash
npm install -g @quasar/cli cordova @capacitor/cli
```

### 2. Add Mobile Mode
```bash
# Choose one approach:

# Option A: Cordova (easier for beginners)
yarn mobile:add

# Option B: Capacitor (modern approach)
yarn capacitor:add
```

### 3. Add Platforms
```bash
# For Cordova:
cd src-cordova
cordova platform add android
cordova platform add ios
cd ..

# For Capacitor:
npx cap add android
npx cap add ios
```

### 4. Start Development
```bash
# Cordova:
yarn mobile:dev

# Capacitor:
yarn capacitor:dev
```

## 📱 Essential Commands

| Action | Cordova | Capacitor |
|--------|---------|-----------|
| **Dev Mode** | `yarn mobile:dev` | `yarn capacitor:dev` |
| **Run Android** | `yarn mobile:run:android` | `yarn capacitor:run:android` |
| **Run iOS** | `yarn mobile:run:ios` | `yarn capacitor:run:ios` |
| **Build** | `yarn mobile:build` | `yarn capacitor:build` |
| **Clean** | `yarn mobile:clean` | `yarn capacitor:clean` |

## 🔧 Requirements Checklist

### Android
- [ ] Android Studio installed
- [ ] Android SDK (API 30+)
- [ ] JDK 11 or 17
- [ ] Environment variables set

### iOS (macOS only)
- [ ] Xcode installed
- [ ] Command Line Tools
- [ ] iOS Simulator

## 🚨 Common Issues

1. **"Mode not found"** → Run `yarn mobile:add` or `yarn capacitor:add`
2. **"Platform not found"** → Add platform in respective directory
3. **"Build failed"** → Check requirements and run `yarn mobile:clean`

## 📚 Full Documentation

- **Setup Guide**: [MOBILE_SETUP.md](./MOBILE_SETUP.md)
- **Cordova Examples**: [CORDOVA_CONFIG_EXAMPLES.md](./CORDOVA_CONFIG_EXAMPLES.md)
- **Capacitor Examples**: [CAPACITOR_CONFIG_EXAMPLES.md](./CAPACITOR_CONFIG_EXAMPLES.md)
- **Main README**: [README.md](./README.md)

## 🎯 Next Steps

1. **Choose approach**: Cordova (easier) or Capacitor (modern)
2. **Follow setup guide** step by step
3. **Test on device/emulator**
4. **Configure app settings**
5. **Build and deploy**

---

**Need help?** Check the troubleshooting section in the main README or setup guides.
