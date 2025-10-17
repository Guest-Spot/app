<template>
  <div
    class="notification-item bg-block border-radius-md q-pa-md flex column q-gap-xs cursor-pointer"
    :class="{ 'notification-item--viewed': isViewed }"
    @click="handleClick"
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
      {{ notificationDetails }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { INotify } from 'src/interfaces/notify';
import type { NotificationType } from 'src/interfaces/enums';
import useDate from 'src/modules/useDate';
import useUser from 'src/modules/useUser';

defineOptions({
  name: 'NotificationItem',
});

interface Props {
  notify: INotify;
  isViewed?: boolean;
}

const props = defineProps<Props>();
const router = useRouter();

const { formatTimeAgo } = useDate();
const { isArtist } = useUser();

// Format date to YYYY-MM for BookingCalendar
const formatDateForCalendar = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// Format notification type for display
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

// Get notification details from body
const notificationDetails = computed(() => {
  if (props.notify.body && typeof props.notify.body === 'object') {
    // Try to extract meaningful information from body
    const body = props.notify.body;
    if (body.message && typeof body.message === 'string') return body.message;
    if (body.description && typeof body.description === 'string') return body.description;
  }

  if (props.notify.ownerDocumentId) {
    return `From: ${props.notify.ownerDocumentId}`;
  }

  return `ID: ${props.notify.documentId}`;
});

// Generate link based on user role
const notificationLink = computed(() => {
  if (isArtist.value) {
    // For artists, use the date from body if available, otherwise use createdAt
    let dateToUse = props.notify.createdAt;

    if (props.notify.body && typeof props.notify.body === 'object') {
      const body = props.notify.body;
      if (body.date && typeof body.date === 'string') {
        dateToUse = body.date;
      } else if (body.day && typeof body.day === 'string') {
        dateToUse = body.day;
      }
    }

    const formattedDate = formatDateForCalendar(dateToUse);
    return `/events?date=${formattedDate}`;
  }

  // For shop owners, could link to bookings or other relevant page
  return '/bookings';
});

const handleClick = () => {
  void router.push(notificationLink.value);
};
</script>

<style lang="scss" scoped>
.notification-item {
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: opacity 0.2s ease, transform 0.1s ease;

  &:hover {
    transform: translateY(-1px);
  }

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
</style>
