<template>
  <!-- Feedback & Logout Section -->
    <div class="flex q-gap-sm no-wrap">
      <q-btn
        label="Feedback"
        rounded
        unelevated
        to="/feedback"
        class="full-width bg-block"
      />
      <q-btn
        label="Logout"
        color="negative"
        rounded
        flat
        unelevated
        class="full-width bg-block"
        @click="handleLogout"
      />
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useNotifiesStore } from 'src/stores/notifies';
import useUser from 'src/modules/useUser';
import useNotify from 'src/modules/useNotify';

const router = useRouter();
const $q = useQuasar();
const notifiesStore = useNotifiesStore();
const { logout } = useUser();
const { showSuccess } = useNotify();

const handleLogout = () => {
  $q.dialog({
    title: 'Logout',
    message: 'Are you sure you want to logout?',
    cancel: {
      color: 'grey-9',
      rounded: true,
      label: 'Cancel',
    },
    ok: {
      color: 'negative',
      rounded: true,
      label: 'Logout',
    },
  }).onOk(() => {
    void logout();
    showSuccess('Logout successful');
    notifiesStore.setNotifies([]);
    notifiesStore.setHasNewNotifies(0);
    void router.push('/');
    window.location.reload();
  });
};
</script>
