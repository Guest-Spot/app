<template>
  <div class="flex justify-between items-center q-gap-md">
    <div class="text-h6">Welcome, <span class="text-primary">{{ profile?.name }}</span></div>
    <q-btn
      text-color="negative"
      icon="logout"
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
import { useQuasar } from 'quasar';

const router = useRouter();
const $q = useQuasar();
const { logout, profile } = useUser();

const handleLogout = () => {
  $q.dialog({
    title: 'Logout',
    message: 'Are you sure you want to logout?',
    cancel: {
      color: 'grey-9',
      rounded: true,
      label: 'Cancel'
    },
    ok: {
      color: 'primary',
      rounded: true,
      label: 'Logout'
    }
  }).onOk(() => {
    void logout();
    void router.push('/');
  });
};
</script>
