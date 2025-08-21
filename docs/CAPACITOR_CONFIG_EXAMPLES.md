# ⚡ Capacitor Configuration Examples

This file contains configuration examples for Capacitor mobile development with Quasar.

## 🔧 capacitor.config.ts Example

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourcompany.guestspot',
  appName: 'GuestSpot',
  webDir: 'dist/spa',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    hostname: 'localhost',
    port: 8080,
    allowNavigation: [
      '*.yourdomain.com',
      '*.googleapis.com'
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: '#ffffffff',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#999999',
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: 'launch_screen',
      useDialog: true
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#000000',
      overlaysWebView: false
    },
    Device: {
      // Device plugin configuration
    },
    Haptics: {
      // Haptics plugin configuration
    },
    Keyboard: {
      resize: 'body',
      style: 'default',
      resizeOnFullScreen: true
    }
  },
  ios: {
    contentInset: 'automatic',
    limitsNavigationsToAppBoundDomains: true,
    scheme: 'guestspot',
    webContentsDebuggingEnabled: false
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    initialFocus: false,
    mixedContentMode: 'compatibility'
  }
};

export default config;
```

## 📱 Android Configuration

### MainActivity.java (android/app/src/main/java/com/yourcompany/guestspot/MainActivity.java)
```java
package com.yourcompany.guestspot;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    // Capacitor automatically handles the bridge
    // Add custom code here if needed
}
```

### AndroidManifest.xml (android/app/src/main/AndroidManifest.xml)
```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="false">
        
        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:name="com.yourcompany.guestspot.MainActivity"
            android:label="@string/app_name"
            android:launchMode="singleTask"
            android:exported="true"
            android:theme="@style/AppTheme.NoActionBarLaunch">
            
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="guestspot" />
            </intent-filter>
        </activity>
        
        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>
    </application>
    
    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    
    <!-- Features -->
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />
    <uses-feature android:name="android.hardware.location" android:required="false" />
    <uses-feature android:name="android.hardware.location.gps" android:required="false" />
</manifest>
```

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
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_11
        targetCompatibility JavaVersion.VERSION_11
    }
    
    buildFeatures {
        viewBinding true
    }
}

dependencies {
    implementation fileTree(include: ['*.jar'], dir: 'libs')
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'androidx.coordinatorlayout:coordinatorlayout:1.2.0'
    implementation 'androidx.core:core:1.10.1'
    implementation 'androidx.webkit:webkit:1.7.0'
    implementation 'com.getcapacitor:core:5.0.0'
    implementation 'com.getcapacitor:android:5.0.0'
    testImplementation 'junit:junit:4.13.2'
    androidTestImplementation 'androidx.test.ext:junit:1.1.5'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
}
```

## 🍎 iOS Configuration

### AppDelegate.swift (ios/App/App/AppDelegate.swift)
```swift
import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
        // Called when the app was opened with a url. Feel free to add additional processing here.
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was opened with an activity, including Universal Links.
        // Feel free to add additional processing here.
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}
```

### Info.plist (ios/App/App/Info.plist)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>$(DEVELOPMENT_LANGUAGE)</string>
    <key>CFBundleDisplayName</key>
    <string>GuestSpot</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>$(PRODUCT_NAME)</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSRequiresIPhoneOS</key>
    <true/>
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <false/>
        <key>NSExceptionDomains</key>
        <dict>
            <key>localhost</key>
            <dict>
                <key>NSExceptionAllowsInsecureHTTPLoads</key>
                <true/>
            </dict>
        </dict>
    </dict>
    <key>NSCameraUsageDescription</key>
    <string>This app needs camera access to take photos</string>
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>This app needs location access to show nearby places</string>
    <key>NSMicrophoneUsageDescription</key>
    <string>This app needs microphone access for voice features</string>
    <key>NSPhotoLibraryUsageDescription</key>
    <string>This app needs photo library access to select images</string>
    <key>UILaunchStoryboardName</key>
    <string>LaunchScreen</string>
    <key>UIRequiredDeviceCapabilities</key>
    <array>
        <string>armv7</string>
    </array>
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
    <key>UISupportedInterfaceOrientations~ipad</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationPortraitUpsideDown</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
    <key>UIViewControllerBasedStatusBarAppearance</key>
    <false/>
