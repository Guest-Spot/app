<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import useUser from 'src/modules/useUser';
import useTokens from 'src/modules/useTokens';

const { fetchMe } = useUser();
const { getStoredTokens } = useTokens();

const fetchCurrentUser = (): void => {
  const tokens = getStoredTokens();
  if (tokens?.accessToken) {
    void fetchMe();
  }
};

onMounted(() => {
  void fetchCurrentUser();
});
</script>
