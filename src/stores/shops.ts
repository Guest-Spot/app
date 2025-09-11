import { defineStore } from 'pinia';
import type { IShop } from 'src/interfaces/shop';

export const useShopsStore = defineStore('shops', {
  state: () => ({
    shops: [] as IShop[],
  }),
  getters: {
    getShops: (state) => state.shops,
  },
  actions: {
    setShops(shops: IShop[]) {
      this.shops = shops;
    },
  },
});
