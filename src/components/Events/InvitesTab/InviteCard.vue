<template>
  <div
    class="invite-card-card bg-block border-radius-md q-pa-md"
    :class="{ sent: isSent, received: isReceived }"
  >
    <div class="card-content">
      <div class="flex items-center q-gap-xs q-mb-sm">
        <template v-if="isSent">
          <q-icon name="send" size="16px" color="primary" />
          <span class="text-primary text-weight-medium">My request</span>
        </template>
        <template v-else>
          <q-icon name="inbox" size="16px" color="primary" />
          <span class="text-primary text-weight-medium">Request for me</span>
        </template>
        <div class="status-badge absolute-top-right q-mr-md q-mt-md" :class="invite.reaction">
          {{ getStatusLabel(invite.reaction) }}
        </div>
      </div>

      <h4 class="invite-card-title">{{ invite.title }}</h4>
      <p class="invite-card-description text-grey-6">{{ invite.description }}</p>
    </div>

    <div class="card-actions">
      <!-- Accept/Reject buttons for pending invitations -->
      <div v-if="isReceived && invite.reaction === InviteReaction.Pending" class="action-buttons">
        <q-btn
          label="Reject"
          color="negative"
          rounded
          flat
          :loading="loading"
          :disable="loading"
          @click="$emit('reject', invite.documentId)"
          class="bg-block full-width"
        />
        <q-btn
          label="Accept"
          color="primary"
          rounded
          :loading="loading"
          :disable="loading"
          @click="$emit('accept', invite.documentId)"
          class="full-width"
        />
      </div>

      <!-- Cancel button for pending requests -->
      <q-btn
        v-else-if="isSent && invite.reaction === InviteReaction.Pending"
        label="Cancel Request"
        color="negative"
        flat
        rounded
        @click="$emit('cancel', invite.documentId)"
        class="bg-block full-width"
      />

      <!-- View shop for other statuses -->
      <q-btn
        v-else
        label="View Shop"
        rounded
        :to="`/shop/${invite.sender}`"
        flat
        class="bg-block full-width"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { IInvite } from 'src/interfaces/invite';
import { InviteReaction } from 'src/interfaces/enums';
import { useUserStore } from 'src/stores/user';

interface Props {
  invite: IInvite;
  loading?: boolean;
}

interface Emits {
  (e: 'accept', documentId: string): void;
  (e: 'reject', documentId: string): void;
  (e: 'cancel', documentId: string): void;
}

const props = defineProps<Props>();
defineEmits<Emits>();

// Computed properties
const userStore = useUserStore();

const isSent = computed(() => props.invite.sender === userStore.getUser?.profile?.documentId);
const isReceived = computed(() => props.invite.recipient === userStore.getUser?.profile?.documentId);

// Methods
const getStatusLabel = (status: IInvite['reaction']) => {
  const statusMap = {
    [InviteReaction.Pending]: 'Pending',
    [InviteReaction.Accepted]: 'Accepted',
    [InviteReaction.Rejected]: 'Rejected',
  };
  return statusMap[status as keyof typeof statusMap];
};
</script>

<style scoped lang="scss">
.invite-card-card {
  transition: all 0.3s ease;
  overflow: hidden;

  .card-content {
    margin-bottom: 20px;

    .status-badge {
      padding: 4px 8px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 600;

      &.pending {
        background: #ff9800;
        color: white;
      }

      &.accepted {
        background: #4caf50;
        color: white;
      }

      &.rejected {
        background: #f44336;
        color: white;
      }

      &.cancelled {
        background: #9e9e9e;
        color: white;
      }

      &.completed {
        background: #2196f3;
        color: white;
      }
    }

    .request-type {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    .invite-card-title {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
    }

    .invite-card-description {
      margin: 0 0 16px 0;
      line-height: 1.5;
    }
  }

  .card-actions {
    .action-buttons {
      display: flex;
      gap: 16px;
    }

    .q-btn {
      font-weight: 600;
    }
  }
}
</style>
