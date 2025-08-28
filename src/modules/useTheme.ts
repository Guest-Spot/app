import { computed } from 'vue';
import * as COLORS from 'src/config/colors';
import { LocalStorage, Dark } from 'quasar';
import { useThemeStore } from 'src/stores/theme';

const THEME_KEY = 'guestspot-theme';
const ACCENT_COLOR_KEY = 'guestspot-accent-color';
const DARK_THEME = 'dark';
const LIGHT_THEME = 'light';

const useTheme = () => {
  const themeStore = useThemeStore();
  
  const accentColor = computed<string>(() => themeStore.getAccentColor || COLORS.DEFAULT_ACCENT_COLOR);
  const isDark = computed<boolean>(() => themeStore.getIsDark);

  const setAccentColor = (color: string) => {
    const root = document.documentElement;
    root.style.setProperty('--q-primary', color);
    LocalStorage.set(ACCENT_COLOR_KEY, color);
  };

  const setDarkTheme = (dark: boolean) => {
    Dark.set(dark);
    LocalStorage.set(THEME_KEY, dark ? DARK_THEME : LIGHT_THEME);
    themeStore.setIsDark(dark);
  };

  const init = () => {
    const savedAccentColor = LocalStorage.getItem(ACCENT_COLOR_KEY);
    if (typeof savedAccentColor === 'string') {
      setAccentColor(savedAccentColor);
      themeStore.setAccentColor(savedAccentColor);
    }

    const savedTheme = LocalStorage.getItem(THEME_KEY);
    if (typeof savedTheme === 'string') {
      Dark.set(savedTheme === DARK_THEME);
      themeStore.setIsDark(savedTheme === DARK_THEME);
    }
  }

  return {
    accentColor,
    isDark,
    setAccentColor,
    init,
    setDarkTheme
  };
};

export default useTheme;
