import { defineStore } from 'pinia';
import type { IUser } from 'src/interfaces/user';

export const useShopsStore = defineStore('shops', {
  state: () => ({
    shops: [] as IUser[],
    total: 0,
    page: 1,
    hasMore: true,
  }),
  getters: {
    getShops: (state) => state.shops,
    getTotal: (state) => state.total,
    getPage: (state) => state.page,
    getHasMore: (state) => state.hasMore,
  },
  actions: {
    setShops(shops: IUser[]) {
      this.shops = shops;
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
    clearShops() {
      this.shops = [];
    },
  },
});
