import { defineStore } from 'pinia';
import type { ITattooStyle } from 'src/interfaces/tattoo';

export const useTattooStylesStore = defineStore('tattooStyles', {
  state: () => ({
    styles: [] as ITattooStyle[],
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    getStyles: (state) => state.styles,
    getIsLoading: (state) => state.isLoading,
    getError: (state) => state.error,
  },

  actions: {
    setStyles(styles: ITattooStyle[]) {
      this.styles = styles;
    },

    setIsLoading(isLoading: boolean) {
      this.isLoading = isLoading;
    },

    setError(error: string | null) {
      this.error = error;
    },
  },
});

