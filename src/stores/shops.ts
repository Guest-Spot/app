import { defineStore } from 'pinia';
import type { IUser } from 'src/interfaces/user';

export const useShopsStore = defineStore('shops', {
  state: () => ({
    shops: [] as IUser[],
    total: 0,
    page: 1,
    pageSize: 15,
    hasMore: true,
  }),
  getters: {
    getShops: (state) => state.shops,
    getTotal: (state) => state.total,
    getPage: (state) => state.page,
    getPageSize: (state) => state.pageSize,
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
    setPageSize(pageSize: number) {
      this.pageSize = pageSize;
    },
    setHasMore(hasMore: boolean) {
      this.hasMore = hasMore;
    },
    clearShops() {
      this.shops = [];
    },
  },
});
