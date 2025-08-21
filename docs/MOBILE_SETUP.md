# 🚀 Mobile Development Setup Guide

This guide will help you set up your Quasar project for mobile development on iOS and Android platforms.

## 📋 Prerequisites

### System Requirements

#### For Android Development:
- **macOS** 10.15+ (Catalina or later) or **Windows** 10+ or **Linux** (Ubuntu 18.04+)
- **Node.js** 18+ and npm/yarn
- **Java Development Kit (JDK)** 11 or 17
- **Android Studio** (latest version)
- **Android SDK** (API level 30+)

#### For iOS Development (macOS only):
- **macOS** 10.15+ (Catalina or later)
- **Xcode** 14+ from App Store
- **Xcode Command Line Tools**
- **iOS Simulator** (included with Xcode)

## 🔧 Step-by-Step Setup

### 1. Install Global Dependencies

```bash
# Install Quasar CLI globally
npm install -g @quasar/cli

# Install Cordova globally (for Cordova approach)
npm install -g cordova

# Install Capacitor globally (for Capacitor approach)
npm install -g @capacitor/cli
```

### 2. Add Mobile Mode to Your Project

#### Option A: Cordova (Recommended for beginners)
```bash
# Add Cordova mode to your Quasar project
yarn mobile:add
# or
npm run mobile:add
```

#### Option B: Capacitor (Modern approach)
```bash
# Add Capacitor mode to your Quasar project
yarn capacitor:add
# or
npm run capacitor:add
```

### 3. Install Platform Dependencies

#### For Android:

