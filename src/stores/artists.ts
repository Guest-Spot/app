import { defineStore } from 'pinia';
import type { IArtist } from 'src/interfaces/artist';

export const useArtistsStore = defineStore('artists', {
  state: () => ({
    artists: [] as IArtist[],
  }),
  getters: {
    getArtists: (state) => state.artists,
  },
  actions: {
    setArtists(artists: IArtist[]) {
      this.artists = artists;
    },
    addArtists(artists: IArtist[]) {
      this.artists.push(...artists);
    },
    clearArtists() {
      this.artists = [];
    },
  },
});
