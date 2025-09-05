<template>
  <div class="flex justify-between items-center q-gap-md">
    <div class="text-subtitle1">Welcome, <span class="text-primary">{{ profile?.fullname }}</span></div>
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

import { useRouter } from 'vue-router';
import useUser from 'src/modules/useUser';

const router = useRouter();
const { logout, profile } = useUser();

const handleLogout = () => {
  void logout();
  void router.push('/');
};
</script>
