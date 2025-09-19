import { defineStore } from 'pinia';

export const useScrollStore = defineStore('scroll', {
  state: () => ({
    scrollPositions: {},
  }),
  getters: {
    getScrollPositions: (state) => state.scrollPositions,
    getScrollPosition: (state) => (path: string) =>
      state.scrollPositions[path as keyof typeof state.scrollPositions],
  },
  actions: {
    setScrollPosition(path: string, position: number) {
      this.scrollPositions = { ...this.scrollPositions, [path]: position };
    },
  },
});
