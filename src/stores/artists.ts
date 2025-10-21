import { defineStore } from 'pinia';
import type { IUser } from 'src/interfaces/user';

export const useArtistsStore = defineStore('artists', {
  state: () => ({
    artists: [] as IUser[],
    total: 0,
    page: 1,
    hasMore: true,
  }),
  getters: {
    getArtists: (state) => state.artists,
    getTotal: (state) => state.total,
    getPage: (state) => state.page,
    getHasMore: (state) => state.hasMore,
  },
  actions: {
    setArtists(artists: IUser[]) {
      this.artists = artists;
    },
    setTotal(total: number) {
      this.total = total;
    },
    setPage(page: number) {
      this.page = page;
    },
    setHasMore(hasMore: boolean) {
      this.hasMore = hasMore;
    },
    clearArtists() {
      this.artists = [];
    },
  },
});
