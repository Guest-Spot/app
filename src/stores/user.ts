import { defineStore } from 'pinia';
import type { IUser, IProfile, IAuthState } from 'src/interfaces/user';

export const useUserStore = defineStore('user', {
  state: (): IAuthState => ({
    user: null,
    profile: null,
    isAuthenticated: false,
    isLoading: false,
    isShop: false,
    isArtist: false,
    isGuest: false,
    tokens: null,
  }),

  getters: {
    getUser: (state) => state.user,
    getProfile: (state) => state.profile,
    getIsAuthenticated: (state) => state.isAuthenticated,
    getIsLoading: (state) => state.isLoading,
    getIsShop: (state) => state.isShop,
    getIsArtist: (state) => state.isArtist,
    getIsGuest: (state) => state.isGuest,
    getTokens: (state) => state.tokens,

    // Derived getters
    getUserEmail: (state) => state.user?.email || '',
    getUserId: (state) => state.user?.id || '',
    getFullName: (state) => state.profile?.fullname || '',
    getUserType: (state) => state.profile?.type || null,
  },

  actions: {
    /**
     * Set user data
     */
    setUser(userData: IUser | null) {
      this.user = userData;
    },

    /**
     * Set user profile
     */
    setProfile(profileData: IProfile | null) {
      this.profile = profileData;
    },

    /**
     * Set authentication status
     */
    setIsAuthenticated(isAuthenticated: boolean) {
      this.isAuthenticated = isAuthenticated;
    },

    /**
     * Set loading state
     */
    setIsLoading(isLoading: boolean) {
      this.isLoading = isLoading;
    },

    /**
     * Set user type flags
     */
    setIsShop(isShop: boolean) {
      this.isShop = isShop;
    },

    setIsArtist(isArtist: boolean) {
      this.isArtist = isArtist;
    },

    setIsGuest(isGuest: boolean) {
      this.isGuest = isGuest;
    },

    /**
     * Complete logout - clear all user data
     */
    logout() {
      this.user = null;
      this.profile = null;
      this.isAuthenticated = false;
      this.isLoading = false;
      this.isShop = false;
      this.isArtist = false;
      this.isGuest = false;
      this.tokens = null;
    },

    /**
     * Reset user type flags
     */
    resetUserTypes() {
      this.isShop = false;
      this.isArtist = false;
      this.isGuest = false;
    },
  },
});
