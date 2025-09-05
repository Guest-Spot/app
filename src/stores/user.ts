import { defineStore, acceptHMRUpdate } from 'pinia';
import type { IUser } from 'src/interfaces/user';

// Test credentials for development
const TEST_CREDENTIALS = {
  artist: {
    login: 'artist_test',
    password: '123456'
  },
  shop: {
    login: 'shop_test',
    password: '123456'
  }
};

export const useUserStore = defineStore('user', {
  state: (): IUser => ({
    id: '',
    username: '',
    email: '',
    type: 'guest',
    fullname: '',
    avatar: '',
    isAuthenticated: false,
  }),

  getters: {
    isShop: (state) => state.type === 'shop',
    isArtist: (state) => state.type === 'artist',
    userDisplayName: (state) => state.fullname || state.username,
    getUser: (state) => state,
  },

  actions: {
    // Initialize store from localStorage on app start
    initFromStorage() {
      const storedUser = localStorage.getItem('guestspot_user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          this.login(userData);
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          this.clearStorage();
        }
      }
    },

    // Save user data to localStorage
    saveToStorage() {
      const userData = {
        id: this.id,
        username: this.username,
        email: this.email,
        type: this.type,
        fullname: this.fullname,
        avatar: this.avatar,
        isAuthenticated: this.isAuthenticated,
      };
      localStorage.setItem('guestspot_user', JSON.stringify(userData));
    },

    // Clear user data from localStorage
    clearStorage() {
      localStorage.removeItem('guestspot_user');
    },

    login(userData: Partial<IUser>) {
      this.id = userData.id || '';
      this.username = userData.username || '';
      this.email = userData.email || '';
      this.type = userData.type || 'guest';
      this.fullname = userData.fullname || '';
      this.avatar = userData.avatar || '';
      this.isAuthenticated = true;

      // Save to localStorage
      this.saveToStorage();
    },

    logout() {
      this.id = '';
      this.username = '';
      this.email = '';
      this.type = 'guest';
      this.fullname = '';
      this.avatar = '';
      this.isAuthenticated = false;

      // Clear from localStorage
      this.clearStorage();
    },

    updateProfile(profileData: Partial<IUser>) {
      Object.assign(this, profileData);
      this.saveToStorage();
    },

    // Test authentication methods
    authenticateTestUser(login: string, password: string, userType: 'shop' | 'artist'): boolean {
      const credentials = TEST_CREDENTIALS[userType];

      if (credentials.login === login && credentials.password === password) {
        if (userType === 'shop') {
          this.loginAsShop();
        } else {
          this.loginAsArtist();
        }
        return true;
      }
      return false;
    },

    // Mock login methods for testing
    loginAsShop() {
      this.login({
        id: 'shop_001',
        username: 'shop_test',
        email: 'shop@example.com',
        type: 'shop',
        fullname: 'Test Shop Manager',
        isAuthenticated: true,
      });
    },

    loginAsArtist() {
      this.login({
        id: 'artist_001',
        username: 'artist_test',
        email: 'artist@example.com',
        type: 'artist',
        fullname: 'Test Artist',
        isAuthenticated: true,
      });
    },

    // Get test credentials for UI
    getTestCredentials(userType: 'shop' | 'artist') {
      return TEST_CREDENTIALS[userType];
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}
