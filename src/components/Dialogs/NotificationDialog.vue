<template>
  <q-dialog
    v-model="isVisible"
    position="right"
    full-width
    full-height
    no-route-dismiss
    transition-show="slide-left"
    transition-hide="slide-right"
    class="notification-dialog"
  >
    <q-card>
      <q-card-section class="notification-dialog-header bg-block row items-center justify-between">
        <div class="text-subtitle1 text-bold">Notifications</div>
        <q-btn
          icon="close"
          flat
          round
          dense
          class="q-ml-sm bg-block"
          size="sm"
          text-color="negative"
          v-close-popup
        />
      </q-card-section>
      <q-card-section class="dialog-content">
        <div v-if="isLoading" class="flex justify-center items-center q-h-full q-my-xl full-width">
          <q-spinner color="primary" size="32px" />
        </div>
        <div v-else-if="notifies.length > 0" class="flex column q-gap-sm">
          <div
            v-for="notify in notifies"
            :key="notify.documentId"
            class="notification-item bg-block border-radius-md q-pa-md flex column q-gap-xs"
            :class="{ 'notification-item--viewed': isNotificationViewed(notify.documentId) }"
          >
            <div class="flex items-start justify-between q-gap-sm full-width">
              <div class="notification-item-title text-bold">
                {{ formatNotificationType(notify.type) }}
              </div>
              <div class="notification-item-time text-caption text-grey-6 border-radius-sm">
                {{ formatTimeAgo(notify.createdAt) }}
              </div>
            </div>
            <div class="notification-item-description text-grey-5">
              {{ notificationDetails(notify) }}
            </div>
          </div>
        </div>
        <div
          v-else
          class="flex justify-center items-center q-h-full q-mt-lg full-width column q-gap-sm"
        >
          <q-icon name="notifications" size="24px" class="text-grey-6" />
          <div class="text-caption text-grey-6">Notifications not found</div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import useNotify from 'src/modules/useNotify';
import useNotifyCompos from 'src/composables/useNotifyCompos';
import type { INotify } from 'src/interfaces/notify';
import type { NotificationType } from 'src/interfaces/enums';
import useDate from 'src/modules/useDate';

interface Props {
  modelValue: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
}

const emit = defineEmits<Emits>();
const props = withDefaults(defineProps<Props>(), {
  modelValue: true,
});
const { showError } = useNotify();
const { notifies, fetchNotifies, onResultNotifies, onErrorNotifies, markNotificationsAsViewed, isNotificationViewed } = useNotifyCompos();
const { formatTimeAgo } = useDate();

const isVisible = ref(props.modelValue);
const isLoading = ref(false);

const loadNotifications = () => {
  if (isLoading.value) {
    return;
  }

  isLoading.value = fetchNotifies();
};

onResultNotifies(() => {
  isLoading.value = false;

  // Mark notifications as viewed after loading
  if (notifies.value.length > 0) {
    markNotificationsAsViewed(notifies.value);
  }
});

onErrorNotifies((error) => {
  console.error('Error loading notifications', error);
  isLoading.value = false;
  showError('Failed to load notifications');
});

const formatNotificationType = (type: NotificationType | string) => {
  if (!type) {
    return 'Notification';
  }

  return type
    .toString()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const notificationDetails = (notify: INotify) => {
  if (notify.ownerDocumentId) {
    return `From: ${notify.ownerDocumentId}`;
  }
  return `ID: ${notify.documentId}`;
};

onMounted(() => {
  loadNotifications();
});

watch(
  () => props.modelValue,
  (newValue) => {
    isVisible.value = newValue;
    if (newValue) {
      loadNotifications();
    }
  },
);

watch(isVisible, (newValue) => {
  emit('update:modelValue', newValue);
});
</script>

<style lang="scss" scoped>
.notification-dialog {
  .notification-dialog-header {
    position: sticky;
    top: 0;
    z-index: 2;
  }

  .q-card {
    width: 320px !important;
    border-radius: 20px 0 0 20px;
    box-shadow: none;
  }

  .notification-item {
    border: 1px solid rgba(255, 255, 255, 0.06);
    transition: opacity 0.2s ease;

    .notification-item-title {
      line-height: 1.2;
    }

    .notification-item-description {
      font-size: 13px;
    }

    &--viewed {
      opacity: 0.5;
      border-color: rgba(255, 255, 255, 0.03);
    }
  }
}
</style>
