import { api } from 'src/boot/axios';
import type {
  RegisterPushTokenPayload,
} from 'src/interfaces/pushNotifications';

/**
 * Send the device push token to the backend for registration.
 */
export async function registerPushToken(payload: RegisterPushTokenPayload): Promise<void> {
  await api.post('/api/device-tokens', { data: payload });
}
