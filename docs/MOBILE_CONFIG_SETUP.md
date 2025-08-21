# 📱 Mobile Configuration Setup for Quasar v2

This guide explains how to properly configure mobile development with Quasar v2 for both Cordova and Capacitor.

## 🔧 Important Note for Quasar v2

In Quasar v2, the mobile configuration in `quasar.config.ts` is simplified. The detailed configuration options are moved to platform-specific configuration files:

- **Cordova**: `src-cordova/config.xml`
- **Capacitor**: `src-capacitor/capacitor.config.json`

## 📋 Current Configuration

### quasar.config.ts (Simplified)
```typescript
// Cordova configuration - minimal in Quasar v2
cordova: {
  // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
},

// Capacitor configuration - minimal in Quasar v2
capacitor: {
  hideSplashscreen: true,
},
```

## 🎯 Platform-Specific Configuration

### Cordova Configuration (src-cordova/config.xml)
The `config.xml` file contains all Cordova-specific settings:

- **App metadata**: ID, name, description, author
- **Platform-specific settings**: Android and iOS configurations
- **Plugin configurations**: Device, network, splash screen, status bar, whitelist
- **Permissions**: Network access, camera, location, etc.
- **Icons and splash screens**: Platform-specific image resources

### Capacitor Configuration (src-capacitor/capacitor.config.json)
The `capacitor.config.json` file contains all Capacitor-specific settings:

- **App metadata**: ID, name, web directory
- **Server settings**: Development server configuration
- **Plugin configurations**: Splash screen, status bar, device, haptics, keyboard
- **Platform-specific settings**: iOS and Android configurations

## 🚀 Setup Commands

### 1. Add Mobile Mode
```bash
# For Cordova
yarn mobile:add

# For Capacitor
yarn capacitor:add
```

### 2. Add Platforms
```bash
# Cordova
cd src-cordova
cordova platform add android
cordova platform add ios
cd ..

# Capacitor
cd src-capacitor
npx cap add android
npx cap add ios
cd ..
```

### 3. Development Commands
```bash
# Cordova
yarn mobile:dev          # Development mode
yarn mobile:run:android  # Run on Android
yarn mobile:run:ios      # Run on iOS

# Capacitor
yarn capacitor:dev       # Development mode
yarn capacitor:run:android # Run on Android
yarn capacitor:run:ios   # Run on iOS
```

## 🔍 Configuration Details

### Cordova Plugins (in config.xml)
```xml
<plugin name="cordova-plugin-device" spec="~2.1.0" />
<plugin name="cordova-plugin-network-information" spec="~3.0.0" />
<plugin name="cordova-plugin-splashscreen" spec="~6.1.0" />
<plugin name="cordova-plugin-statusbar" spec="~3.1.0" />
<plugin name="cordova-plugin-whitelist" spec="~1.3.5" />
```

### Capacitor Plugins (in capacitor.config.json)
```json
{
  "plugins": {
    "SplashScreen": { /* splash screen settings */ },
    "StatusBar": { /* status bar settings */ },
    "Device": { /* device info settings */ },
    "Haptics": { /* haptic feedback settings */ },
    "Keyboard": { /* keyboard settings */ }
  }
}
```

## 📱 Platform-Specific Settings

### Android Settings
- **Cordova**: Configured in `config.xml` with platform-specific elements
- **Capacitor**: Configured in `capacitor.config.json` under `android` section

### iOS Settings
- **Cordova**: Configured in `config.xml` with platform-specific elements
- **Capacitor**: Configured in `capacitor.config.json` under `ios` section

## 🎨 Customization

### Adding New Plugins
```bash
# Cordova
cd src-cordova
cordova plugin add cordova-plugin-camera
cd ..

# Capacitor
cd src-capacitor
npx cap add @capacitor/camera
cd ..
```

### Custom Icons and Splash Screens
- **Cordova**: Place images in `src-cordova/res/` directory
- **Capacitor**: Place images in platform-specific directories

## 🚨 Troubleshooting

### Common Issues
1. **Configuration not applied**: Check platform-specific config files
2. **Plugins not working**: Ensure plugins are added to both Quasar and platform configs
3. **Build failures**: Run `yarn mobile:clean` or `yarn capacitor:clean`

### Debug Commands
```bash
# Check platform status
cd src-cordova && cordova platform list
cd src-capacitor && npx cap ls

# Check plugin status
cd src-cordova && cordova plugin list
cd src-capacitor && npx cap ls plugins
```

## 📚 Additional Resources

- [Quasar v2 Mobile Development Guide](https://v2.quasar.dev/quasar-cli-vite/developing-mobile-apps/introduction)
- [Cordova Documentation](https://cordova.apache.org/docs/en/latest/)
- [Capacitor Documentation](https://capacitorjs.com/docs)

## 🔄 Migration from Quasar v1

If migrating from Quasar v1:
1. Remove detailed mobile config from `quasar.config.ts`
2. Create platform-specific configuration files
3. Update build and run commands
4. Test mobile functionality

---

**Note**: This configuration approach in Quasar v2 provides better separation of concerns and makes it easier to maintain platform-specific settings while keeping the main Quasar configuration clean and focused.
