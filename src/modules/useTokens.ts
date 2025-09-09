import { type IJWTTokens, type IAccessTokenPayload } from 'src/interfaces/user';

const TOKEN_STORAGE_KEY = 'guestspot_tokens';
const REFRESH_TOKEN_KEY = 'guestspot_refresh';

/**
 * Token Management Module
 * Provides secure storage, validation and management of JWT tokens
 */
export const useTokens = () => {

  /**
   * Decode JWT payload without verification (for client-side info only)
   */
  const decodeJWT = (token: string): IAccessTokenPayload | null => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const base64Url = parts[1];
      if (!base64Url) return null;

      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode JWT:', error);
      return null;
    }
  };

  /**
   * Check if token is expired (with 30s buffer)
   */
  const isTokenExpired = (token: string): boolean => {
    const payload = decodeJWT(token);
    if (!payload || !payload.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    const bufferTime = 30; // 30 seconds buffer
    return payload.exp <= (currentTime + bufferTime);
  };

  /**
   * Store tokens securely in localStorage
   */
  const storeTokens = (tokens: IJWTTokens): void => {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, tokens.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  };

  /**
   * Retrieve tokens from storage
   */
  const getStoredTokens = (): IJWTTokens | null => {
    try {
      const accessToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (!accessToken || !refreshToken) return null;

      return { accessToken, refreshToken };
    } catch (error) {
      console.error('Failed to retrieve tokens:', error);
      return null;
    }
  };

  /**
   * Get valid access token (refresh if needed)
   */
  const getValidAccessToken = (): string | null => {
    const tokens = getStoredTokens();
    if (!tokens) return null;

    // If access token is still valid, return it
    if (!isTokenExpired(tokens.accessToken)) {
      return tokens.accessToken;
    }

    // Access token expired, need refresh (handled by Apollo interceptor)
    return null;
  };

  /**
   * Clear all stored tokens
   */
  const clearTokens = (): void => {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  };

  /**
   * Get user info from current access token
   */
  const getCurrentUserInfo = (): IAccessTokenPayload | null => {
    const tokens = getStoredTokens();
    if (!tokens) return null;

    return decodeJWT(tokens.accessToken);
  };

  /**
   * Check if user is authenticated (has valid tokens)
   */
  const isAuthenticated = (): boolean => {
    const tokens = getStoredTokens();
    return tokens !== null;
  };

  return {
    storeTokens,
    getStoredTokens,
    getValidAccessToken,
    clearTokens,
    getCurrentUserInfo,
    isAuthenticated,
    isTokenExpired,
    decodeJWT,
  };
};

export default useTokens;
