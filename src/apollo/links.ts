import { ApolloLink, fromPromise } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { createHttpLink } from '@apollo/client/link/http';
import { useTokens } from 'src/modules/useTokens';
import { useUserStore } from 'src/stores/user';

const GRAPHQL_URL = `${process.env.API_URL}/graphql`;

/**
 * Auth Link - adds JWT token to requests
 */
export const authLink = setContext((_, { headers }) => {
  const { getValidAccessToken } = useTokens();
  const token = getValidAccessToken();

  return {
    headers: {
      ...headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };
});

/**
 * Refresh Token Mutation
 */
const REFRESH_TOKEN_MUTATION = `
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      jwt
      refreshToken
    }
  }
`;

/**
 * Error Link - handles 401 errors and token refresh
 */
export const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  const { getStoredTokens, storeTokens, clearTokens } = useTokens();
  const userStore = useUserStore();

  // Handle GraphQL errors
  if (graphQLErrors) {
    for (const error of graphQLErrors) {
      if (error.extensions?.code === 'UNAUTHENTICATED' || error.message.includes('401')) {
        console.log('Unauthenticated error detected, attempting token refresh...');

        return fromPromise(
          refreshTokens()
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
                // Refresh failed, logout user
                handleLogout();
                throw new Error('Authentication failed');
              }
            })
            .catch((refreshError) => {
              console.error('Token refresh failed:', refreshError);
              handleLogout();
              throw refreshError;
            })
        ).flatMap(() => forward(operation));
      }
    }
  }

  // Handle network errors (401, 403, etc.)
  if (networkError && 'statusCode' in networkError) {
    if (networkError.statusCode === 401) {
      console.log('401 Network error, attempting token refresh...');

      return fromPromise(
        refreshTokens()
          .then((newTokens) => {
            if (newTokens) {
              // Retry the operation with new token
              const oldHeaders = operation.getContext().headers;
              operation.setContext({
                headers: {
                  ...oldHeaders,
                  Authorization: `Bearer ${newTokens.accessToken}`,
                },
              });
              return forward(operation);
            } else {
              handleLogout();
              throw new Error('Authentication failed');
            }
          })
          .catch((refreshError) => {
            console.error('Token refresh failed:', refreshError);
            handleLogout();
            throw refreshError;
          })
      ).flatMap(() => forward(operation));
    }
  }

  /**
   * Refresh tokens using the refresh token
   */
  async function refreshTokens(): Promise<{ accessToken: string; refreshToken: string } | null> {
    try {
      const tokens = getStoredTokens();
      if (!tokens?.refreshToken) {
        throw new Error('No refresh token available');
      }

      // Create a simple HTTP request for token refresh (without Apollo to avoid circular dependency)
      const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: REFRESH_TOKEN_MUTATION,
          variables: { refreshToken: tokens.refreshToken },
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
    }
  }

  /**
   * Handle logout when token refresh fails
   */
  function handleLogout(): void {
    clearTokens();
    userStore.logout();
    // Optional: redirect to login page
    // router.push('/auth/login');
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
export const apolloLinkChain = ApolloLink.from([
  errorLink,
  authLink,
  httpLink,
]);
