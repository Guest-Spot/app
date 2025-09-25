<template>
  <div class="flex justify-between items-start q-gap-md no-wrap">
    <div class="text-h6">
      Welcome<template v-if="name"
        >, <span class="text-primary">{{ name }}</span></template
      >
    </div>
    <div class="flex items-center q-gap-sm">
      <q-btn
        text-color="primary"
        icon="notifications"
        round
        unelevated
        class="bg-block"
        size="sm"
        @click="showNotificationDialog"
      >
        <q-badge v-if="invites.length > 0" color="negative" floating rounded>{{
          invites.length
        }}</q-badge>
      </q-btn>
      <q-btn text-color="primary" icon="settings" round unelevated class="bg-block" size="sm">
        <q-menu style="width: 150px">
          <q-list>
            <q-item v-close-popup clickable @click="handlePublicProfile">
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import useUser from 'src/modules/useUser';
import { useQuasar } from 'quasar';
import useNotify from 'src/modules/useNotify';
import { useInvitesStore } from 'src/stores/invites';
import NotificationDialog from 'src/components/Dialogs/NotificationDialog.vue';

defineOptions({
  name: 'ProfileHeader',
});

defineProps({
  name: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['openPublicProfile']);

const router = useRouter();
const $q = useQuasar();
const { logout } = useUser();
const { showSuccess } = useNotify();
const invitesStore = useInvitesStore();

const invites = computed(() => invitesStore.getInvites);

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
      color: 'primary',
      rounded: true,
      label: 'Logout',
    },
  }).onOk(() => {
    void logout();
    showSuccess('Logout successful');
    invitesStore.setInvites([]);
    void router.push('/');
  });
};

const handlePublicProfile = () => {
  emit('openPublicProfile');
};

const showNotificationDialog = () => {
  $q.dialog({
    component: NotificationDialog,
  });
};
</script>
