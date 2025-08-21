# 📱 Cordova Configuration Examples

This file contains configuration examples for Cordova mobile development with Quasar.

## 🔧 config.xml Example

```xml
<?xml version='1.0' encoding='utf-8'?>
<widget id="com.yourcompany.guestspot" version="1.0.0" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0">
    <name>GuestSpot</name>
    <description>A Quasar mobile application</description>
    <author email="dev@yourcompany.com" href="http://yourcompany.com">
        Your Company
    </author>
    <content src="index.html" />
    <access origin="*" />
    <allow-intent href="http://*/*" />
    <allow-intent href="https://*/*" />
    <allow-intent href="tel:*" />
    <allow-intent href="sms:*" />
    <allow-intent href="mailto:*" />
    <allow-intent href="geo:*" />
    <platform name="android">
        <allow-intent href="market:*" />
        <icon density="ldpi" src="res/icon/android/drawable-ldpi-icon.png" />
        <icon density="mdpi" src="res/icon/android/drawable-mdpi-icon.png" />
        <icon density="hdpi" src="res/icon/android/drawable-hdpi-icon.png" />
        <icon density="xhdpi" src="res/icon/android/drawable-xhdpi-icon.png" />
        <icon density="xxhdpi" src="res/icon/android/drawable-xxhdpi-icon.png" />
        <icon density="xxxhdpi" src="res/icon/android/drawable-xxxhdpi-icon.png" />
        <splash density="land-ldpi" src="res/screen/android/drawable-land-ldpi-screen.png" />
        <splash density="land-mdpi" src="res/screen/android/drawable-land-mdpi-screen.png" />
        <splash density="land-hdpi" src="res/screen/android/drawable-land-hdpi-screen.png" />
        <splash density="land-xhdpi" src="res/screen/android/drawable-land-xhdpi-screen.png" />
        <splash density="land-xxhdpi" src="res/screen/android/drawable-land-xxhdpi-screen.png" />
        <splash density="land-xxxhdpi" src="res/screen/android/drawable-land-xxxhdpi-screen.png" />
        <splash density="port-ldpi" src="res/screen/android/drawable-port-ldpi-screen.png" />
        <splash density="port-mdpi" src="res/screen/android/drawable-port-mdpi-screen.png" />
        <splash density="port-hdpi" src="res/screen/android/drawable-port-hdpi-screen.png" />
        <splash density="port-xhdpi" src="res/screen/android/drawable-port-xhdpi-screen.png" />
        <splash density="port-xxhdpi" src="res/screen/android/drawable-port-xxhdpi-screen.png" />
        <splash density="port-xxxhdpi" src="res/screen/android/drawable-port-xxxhdpi-screen.png" />
    </platform>
    <platform name="ios">
        <allow-intent href="itms:*" />
        <allow-intent href="itms-apps:*" />
        <icon height="57" src="res/icon/ios/icon.png" width="57" />
        <icon height="114" src="res/icon/ios/icon@2x.png" width="114" />
        <icon height="40" src="res/icon/ios/icon-40.png" width="40" />
        <icon height="80" src="res/icon/ios/icon-40@2x.png" width="80" />
        <icon height="120" src="res/icon/ios/icon-40@3x.png" width="120" />
        <icon height="50" src="res/icon/ios/icon-50.png" width="50" />
        <icon height="100" src="res/icon/ios/icon-50@2x.png" width="100" />
        <icon height="60" src="res/icon/ios/icon-60.png" width="60" />
        <icon height="120" src="res/icon/ios/icon-60@2x.png" width="120" />
        <icon height="180" src="res/icon/ios/icon-60@3x.png" width="180" />
        <icon height="72" src="res/icon/ios/icon-72.png" width="72" />
        <icon height="144" src="res/icon/ios/icon-72@2x.png" width="144" />
        <icon height="76" src="res/icon/ios/icon-76.png" width="76" />
        <icon height="152" src="res/icon/ios/icon-76@2x.png" width="152" />
        <icon height="167" src="res/icon/ios/icon-83.5@2x.png" width="167" />
        <icon height="29" src="res/icon/ios/icon-small.png" width="29" />
        <icon height="58" src="res/icon/ios/icon-small@2x.png" width="58" />
        <icon height="87" src="res/icon/ios/icon-small@3x.png" width="87" />
        <icon height="1024" src="res/icon/ios/icon-1024.png" width="1024" />
        <splash height="1136" src="res/screen/ios/Default-568h@2x.png" width="640" />
        <splash height="1334" src="res/screen/ios/Default-667h.png" width="750" />
        <splash height="2208" src="res/screen/ios/Default-736h.png" width="1242" />
        <splash height="2436" src="res/screen/ios/Default-2436h.png" width="1125" />
        <splash height="2688" src="res/screen/ios/Default-2688h.png" width="1242" />
        <splash height="1792" src="res/screen/ios/Default-1792h.png" width="828" />
        <splash height="2732" src="res/screen/ios/Default-2732h.png" width="2048" />
        <splash height="2048" src="res/screen/ios/Default-Portrait@2x.png" width="1536" />
        <splash height="1024" src="res/screen/ios/Default-Portrait.png" width="768" />
        <splash height="960" src="res/screen/ios/Default@2x.png" width="640" />
        <splash height="480" src="res/screen/ios/Default.png" width="320" />
    </platform>
    <plugin name="cordova-plugin-device" spec="~2.1.0" />
    <plugin name="cordova-plugin-network-information" spec="~3.0.0" />
    <plugin name="cordova-plugin-splashscreen" spec="~6.1.0" />
    <plugin name="cordova-plugin-statusbar" spec="~3.1.0" />
    <plugin name="cordova-plugin-whitelist" spec="~1.3.5" />
    <engine name="android" spec="^12.0.0" />
    <engine name="ios" spec="^7.0.0" />
</widget>
```