1. **Install Android Studio:**
   - Download from [developer.android.com](https://developer.android.com/studio)
   - Install and launch Android Studio
   - Complete the setup wizard

2. **Install Android SDK:**
   - Open Android Studio → Preferences → Appearance & Behavior → System Settings → Android SDK
   - Install Android SDK Platform 34 (API level 34)
   - Install Android SDK Build-Tools 34.0.0
   - Install Android SDK Platform-Tools

3. **Set Environment Variables:**
   ```bash
   # Add to your ~/.zshrc or ~/.bash_profile
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
   export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home
   
   # Reload shell configuration
   source ~/.zshrc
   ```

4. **Add Android Platform:**
   ```bash
   cd src-cordova
   cordova platform add android
   cd ..
   ```

#### For iOS (macOS only):

1. **Install Xcode:**
   - Download from App Store
   - Launch Xcode and accept license agreement

2. **Install Command Line Tools:**
   ```bash
   xcode-select --install
   ```

3. **Add iOS Platform:**
   ```bash
   cd src-cordova
   cordova platform add ios
   cd ..
   ```

### 4. Verify Installation

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

## 🚀 Development Workflow

### Development Mode

```bash
# Start development server with mobile mode
yarn mobile:dev          # Cordova
yarn capacitor:dev       # Capacitor
```

### Testing on Device/Emulator

```bash
# Run on Android
yarn mobile:run:android      # Cordova
yarn capacitor:run:android   # Capacitor

# Run on iOS
yarn mobile:run:ios          # Cordova
yarn capacitor:run:ios       # Capacitor

# Run on emulator
yarn mobile:emulate:android  # Android emulator
yarn mobile:emulate:ios      # iOS simulator
```

### Building for Production

```bash
# Build for all platforms
yarn mobile:build            # Cordova
yarn capacitor:build         # Capacitor

# Build for specific platform
yarn mobile:build:android    # Android APK
yarn mobile:build:ios        # iOS project
```

## 🔍 Troubleshooting

### Common Issues and Solutions

#### Android Issues:

1. **SDK not found:**
   ```bash
   echo $ANDROID_HOME
   # Should show path to Android SDK
   # If empty, set environment variable
   export ANDROID_HOME=$HOME/Library/Android/sdk
   ```

2. **Build failed with JDK error:**
   ```bash
   java -version
   # Should show Java 11 or 17
   # Install JDK if needed
   brew install openjdk@17
   ```

3. **Emulator not starting:**
   - Open Android Studio → AVD Manager
   - Create new virtual device
   - Start emulator from command line:
   ```bash
   $ANDROID_HOME/emulator/emulator -avd YOUR_AVD_NAME
   ```

#### iOS Issues:

1. **Build failed:**
   ```bash
   # Check Xcode installation
   xcode-select --print-path
   # Should show /Applications/Xcode.app/Contents/Developer
   ```

2. **Signing issues:**
   - Open project in Xcode
   - Set development team in project settings
   - Check provisioning profiles

3. **Simulator not working:**
   - Reset simulator: Xcode → Device → Erase All Content
   - Check simulator is running before building

#### General Issues:

1. **Mode not found:**
   ```bash
   # Re-add mobile mode
   yarn mobile:add
   # or
   yarn capacitor:add
   ```

2. **Platform not found:**
   ```bash
   cd src-cordova
   cordova platform add android
   cordova platform add ios
   cd ..
   ```

3. **Build errors:**
   ```bash
   # Clean and rebuild
   yarn mobile:clean
   yarn mobile:build
   ```

## 📱 Platform-Specific Configuration

### Android Configuration

#### Gradle Configuration:
```gradle
// android/app/build.gradle
android {
    compileSdkVersion 34
    buildToolsVersion "34.0.0"
    
    defaultConfig {
        minSdkVersion 22
        targetSdkVersion 34
        applicationId "com.yourcompany.guestspot"
        versionCode 1
        versionName "1.0.0"
    }
}
```

#### Permissions (android/app/src/main/AndroidManifest.xml):
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

### iOS Configuration

#### Info.plist Configuration:
```xml
<!-- ios/GuestSpot/Info.plist -->
<key>NSCameraUsageDescription</key>
<string>This app needs camera access to take photos</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs photo library access to select images</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs location access to show nearby places</string>
```

#### Build Settings:
- Deployment Target: iOS 12.0+
- Development Team: Your Apple Developer Team ID
- Bundle Identifier: com.yourcompany.guestspot

## 🚀 Publishing to App Stores

### Android (Google Play Store)

1. **Build Release APK:**
   ```bash
   yarn mobile:build:android
   ```

2. **Sign the APK:**
   ```bash
   cd src-cordova/platforms/android
   ./gradlew assembleRelease
   ```

3. **Upload to Google Play Console:**
   - Create app in Google Play Console
   - Upload signed APK or AAB
   - Complete store listing
   - Submit for review

### iOS (App Store)

1. **Build iOS Project:**
   ```bash
   yarn mobile:build:ios
   ```

2. **Open in Xcode:**
   ```bash
   open src-cordova/platforms/ios/GuestSpot.xcworkspace
   ```

3. **Archive and Upload:**
   - Select "Any iOS Device" as target
   - Product → Archive
   - Distribute App through App Store Connect

## 📚 Additional Resources

- [Quasar Mobile Development Guide](https://quasar.dev/quasar-cli-vite/developing-mobile-apps/introduction)
- [Cordova Documentation](https://cordova.apache.org/docs/en/latest/)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [iOS Developer Guide](https://developer.apple.com/ios/)
- [Google Play Console](https://play.google.com/console)
- [App Store Connect](https://appstoreconnect.apple.com/)

## 🧹 Maintenance

### Regular Updates:
```bash
# Update Quasar CLI
npm update -g @quasar/cli

# Update Cordova
npm update -g cordova

# Update Capacitor
npm update -g @capacitor/cli

# Update project dependencies
yarn upgrade
```

### Clean up:
```bash
# Remove mobile mode
yarn mobile:remove
# or
yarn capacitor:remove

# Clean build artifacts
yarn mobile:clean
```

---

## 🎯 Next Steps

1. **Choose your approach**: Cordova or Capacitor
2. **Follow the setup guide** step by step
3. **Test on device/emulator** before building
4. **Configure platform-specific settings**
5. **Build and test thoroughly**
6. **Prepare for app store submission**

For any issues, check the troubleshooting section or refer to the official documentation.
