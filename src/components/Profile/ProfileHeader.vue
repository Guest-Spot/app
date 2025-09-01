<template>
  <div class="flex justify-between items-center q-gap-md">
    <div class="text-subtitle1 text-bold">My Profile</div>
    <q-btn
      text-color="negative"
      icon="logout"
      size="sm"
      round
      unelevated
      @click="handleLogout"
      class="bg-block"
    />
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ProfileHeader'
});

import { useUserStore } from 'src/stores/user-store';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

const handleLogout = () => {
  // Logout user from store (this will clear localStorage)
  userStore.logout();

  // Redirect to appropriate login page based on user type
  if (userStore.type === 'shop') {
    void router.push('/login/shop');
  } else if (userStore.type === 'artist') {
    void router.push('/login/artist');
  } else {
    // Default to auth page
    void router.push('/auth');
  }
};
</script>
