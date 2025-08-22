import { defineStore, acceptHMRUpdate } from 'pinia';

export interface User {
  id: string;
  username: string;
  email: string;
  type: 'shop' | 'artist' | 'guest';
  fullname: string;
  avatar?: string;
  isAuthenticated: boolean;
}

export const useUserStore = defineStore('user', {
  state: (): User => ({
    id: '',
    username: '',
    email: '',
    type: 'artist',
    fullname: '',
    avatar: '',
    isAuthenticated: false,
  }),

  getters: {
    isShop: (state) => state.type === 'shop',
    isArtist: (state) => state.type === 'artist',
    userDisplayName: (state) => state.fullname || state.username,
  },

  actions: {
    login(userData: Partial<User>) {
      this.id = userData.id || '';
      this.username = userData.username || '';
      this.email = userData.email || '';
      this.type = userData.type || 'guest';
      this.fullname = userData.fullname || '';
      this.avatar = userData.avatar || '';
      this.isAuthenticated = true;
    },

    logout() {
      this.id = '';
      this.username = '';
      this.email = '';
      this.type = 'guest';
      this.fullname = '';
      this.avatar = '';
      this.isAuthenticated = false;
    },

    updateProfile(profileData: Partial<User>) {
      Object.assign(this, profileData);
    },

    // Mock login methods for testing
    loginAsShop() {
      this.login({
        id: 'shop_001',
        username: 'shop_manager',
        email: 'shop@example.com',
        type: 'shop',
        fullname: 'Shop Manager',
        isAuthenticated: true,
      });
    },

    loginAsArtist() {
      this.login({
        id: 'artist_001',
        username: 'artist_john',
        email: 'john@example.com',
        type: 'artist',
        fullname: 'John Doe',
        isAuthenticated: true,
      });
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}
