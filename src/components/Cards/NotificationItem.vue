<template>
  <div class="notification-item bg-block border-radius-md q-pa-md flex column q-gap-sm">
    <div
      class="notification-item-content flex column items-start q-gap-sm"
      @click="$router.push(`/shop/${invite.sender}`)"
      v-close-popup
    >
      <div class="flex items-center justify-between q-gap-sm full-width">
        <div class="notification-item-time text-caption border-radius-sm text-grey-6">
          {{ formatTimeAgo(invite.createdAt) }}
        </div>
      </div>
      <div class="notification-item-title text-bold">{{ invite.title }}</div>
      <div class="notification-item-description text-grey-4">{{ invite.description }}</div>
      <div class="notification-item-actions flex no-wrap q-gap-sm q-mt-md full-width">
        <q-btn
          label="Reject"
          color="grey-9"
          rounded
          size="sm"
          :loading="loadingReject"
          :disable="loadingReject || loadingAccept"
          @click.stop="$emit('reject', invite.documentId)"
          class="bg-block"
        />
        <q-btn
          label="Accept"
          color="primary"
          rounded
          size="sm"
          :loading="loadingAccept"
          :disable="loadingAccept || loadingReject"
          @click.stop="$emit('accept', invite.documentId)"
        />
        <q-btn
          round
          size="sm"
          color="grey-9"
          icon="visibility"
          class="bg-block q-ml-auto"
          @click.stop="$router.push(`/shop/${invite.sender}`)"
          v-close-popup
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IInvite } from 'src/interfaces/invite';
import useDate from 'src/modules/useDate';

defineOptions({
  name: 'NotificationItem',
});

interface Props {
  invite: IInvite;
  loadingAccept?: boolean;
  loadingReject?: boolean;
}

interface Emits {
  (e: 'reject', documentId: string): void;
  (e: 'accept', documentId: string): void;
}

defineProps<Props>();
defineEmits<Emits>();

const { formatTimeAgo } = useDate();
</script>

<style lang="scss" scoped>
.notification-item {
  .notification-item-content {
    .notification-item-description {
      border-left: 2px solid var(--q-primary);
      padding-left: 10px;
    }
  }
}
</style>
