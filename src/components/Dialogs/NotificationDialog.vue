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
      <q-card-section class="row items-center q-pb-none justify-between">
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
        <div v-if="invites.length > 0" class="flex column q-gap-sm">
          <div
            v-for="invite in invites"
            :key="invite.documentId"
            class="notification-item bg-block border-radius-md q-pa-md flex column q-gap-sm"
          >
            <div class="notification-item-content flex column items-start q-gap-sm">
              <div class="flex items-center justify-between q-gap-sm full-width q-mb-sm">
                <q-badge
                  color="primary"
                  class="notification-item-sender text-caption border-radius-sm"
                  >Invitation</q-badge
                >
                <div
                  class="notification-item-time text-caption bg-block border-radius-sm q-px-sm q-py-xs text-grey-6"
                >
                  Created at: {{ formatDate(invite.createdAt) }}
                </div>
              </div>
              <div class="notification-item-title text-bold">{{ invite.title }}</div>
              <div class="notification-item-description text-grey-4">{{ invite.description }}</div>
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
import { ref, watch } from 'vue';
import type { IInvite } from 'src/interfaces/invite';
import useDate from 'src/modules/useDate';

interface Props {
  modelValue: boolean;
  invites: IInvite[];
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
}

const emit = defineEmits<Emits>();
const props = defineProps<Props>();

const { formatDate } = useDate();

// Dialog visibility
const isVisible = ref(props.modelValue);

// Watch for props changes
watch(
  () => props.modelValue,
  (newValue) => {
    isVisible.value = newValue;
  },
);

// Watch for internal changes to isVisible
watch(isVisible, (newValue) => {
  emit('update:modelValue', newValue);
});
</script>

<style lang="scss" scoped>
.notification-dialog {
  .q-card {
    width: 320px !important;
    border-radius: 20px 0 0 20px;
    box-shadow: none;
  }
}

.notification-item {
  .notification-item-content {
    .notification-item-description {
      border-left: 2px solid var(--q-primary);
      padding-left: 10px;
    }
  }
}
</style>
