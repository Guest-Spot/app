import { AxiosError } from 'axios';
import { Capacitor } from '@capacitor/core';
import { useRouter } from 'vue-router';
import { type Ref } from 'vue';
import { GoogleAuth, type InitOptions } from '@codetrix-studio/capacitor-google-auth';
import { API_URL, GOOGLE_WEB_CLIENT_ID } from 'src/config/constants';
import { connect } from 'src/api/auth';
import useUser from 'src/modules/useUser';
import useNotify from 'src/modules/useNotify';
import { useProfileStore } from 'src/stores/profile';

export type GoogleSignInResult =
  | {
      type: 'native';
      accessToken: string;
    }
  | {
      type: 'web';
      redirectUrl: string;
    };

const GOOGLE_SCOPES = ['profile', 'email'];

const isPluginAvailable = () => Capacitor.isPluginAvailable('GoogleAuth');

const isNativeGoogleAuth = () => Capacitor.isNativePlatform() && isPluginAvailable();

const buildRedirectUrl = () => `${API_URL}/api/connect/google`;

const initializeGoogleAuth = async () => {
  if (!isPluginAvailable()) {
    return;
  }

  const options: InitOptions = {
    scopes: GOOGLE_SCOPES,
  };

  if (GOOGLE_WEB_CLIENT_ID) {
    options.clientId = GOOGLE_WEB_CLIENT_ID;
  }

  try {
    await GoogleAuth.initialize(options);
  } catch (error) {
    console.error('Failed to initialize GoogleAuth plugin', error);
  }
};

const signInWithGoogle = async (): Promise<GoogleSignInResult> => {
  if (!isNativeGoogleAuth()) {
    return {
      type: 'web',
      redirectUrl: buildRedirectUrl(),
    };
  }

  const googleUser = await GoogleAuth.signIn();
  const accessToken = googleUser?.authentication?.accessToken;

  if (!accessToken) {
    throw new Error('Missing Google access token');
  }

  return {
    type: 'native',
    accessToken,
  };
};

interface UseGoogleAuthOptions {
  loadingRef?: Ref<boolean>;
  fallbackMessage?: string;
  successRedirect?: string;
}

const DEFAULT_FALLBACK_MESSAGE = 'Google sign-in failed. Please try again.';
const DEFAULT_SUCCESS_REDIRECT = '/profile';

export const useGoogleAuth = (options: UseGoogleAuthOptions = {}) => {
  const { loadingRef, fallbackMessage = DEFAULT_FALLBACK_MESSAGE, successRedirect = DEFAULT_SUCCESS_REDIRECT } = options;
  const { fetchMe } = useUser();
  const profileStore = useProfileStore();
  const { showSuccess, showError } = useNotify();
  const router = useRouter();

  const setLoading = (value: boolean) => {
    if (loadingRef) {
      loadingRef.value = value;
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);

    try {
      const result = await signInWithGoogle();

      if (result.type === 'web') {
        if (typeof window !== 'undefined') {
          window.location.href = result.redirectUrl;
        }
        return;
      }

      const accessToken = result.accessToken;
      if (!accessToken) {
        throw new Error('Missing Google access token');
      }

      const url = `/api/auth/google/callback?access_token=${encodeURIComponent(accessToken)}&provider=google`;
      await connect(url);

      const userData = await fetchMe();
      if (userData) {
        profileStore.setUserProfile(userData);
      }

      showSuccess('Login successful');
      setTimeout(() => {
        void router.push(successRedirect);
      }, 500);
    } catch (error) {
      console.error('Google sign-in error:', error);
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.error?.details?.message || fallbackMessage
          : fallbackMessage;
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    initializeGoogleAuth,
    handleGoogleSignIn,
  };
};

export default useGoogleAuth;
