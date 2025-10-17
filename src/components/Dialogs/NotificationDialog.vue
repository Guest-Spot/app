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
          <NotificationItem
            v-for="notify in notifies"
            :key="notify.documentId"
            :notify="notify"
            :is-viewed="isNotificationViewed(notify.documentId)"
            v-close-popup
          />
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
import { NotificationItem } from 'src/components';

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
});

onErrorNotifies((error) => {
  console.error('Error loading notifications', error);
  isLoading.value = false;
  showError('Failed to load notifications');
});

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

  // Mark notifications as viewed when dialog is closed
  if (!newValue && notifies.value.length > 0) {
    markNotificationsAsViewed(notifies.value);
  }
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
}
</style>
