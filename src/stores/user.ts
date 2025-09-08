import { defineStore } from 'pinia';
import type { User } from '@supabase/supabase-js';

interface IState {
  isAuthenticated: boolean;
  user: User | null;
  isShop: boolean;
  isArtist: boolean;
  isGuest: boolean;
}

export const useUserStore = defineStore('user', {
  state: (): IState => ({
    user: null,
    isAuthenticated: false,
    isShop: false,
    isArtist: false,
    isGuest: false,
  }),

  getters: {
    getUser: (state) => state.user,
    getIsAuthenticated: (state) => state.isAuthenticated,
    getIsShop: (state) => state.isShop,
    getIsArtist: (state) => state.isArtist,
    getIsGuest: (state) => state.isGuest,
  },

  actions: {
    setUser(userData: User | null) {
      this.user = userData;
    },
    setIsAuthenticated(isAuthenticated: boolean) {
      this.isAuthenticated = isAuthenticated;
    },
    setIsShop(isShop: boolean) {
      this.isShop = isShop;
    },
    setIsArtist(isArtist: boolean) {
      this.isArtist = isArtist;
    },
    setIsGuest(isGuest: boolean) {
      this.isGuest = isGuest;
    },
  },
});