</dict>
</plist>
```

## 🔌 Capacitor Plugins

### Essential Plugins
```bash
# Core plugins
npm install @capacitor/core
npm install @capacitor/cli

# App functionality
npm install @capacitor/app
npm install @capacitor/haptics
npm install @capacitor/keyboard
npm install @capacitor/status-bar
npm install @capacitor/device
npm install @capacitor/splash-screen

# Additional functionality
npm install @capacitor/camera
npm install @capacitor/filesystem
npm install @capacitor/geolocation
npm install @capacitor/local-notifications
npm install @capacitor/push-notifications
npm install @capacitor/storage
npm install @capacitor/toast
npm install @capacitor/action-sheet
npm install @capacitor/dialog
npm install @capacitor/network
npm install @capacitor/share
npm install @capacitor/browser
```

### Plugin Usage in Vue Components
```typescript
// Example: Using Camera plugin
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export default {
  methods: {
    async takePicture() {
      try {
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: true,
          resultType: CameraResultType.Uri,
          source: CameraSource.Camera
        });
        
        console.log('Image URI:', image.webPath);
      } catch (error) {
        console.error('Error taking picture:', error);
      }
    }
  }
};
```

## 🎨 Icons and Splash Screens

### Icon Sizes
- **Android**: 48x48, 72x72, 96x96, 144x144, 192x192
- **iOS**: 20x20, 29x29, 40x40, 50x50, 57x57, 58x58, 60x60, 72x72, 76x76, 80x80, 87x87, 100x100, 114x114, 120x120, 144x144, 152x152, 167x167, 180x180, 1024x1024

### Splash Screen Sizes
- **Android**: Various densities and orientations
- **iOS**: Various device sizes and orientations

## 🚀 Build Commands

### Development
```bash
# Add platforms
npx cap add android
npx cap add ios

# Sync web code with native projects
npx cap sync

# Open in native IDE
npx cap open android
npx cap open ios

# Run on device/emulator
npx cap run android
npx cap run ios
```

### Production
```bash
# Build web app
quasar build

# Sync with native projects
npx cap sync

# Build native projects
npx cap build android
npx cap build ios
```

## 🔍 Troubleshooting

### Common Issues
1. **Platform not found**: Run `npx cap add [platform]`
2. **Plugin not found**: Install plugin with npm and run `npx cap sync`
3. **Build failed**: Check platform requirements and dependencies
4. **Sync issues**: Run `npx cap sync` after web build

### Debug Commands
```bash
# Check platform list
npx cap ls

# Check plugin list
npx cap list

# Check requirements
npx cap doctor

# Sync project
npx cap sync

# Copy web assets
npx cap copy
```

### Platform-Specific Issues

#### Android:
- **Gradle sync failed**: Check Android Studio and SDK versions
- **Build tools not found**: Install correct build tools version
- **Permission denied**: Check AndroidManifest.xml permissions

#### iOS:
- **Signing issues**: Check development team and provisioning profiles
- **Build failed**: Ensure Xcode and Command Line Tools are installed
- **Simulator issues**: Reset simulator in Xcode

## 📱 Advanced Configuration

### Custom Native Code
```java
// Android: Custom MainActivity
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Register custom plugin
        registerPlugin(CustomPlugin.class);
    }
}
```

```swift
// iOS: Custom AppDelegate
@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Custom initialization code
        return true
    }
}
```

### Environment-Specific Configuration
```typescript
// capacitor.config.ts
const config: CapacitorConfig = {
  // ... base config
  
  // Development overrides
  ...(process.env.NODE_ENV === 'development' && {
    server: {
      hostname: '192.168.1.100', // Your local IP
      port: 8080
    }
  }),
  
  // Production overrides
  ...(process.env.NODE_ENV === 'production' && {
    server: {
      hostname: 'yourdomain.com',
      port: 443
    }
  })
};
```
