<template>
  <div class="delete-account-section">
    <q-expansion-item
      icon="warning"
      label="Delete Account"
      header-class="expansion-header text-negative"
      class="bg-block border-radius-lg"
    >
      <div class="delete-account-content q-pa-md">
        <div class="flex column q-gap-sm">
          <div class="text-body2 text-grey-6">
            Once you delete your account, there is no going back. Please be certain.
          </div>
          <div class="text-body2 text-grey-6 q-mt-sm delete-info">
            <strong>This will permanently delete:</strong>
            <ul class="delete-list q-mt-xs">
              <li>Your profile information</li>
              <li>All portfolio items</li>
              <li>All bookings</li>
              <li>Your photos and images</li>
              <li>Account settings and preferences</li>
            </ul>
          </div>
          <q-btn
            label="Delete Account"
            color="negative"
            rounded
            unelevated
            class="q-mt-sm"
            :loading="isDeleting"
            @click="handleDeleteAccount"
          />
        </div>
      </div>
    </q-expansion-item>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import useUser from 'src/modules/useUser';
import useNotify from 'src/modules/useNotify';
import { useNotifiesStore } from 'src/stores/notifies';

defineOptions({
  name: 'DeleteAccountSection',
});

const $q = useQuasar();
const router = useRouter();
const { deleteAccount, user } = useUser();
const { showSuccess, showError } = useNotify();
const notifiesStore = useNotifiesStore();

const isDeleting = ref(false);

const deleteAccountAction = async () => {
  if (!user.value?.id) {
    showError('User not found');
    return;
  }

  isDeleting.value = true;

  try {
    const result = await deleteAccount();

    if (result.success) {
      // Clear all notifications
      notifiesStore.setNotifies([]);
      notifiesStore.setHasNewNotifies(0);

      showSuccess('Account deleted successfully');
      void router.push('/');
    } else {
      showError(result.error || 'Failed to delete account');
    }
  } catch (error) {
    console.error('Error deleting account:', error);
    showError('Failed to delete account. Please try again.');
  } finally {
    isDeleting.value = false;
  }
}

const handleDeleteAccount = () => {
  $q.dialog({
    title: 'Delete Account',
    message: 'Are you sure you want to delete your account? This action cannot be undone.',
    html: true,
    cancel: {
      color: 'grey-9',
      rounded: true,
      label: 'Cancel',
    },
    ok: {
      color: 'negative',
      rounded: true,
      label: 'Delete Account',
    },
    persistent: true,
  }).onOk(() => {
    void deleteAccountAction();
  });
};
</script>

<style scoped lang="scss">
.delete-account-section {
  width: 100%;

  .expansion-header {
    font-weight: 600;
    font-size: 18px;
  }

  .delete-account-content {
    width: 100%;
  }

  .delete-info {
    line-height: 1.6;

    strong {
      display: block;
      margin-bottom: 4px;
    }
  }

  .delete-list {
    margin: 8px 0 0 0;
    padding-left: 20px;
    list-style-type: disc;

    li {
      margin-bottom: 4px;
      line-height: 1.5;
    }
  }
}
</style>
