#!/bin/bash

# Script to sign APK and AAB files using apksigner and jarsigner
# This script signs Android APK and AAB files for distribution

set -e  # Exit on any error

echo "✍️  Starting APK/AAB signing process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_question() {
    echo -e "${BLUE}[QUESTION]${NC} $1"
}

# Configuration
KEYSTORE_PATH="src-capacitor/android/guest-spot-key.jks"
KEYSTORE_ALIAS="guest-spot-key"
LOCAL_PROPERTIES="src-capacitor/android/local.properties"
TEMP_DIR="temp"

# Check if keystore exists
if [ ! -f "$KEYSTORE_PATH" ]; then
    print_error "Keystore file not found at $KEYSTORE_PATH"
    print_error "Please run ./scripts/generate-keystore.sh first to create a keystore"
    exit 1
fi

print_status "Keystore file found at $KEYSTORE_PATH"

# Check if local.properties exists
if [ ! -f "$LOCAL_PROPERTIES" ]; then
    print_error "local.properties file not found at $LOCAL_PROPERTIES"
    print_error "Please ensure the file exists with your signing passwords"
    exit 1
fi

# Read passwords from local.properties
print_status "Reading signing configuration from local.properties..."
STORE_PASSWORD=$(grep "RELEASE_STORE_PASSWORD=" "$LOCAL_PROPERTIES" | cut -d'=' -f2)
KEY_PASSWORD=$(grep "RELEASE_KEY_PASSWORD=" "$LOCAL_PROPERTIES" | cut -d'=' -f2)

if [ -z "$STORE_PASSWORD" ] || [ "$STORE_PASSWORD" = "your_store_password_here" ]; then
    print_error "RELEASE_STORE_PASSWORD not set in local.properties"
    print_error "Please update the password in $LOCAL_PROPERTIES"
    exit 1
fi

if [ -z "$KEY_PASSWORD" ] || [ "$KEY_PASSWORD" = "your_key_password_here" ]; then
    print_error "RELEASE_KEY_PASSWORD not set in local.properties"
    print_error "Please update the password in $LOCAL_PROPERTIES"
    exit 1
fi

print_status "Signing configuration loaded successfully"

# Find Android SDK build tools
print_status "Looking for Android SDK build tools..."

# Common Android SDK locations
ANDROID_SDK_PATHS=(
    "$HOME/Library/Android/sdk"
    "$HOME/Android/Sdk"
    "/usr/local/android-sdk"
    "/opt/android-sdk"
)

BUILD_TOOLS_PATH=""
for sdk_path in "${ANDROID_SDK_PATHS[@]}"; do
    if [ -d "$sdk_path/build-tools" ]; then
        # Find the latest build tools version
        LATEST_VERSION=$(ls -1 "$sdk_path/build-tools" | sort -V | tail -1)
        if [ -n "$LATEST_VERSION" ]; then
            BUILD_TOOLS_PATH="$sdk_path/build-tools/$LATEST_VERSION"
            break
        fi
    fi
done

if [ -z "$BUILD_TOOLS_PATH" ]; then
    print_error "Android SDK build tools not found"
    print_error "Please install Android SDK and build tools"
    print_error "Common locations checked:"
    for path in "${ANDROID_SDK_PATHS[@]}"; do
        print_error "  - $path"
    done
    exit 1
fi

APKSIGNER_PATH="$BUILD_TOOLS_PATH/apksigner"
if [ ! -f "$APKSIGNER_PATH" ]; then
    print_error "apksigner not found at $APKSIGNER_PATH"
    exit 1
fi

print_status "Found Android build tools at: $BUILD_TOOLS_PATH"

# Create temp directory if it doesn't exist
mkdir -p "$TEMP_DIR"

# Function to sign APK file
sign_apk() {
    local input_apk="$1"
    local output_apk="$2"
    
    if [ ! -f "$input_apk" ]; then
        print_error "Input APK file not found: $input_apk"
        return 1
    fi
    
    print_status "Signing APK: $(basename "$input_apk")"
    
    # Sign the APK
    "$APKSIGNER_PATH" sign \
        --ks "$KEYSTORE_PATH" \
        --ks-key-alias "$KEYSTORE_ALIAS" \
        --ks-pass "pass:$STORE_PASSWORD" \
        --key-pass "pass:$KEY_PASSWORD" \
        --out "$output_apk" \
        "$input_apk"
    
    if [ $? -eq 0 ]; then
        print_status "✅ APK signed successfully: $output_apk"
        
        # Verify signature
        print_status "Verifying APK signature..."
        "$APKSIGNER_PATH" verify "$output_apk"
        
        if [ $? -eq 0 ]; then
            print_status "✅ APK signature verified"
            
            # Get file size
            FILE_SIZE=$(du -h "$output_apk" | cut -f1)
            print_status "📊 Signed APK size: $FILE_SIZE"
        else
            print_warning "APK signature verification failed"
        fi
    else
        print_error "Failed to sign APK"
        return 1
    fi
}

