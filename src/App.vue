<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import useUser from 'src/modules/useUser';
import useTokens from 'src/modules/useTokens';
import { useProfileStore } from 'src/stores/profile';
import useInviteCompos from 'src/composables/useInviteCompos';
import useNotifyCompos from 'src/composables/useNotifyCompos';

const { fetchMe, user } = useUser();
const { getStoredTokens } = useTokens();
const profileStore = useProfileStore();
const { fetchInvites } = useInviteCompos();
const { fetchNotifies } = useNotifyCompos();

const fetchCurrentUser = async (): Promise<void> => {
  const tokens = getStoredTokens();
  if (tokens?.accessToken) {
    const result = await fetchMe();
    if (result) {
      profileStore.setUserProfile(result);
    }
  }
};

watch(
  user,
  (newValue) => {
    if (newValue?.profile?.documentId) {
      void fetchInvites();
      void fetchNotifies();
    }
  },
  { immediate: true },
);

onMounted(() => {
  void fetchCurrentUser();
});
</script>
