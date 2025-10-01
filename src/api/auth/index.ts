import { api } from 'src/boot/axios';
import type { IJWTTokens } from 'src/interfaces/user';
import { useTokens } from 'src/modules/useTokens';
import { useUserStore } from 'src/stores/user';

/**
 * Connect with Google
 * @param url - Google URL
 * @returns Promise with connect data
 */
export async function connect(url: string) {
  if (!url) {
    throw new Error('Connect failed: No URL provided');
  }

  const { storeTokens } = useTokens();
  const userStore = useUserStore();

  try {
    const response = await api.get(url);

    if (!response?.data) {
      throw new Error('Connect failed: No data received');
    }

    const { jwt, refreshToken, user: userData } = response.data;

    // Store tokens
    const tokens: IJWTTokens = {
      accessToken: jwt,
      refreshToken,
    };
    storeTokens(tokens);

    // Update store
    userStore.setUser(userData);
    userStore.setIsAuthenticated(true);

    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  } finally {
    userStore.setIsLoading(false);
  }
}
