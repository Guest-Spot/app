import { useUserStore } from 'src/stores/user';
import { computed } from 'vue';
import { useMutation, useLazyQuery } from '@vue/apollo-composable';
import {
  type IUser,
  type ILoginResponse,
  type IMeResponse,
  type IJWTTokens,
  UserType
} from 'src/interfaces/user';
import { useTokens } from 'src/modules/useTokens';
import { LOGIN_MUTATION, ME_QUERY, LOGOUT_MUTATION } from 'src/apollo/types/user';

/**
 * User Management Module
 * Handles authentication, user data and JWT tokens through GraphQL
 */
const useUser = () => {
  const userStore = useUserStore();
  const { storeTokens, clearTokens, isAuthenticated: hasTokens, getStoredTokens } = useTokens();

  // Computed getters
  const user = computed(() => userStore.getUser);
  const profile = computed(() => userStore.getProfile);
  const isShop = computed(() => userStore.getIsShop);
  const isArtist = computed(() => userStore.getIsArtist);
  const isGuest = computed(() => userStore.getIsGuest);
  const isAuthenticated = computed(() => userStore.getIsAuthenticated);
  const isLoading = computed(() => userStore.getIsLoading);

  // GraphQL composables
  const { mutate: loginMutation } = useMutation<ILoginResponse>(LOGIN_MUTATION);
  const { mutate: logoutMutation } = useMutation(LOGOUT_MUTATION);
  /**
   * Login user with email and password
   */
  const login = async (
    identifier: string,
    password: string
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
        throw new Error('Login failed: No data received');
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

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
    } finally {
      userStore.setIsLoading(false);
    }
  };

  /**
   * Fetch current user from API
   */
  const fetchMe = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      userStore.setIsLoading(true);

      // Use Apollo query with current context (token will be added by authLink)
      const { result, load } = useLazyQuery<IMeResponse>(ME_QUERY, {}, {
        fetchPolicy: 'network-only', // Always fetch fresh data
      });

      await load();

      if (result.value?.me) {
        updateUserState(result.value.me);
        return { success: true };
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Fetch me error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user'
      };
    } finally {
      userStore.setIsLoading(false);
    }
  };

  /**
   * Restore user session from stored tokens
   */
  const restoreSession = async (): Promise<void> => {
    try {
      if (!hasTokens()) {
        console.log('No tokens found, user not authenticated');
        return;
      }

      // Try to fetch fresh user data
      const { success } = await fetchMe();
      if (!success) {
        console.log('Failed to restore session, tokens may be invalid');
        void logout();
      }
    } catch (error) {
      console.error('Session restore error:', error);
      void logout();
    }
  };

  /**
   * Update user state in store
   */
  const updateUserState = (userData: IUser): void => {
    userStore.setUser(userData);
    userStore.setIsAuthenticated(true);

    if (userData.profile) {
      userStore.setProfile(userData.profile);
      userStore.setIsShop(userData.profile.type === UserType.Shop);
      userStore.setIsArtist(userData.profile.type === UserType.Artist);
      userStore.setIsGuest(userData.profile.type === UserType.Guest);
    }
  };

  /**
   * Logout user and clear all data
   */
  const logout = async (): Promise<void> => {
    try {
      await logoutMutation({ input: { refreshToken: getStoredTokens()?.refreshToken } });

      // Clear tokens
      clearTokens();

      // Clear store
      userStore.logout();

      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Force clear even if error occurs
      clearTokens();
      userStore.logout();
    }
  };

  return {
    // State
    user,
    profile,
    isShop,
    isArtist,
    isGuest,
    isAuthenticated,
    isLoading,

    // Actions
    login,
    logout,
    fetchMe,
    restoreSession,
  };
};

export default useUser;
