import { useLazyQuery } from '@vue/apollo-composable';
import { SETTING_QUERY } from 'src/apollo/types/queries/setting';
import { useSettingsStore } from 'src/stores/settings';
import type { ISettingQueryResponse } from 'src/interfaces/setting';

export default function useSettings() {
  const settingsStore = useSettingsStore();

  const {
    load: loadSettings,
    onResult: onSettingsResult,
    onError: onSettingsError,
  } = useLazyQuery<ISettingQueryResponse>(SETTING_QUERY);

  // Setup result handler
  onSettingsResult((result) => {
    if (result?.data?.setting) {
      settingsStore.setSettings(result.data.setting);
    }
    settingsStore.setIsLoading(false);
  });

  // Setup error handler
  onSettingsError(() => {
    settingsStore.setIsLoading(false);
  });

  const fetchSettings = (): void => {
    // Don't fetch if settings already loaded
    if (settingsStore.getSettings) {
      return;
    }

    settingsStore.setIsLoading(true);
    void loadSettings();
  };

  return {
    fetchSettings,
  };
}

