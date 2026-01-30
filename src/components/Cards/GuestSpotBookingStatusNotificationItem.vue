<template>
  <div
    class="notification-item guest-spot-booking-status-notification-item bg-block border-radius-md q-pa-md flex column q-gap-xs"
    :class="{ 'notification-item--viewed': isViewed }"
    @click="handleClick"
  >
    <div class="flex items-start justify-between q-gap-sm full-width">
      <div class="notification-item-title text-bold">
        {{ cardTitle }}
      </div>
      <div class="notification-item-time text-caption text-grey-6 border-radius-sm">
        {{ formatTimeAgo(notify.createdAt) }}
      </div>
    </div>

    <div v-if="statusLabel" class="booking-status-badge q-px-sm q-py-xs" :class="statusClass">
      <q-icon v-if="statusIcon" :name="statusIcon" size="14px" />
      <span class="text-weight-medium">{{ statusLabel }}</span>
    </div>

    <div class="notification-item-content flex column q-gap-xs">
      <div v-if="shopName" class="flex items-center q-gap-xs">
        <q-icon name="store" size="16px" color="grey-6" />
        <span class="text-grey-5">{{ shopName }}</span>
      </div>
      <div v-if="bookingDate" class="flex items-center q-gap-xs">
        <q-icon name="event" size="16px" color="grey-6" />
        <span class="text-grey-5">{{ bookingDate }}</span>
      </div>
      <div v-if="bookingTime" class="flex items-center q-gap-xs">
        <q-icon name="schedule" size="16px" color="grey-6" />
        <span class="text-grey-5">{{ bookingTime }}</span>
      </div>
      <div v-if="rejectReason && isRejected" class="reject-reason q-mt-xs q-pa-sm">
        <div class="text-caption text-grey-6">Reason:</div>
        <div class="text-grey-5">{{ rejectReason }}</div>
      </div>
      <div v-if="message && !rejectReason" class="notification-item-description text-grey-5">
        {{ message }}
      </div>
    </div>

    <div class="notification-item-footer">
      <q-btn
        flat
        dense
        rounded
        color="primary"
        label="View"
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
  name: 'GuestSpotBookingStatusNotificationItem',
});

interface Props {
  notify: INotify;
  isViewed?: boolean;
}

const props = defineProps<Props>();
const router = useRouter();

const { formatTimeAgo, formatDate, formatTime } = useDate();

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const body = computed<Record<string, unknown>>(() => {
  const b = props.notify.body;
  if (isRecord(b)) {
    return b;
  }
  return {};
});

const pickString = (key: string): string => {
  const value = body.value?.[key];
  return typeof value === 'string' ? value : '';
};

const isAccepted = computed(
  () => props.notify.type === NotificationType.GuestSpotBookingAccepted,
);
const isRejected = computed(
  () => props.notify.type === NotificationType.GuestSpotBookingRejected,
);

const cardTitle = computed(() => {
  if (isAccepted.value) return 'Guest Spot Booking Accepted';
  if (isRejected.value) return 'Guest Spot Booking Rejected';
  return 'Guest Spot Booking';
});

const statusClass = computed(() => {
  if (isAccepted.value) return 'accepted';
  if (isRejected.value) return 'rejected';
  return '';
});

const statusLabel = computed(() => {
  if (isAccepted.value) return 'Booking Accepted';
  if (isRejected.value) return 'Booking Rejected';
  return '';
});

const statusIcon = computed(() => {
  if (isAccepted.value) return 'check_circle';
  if (isRejected.value) return 'cancel';
  return '';
});

const shopName = computed(() => {
  const name = pickString('shopName') || pickString('shop_name');
  if (name) return name;
  const shop = body.value?.shop;
  if (isRecord(shop) && typeof shop.name === 'string') {
    return shop.name;
  }
  return '';
});

const bookingDate = computed(() => {
  const dateString =
    pickString('selectedDate') ||
    pickString('bookingDate') ||
    pickString('day') ||
    pickString('date');
  return dateString ? formatDate(dateString) : '';
});

const bookingTime = computed(() => {
  const startTime = body.value?.start ?? body.value?.startTime;
  const endTime = body.value?.endTime;
  if (startTime && typeof startTime === 'string') {
    const formattedStart = formatTime(startTime);
    if (endTime && typeof endTime === 'string') {
      return `${formattedStart} - ${formatTime(endTime)}`;
    }
    return formattedStart;
  }
  return '';
});

const rejectReason = computed(() => {
  return (
    pickString('rejectNote') ||
    pickString('rejectReason') ||
    pickString('reject_note') ||
    pickString('reject_reason') ||
    ''
  );
});

const message = computed(() => pickString('message') || pickString('description') || '');

const handleClick = () => {
  void router.push({ path: '/events', query: { tab: 'guest-spot' } });
};
</script>

<style scoped lang="scss">
.guest-spot-booking-status-notification-item {
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

  .booking-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border-radius: 6px;
    font-size: 12px;
    width: fit-content;

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

  .reject-reason {
    background-color: rgba(244, 67, 54, 0.08);
    border-radius: 6px;
    border-left: 3px solid rgba(244, 67, 54, 0.5);
    font-size: 13px;
  }
}

.notification-item--viewed {
  opacity: 0.5;
}
</style>
