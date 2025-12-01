<template>
  <div
    class="notification-item invite-notification-item bg-block border-radius-md q-pa-md flex column q-gap-xs"
    :class="{ 'notification-item--viewed': isViewed }"
    @click="handleClick"
  >
    <div class="flex items-start justify-between q-gap-sm full-width">
      <div class="notification-item-title text-bold">
        {{ inviteTitle }}
      </div>
      <div class="notification-item-time text-caption text-grey-6 border-radius-sm">
        {{ formatTimeAgo(notify.createdAt) }}
      </div>
    </div>

    <div v-if="statusLabel" class="invite-status-badge q-px-sm q-py-xs" :class="statusClass">
      <q-icon v-if="statusIcon" :name="statusIcon" size="14px" />
      <span class="text-weight-medium">{{ statusLabel }}</span>
    </div>

    <div class="notification-item-content flex column q-gap-xs">
      <div v-if="senderName" class="flex items-center q-gap-xs">
        <q-icon name="person" size="16px" color="grey-6" />
        <span class="text-grey-5">From: {{ senderName }}</span>
      </div>
      <div v-if="recipientName" class="flex items-center q-gap-xs">
        <q-icon name="group" size="16px" color="grey-6" />
        <span class="text-grey-5">To: {{ recipientName }}</span>
      </div>
      <div v-if="relatedShop" class="flex items-center q-gap-xs">
        <q-icon name="store" size="16px" color="grey-6" />
        <span class="text-grey-5">{{ relatedShop }}</span>
      </div>
      <div v-if="relatedArtist" class="flex items-center q-gap-xs">
        <q-icon name="brush" size="16px" color="grey-6" />
        <span class="text-grey-5">{{ relatedArtist }}</span>
      </div>

      <div v-if="inviteDescription" class="notification-item-description text-grey-5">
        {{ inviteDescription }}
      </div>
    </div>

    <div class="notification-item-footer">
      <q-btn
        flat
        dense
        rounded
        color="primary"
        label="View Invite"
        class="full-width bg-block"
        @click="handleClick"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { INotify } from 'src/interfaces/notify';
import { NotificationType } from 'src/interfaces/enums';
import useDate from 'src/modules/useDate';

defineOptions({
  name: 'InviteNotificationItem',
});

interface Props {
  notify: INotify;
  isViewed?: boolean;
}

const props = defineProps<Props>();
const router = useRouter();

const { formatTimeAgo } = useDate();

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const inviteBody = computed<Record<string, unknown>>(() => {
  const body = props.notify.body;
  if (isRecord(body)) {
    return body;
  }
  return {};
});

const pickString = (key: string): string => {
  const value = inviteBody.value?.[key];
  return typeof value === 'string' ? value : '';
};

const formatInviteType = (type: NotificationType | string) => {
  if (!type) {
    return 'Invite';
  }

  return type
    .toString()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const inviteTitle = computed(() => {
  return pickString('title') || formatInviteType(props.notify.type);
});

const inviteDescription = computed(() => {
  return pickString('description') || pickString('message') || '';
});

const senderName = computed(() => {
  return pickString('senderName') || pickString('shopName') || pickString('from');
});

const recipientName = computed(() => {
  return pickString('recipientName') || pickString('artistName') || pickString('to');
});

const relatedShop = computed(() => {
  const explicitShopName = pickString('shopName');
  if (explicitShopName && explicitShopName !== senderName.value) {
    return explicitShopName;
  }
  return '';
});

const relatedArtist = computed(() => {
  const explicitArtistName = pickString('artistName');
  if (explicitArtistName && explicitArtistName !== recipientName.value) {
    return explicitArtistName;
  }
  return '';
});

const statusClass = computed(() => {
  switch (props.notify.type) {
    case NotificationType.InviteAccepted:
      return 'accepted';
    case NotificationType.InviteRejected:
      return 'rejected';
    case NotificationType.InviteCreated:
    default:
      return 'pending';
  }
});

const statusLabel = computed(() => {
  switch (props.notify.type) {
    case NotificationType.InviteAccepted:
      return 'Invite Accepted';
    case NotificationType.InviteRejected:
      return 'Invite Rejected';
    case NotificationType.InviteCreated:
    default:
      return 'Invite Pending';
  }
});

const statusIcon = computed(() => {
  switch (props.notify.type) {
    case NotificationType.InviteAccepted:
      return 'check_circle';
    case NotificationType.InviteRejected:
      return 'cancel';
    case NotificationType.InviteCreated:
    default:
      return 'hourglass_empty';
  }
});

const handleClick = () => {
  const inviteId = inviteBody.value.documentId;
  const query: Record<string, string> = { tab: 'invites' };

  if (typeof inviteId === 'string') {
    query.inviteId = inviteId;
  }

  void router.push({ path: '/events', query });
};
</script>

<style scoped lang="scss">
.invite-notification-item {
  .notification-item-title {
    line-height: 1.2;
  }

  .notification-item-content {
    margin-top: 4px;
  }

  .notification-item-description {
    font-size: 13px;
    margin-top: 4px;
  }

  .notification-item-footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 8px;
  }

  .invite-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border-radius: 6px;
    font-size: 12px;
    width: fit-content;

    &.pending {
      background-color: rgba(255, 193, 7, 0.15);
      color: #ffc107;
      border: 1px solid rgba(255, 193, 7, 0.3);
    }

    &.accepted {
      background-color: rgba(76, 175, 80, 0.15);
      color: #4caf50;
      border: 1px solid rgba(76, 175, 80, 0.3);
    }

    &.rejected {
      background-color: rgba(244, 67, 54, 0.15);
      color: #f44336;
      border: 1px solid rgba(244, 67, 54, 0.3);
    }
  }
}

.notification-item--viewed {
  opacity: 0.5;
}
</style>
