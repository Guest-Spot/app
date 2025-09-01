# Android APK Build and Signing Guide

This guide describes the process of building and signing Android APK files for the GuestSpot application.

## Prerequisites

- Node.js and npm/yarn installed
- Android SDK installed and configured
- Android build tools (version 34.0.0 or later)
- Java Development Kit (JDK)

## Build Process

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Build Android APK

Use the provided npm script to build the Android APK:

```bash
npm run capacitor:build:android
# or
yarn capacitor:build:android
```

This command will:
- Build the Quasar application for Capacitor
- Generate the Android project
- Create an unsigned APK file

### 3. Locate the Built APK

The unsigned APK file will be located at:
```
/dist/capacitor/android/apk/release/app-release-unsigned.apk
```

## Signing Process

### 1. Generate Keystore (JKS Key)

First, create a keystore file for signing your APK:

```bash
keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
```

**Parameters:**
- `-keystore my-release-key.jks`: Name of the keystore file
- `-keyalg RSA`: Algorithm for key generation
- `-keysize 2048`: Key size in bits
- `-validity 10000`: Validity period in days
- `-alias my-key-alias`: Alias for the key

**Note:** Keep your keystore file and password secure. You'll need them for future app updates.

### 2. Sign the APK

Use the Android SDK's `apksigner` tool to sign your APK:

```bash
~/Library/Android/sdk/build-tools/34.0.0/apksigner sign \
  --ks my-release-key.jks \
  --out app-release-signed.apk \
  app-release-unsigned.apk
```

**Parameters:**
- `--ks my-release-key.jks`: Path to your keystore file
- `--out app-release-signed.apk`: Output filename for the signed APK
- `app-release-unsigned.apk`: Input unsigned APK file

### 3. Verify the Signature

After signing, verify that the APK is properly signed:

```bash
~/Library/Android/sdk/build-tools/34.0.0/apksigner verify app-release-signed.apk
```

## Complete Workflow Script

You can create a script to automate the entire process:

```bash
#!/bin/bash

# Build the APK
echo "Building Android APK..."
npm run capacitor:build:android

# Check if build was successful
if [ ! -f "dist/capacitor/android/apk/release/app-release-unsigned.apk" ]; then
    echo "Build failed! APK file not found."
    exit 1
fi

# Sign the APK
echo "Signing APK..."
~/Library/Android/sdk/build-tools/34.0.0/apksigner sign \
  --ks my-release-key.jks \
  --out app-release-signed.apk \
  dist/capacitor/android/apk/release/app-release-unsigned.apk

# Verify signature
echo "Verifying signature..."
~/Library/Android/sdk/build-tools/34.0.0/apksigner verify app-release-signed.apk

echo "APK build and signing completed successfully!"
```

## Troubleshooting

### Common Issues

1. **Build Tools Version**: Make sure you have the correct version of Android build tools installed
2. **Keystore Path**: Ensure the keystore file path is correct
3. **Permissions**: Make sure you have execute permissions for the build tools
4. **Java Version**: Ensure you're using a compatible JDK version

### Alternative Build Tools Path

If your Android SDK is installed in a different location, adjust the path accordingly:

**To find your Android SDK location:**
- Open Android Studio
- Go to **Tools > SDK Manager**
- Navigate to **Android SDK** tab
- Check the **Android SDK Location** field

```bash
# For Windows
C:\Users\<username>\AppData\Local\Android\Sdk\build-tools\34.0.0\apksigner.bat

# For Linux
~/Android/Sdk/build-tools/34.0.0/apksigner

# For macOS (default location)
~/Library/Android/sdk/build-tools/34.0.0/apksigner
```

## Security Notes

- **Keep your keystore secure**: Store it in a safe location and back it up
- **Remember your passwords**: You'll need them for future app updates
- **Don't commit keystore files**: Add `*.jks` to your `.gitignore` file
- **Use different keystores**: Consider using different keystores for debug and release builds

## Next Steps

After signing your APK, you can:
- Upload it to Google Play Store
- Distribute it for testing
- Install it directly on Android devices

For more information about Android app distribution, refer to the [Google Play Console documentation](https://support.google.com/googleplay/android-developer).
