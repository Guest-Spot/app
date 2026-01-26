<template>
  <div class="app-wrapper">
    <div class="gradient-spot"></div>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import useUser from 'src/modules/useUser';
import useTokens from 'src/modules/useTokens';
import useInviteCompos from 'src/composables/useInviteCompos';
import useNotifyCompos from 'src/composables/useNotifyCompos';
import useSettings from 'src/composables/useSettings';
import useTattooStyles from 'src/modules/useTattooStyles';
import useNavigationBar from 'src/modules/useNavigationBar';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { useRouter } from 'vue-router';

const { fetchMe, user } = useUser();
const { getStoredTokens } = useTokens();
const { fetchInvites } = useInviteCompos();
const { fetchNotifies } = useNotifyCompos();
const { fetchSettings } = useSettings();
const { fetchStyles } = useTattooStyles();
const { initNavigationBar } = useNavigationBar();
const router = useRouter();

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
  initNavigationBar();

  // Handle deep links when app is already open
  void App.addListener('appUrlOpen', (event) => {
    try {
      const url = new URL(event.url);

      // Check if this is a close-browser command
      // Can be in hash (https://domain.com/#/close-browser) or pathname (com.guestspot.app://close-browser)
      if (url.hash.includes('close-browser') || url.pathname.includes('close-browser')) {
        void Browser.close();
        return;
      }

      // Handle navigation deep links
      if (url.hash) {
        void router.replace(url.hash.substring(1));
      }
    } catch {
      // If URL parsing fails, check if the URL string contains close-browser
      if (event.url.includes('close-browser')) {
        void Browser.close();
      }
    }
  });
});
</script>

<style scoped>
.app-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.gradient-spot {
  position: fixed;
  top: 0;
  left: 0;
  width: 400px;
  height: 400px;
  background: radial-gradient(
    circle at top left,
    color-mix(in srgb, var(--q-primary) 15%, transparent) 0%,
    color-mix(in srgb, var(--q-primary) 4%, transparent) 70%,
    transparent 70%
  );
  filter: blur(40px);
  pointer-events: none;
  z-index: 0;
}
</style>
