<template>
  <div class="flex justify-between items-center q-gap-md">
    <div class="text-h6">Welcome, <span class="text-primary">{{ user?.email }}</span></div>
    <q-btn
      text-color="negative"
      icon="settings"
      round
      unelevated
      class="bg-block"
      size="sm"
    >
      <q-menu style="width: 150px;">
        <q-list>
          <q-item v-close-popup clickable>
            <q-item-section>
              <div class="flex items-center no-wrap q-gap-sm">
                <q-icon name="public" size="18px" />
                <q-item-label>Public profile</q-item-label>
              </div>
            </q-item-section>
          </q-item>
          <q-item clickable @click="handleLogout" v-close-popup>
            <q-item-section>
              <div class="flex items-center q-gap-sm text-negative">
                <q-icon name="logout" size="18px" />
                <q-item-label>Logout</q-item-label>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>
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
const { logout, user } = useUser();

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