## 📱 Android Configuration

### build.gradle (android/app/build.gradle)
```gradle
android {
    compileSdkVersion 34
    buildToolsVersion "34.0.0"
    
    defaultConfig {
        applicationId "com.yourcompany.guestspot"
        minSdkVersion 22
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }
    
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
    
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_11
        targetCompatibility JavaVersion.VERSION_11
    }
}
```

### AndroidManifest.xml Permissions
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

## 🍎 iOS Configuration

### Info.plist Entries
```xml
<key>NSCameraUsageDescription</key>
<string>This app needs camera access to take photos</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs photo library access to select images</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs location access to show nearby places</string>
<key>NSMicrophoneUsageDescription</key>
<string>This app needs microphone access for voice features</string>
<key>UIRequiresFullScreen</key>
<true/>
<key>UISupportedInterfaceOrientations</key>
<array>
    <string>UIInterfaceOrientationPortrait</string>
    <string>UIInterfaceOrientationLandscapeLeft</string>
    <string>UIInterfaceOrientationLandscapeRight</string>
</array>
```

## 🔌 Cordova Plugins

### Essential Plugins
```bash
# Device information
cordova plugin add cordova-plugin-device

# Network status
cordova plugin add cordova-plugin-network-information

# Splash screen
cordova plugin add cordova-plugin-splashscreen

# Status bar
cordova plugin add cordova-plugin-statusbar

# Whitelist
cordova plugin add cordova-plugin-whitelist

# Camera
cordova plugin add cordova-plugin-camera

# File transfer
cordova plugin add cordova-plugin-file-transfer

# Geolocation
cordova plugin add cordova-plugin-geolocation

# In-app browser
cordova plugin add cordova-plugin-inappbrowser
```

### Plugin Configuration
```xml
<!-- config.xml -->
<plugin name="cordova-plugin-splashscreen" spec="~6.1.0">
    <variable name="SPLASHSCREEN_DELAY" value="3000" />
    <variable name="SPLASHSCREEN_FADE_DURATION" value="500" />
</plugin>

<plugin name="cordova-plugin-statusbar" spec="~3.1.0">
    <variable name="STATUS_BAR_STYLE" value="lightcontent" />
    <variable name="STATUS_BAR_OVERLAYS_WEBVIEW" value="false" />
</plugin>
```

## 🎨 Icons and Splash Screens

### Icon Sizes
- **Android**: 48x48, 72x72, 96x96, 144x144, 192x192
- **iOS**: 57x57, 60x60, 76x76, 83.5x83.5, 1024x1024

### Splash Screen Sizes
- **Android**: Various densities (ldpi, mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
- **iOS**: Various device sizes (iPhone, iPad, different orientations)

## 🚀 Build Commands

### Development
```bash
# Add platform
cordova platform add android
cordova platform add ios

# Build for development
cordova build android
cordova build ios

# Run on device/emulator
cordova run android
cordova run ios
```

### Production
```bash
# Build for production
cordova build android --release
cordova build ios --release

# Clean build
cordova clean android
cordova clean ios
```

## 🔍 Troubleshooting

### Common Issues
1. **Platform not found**: Run `cordova platform add [platform]`
2. **Plugin not found**: Run `cordova plugin add [plugin]`
3. **Build failed**: Check SDK versions and environment variables
4. **Signing issues**: Configure signing in platform-specific settings

### Debug Commands
```bash
# Check platform list
cordova platform list

# Check plugin list
cordova plugin list

# Check requirements
cordova requirements

# Check platform requirements
cordova requirements android
cordova requirements ios
```
