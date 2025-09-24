# Android App Bundle (AAB) and APK Build Guide

This guide describes the process of building Android App Bundle (AAB) and APK files for the GuestSpot application in release mode.

## Prerequisites

- Node.js and npm/yarn installed
- Android SDK installed and configured
- Android build tools (version 34.0.0 or later)
- Java Development Kit (JDK)
- Keystore file for signing (guest-spot-key.jks) located in src-capacitor/android/
- Local signing configuration in `src-capacitor/android/local.properties`

## Build Process

### 1. Setup Signing Configuration

#### Place your keystore file:
Place your keystore file at `src-capacitor/android/guest-spot-key.jks`

#### Create local.properties:
Create or update `src-capacitor/android/local.properties` with your signing credentials:

```properties
# Android Signing Configuration
RELEASE_STORE_PASSWORD=your_keystore_password
RELEASE_KEY_PASSWORD=your_key_password
```

**Important**: Both `local.properties` and `guest-spot-key.jks` files are automatically ignored by Git and should never be committed to version control.

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Build Android App Bundle (AAB) and APK

Use the provided build script to create signed AAB and APK files:

```bash
./scripts/build-aab.sh
```

This command will:
- Build the Quasar application for Capacitor
- Generate the Android project
- Create a signed AAB file for Google Play Store distribution
- Create a signed APK file for local testing

### 4. Alternative Build Methods

#### Using npm script:
```bash
npm run capacitor:build:aab
```

#### Using build script directly:
```bash
./scripts/build-aab.sh
```

#### Manual build:
```bash
# Build Quasar app
npm run capacitor:build:android

# Build AAB and APK files
cd src-capacitor/android
./gradlew bundleRelease
./gradlew assembleRelease
```

## Security Notes

- **Never commit `local.properties`** to version control
- **Keystore file location**: `src-capacitor/android/guest-spot-key.jks`
- Store your keystore file securely and back it up
- Use strong passwords for your keystore and key
- Consider using environment variables in CI/CD pipelines

### 4. Locate the Built Files

The signed files will be located at:
```
temp/app-release-signed.aab  # For Google Play Store
temp/app-release-signed.apk  # For local testing
```

Original locations:
```
src-capacitor/android/app/build/outputs/bundle/release/app-release.aab
src-capacitor/android/app/build/outputs/apk/release/app-release.apk
```

## Configuration

### Signing Configuration

The signing configuration is set in `src-capacitor/android/gradle.properties`:

```properties
# Release signing configuration (non-sensitive)
RELEASE_STORE_FILE=../guest-spot-key.jks
RELEASE_KEY_ALIAS=guest-spot-alias
```

**Important**: Passwords are NOT stored in `gradle.properties`. They are read from `local.properties` and passed as Gradle properties during build time only.

### Build Configuration

The build configuration is set in `src-capacitor/android/app/build.gradle`:

```gradle
signingConfigs {
    release {
        storeFile file(RELEASE_STORE_FILE)
        storePassword project.findProperty('RELEASE_STORE_PASSWORD') ?: System.getenv('RELEASE_STORE_PASSWORD')
        keyAlias RELEASE_KEY_ALIAS
        keyPassword project.findProperty('RELEASE_KEY_PASSWORD') ?: System.getenv('RELEASE_KEY_PASSWORD')
    }
}

buildTypes {
    release {
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        signingConfig signingConfigs.release
    }
}
```

## Build Script

The `scripts/build-aab.sh` script automates the entire build process:

1. **Validates keystore file** - Ensures the keystore exists
2. **Reads passwords** - Securely reads passwords from `local.properties`
3. **Builds Quasar app** - Compiles the web application
4. **Syncs Capacitor** - Updates the Android project
5. **Builds AAB** - Creates the signed AAB file using Gradle properties
6. **Builds APK** - Creates the signed APK file using Gradle properties
7. **Verifies output** - Checks if both files were created successfully
8. **Copies to temp** - Makes both files easily accessible

### Script Features

- **Color-coded output** - Easy to read build progress
- **Error handling** - Stops on any build failure
- **File validation** - Checks keystore and output files
- **Secure password handling** - Passwords never stored in version control
- **Automatic cleanup** - Removes previous builds
- **Size reporting** - Shows final AAB and APK file sizes
- **Dual output** - Creates both AAB and APK files for different use cases

## Troubleshooting

### Common Issues

1. **Keystore not found**: Ensure the keystore file exists at `src-capacitor/android/guest-spot-key.jks`
2. **Wrong password**: Verify the keystore password in `src-capacitor/android/local.properties`
3. **Build tools version**: Make sure you have the correct Android build tools installed
4. **Java version**: Ensure you're using a compatible JDK version

### Build Errors

#### "Keystore file not found"
- Check the path in `src-capacitor/android/gradle.properties`
- Ensure the keystore file exists at `src-capacitor/android/guest-spot-key.jks`

#### "Keystore password was incorrect"
- Verify the password in `src-capacitor/android/local.properties`
- Try recreating the keystore if necessary

#### "Build failed with an exception"
- Check the full error message in the terminal
- Ensure all dependencies are properly installed

## Additional Security Notes

- **Keep your keystore secure**: Store it in a safe location and back it up
- **Remember your passwords**: You'll need them for future app updates
- **Don't commit keystore files**: Keystore files are automatically ignored by Git
- **Use different keystores**: Consider using different keystores for debug and release builds

## Next Steps

After building your files, you can:

1. **Upload to Google Play Console** - Use the AAB file for app distribution
2. **Complete app review** - Follow Google's review process
3. **Publish your app** - Make it available on the Play Store
4. **Local testing** - Use the APK file for testing on devices
5. **Debug and development** - Install APK directly on test devices

## File Structure

```
GuestSpot/
├── scripts/
│   └── build-aab.sh                # Build script
├── temp/
│   ├── app-release-signed.aab      # Signed AAB file (Google Play Store)
│   └── app-release-signed.apk      # Signed APK file (Local testing)
├── src-capacitor/
│   └── android/
│       ├── guest-spot-key.jks      # Keystore file
│       ├── local.properties        # Signing passwords
│       ├── gradle.properties       # Signing configuration
│       └── app/
│           └── build.gradle        # Build configuration
└── package.json                    # NPM scripts configuration
```

## Verification

To verify the files were built correctly:

```bash
# Check file sizes
ls -la temp/app-release-signed.aab
ls -la temp/app-release-signed.apk

# Expected sizes:
# AAB: ~6.2MB (for Google Play Store)
# APK: ~8-12MB (for local testing)
# Expected location: temp/
```

For more information about Android app distribution, refer to the [Google Play Console documentation](https://support.google.com/googleplay/android-developer).
