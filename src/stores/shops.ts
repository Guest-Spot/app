import { defineStore } from 'pinia';
import type { IShop } from 'src/interfaces/shop';

export const useShopsStore = defineStore('shops', {
  state: () => ({
    shops: [] as IShop[],
    total: 0,
  }),
  getters: {
    getShops: (state) => state.shops,
    getTotal: (state) => state.total,
  },
  actions: {
    setShops(shops: IShop[]) {
      this.shops = shops;
    },
    setTotal(total: number) {
      this.total = total;
    },
    clearShops() {
      this.shops = [];
    },
  },
});
