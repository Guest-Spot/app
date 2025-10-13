import { defineStore } from 'pinia';
import type { IUser } from 'src/interfaces/user';

export const useArtistsStore = defineStore('artists', {
  state: () => ({
    artists: [] as IUser[],
    total: 0,
    page: 1,
    pageSize: 15,
    hasMore: true,
  }),
  getters: {
    getArtists: (state) => state.artists,
    getTotal: (state) => state.total,
    getPage: (state) => state.page,
    getPageSize: (state) => state.pageSize,
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
    setPageSize(pageSize: number) {
      this.pageSize = pageSize;
    },
    setHasMore(hasMore: boolean) {
      this.hasMore = hasMore;
    },
    clearArtists() {
      this.artists = [];
    },
  },
});
