import { defineStore } from 'pinia';
import type { User, Session } from '@supabase/supabase-js';
import type { IProfile } from 'src/interfaces/user';

interface IState {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  profile: IProfile | null;
  isShop: boolean;
  isArtist: boolean;
  isGuest: boolean;
}

export const useUserStore = defineStore('user', {
  state: (): IState => ({
    user: null,
    session: null,
    isAuthenticated: false,
    isShop: false,
    isArtist: false,
    isGuest: false,
    profile: null,
  }),

  getters: {
    getUser: (state) => state.user,
    getSession: (state) => state.session,
    getIsAuthenticated: (state) => state.isAuthenticated,
    getIsShop: (state) => state.isShop,
    getIsArtist: (state) => state.isArtist,
    getIsGuest: (state) => state.isGuest,
    getProfile: (state) => state.profile,
  },

  actions: {
    setUser(userData: User | null) {
      this.user = userData;
    },
    setSession(sessionData: Session | null) {
      this.session = sessionData;
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
    setProfile(profileData: IProfile | null) {
      this.profile = profileData;
    },
  },
});
