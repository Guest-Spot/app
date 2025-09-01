import { defineStore } from "pinia";

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDark: false,
    accentColor: '',
  }),
  getters: {
    getIsDark: (state) => state.isDark,
    getAccentColor: (state) => state.accentColor,
  },
  actions: {
    setIsDark(isDark: boolean) {
      this.isDark = isDark;
    },
    setAccentColor(accentColor: string) {
      this.accentColor = accentColor;
    },
  },
});
