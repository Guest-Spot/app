# GuestSpot (guest-spot)

A Quasar Project with mobile development capabilities for iOS and Android.

## 🚀 Quick Start

### Install the dependencies

```bash
yarn
# or
npm install
```

### Start the app in development mode

```bash
quasar dev
```

## 📱 Mobile Development Setup

This project supports both **Cordova** and **Capacitor** for mobile development. Choose one approach based on your needs:

- **Cordova**: Traditional hybrid app development with web technologies
- **Capacitor**: Modern approach with better native integration

## 🔧 Cordova Setup (Recommended for beginners)

### 1. Install Cordova Dependencies

```bash
# Install Cordova globally
npm install -g cordova

# Add Cordova mode to your Quasar project
yarn mobile:add
# or
npm run mobile:add
```

### 2. Install Platform Dependencies

#### For Android:
```bash
# Install Android Studio and Android SDK
# Set ANDROID_HOME environment variable
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

# Add Android platform
cd src-cordova
cordova platform add android
cd ..
```

#### For iOS (macOS only):
```bash
# Install Xcode from App Store
# Install Xcode Command Line Tools
xcode-select --install

# Add iOS platform
cd src-cordova
cordova platform add ios
cd ..
```

### 3. Development Commands

```bash
# Development with live reload
yarn mobile:dev
npm run mobile:dev

# Run on specific platform
yarn mobile:run:android    # Android device/emulator
yarn mobile:run:ios        # iOS device/simulator

# Build for production
yarn mobile:build:android  # Build Android APK
yarn mobile:build:ios      # Build iOS project
```

## ⚡ Capacitor Setup (Modern approach)

### 1. Install Capacitor Dependencies

```bash
# Install Capacitor globally
npm install -g @capacitor/cli

# Add Capacitor mode to your Quasar project
yarn capacitor:add
# or
npm run capacitor:add
```

### 2. Install Platform Dependencies

```bash
# Add platforms
cd src-capacitor
npx cap add android
npx cap add ios
cd ..
```

### 3. Development Commands

```bash
# Sync web code with native projects
yarn capacitor:sync
npm run capacitor:sync

# Run on specific platform
yarn capacitor:run:android  # Android
yarn capacitor:run:ios      # iOS

# Open native IDE
yarn capacitor:open:android # Opens Android Studio
yarn capacitor:open:ios     # Opens Xcode
```

## 🛠️ Build Commands

### Available Scripts

| Command | Description |
|---------|-------------|
| `yarn mobile:add` | Add Cordova mode to project |
| `yarn mobile:remove` | Remove Cordova mode |
| `yarn mobile:dev` | Start development server with Cordova |
| `yarn mobile:build` | Build for all platforms |
| `yarn mobile:build:android` | Build Android APK |
| `yarn mobile:build:ios` | Build iOS project |
| `yarn mobile:run:android` | Run on Android device/emulator |
| `yarn mobile:run:ios` | Run on iOS device/simulator |
| `yarn mobile:emulate:android` | Run on Android emulator |
| `yarn mobile:emulate:ios` | Run on iOS simulator |
| `yarn mobile:clean` | Clean build artifacts |
| `yarn mobile:prepare` | Prepare Cordova project |

### Capacitor Scripts

| Command | Description |
|---------|-------------|
| `yarn capacitor:add` | Add Capacitor mode to project |
| `yarn capacitor:remove` | Remove Capacitor mode |
| `yarn capacitor:dev` | Start development server with Capacitor |
| `yarn capacitor:build` | Build for all platforms |
| `yarn capacitor:sync` | Sync web code with native projects |
| `yarn capacitor:run:android` | Run on Android |
| `yarn capacitor:run:ios` | Run on iOS |
| `yarn capacitor:open:android` | Open Android Studio |
| `yarn capacitor:open:ios` | Open Xcode |

## 📋 Requirements

### System Requirements

