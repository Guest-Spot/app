#!/bin/bash

# Complete Android Build and Signing Automation Script
# This script automates the entire process from keystore generation to signed APK/AAB creation

set -e  # Exit on any error

echo "🚀 Starting Complete Android Build and Signing Process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

print_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# Configuration
KEYSTORE_PATH="src-capacitor/android/guest-spot-key.jks"
LOCAL_PROPERTIES="src-capacitor/android/local.properties"
TEMP_DIR="temp"

# Check if we're in the project root
if [ ! -f "package.json" ] || [ ! -d "src-capacitor" ]; then
    print_error "This script must be run from the project root directory"
    print_error "Please navigate to the GuestSpot project root and run this script"
    exit 1
fi

print_status "Project root directory confirmed"

# Step 1: Check and generate keystore if needed
print_step "Step 1: Checking keystore configuration..."

if [ ! -f "$KEYSTORE_PATH" ]; then
    print_warning "Keystore file not found at $KEYSTORE_PATH"
    print_question "Do you want to generate a new keystore? (Y/n)"
    read -r response
    if [[ "$response" =~ ^[Nn]$ ]]; then
        print_error "Cannot proceed without a keystore file"
        exit 1
    fi
    
    print_status "Generating new keystore..."
    ./scripts/generate-keystore.sh
    
    if [ $? -ne 0 ]; then
        print_error "Keystore generation failed"
        exit 1
    fi
else
    print_status "Keystore file found at $KEYSTORE_PATH"
fi

# Step 2: Check local.properties configuration
print_step "Step 2: Checking signing configuration..."

if [ ! -f "$LOCAL_PROPERTIES" ]; then
    print_error "local.properties file not found"
    print_error "Please run ./scripts/generate-keystore.sh first"
    exit 1
fi

# Check if passwords are configured
STORE_PASSWORD=$(grep "RELEASE_STORE_PASSWORD=" "$LOCAL_PROPERTIES" | cut -d'=' -f2)
KEY_PASSWORD=$(grep "RELEASE_KEY_PASSWORD=" "$LOCAL_PROPERTIES" | cut -d'=' -f2)

if [ -z "$STORE_PASSWORD" ] || [ "$STORE_PASSWORD" = "your_store_password_here" ] || \
   [ -z "$KEY_PASSWORD" ] || [ "$KEY_PASSWORD" = "your_key_password_here" ]; then
    print_warning "Passwords not configured in local.properties"
    print_question "Do you want to configure passwords now? (Y/n)"
    read -r response
    if [[ "$response" =~ ^[Nn]$ ]]; then
        print_error "Cannot proceed without configured passwords"
        exit 1
    fi
    
    print_question "Enter keystore password:"
    read -s STORE_PASSWORD
    print_question "Enter key password (press Enter to use same as keystore):"
    read -s KEY_PASSWORD
    
    if [ -z "$KEY_PASSWORD" ]; then
        KEY_PASSWORD="$STORE_PASSWORD"
    fi
    
    # Update local.properties
    sed -i.bak "s/RELEASE_STORE_PASSWORD=.*/RELEASE_STORE_PASSWORD=$STORE_PASSWORD/" "$LOCAL_PROPERTIES"
    sed -i.bak "s/RELEASE_KEY_PASSWORD=.*/RELEASE_KEY_PASSWORD=$KEY_PASSWORD/" "$LOCAL_PROPERTIES"
    rm -f "${LOCAL_PROPERTIES}.bak"
    
    print_status "Passwords configured successfully"
else
    print_status "Signing configuration verified"
fi

# Step 3: Build the application
print_step "Step 3: Building Android application..."

print_question "What type of build do you want to create?"
echo "1) APK only (faster, for testing)"
echo "2) AAB only (for Google Play Store)"
echo "3) Both APK and AAB (recommended)"
print_question "Enter your choice (1-3):"
read -r build_choice

