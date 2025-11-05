import { defineStore } from 'pinia';
import type { ISetting } from 'src/interfaces/setting';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    settings: null as ISetting | null,
    isLoading: false,
  }),
  getters: {
    getSettings: (state) => state.settings,
    getPlatformFeePercent: (state) => state.settings?.platformFeePercent ?? null,
    getStripeFeePercent: (state) => state.settings?.stripeFeePercent ?? null,
    getTotalFeePercent: (state) => state.settings?.totalFeePercent ?? null,
    getIsLoading: (state) => state.isLoading,
  },
  actions: {
    /**
     * Set settings data
     */
    setSettings(settings: ISetting | null) {
      this.settings = settings;
    },
    /**
     * Set loading state
     */
    setIsLoading(isLoading: boolean) {
      this.isLoading = isLoading;
    },
    /**
     * Clear settings
     */
    clearSettings() {
      this.settings = null;
    },
  },
});

