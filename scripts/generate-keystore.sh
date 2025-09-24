#!/bin/bash

# Script to generate a keystore file for Android APK/AAB signing
# This script creates a JKS keystore file for signing Android applications

set -e  # Exit on any error

echo "🔐 Starting keystore generation process..."

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
KEYSTORE_VALIDITY="10000"  # 10000 days (~27 years)
KEYSTORE_ALGORITHM="RSA"
KEYSTORE_KEYSIZE="2048"

# Check if keystore already exists
if [ -f "$KEYSTORE_PATH" ]; then
    print_warning "Keystore file already exists at $KEYSTORE_PATH"
    print_question "Do you want to overwrite it? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        print_status "Keystore generation cancelled"
        exit 0
    fi
    
    # Backup existing keystore
    BACKUP_PATH="${KEYSTORE_PATH}.backup.$(date +%Y%m%d_%H%M%S)"
    print_status "Backing up existing keystore to $BACKUP_PATH"
    cp "$KEYSTORE_PATH" "$BACKUP_PATH"
fi

# Check if keytool is available
if ! command -v keytool &> /dev/null; then
    print_error "keytool not found. Please install Java Development Kit (JDK)"
    print_error "On macOS: brew install openjdk"
    print_error "On Ubuntu: sudo apt-get install openjdk-11-jdk"
    exit 1
fi

print_status "keytool found: $(which keytool)"

# Create Android directory if it doesn't exist
mkdir -p "$(dirname "$KEYSTORE_PATH")"

print_status "Generating keystore file..."
print_status "Keystore path: $KEYSTORE_PATH"
print_status "Key alias: $KEYSTORE_ALIAS"
print_status "Validity: $KEYSTORE_VALIDITY days"
print_status "Algorithm: $KEYSTORE_ALGORITHM"
print_status "Key size: $KEYSTORE_KEYSIZE bits"

echo ""
print_warning "You will be prompted to enter the following information:"
print_warning "1. Keystore password (store password)"
print_warning "2. Key password (can be the same as keystore password)"
print_warning "3. Your name and organizational information"
print_warning ""
print_warning "IMPORTANT: Remember these passwords! You'll need them for future builds."
print_warning ""

# Generate the keystore
keytool -genkey -v \
    -keystore "$KEYSTORE_PATH" \
    -keyalg "$KEYSTORE_ALGORITHM" \
    -keysize "$KEYSTORE_KEYSIZE" \
    -validity "$KEYSTORE_VALIDITY" \
    -alias "$KEYSTORE_ALIAS" \
    -storetype JKS

# Check if keystore was created successfully
if [ -f "$KEYSTORE_PATH" ]; then
    print_status "✅ Keystore file created successfully!"
    print_status "📁 Location: $KEYSTORE_PATH"
    
    # Get file size
    FILE_SIZE=$(du -h "$KEYSTORE_PATH" | cut -f1)
    print_status "📊 Keystore file size: $FILE_SIZE"
    
    # Set proper permissions
    chmod 600 "$KEYSTORE_PATH"
    print_status "🔒 Set secure permissions (600) on keystore file"
    
else
    print_error "Failed to create keystore file"
    exit 1
fi

# Create or update local.properties with keystore information
LOCAL_PROPERTIES="src-capacitor/android/local.properties"
print_status "Updating local.properties with keystore information..."

# Create local.properties if it doesn't exist
if [ ! -f "$LOCAL_PROPERTIES" ]; then
    print_status "Creating local.properties file..."
    touch "$LOCAL_PROPERTIES"
fi

# Add keystore configuration to local.properties
print_status "Adding keystore configuration to local.properties..."

# Remove existing keystore configuration
sed -i.bak '/^RELEASE_STORE_FILE=/d' "$LOCAL_PROPERTIES" 2>/dev/null || true
sed -i.bak '/^RELEASE_KEY_ALIAS=/d' "$LOCAL_PROPERTIES" 2>/dev/null || true
sed -i.bak '/^RELEASE_STORE_PASSWORD=/d' "$LOCAL_PROPERTIES" 2>/dev/null || true
sed -i.bak '/^RELEASE_KEY_PASSWORD=/d' "$LOCAL_PROPERTIES" 2>/dev/null || true

# Add new configuration
echo "" >> "$LOCAL_PROPERTIES"
echo "# Keystore configuration for release builds" >> "$LOCAL_PROPERTIES"
echo "RELEASE_STORE_FILE=guest-spot-key.jks" >> "$LOCAL_PROPERTIES"
echo "RELEASE_KEY_ALIAS=$KEYSTORE_ALIAS" >> "$LOCAL_PROPERTIES"
echo "RELEASE_STORE_PASSWORD=your_store_password_here" >> "$LOCAL_PROPERTIES"
echo "RELEASE_KEY_PASSWORD=your_key_password_here" >> "$LOCAL_PROPERTIES"

# Clean up backup file
rm -f "${LOCAL_PROPERTIES}.bak" 2>/dev/null || true

print_status "✅ local.properties updated with keystore configuration"
print_warning "⚠️  IMPORTANT: Update the passwords in local.properties with your actual passwords!"

echo ""
print_status "🎉 Keystore generation completed successfully!"
print_status ""
print_status "📋 Next steps:"
print_status "1. Update passwords in $LOCAL_PROPERTIES"
print_status "2. Run ./scripts/build-aab.sh to build signed AAB/APK files"
print_status "3. Keep your keystore file and passwords secure!"
print_status ""
print_status "🔐 Security reminders:"
print_status "   • Never commit the keystore file to version control"
print_status "   • Store passwords securely (password manager recommended)"
print_status "   • Keep a backup of your keystore file in a safe location"
print_status "   • The same keystore must be used for all future app updates"