# Function to sign AAB file
sign_aab() {
    local input_aab="$1"
    local output_aab="$2"
    
    if [ ! -f "$input_aab" ]; then
        print_error "Input AAB file not found: $input_aab"
        return 1
    fi
    
    print_status "Signing AAB: $(basename "$input_aab")"
    
    # Sign the AAB using jarsigner
    jarsigner -verbose \
        -keystore "$KEYSTORE_PATH" \
        -storepass "$STORE_PASSWORD" \
        -keypass "$KEY_PASSWORD" \
        -signedjar "$output_aab" \
        "$input_aab" \
        "$KEYSTORE_ALIAS"
    
    if [ $? -eq 0 ]; then
        print_status "✅ AAB signed successfully: $output_aab"
        
        # Verify signature
        print_status "Verifying AAB signature..."
        jarsigner -verify -verbose -certs "$output_aab"
        
        if [ $? -eq 0 ]; then
            print_status "✅ AAB signature verified"
            
            # Get file size
            FILE_SIZE=$(du -h "$output_aab" | cut -f1)
            print_status "📊 Signed AAB size: $FILE_SIZE"
        else
            print_warning "AAB signature verification failed"
        fi
    else
        print_error "Failed to sign AAB"
        return 1
    fi
}

# Check for unsigned files to sign
UNSIGNED_APK=""
UNSIGNED_AAB=""

# Look for unsigned APK files
if [ -f "dist/capacitor/android/apk/release/app-release-unsigned.apk" ]; then
    UNSIGNED_APK="dist/capacitor/android/apk/release/app-release-unsigned.apk"
elif [ -f "src-capacitor/android/app/build/outputs/apk/release/app-release.apk" ]; then
    UNSIGNED_APK="src-capacitor/android/app/build/outputs/apk/release/app-release.apk"
fi

# Look for unsigned AAB files
if [ -f "src-capacitor/android/app/build/outputs/bundle/release/app-release.aab" ]; then
    UNSIGNED_AAB="src-capacitor/android/app/build/outputs/bundle/release/app-release.aab"
fi

# Sign APK if found
if [ -n "$UNSIGNED_APK" ]; then
    print_status "Found unsigned APK: $UNSIGNED_APK"
    sign_apk "$UNSIGNED_APK" "$TEMP_DIR/app-release-signed.apk"
else
    print_warning "No unsigned APK file found"
    print_warning "Run 'npm run capacitor:build:android' first to build the APK"
fi

# Sign AAB if found
if [ -n "$UNSIGNED_AAB" ]; then
    print_status "Found unsigned AAB: $UNSIGNED_AAB"
    sign_aab "$UNSIGNED_AAB" "$TEMP_DIR/app-release-signed.aab"
else
    print_warning "No unsigned AAB file found"
    print_warning "Run './scripts/build-aab.sh' first to build the AAB"
fi

# Check if any files were signed
if [ -f "$TEMP_DIR/app-release-signed.apk" ] || [ -f "$TEMP_DIR/app-release-signed.aab" ]; then
    print_status "🎉 Signing process completed successfully!"
    print_status ""
    print_status "📁 Signed files created:"
    
    if [ -f "$TEMP_DIR/app-release-signed.apk" ]; then
        print_status "   • APK: $TEMP_DIR/app-release-signed.apk"
    fi
    
    if [ -f "$TEMP_DIR/app-release-signed.aab" ]; then
        print_status "   • AAB: $TEMP_DIR/app-release-signed.aab"
    fi
    
    print_status ""
    print_status "🎯 Next steps:"
    if [ -f "$TEMP_DIR/app-release-signed.aab" ]; then
        print_status "1. Upload AAB to Google Play Console for distribution"
    fi
    if [ -f "$TEMP_DIR/app-release-signed.apk" ]; then
        print_status "2. Use APK for local testing and sideloading"
    fi
else
    print_error "No files were signed"
    print_error "Please ensure you have unsigned APK/AAB files to sign"
    exit 1
fi
