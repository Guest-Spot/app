import { Capacitor } from '@capacitor/core';
import {
  PushNotifications,
  type ActionPerformed,
  type PushNotificationSchema,
  type Token,
} from '@capacitor/push-notifications';
import { ref } from 'vue';
import { registerPushToken, unregisterPushToken } from 'src/api/pushNotifications';
import { useUserStore } from 'src/stores/user';

const hasRegisteredListeners = ref(false);
const currentToken = ref<string | null>(null);
const lastSyncedToken = ref<string | null>(null);
let isRegistering = false;

const isNative = () => Capacitor.isNativePlatform?.() ?? Capacitor.getPlatform() !== 'web';

/**
 * Configure Android notification channel with sane defaults.
 */
const configureAndroidChannel = async () => {
  if (Capacitor.getPlatform() !== 'android') {
    return;
  }

  try {
    await PushNotifications.createChannel({
      id: 'guestspot-default',
      name: 'General notifications',
      description: 'General GuestSpot notifications',
      importance: 4,
      visibility: 1,
    });
  } catch (error) {
    console.error('Failed to create Android notification channel', error);
  }
};

/**
 * Register listeners once to keep track of the token and notification events.
 */
const registerListeners = () => {
  if (hasRegisteredListeners.value) {
    return;
  }

  void PushNotifications.addListener('registration', (token: Token) => {
    currentToken.value = token.value;
    console.log('Push notification token registered', token.value);
    void syncPushTokenWithBackend();
  });

  void PushNotifications.addListener('registrationError', (error) => {
    console.error('Push registration error', error);
  });

  void PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
    console.log('Push notification received', notification);
  });

  void PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
    console.log('Push notification action performed', action);
  });

  hasRegisteredListeners.value = true;
};

/**
 * Request permissions and register the device to receive push notifications.
 */
export const initializePushNotifications = async (): Promise<void> => {
  if (!isNative() || isRegistering) {
    return;
  }

  try {
    isRegistering = true;

    const permissionStatus = await PushNotifications.checkPermissions();
    let receiveStatus = permissionStatus.receive;

    if (receiveStatus !== 'granted') {
      const requestStatus = await PushNotifications.requestPermissions();
      receiveStatus = requestStatus.receive;
    }

    if (receiveStatus !== 'granted') {
      console.warn('Push notification permission was not granted');
      return;
    }

    registerListeners();

    await configureAndroidChannel();

    await PushNotifications.register();
  } catch (error) {
    console.error('Failed to initialize push notifications', error);
  } finally {
    isRegistering = false;
  }
};

/**
 * Send the current token to the backend if available and the user is authenticated.
 */
export const syncPushTokenWithBackend = async (force = false): Promise<void> => {
  if (!isNative()) {
    return;
  }

  const token = currentToken.value;
  if (!token) {
    return;
  }

  const userStore = useUserStore();
  if (!userStore.getIsAuthenticated) {
    return;
  }

  if (!force && lastSyncedToken.value === token) {
    return;
  }

  if (userStore.getUser?.device_tokens?.find((device) => device.token === token)) {
    return;
  }

  try {
    await registerPushToken({
      token,
      platform: Capacitor.getPlatform(),
      appVersion: process.env.APP_VERSION ?? '1.0.0',
      user: userStore.getUser?.documentId ?? '',
    });
    lastSyncedToken.value = token;
  } catch (error) {
    console.error('Failed to sync push token with backend', error);
  }
};

/**
 * Remove the token from backend when user logs out or disables notifications.
 */
export const removePushTokenFromBackend = async (documentId: string): Promise<void> => {
  if (!isNative()) {
    return;
  }

  try {
    await unregisterPushToken(documentId);
  } catch (error) {
    console.error('Failed to unregister push token on backend', error);
  }
};
