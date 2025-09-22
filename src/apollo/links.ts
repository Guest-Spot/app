import { ApolloLink, fromPromise } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { createHttpLink } from '@apollo/client/link/http';
import { useTokens } from 'src/modules/useTokens';
import { useUserStore } from 'src/stores/user';
import { REFRESH_TOKEN_MUTATION, LOGOUT_MUTATION } from './types/user';

const GRAPHQL_URL = `${process.env.API_URL}/graphql`;

/**
 * Auth Link - adds JWT token to requests
 */
export const authLink = setContext((_, { headers }) => {
  const { getStoredTokens } = useTokens();
  const tokens = getStoredTokens();

  return {
    headers: {
      ...headers,
      ...(tokens?.accessToken && { Authorization: `Bearer ${tokens.accessToken}` }),
    },
  };
});

// Global promise to track ongoing token refresh
let refreshTokenPromise: Promise<{ accessToken: string; refreshToken: string } | null> | null =
  null;

/**
 * Error Link - handles 401 errors and token refresh
 */
export const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  const { getStoredTokens, storeTokens, clearTokens } = useTokens();
  const userStore = useUserStore();

  /**
   * Common function to handle token refresh and retry operation
   */
  function handleTokenRefreshAndRetry(logMessage: string) {
    console.log(logMessage);

    // If there's already an ongoing refresh, wait for it
    const refreshPromise = refreshTokenPromise || refreshTokens();

    return fromPromise(
      refreshPromise
        .then((newTokens) => {
          if (newTokens) {
            // Update the operation context with new token
            const oldHeaders = operation.getContext().headers;
            operation.setContext({
              headers: {
                ...oldHeaders,
                Authorization: `Bearer ${newTokens.accessToken}`,
              },
            });
            // Retry the operation
            return forward(operation);
          } else {
            throw new Error('Authentication failed');
          }
        })
        .catch((refreshError) => {
          void handleLogout();
          throw refreshError;
        }),
    ).flatMap(() => forward(operation));
  }

  // Handle GraphQL errors
  if (graphQLErrors) {
    for (const error of graphQLErrors) {
      if (error.extensions?.code === 'UNAUTHENTICATED' || error.message.includes('401')) {
        return handleTokenRefreshAndRetry(
          'Unauthenticated error detected, attempting token refresh...',
        );
      }
    }
  }

  // Handle network errors (401, 403, etc.)
  if (networkError && 'statusCode' in networkError) {
    if (networkError.statusCode === 401) {
      return handleTokenRefreshAndRetry('401 Network error, attempting token refresh...');
    }
  }

  /**
   * Refresh tokens using the refresh token
   */
  async function refreshTokens(): Promise<{ accessToken: string; refreshToken: string } | null> {
    // If there's already an ongoing refresh, return that promise
    if (refreshTokenPromise) {
      return refreshTokenPromise;
    }

    // Create new refresh promise
    refreshTokenPromise = (async () => {
      try {
        const tokens = getStoredTokens();
        if (!tokens?.refreshToken) {
          throw new Error('No refresh token available');
        }

        console.log('Starting token refresh...');

        // Create a simple HTTP request for token refresh (without Apollo to avoid circular dependency)
        const response = await fetch(GRAPHQL_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: REFRESH_TOKEN_MUTATION,
            variables: { input: { refreshToken: tokens.refreshToken } },
          }),
        });

        const result = await response.json();

        if (result.errors || !result.data?.refreshToken) {
          throw new Error('Token refresh failed');
        }

        const newTokens = {
          accessToken: result.data.refreshToken.jwt,
          refreshToken: result.data.refreshToken.refreshToken,
        };

        // Store new tokens
        storeTokens(newTokens);

        console.log('Tokens refreshed successfully');
        return newTokens;
      } catch (error) {
        console.error('Error refreshing tokens:', error);
        return null;
      } finally {
        // Clear the promise after completion (success or failure)
        refreshTokenPromise = null;
      }
    })();

    return refreshTokenPromise;
  }

  /**
   * Handle logout when token refresh fails
   */
  async function handleLogout(): Promise<void> {
    const tokens = getStoredTokens();
    if (!tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: LOGOUT_MUTATION,
        variables: { input: { refreshToken: tokens.refreshToken } },
      }),
    });

    const result = await response.json();
    if (result.errors || !result.data?.logoutWithRefresh) {
      throw new Error('Logout failed');
    }

    clearTokens();
    userStore.logout();
  }
});

/**
 * HTTP Link for GraphQL endpoint
 */
export const httpLink = createHttpLink({
  uri: GRAPHQL_URL,
});

/**
 * Combined Apollo Link chain
 */
export const apolloLinkChain = ApolloLink.from([errorLink, authLink, httpLink]);
