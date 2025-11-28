import { useQuasar } from 'quasar';
import { NavigationBar } from '@capgo/capacitor-navigation-bar';
import { StatusBar, Style } from '@capacitor/status-bar';
import { watch } from 'vue';

export default function useNavigationBar() {
  const $q = useQuasar();

  const setColors = async (isDark: boolean) => {
    if (!$q.platform.is.capacitor) return;

    // Navigation Bar (Android only)
    if ($q.platform.is.android) {
      const navColor = isDark ? '#1d1d1d' : '#ffffff';
      try {
        await NavigationBar.setNavigationBarColor({
          color: navColor,
          darkButtons: !isDark,
        });
      } catch (e) {
        console.error('Error setting NavigationBar color', e);
      }
    }

    // Status Bar (Android & iOS)
    try {
      const statusColor = isDark ? '#000000' : '#ffffff';

      if ($q.platform.is.android) {
        await StatusBar.setBackgroundColor({ color: statusColor });
      }

      await StatusBar.setStyle({
        style: isDark ? Style.Dark : Style.Light
      });
    } catch (e) {
      console.error('Error setting StatusBar color', e);
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
