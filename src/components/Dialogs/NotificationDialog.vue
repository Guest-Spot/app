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
        <div v-else-if="localNotifies.length > 0" class="notification-list">
          <InfiniteScrollWrapper
            class="flex column q-gap-md"
            :offset="150"
            :loading="isLoading"
            :stop="!hasMoreNotifies"
            @load-more="loadMoreNotifies"
          >
            <component
              v-for="notify in localNotifies"
              :key="notify.documentId"
              :is="resolveNotificationComponent(notify.type)"
              :notify="notify"
              :is-viewed="isNotificationViewed(notify.documentId)"
              v-close-popup
            />
          </InfiniteScrollWrapper>
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
import { InviteNotificationItem, NotificationItem } from 'src/components';
import type { INotify } from 'src/interfaces/notify';
import { PAGINATION_PAGE_SIZE } from 'src/config/constants';
import InfiniteScrollWrapper from 'src/components/InfiniteScrollWrapper.vue';
import { InviteType } from 'src/interfaces/enums';

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
const {
  fetchNotifies,
  onResultNotifies,
  onErrorNotifies,
  markNotificationsAsViewed,
  isNotificationViewed,
} = useNotifyCompos();

const isVisible = ref(props.modelValue);
const isLoading = ref(false);
const localNotifies = ref<INotify[]>([]);
const currentPage = ref(1);
const hasMoreNotifies = ref(true);
const inviteNotificationTypes = new Set<string>(Object.values(InviteType));

let lastRequestWasAppend = false;

const resetPagination = () => {
  currentPage.value = 1;
  hasMoreNotifies.value = true;
  localNotifies.value = [];
  lastRequestWasAppend = false;
};

const loadNotifications = (reset = false) => {
  if (isLoading.value) {
    return;
  }

  if (reset) {
    resetPagination();
  }

  if (!hasMoreNotifies.value) {
    return;
  }

  lastRequestWasAppend = currentPage.value > 1;
  isLoading.value = true;

  const started = fetchNotifies({
    pagination: {
      page: currentPage.value,
      pageSize: PAGINATION_PAGE_SIZE,
    },
    append: lastRequestWasAppend,
  });

  if (!started) {
    isLoading.value = false;
    if (lastRequestWasAppend && currentPage.value > 1) {
      currentPage.value -= 1;
    }
    lastRequestWasAppend = false;
  }
};

const loadMoreNotifies = () => {
  if (isLoading.value || !hasMoreNotifies.value) {
    return;
  }

  currentPage.value += 1;
  loadNotifications();
};

const resolveNotificationComponent = (type: INotify['type']) => {
  return inviteNotificationTypes.has(type) ? InviteNotificationItem : NotificationItem;
};

onResultNotifies((result) => {
  isLoading.value = false;
  const fetchedNotifies = result?.data?.notifies ?? [];

  if (lastRequestWasAppend) {
    const existingIds = new Set(localNotifies.value.map((notify) => notify.documentId));
    const uniqueNewNotifies = fetchedNotifies.filter(
      (notify: INotify) => !existingIds.has(notify.documentId),
    );
    localNotifies.value = [...localNotifies.value, ...uniqueNewNotifies];
  } else {
    localNotifies.value = fetchedNotifies;
  }

  hasMoreNotifies.value = fetchedNotifies.length === PAGINATION_PAGE_SIZE;
  lastRequestWasAppend = false;
});

onErrorNotifies((error) => {
  console.error('Error loading notifications', error);
  isLoading.value = false;
  if (lastRequestWasAppend && currentPage.value > 1) {
    currentPage.value -= 1;
  }
  lastRequestWasAppend = false;
  showError('Failed to load notifications');
});

onMounted(() => {
  if (props.modelValue) {
    loadNotifications(true);
  }
});

watch(
  () => props.modelValue,
  (newValue) => {
    isVisible.value = newValue;
    if (newValue) {
      loadNotifications(true);
    }
  },
);

watch(isVisible, (newValue) => {
  emit('update:modelValue', newValue);

  // Mark notifications as viewed when dialog is closed
  if (!newValue && localNotifies.value.length > 0) {
    markNotificationsAsViewed(localNotifies.value);
  }
});
</script>

<style lang="scss" scoped>
.notification-dialog {

  .q-card {
    overflow: hidden;
  }

  .dialog-content {
    height: 90%;
    overflow: auto;
  }

  .notification-list {
    overflow-y: auto;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

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
