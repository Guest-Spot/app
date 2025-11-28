<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { NavigationBar } from '@capgo/capacitor-navigation-bar';
import useUser from 'src/modules/useUser';
import useTokens from 'src/modules/useTokens';
import useInviteCompos from 'src/composables/useInviteCompos';
import useNotifyCompos from 'src/composables/useNotifyCompos';
import useSettings from 'src/composables/useSettings';
import useTattooStyles from 'src/modules/useTattooStyles';
import { App } from '@capacitor/app';
import { useRouter } from 'vue-router';

const { fetchMe, user } = useUser();
const { getStoredTokens } = useTokens();
const { fetchInvites } = useInviteCompos();
const { fetchNotifies } = useNotifyCompos();
const { fetchSettings } = useSettings();
const { fetchStyles } = useTattooStyles();
const router = useRouter();
const $q = useQuasar();

const setNavColor = async (isDark: boolean) => {
  if (!$q.platform.is.capacitor || !$q.platform.is.android) return;

  const color = isDark ? '#1d1d1d' : '#ffffff';

  try {
    await NavigationBar.setNavigationBarColor({
      color: color,
      darkButtons: !isDark,
    });
  } catch (e) {
    console.error('Error setting NavigationBar color', e);
  }
};

watch(
  () => $q.dark.isActive,
  (val) => {
    void setNavColor(val);
  },
);

const fetchCurrentUser = (): void => {
  const tokens = getStoredTokens();
  if (tokens?.accessToken) {
    void fetchMe();
  }
};

watch(
  user,
  (newValue) => {
    if (newValue?.documentId) {
      void fetchInvites();
      void fetchNotifies();
    }
  },
  { immediate: true },
);

onMounted(() => {
  void fetchCurrentUser();
  void fetchSettings();
  void fetchStyles();
  void setNavColor($q.dark.isActive);

  // Handle deep links when app is already open
  void App.addListener('appUrlOpen', (event) => {
    const url = new URL(event.url);
    if (url.hash) {
      void router.replace(url.hash.substring(1));
    }
  });
});
</script>
