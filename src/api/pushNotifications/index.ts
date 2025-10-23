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

/**
 * Inform the backend that the device push token should be removed.
 */
export async function unregisterPushToken(documentId: string): Promise<void> {
  await api.delete(`/api/device-tokens/${documentId}`);
}
