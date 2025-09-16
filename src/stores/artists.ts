import { defineStore } from 'pinia';
import type { IArtist } from 'src/interfaces/artist';

export const useArtistsStore = defineStore('artists', {
  state: () => ({
    artists: [] as IArtist[],
    total: 0,
  }),
  getters: {
    getArtists: (state) => state.artists,
    getTotal: (state) => state.total,
  },
  actions: {
    setArtists(artists: IArtist[]) {
      this.artists = artists;
    },
    setTotal(total: number) {
      this.total = total;
    },
    clearArtists() {
      this.artists = [];
    },
  },
});
