import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosInstance } from 'axios';
import { API_URL } from 'src/config/constants';
import { useTokens } from 'src/modules/useTokens';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const axiosParams = {
  baseURL: API_URL ?? '',
  headers: {
    'Content-Type': 'application/json',
  },
};

const api = axios.create(axiosParams);

api.interceptors.request.use(
  (request) => {
    const { getStoredTokens } = useTokens();
    const tokens = getStoredTokens();
    const accessToken = tokens?.accessToken;
    if (accessToken) {
      request.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return request;
  },
  (error) => {
    return Promise.reject(error as Error);
  },
);

api.interceptors.response.use(
  (response) => response, // Directly return successful responses.
  async (error) => {
    const { getStoredTokens, clearTokens, storeTokens } = useTokens();
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark the request as retried to avoid infinite loops.
      try {
        const tokens = getStoredTokens();

        // Make a request to your auth server to refresh the token.
        const response = await axios.post(`${API_URL}/api/auth/refreshToken`, {
          refreshToken: tokens?.refreshToken,
        });
        const { jwt: accessToken, refreshToken: newRefreshToken } = response.data;
        // Store the new access and refresh tokens.
        storeTokens({ accessToken, refreshToken: newRefreshToken });
        // Update the authorization header with the new access token.
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        return api(originalRequest); // Retry the original request with the new access token.
      } catch (refreshError) {
        // Handle refresh token errors by clearing stored tokens and redirecting to the login page.
        console.error('Token refresh failed:', refreshError);
        clearTokens();
        return Promise.reject(refreshError as Error);
      }
    }
    return Promise.reject(error as Error); // For all other errors, return the error as is.
  },
);

export default defineBoot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { api };
