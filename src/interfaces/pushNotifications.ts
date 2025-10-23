export interface RegisterPushTokenPayload {
  token: string;
  platform: string;
  appVersion?: string;
  user: string;
}
