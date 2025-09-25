<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import useUser from 'src/modules/useUser';
import useTokens from 'src/modules/useTokens';
import { useProfileStore } from 'src/stores/profile';
import useInviteCompos from 'src/composables/useInviteCompos';

const { fetchMe } = useUser();
const { getStoredTokens } = useTokens();
const profileStore = useProfileStore();
const { fetchInvites } = useInviteCompos();

const fetchCurrentUser = async (): Promise<void> => {
  const tokens = getStoredTokens();
  if (tokens?.accessToken) {
    const result = await fetchMe();
    if (result) {
      profileStore.setUserProfile(result);
      if (result?.profile?.documentId) {
        void fetchInvites({
          recipient: {
            eq: result?.profile?.documentId,
          },
        });
      }
    }
  }
};

onMounted(() => {
  void fetchCurrentUser();
});
</script>
