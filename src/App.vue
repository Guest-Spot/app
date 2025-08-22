<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUserStore } from 'src/stores/user-store';

const userStore = useUserStore();

onMounted(() => {
  // Initialize user store from localStorage on app start
  userStore.initFromStorage();
});
</script>
