import { defineStore } from 'pinia';
import type { IArtist } from 'src/interfaces/artist';
import type { IShop } from 'src/interfaces/shop';
import type { IUser } from 'src/interfaces/user';
import { UserType } from 'src/interfaces/enums';

interface IProfileState {
  shopProfile: IShop | null;
  artistProfile: IArtist | null;
  isLoading: boolean;
  error: string | null;
}

export const useProfileStore = defineStore('profile', {
  state: (): IProfileState => ({
    shopProfile: null,
    artistProfile: null,
    isLoading: false,
    error: null,
  }),

  getters: {
    getShopProfile: (state) => state.shopProfile,
    getArtistProfile: (state) => state.artistProfile,
    getIsLoading: (state) => state.isLoading,
    getError: (state) => state.error,
  },

  actions: {
    /**
     * Set user profile based on user type
     */
    setUserProfile(user: IUser) {
      if (user.type === UserType.Shop) {
        this.setShopProfile((user.profile as IShop) || null);
      } else if (user.type === UserType.Artist) {
        this.setArtistProfile((user.profile as IArtist) || null);
      }
    },

    /**
     * Set shop profile data
     */
    setShopProfile(profile: IShop | null) {
      this.shopProfile = profile;
    },

    /**
     * Set artist profile data
     */
    setArtistProfile(profile: IArtist | null) {
      this.artistProfile = profile;
    },

    /**
     * Set loading state
     */
    setIsLoading(isLoading: boolean) {
      this.isLoading = isLoading;
    },

    /**
     * Set error message
     */
    setError(error: string | null) {
      this.error = error;
    },

    /**
     * Clear profile data
     */
    clearProfile() {
      this.shopProfile = null;
      this.artistProfile = null;
      this.error = null;
    },
  },
});
