import { defineStore } from 'pinia';
import type { IUser, IAuthState } from 'src/interfaces/user';
import type { IShop } from 'src/interfaces/shop';
import type { IArtist } from 'src/interfaces/artist';

export const useUserStore = defineStore('user', {
  state: (): IAuthState<IShop | IArtist> => ({
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
  },

  actions: {
    /**
     * Set user data
     */
    setUser(userData: IUser<IShop | IArtist> | null) {
      this.user = userData;
    },

    /**
     * Set user profile
     */
    setProfile(profileData: IShop | IArtist | null) {
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