#### For Android Development:
- **Node.js** 18+ and npm/yarn
- **Android Studio** (latest version)
- **Android SDK** (API level 30+)
- **Java Development Kit (JDK)** 11 or 17
- **Gradle** (included with Android Studio)

#### For iOS Development (macOS only):
- **macOS** 10.15+ (Catalina or later)
- **Xcode** 14+ from App Store
- **Xcode Command Line Tools**
- **iOS Simulator** (included with Xcode)

### Environment Variables

#### Android:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home
```

#### iOS:
```bash
export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
```

## 🚀 Building and Publishing

### Android Build Process

1. **Build the project:**
   ```bash
   yarn mobile:build:android
   ```

2. **Generated files:**
   - APK: `src-cordova/platforms/android/app/build/outputs/apk/debug/app-debug.apk`
   - AAB: `src-cordova/platforms/android/app/build/outputs/bundle/debug/app-debug.aab`

3. **Sign the APK for release:**
   ```bash
   cd src-cordova/platforms/android
   ./gradlew assembleRelease
   ```

### iOS Build Process

1. **Build the project:**
   ```bash
   yarn mobile:build:ios
   ```

2. **Open in Xcode:**
   ```bash
   yarn capacitor:open:ios
   # or
   open src-cordova/platforms/ios/GuestSpot.xcworkspace
   ```

3. **Archive and distribute through Xcode**

## 🔍 Troubleshooting

### Common Issues

#### Android:
- **SDK not found**: Check `ANDROID_HOME` environment variable
- **Build failed**: Ensure JDK 11 or 17 is installed
- **Emulator not starting**: Check AVD Manager in Android Studio

#### iOS:
- **Build failed**: Ensure Xcode and Command Line Tools are installed
- **Signing issues**: Check Apple Developer account and provisioning profiles
- **Simulator not working**: Reset simulator in Xcode → Device → Erase All Content

#### General:
- **Mode not found**: Run `yarn mobile:add` or `yarn capacitor:add`
- **Platform not found**: Add platform in respective directory
- **Build errors**: Run `yarn mobile:clean` and rebuild

### Debug Commands

```bash
# Check Quasar CLI version
quasar info

# Check Cordova version
cordova --version

# Check Capacitor version
npx cap --version

# List available platforms
cd src-cordova && cordova platform list
cd src-capacitor && npx cap ls
```

## 📚 Additional Resources

- [Quasar Mobile Development Guide](https://quasar.dev/quasar-cli-vite/developing-mobile-apps/introduction)
- [Cordova Documentation](https://cordova.apache.org/docs/en/latest/)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [iOS Developer Guide](https://developer.apple.com/ios/)

## 🧹 Maintenance

### Clean up commands:
```bash
# Clean build artifacts
yarn mobile:clean

# Remove mobile mode
yarn mobile:remove
# or
yarn capacitor:remove

# Update dependencies
yarn upgrade
```

### Regular maintenance:
- Update Quasar CLI: `npm update -g @quasar/cli`
- Update Cordova: `npm update -g cordova`
- Update Capacitor: `npm update -g @capacitor/cli`
- Check for platform updates in respective directories

---

## 📝 Development Workflow

1. **Setup**: Add mobile mode (`yarn mobile:add` or `yarn capacitor:add`)
2. **Develop**: Use `yarn mobile:dev` or `yarn capacitor:dev`
3. **Test**: Run on device/emulator with respective commands
4. **Build**: Create production builds
5. **Deploy**: Distribute through app stores

For detailed configuration, see [quasar.config.ts](quasar.config.ts), [Mobile Configuration Setup](./docs/MOBILE_CONFIG_SETUP.md), and platform-specific configuration files in `src-cordova/` or `src-capacitor/` directories.


## Generate icons

```bash
npx @quasar/icongenie generate -m capacitor \
  -i ./public/logo-primary.png \
  --png-color 000 \
  --splashscreen-color 000 \
  --splashscreen-icon-ratio 35 \
  --padding 20,20 \
  --skip-trim
```
