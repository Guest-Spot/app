import { useUserStore } from 'src/stores/user';
import { computed } from 'vue';
import { useMutation, useLazyQuery } from '@vue/apollo-composable';
import {
  type IUser,
  type ILoginResponse,
  type IMeResponse,
  type IJWTTokens,
} from 'src/interfaces/user';
import { UserType } from 'src/interfaces/enums';
import { useTokens } from 'src/modules/useTokens';
import { LOGIN_MUTATION, ME_QUERY, LOGOUT_MUTATION, DELETE_USER_MUTATION } from 'src/apollo/types/user';
import {
  syncPushTokenWithBackend,
} from 'src/modules/usePushNotifications';
import gql from 'graphql-tag';
import { Capacitor } from '@capacitor/core';

/**
 * User Management Module
 * Handles authentication, user data and JWT tokens through GraphQL
 */
const useUser = () => {
  const userStore = useUserStore();
  const { storeTokens, clearTokens, getStoredTokens } = useTokens();

  // Computed getters
  const user = computed(() => userStore.getUser);
  const isShop = computed(() => userStore.getIsShop);
  const isArtist = computed(() => userStore.getIsArtist);
  const isGuest = computed(() => userStore.getIsGuest);
  const isAuthenticated = computed(() => userStore.getIsAuthenticated);
  const isLoading = computed(() => userStore.getIsLoading);

  // GraphQL composables
  const { mutate: loginMutation } = useMutation<ILoginResponse>(LOGIN_MUTATION);
  const { mutate: logoutMutation } = useMutation(gql(LOGOUT_MUTATION));
  const { mutate: deleteUserMutation } = useMutation(DELETE_USER_MUTATION);
  /**
   * Login user with email and password
   */
  const login = async (
    identifier: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      userStore.setIsLoading(true);

      const result = await loginMutation({
        input: {
          identifier,
          password,
        },
      });

      if (!result?.data?.loginWithRefresh) {
        throw new Error(result?.errors?.[0]?.message || 'Login failed');
      }

      const { jwt, refreshToken, user: userData } = result.data.loginWithRefresh;

      // Store tokens
      const tokens: IJWTTokens = {
        accessToken: jwt,
        refreshToken,
      };
      storeTokens(tokens);

      // Update store
      updateUserState(userData);

      await syncPushTokenWithBackend(true);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    } finally {
      userStore.setIsLoading(false);
    }
  };

  /**
   * Fetch current user from API
   */
  const fetchMe = async (): Promise<IUser | null> => {
    try {
      userStore.setIsLoading(true);

      // Use Apollo query with current context (token will be added by authLink)
      const { result, load } = useLazyQuery<IMeResponse>(
        ME_QUERY,
        {},
        {
          fetchPolicy: 'network-only', // Always fetch fresh data
        },
      );

      await load();
      if (result.value?.me) {
        updateUserState(result.value.me);
        await syncPushTokenWithBackend();
        return result.value.me;
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Fetch user error:', error);
      return null;
    } finally {
      userStore.setIsLoading(false);
    }
  };

  /**
   * Update user state in store
   */
  const updateUserState = (userData: IUser): void => {
    userStore.setUser(userData);
    userStore.setIsAuthenticated(true);

    if (userData.type) {
      userStore.setIsShop(userData.type === UserType.Shop);
      userStore.setIsArtist(userData.type === UserType.Artist);
      userStore.setIsGuest(userData.type === UserType.Guest);
    }
  };

  /**
   * Logout user and clear all data
   */
  const logout = async (): Promise<void> => {
    try {
      await logoutMutation({ input: { refreshToken: getStoredTokens()?.refreshToken, platform: Capacitor.getPlatform() } });
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearTokens();
      userStore.logout();
    }
  };

  /**
   * Delete user account
   */
  const deleteAccount = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const userId = user.value?.id;
      if (!userId) {
        return { success: false, error: 'User not found' };
      }

      userStore.setIsLoading(true);

      await deleteUserMutation({
        deleteUsersPermissionsUserId: userId,
      });

      // Perform full logout to clear all tokens and state
      // Note: logoutMutation may fail since account is deleted, but tokens and state will still be cleared
      try {
        await logout();
      } catch {
        // Ignore logout errors since account is already deleted
        // Still clear tokens and state manually to ensure cleanup
        console.log('Logout mutation failed (account already deleted), clearing local state');
        clearTokens();
        userStore.logout();
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Account deletion failed',
      };
    } finally {
      userStore.setIsLoading(false);
    }
  };

  return {
    // State
    user,
    isShop,
    isArtist,
    isGuest,
    isAuthenticated,
    isLoading,

    // Actions
    login,
    logout,
    fetchMe,
    deleteAccount,
  };
};

export default useUser;
