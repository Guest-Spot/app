<template>
  <div class="flex justify-between items-start q-gap-md no-wrap">
    <div class="profile-welcome-row text-h6 flex items-center q-gap-sm">
      <span>
        Welcome<template v-if="name"
          >, <span class="text-primary">{{ name }}</span></template
        >
      </span>
      <VerifiedBadge v-if="isVerified" />
    </div>
    <div class="flex items-center no-wrap q-gap-sm">
      <q-btn
        text-color="primary"
        icon="notifications"
        round
        unelevated
        class="bg-block"
        @click="showNotificationDialog"
      >
        <q-badge v-if="notificationsCount > 0" color="warning" text-color="dark" floating
          >{{ notificationsCount }}</q-badge
        >
      </q-btn>
      <q-btn text-color="primary" icon="settings" round unelevated class="bg-block">
        <q-menu style="width: 200px" anchor="bottom right" self="top right" :offset="[0, 4]">
          <q-list>
            <q-item v-if="!isGuest" v-close-popup clickable @click="handlePublicProfile">
              <q-item-section>
                <div class="flex items-center no-wrap q-gap-sm">
                  <q-icon name="public" size="18px" />
                  <q-item-label>Public profile</q-item-label>
                </div>
              </q-item-section>
            </q-item>
            <q-item v-if="!isGuest" clickable v-close-popup @click="handleChangePassword">
              <q-item-section>
                <div class="flex items-center q-gap-sm">
                  <q-icon name="lock_reset" size="18px" />
                  <q-item-label>Change password</q-item-label>
                </div>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="handleFeedback">
              <q-item-section>
                <div class="flex items-center q-gap-sm">
                  <q-icon name="feedback" size="18px" />
                  <q-item-label>Send feedback</q-item-label>
                </div>
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup @click="handleTermsOfService">
              <q-item-section>
                <div class="flex items-center q-gap-sm">
                  <q-icon name="description" size="18px" />
                  <q-item-label>Terms of Service</q-item-label>
                </div>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="handlePrivacyPolicy">
              <q-item-section>
                <div class="flex items-center q-gap-sm">
                  <q-icon name="privacy_tip" size="18px" />
                  <q-item-label>Privacy Policy</q-item-label>
                </div>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="handleUserAgreement">
              <q-item-section>
                <div class="flex items-center q-gap-sm">
                  <q-icon name="description" size="18px" />
                  <q-item-label>User Agreement</q-item-label>
                </div>
              </q-item-section>
            </q-item>
            <q-separator />
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
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import useUser from 'src/modules/useUser';
import { useQuasar } from 'quasar';
import useNotify from 'src/modules/useNotify';
import NotificationDialog from 'src/components/Dialogs/NotificationDialog.vue';
import useNotifyCompos from 'src/composables/useNotifyCompos';
import { useUserStore } from 'src/stores/user';
import { useNotifiesStore } from 'src/stores/notifies';
import VerifiedBadge from 'src/components/VerifiedBadge.vue';

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
const notifiesStore = useNotifiesStore();
const { fetchNotifies } = useNotifyCompos();
const userStore = useUserStore();

const isGuest = computed(() => userStore.getIsGuest);
const isVerified = computed(() => Boolean(userStore.getUser?.verified));
const notificationsCount = computed(() => notifiesStore.getHasNewNotifies);

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
    notifiesStore.setNotifies([]);
    notifiesStore.setHasNewNotifies(0);
    void router.push('/');
  });
};

const handlePublicProfile = () => {
  emit('openPublicProfile');
};

const handleChangePassword = () => {
  void router.push('/change-password');
};

const showNotificationDialog = () => {
  void fetchNotifies();
  $q.dialog({
    component: NotificationDialog,
  });
};

const handleFeedback = () => {
  void router.push('/feedback');
};

const handleTermsOfService = () => {
  void window.open('https://www.getguestspot.com/terms-of-service', '_blank');
};

const handlePrivacyPolicy = () => {
  void window.open('https://www.getguestspot.com/privacy-policy', '_blank');
};

const handleUserAgreement = () => {
  void window.open('https://www.getguestspot.com/user-agreement', '_blank');
};

onMounted(() => {
  void fetchNotifies();
});
</script>

<style scoped lang="scss">
.profile-welcome-row {
  flex-wrap: wrap;
}
</style>
