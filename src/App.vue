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

const { fetchMe, user } = useUser();
const { getStoredTokens } = useTokens();
const { fetchInvites } = useInviteCompos();
const { fetchNotifies } = useNotifyCompos();
const { fetchSettings } = useSettings();

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
});
</script>
