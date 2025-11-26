<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
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

  // Handle deep links when app is already open
  void App.addListener('appUrlOpen', (event) => {
    const url = new URL(event.url);
    if (url.hash) {
      void router.replace(url.hash.substring(1));
    }
  });
});
</script>
