import { useQuasar } from 'quasar';
import { watch } from 'vue';

export default function useNavigationBar() {
  const $q = useQuasar();

  const setColors = async (isDark: boolean) => {
    if (!$q.platform.is.capacitor) return;

    // Navigation Bar и Status Bar (Android only) - динамический импорт только для Android
    if ($q.platform.is.android) {
      try {
        const { NavigationBar } = await import('@capgo/capacitor-navigation-bar');
        const { StatusBar, Style } = await import('@capacitor/status-bar');

        const navColor = isDark ? '#1d1d1d' : '#ffffff';
        const statusColor = isDark ? '#000000' : '#ffffff';

        // Status Bar
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setBackgroundColor({ color: statusColor });
        await StatusBar.setStyle({
          style: isDark ? Style.Dark : Style.Light
        });

        // Navigation Bar
        await NavigationBar.setNavigationBarColor({
          color: navColor,
          darkButtons: !isDark,
        });
      } catch (e) {
        console.error('Error setting NavigationBar/StatusBar color', e);
      }
    }
  };

  const initNavigationBar = () => {
    void setColors($q.dark.isActive);

    watch(
      () => $q.dark.isActive,
      (val) => {
        void setColors(val);
      }
    );
  };

  return {
    initNavigationBar,
    setColors,
  };
}
