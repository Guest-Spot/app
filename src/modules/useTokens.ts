import { jwtDecode } from 'jwt-decode';
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
   * Uses jwt-decode library for better reliability and security
   */
  const decodeJWT = (token: string): IAccessTokenPayload | null => {
    try {
      return jwtDecode<IAccessTokenPayload>(token);
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
   * Validates tokens before storing them
   */
  const storeTokens = (tokens: IJWTTokens): void => {
    try {
      // Validate tokens before storing
      if (!tokens.accessToken || !tokens.refreshToken) {
        throw new Error('Invalid tokens: accessToken and refreshToken are required');
      }

      // Validate that tokens are properly formatted JWTs
      const accessPayload = jwtDecode(tokens.accessToken);
      const refreshPayload = jwtDecode(tokens.refreshToken);

      if (!accessPayload || !refreshPayload) {
        throw new Error('Invalid JWT tokens');
      }

      localStorage.setItem(TOKEN_STORAGE_KEY, tokens.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    } catch (error) {
      console.error('Failed to store tokens:', error);
      // Clear any potentially corrupted tokens
      clearTokens();
    }
  };

  /**
   * Retrieve tokens from storage
   * Validates tokens before returning them
   */
  const getStoredTokens = (): IJWTTokens | null => {
    try {
      const accessToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (!accessToken || !refreshToken) return null;

      // Validate that stored tokens are properly formatted JWTs
      try {
        jwtDecode(accessToken);
        jwtDecode(refreshToken);
      } catch {
        console.warn('Stored tokens are corrupted, clearing them');
        clearTokens();
        return null;
      }

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
   * Now checks if refresh token is also not expired
   */
  const isAuthenticated = (): boolean => {
    const tokens = getStoredTokens();
    if (!tokens) return false;

    // Check if refresh token is not expired
    // If refresh token is expired, user needs to login again
    return !isTokenExpired(tokens.refreshToken);
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
