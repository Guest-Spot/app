import { defineStore } from 'pinia';
import type { IPortfolio } from 'src/interfaces/portfolio';

export const usePortfoliosStore = defineStore('portfolios', {
  state: () => ({
    portfolios: [] as IPortfolio[],
    total: 0,
    page: 1,
    hasMore: true,
  }),
  getters: {
    getPortfolios: (state) => state.portfolios,
    getTotal: (state) => state.total,
    getPage: (state) => state.page,
    getHasMore: (state) => state.hasMore,
  },
  actions: {
    setPortfolios(portfolios: IPortfolio[]) {
      this.portfolios = portfolios;
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
    clearPortfolios() {
      this.portfolios = [];
    },
  },
});