case $build_choice in
    1)
        print_status "Building APK only..."
        npm run capacitor:build:android
        ;;
    2)
        print_status "Building AAB only..."
        ./scripts/build-aab.sh
        ;;
    3)
        print_status "Building both APK and AAB..."
        ./scripts/build-aab.sh
        ;;
    *)
        print_error "Invalid choice. Building both APK and AAB..."
        ./scripts/build-aab.sh
        ;;
esac

if [ $? -ne 0 ]; then
    print_error "Build process failed"
    exit 1
fi

# Step 4: Sign the files if needed
print_step "Step 4: Signing files..."

# Check if files need signing
NEEDS_SIGNING=false

# Check for unsigned APK
if [ -f "dist/capacitor/android/apk/release/app-release-unsigned.apk" ]; then
    print_status "Found unsigned APK, signing..."
    ./scripts/sign-apk.sh
    NEEDS_SIGNING=true
fi

# Check if AAB was built but not signed
if [ -f "src-capacitor/android/app/build/outputs/bundle/release/app-release.aab" ]; then
    if [ ! -f "$TEMP_DIR/app-release-signed.aab" ]; then
        print_status "Found unsigned AAB, signing..."
        ./scripts/sign-apk.sh
        NEEDS_SIGNING=true
    fi
fi

if [ "$NEEDS_SIGNING" = false ]; then
    print_status "All files are already signed"
fi

# Step 5: Verify final output
print_step "Step 5: Verifying final output..."

print_status "Checking for signed files in $TEMP_DIR directory..."

SIGNED_FILES=()

if [ -f "$TEMP_DIR/app-release-signed.apk" ]; then
    SIGNED_FILES+=("APK: $TEMP_DIR/app-release-signed.apk")
    APK_SIZE=$(du -h "$TEMP_DIR/app-release-signed.apk" | cut -f1)
    print_status "✅ Signed APK found (Size: $APK_SIZE)"
fi

if [ -f "$TEMP_DIR/app-release-signed.aab" ]; then
    SIGNED_FILES+=("AAB: $TEMP_DIR/app-release-signed.aab")
    AAB_SIZE=$(du -h "$TEMP_DIR/app-release-signed.aab" | cut -f1)
    print_status "✅ Signed AAB found (Size: $AAB_SIZE)"
fi

if [ ${#SIGNED_FILES[@]} -eq 0 ]; then
    print_warning "No signed files found in $TEMP_DIR"
    print_warning "You may need to run the signing process manually"
else
    print_status "🎉 Build and signing process completed successfully!"
    print_status ""
    print_status "📁 Final signed files:"
    for file in "${SIGNED_FILES[@]}"; do
        print_status "   • $file"
    done
fi

# Step 6: Next steps
print_step "Step 6: Next steps and recommendations"

print_status "🎯 What you can do next:"
if [ -f "$TEMP_DIR/app-release-signed.aab" ]; then
    print_status "1. Upload AAB to Google Play Console for distribution"
    print_status "   - Go to Google Play Console"
    print_status "   - Navigate to your app's Release section"
    print_status "   - Upload the AAB file from: $TEMP_DIR/app-release-signed.aab"
fi

if [ -f "$TEMP_DIR/app-release-signed.apk" ]; then
    print_status "2. Use APK for local testing and sideloading"
    print_status "   - Install on Android devices for testing"
    print_status "   - Share with beta testers"
    print_status "   - APK location: $TEMP_DIR/app-release-signed.apk"
fi

print_status ""
print_status "🔐 Security reminders:"
print_status "   • Keep your keystore file and passwords secure"
print_status "   • Never commit keystore files to version control"
print_status "   • Use the same keystore for all future app updates"
print_status "   • Store passwords in a secure password manager"

print_status ""
print_status "📚 Additional resources:"
print_status "   • Android Build Signing Guide: docs/ANDROID_BUILD_SIGNING.md"
print_status "   • AAB Build Guide: docs/ANDROID_AAB_BUILD.md"
print_status "   • Google Play Console: https://play.google.com/console"

echo ""
print_status "🎉 Complete Android build and signing process finished!"
print_status "All signed files are ready for distribution."
