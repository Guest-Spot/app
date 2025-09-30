#!/bin/bash

# Script to build Android App Bundle (AAB) in release mode
# This script builds a signed AAB file for Google Play Store distribution

set -e  # Exit on any error

echo "🚀 Starting Android App Bundle (AAB) build process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if keystore file exists
KEYSTORE_PATH="src-capacitor/android/guest-spot-key.jks"
if [ ! -f "$KEYSTORE_PATH" ]; then
    print_error "Keystore file not found at $KEYSTORE_PATH"
    print_error "Please ensure the keystore file exists before running this script"
    exit 1
fi

print_status "Keystore file found at $KEYSTORE_PATH"

# Check if local.properties exists
LOCAL_PROPERTIES="src-capacitor/android/local.properties"
if [ ! -f "$LOCAL_PROPERTIES" ]; then
    print_error "local.properties file not found at $LOCAL_PROPERTIES"
    print_error "Please create the file with your signing passwords:"
    print_error "RELEASE_STORE_PASSWORD=your_password"
    print_error "RELEASE_KEY_PASSWORD=your_password"
    exit 1
fi

# Verify signing configuration exists
print_status "Verifying signing configuration in local.properties..."
STORE_PASSWORD=$(grep "RELEASE_STORE_PASSWORD=" "$LOCAL_PROPERTIES" | cut -d'=' -f2)
KEY_PASSWORD=$(grep "RELEASE_KEY_PASSWORD=" "$LOCAL_PROPERTIES" | cut -d'=' -f2)

if [ -z "$STORE_PASSWORD" ] || [ -z "$KEY_PASSWORD" ]; then
    print_error "Failed to read passwords from local.properties"
    print_error "Please ensure RELEASE_STORE_PASSWORD and RELEASE_KEY_PASSWORD are set in $LOCAL_PROPERTIES"
    exit 1
fi

print_status "Signing configuration verified"

# Load environment variables from .env file
if [ -f ".env" ]; then
    print_status "Loading environment variables from .env file..."
    export $(grep -v '^#' .env | xargs)
    if [ -n "$API_URL" ]; then
        print_status "API_URL loaded from .env: $API_URL"
    else
        print_error "API_URL not found in .env file"
        exit 1
    fi
else
    print_error ".env file not found in project root"
    print_error "Please create .env file with API_URL variable"
    exit 1
fi

# Step 1: Build Quasar app for Capacitor
print_status "Step 1: Building Quasar app for Capacitor..."
npm run capacitor:build:android

# Check if build was successful
if [ $? -ne 0 ]; then
    print_error "Quasar build failed!"
    exit 1
fi

print_status "Quasar build completed successfully"

# Step 2: Build Android App Bundle and APK
print_status "Step 2: Building Android App Bundle (AAB) and APK in release mode..."

# Navigate to Android directory
cd src-capacitor/android

# Clean previous builds
print_status "Cleaning previous builds..."
./gradlew clean

# Build release bundle with Gradle properties
print_status "Building release bundle with Gradle properties..."
./gradlew bundleRelease -PRELEASE_STORE_PASSWORD="$STORE_PASSWORD" -PRELEASE_KEY_PASSWORD="$KEY_PASSWORD"

# Check if AAB build was successful
if [ $? -ne 0 ]; then
    print_error "AAB build failed!"
    exit 1
fi

print_status "AAB build completed successfully!"

# Build release APK with Gradle properties
print_status "Building release APK with Gradle properties..."
./gradlew assembleRelease -PRELEASE_STORE_PASSWORD="$STORE_PASSWORD" -PRELEASE_KEY_PASSWORD="$KEY_PASSWORD"

# Check if APK build was successful
if [ $? -ne 0 ]; then
    print_error "APK build failed!"
    exit 1
fi

print_status "APK build completed successfully!"

# Navigate back to project root
cd ../..

# Step 3: Locate and verify the AAB, APK, and mapping files
AAB_PATH="src-capacitor/android/app/build/outputs/bundle/release/app-release.aab"
APK_PATH="src-capacitor/android/app/build/outputs/apk/release/app-release.apk"
MAPPING_PATH="src-capacitor/android/app/build/outputs/mapping/release/mapping.txt"

# Create temp directory if it doesn't exist
mkdir -p temp

# Check and copy AAB file
if [ -f "$AAB_PATH" ]; then
    print_status "✅ AAB file created successfully!"
    print_status "📁 Location: $AAB_PATH"
    
    # Get file size
    FILE_SIZE=$(du -h "$AAB_PATH" | cut -f1)
    print_status "📊 AAB file size: $FILE_SIZE"
    
    # Copy to temp directory for easy access
    cp "$AAB_PATH" "temp/app-release-signed.aab"
    print_status "📋 AAB file copied to: temp/app-release-signed.aab"
    
else
    print_error "AAB file not found at expected location: $AAB_PATH"
    print_error "Build may have failed or file was created in a different location"
    exit 1
fi

# Check and copy APK file
if [ -f "$APK_PATH" ]; then
    print_status "✅ APK file created successfully!"
    print_status "📁 Location: $APK_PATH"
    
    # Get file size
    FILE_SIZE=$(du -h "$APK_PATH" | cut -f1)
    print_status "📊 APK file size: $FILE_SIZE"
    
    # Copy to temp directory for easy access
    cp "$APK_PATH" "temp/app-release-signed.apk"
    print_status "📋 APK file copied to: temp/app-release-signed.apk"
    
else
    print_error "APK file not found at expected location: $APK_PATH"
    print_error "Build may have failed or file was created in a different location"
    exit 1
fi

# Check and copy mapping file for deobfuscation
if [ -f "$MAPPING_PATH" ]; then
    print_status "✅ Mapping file created successfully!"
    print_status "📁 Location: $MAPPING_PATH"
    
    # Copy to temp directory for easy access
    cp "$MAPPING_PATH" "temp/mapping.txt"
    print_status "📋 Mapping file copied to: temp/mapping.txt"
    print_status "💡 Upload this mapping file to Google Play Console for deobfuscation"
    
else
    print_warning "Mapping file not found at expected location: $MAPPING_PATH"
    print_warning "This may indicate that obfuscation was not applied properly"
fi

print_status "🎉 Build process completed successfully!"
print_status "The AAB file is ready for Google Play Store upload"
print_status "The APK file is ready for local testing"


# Step 4: Verify the AAB file
print_status "Step 3: Verifying AAB file..."

# Check if bundletool is available (optional verification)
if command -v bundletool &> /dev/null; then
    print_status "Verifying AAB with bundletool..."
    bundletool validate --bundle="temp/app-release-signed.aab"
    if [ $? -eq 0 ]; then
        print_status "✅ AAB file validation passed"
    else
        print_warning "AAB file validation failed, but file was created"
    fi
else
    print_warning "bundletool not found. Skipping AAB validation."
    print_warning "You can install bundletool for additional verification:"
    print_warning "https://developer.android.com/studio/command-line/bundletool"
fi

echo ""
print_status "🎯 Next steps:"
print_status "1. Upload the AAB file to Google Play Console"
print_status "2. Complete the app review process"
print_status "3. Publish your app to the Play Store"
print_status "4. Use the APK file for local testing and debugging"
echo ""
print_status "📁 Files created:"
print_status "   • AAB file: temp/app-release-signed.aab (for Google Play Store)"
print_status "   • APK file: temp/app-release-signed.apk (for local testing)"
print_status "   • Mapping file: temp/mapping.txt (for deobfuscation - upload to Play Console)"
