<template>
  <div
    class="notification-item bg-block border-radius-md q-pa-md flex column q-gap-xs"
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

    <!-- Artist view: show guest details -->
    <div v-if="isArtist" class="notification-item-content flex column q-gap-xs">
      <div v-if="guestName" class="flex items-center q-gap-xs">
        <q-icon name="person" size="16px" color="grey-6" />
        <span class="text-grey-5">{{ guestName }}</span>
      </div>
      <div v-if="bookingDate" class="flex items-center q-gap-xs">
        <q-icon name="event" size="16px" color="grey-6" />
        <span class="text-grey-5">{{ bookingDate }}</span>
      </div>
      <div v-if="bookingTime" class="flex items-center q-gap-xs">
        <q-icon name="schedule" size="16px" color="grey-6" />
        <span class="text-grey-5">{{ bookingTime }}</span>
      </div>
    </div>

    <!-- Guest view: show shop/artist details -->
    <div v-else class="notification-item-content flex column q-gap-xs">
      <!-- Booking status badge for guests -->
      <div v-if="bookingStatus" class="booking-status-badge q-px-sm q-py-xs" :class="bookingStatus">
        <q-icon :name="bookingStatusIcon" size="14px" />
        <span class="text-weight-medium">{{ bookingStatusLabel }}</span>
      </div>

      <div v-if="shopOrArtistName" class="flex items-center q-gap-xs">
        <q-icon name="store" size="16px" color="grey-6" />
        <span class="text-grey-5">{{ shopOrArtistName }}</span>
      </div>
      <div v-if="bookingDate" class="flex items-center q-gap-xs">
        <q-icon name="event" size="16px" color="grey-6" />
        <span class="text-grey-5">{{ bookingDate }}</span>
      </div>
      <div v-if="bookingTime" class="flex items-center q-gap-xs">
        <q-icon name="schedule" size="16px" color="grey-6" />
        <span class="text-grey-5">{{ bookingTime }}</span>
      </div>

      <!-- Reject reason if available -->
      <div v-if="rejectReason" class="reject-reason q-mt-xs q-pa-sm">
        <div class="text-caption text-grey-6">Reason:</div>
        <div class="text-grey-5">{{ rejectReason }}</div>
      </div>

      <div v-if="notificationDetails && !rejectReason" class="notification-item-description text-grey-5">
        {{ notificationDetails }}
      </div>
    </div>

    <!-- View Button -->
    <div v-if="notificationLink" class="notification-item-footer">
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

const { formatTimeAgo, formatDate, formatTime } = useDate();
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

// Extract guest name from notification body (for artists)
const guestName = computed(() => {
  if (props.notify.body && typeof props.notify.body === 'object') {
    const body = props.notify.body;
    if (body.name && typeof body.name === 'string') {
      return body.name;
    }
    if (body.guestName && typeof body.guestName === 'string') {
      return body.guestName;
    }
  }
  return '';
});

// Extract shop or artist name from notification body (for guests)
const shopOrArtistName = computed(() => {
  if (props.notify.body && typeof props.notify.body === 'object') {
    const body = props.notify.body;
    if (body.shopName && typeof body.shopName === 'string') {
      return body.shopName;
    }
    if (body.artistName && typeof body.artistName === 'string') {
      return body.artistName;
    }
  }
  return '';
});

// Extract booking date from notification body
const bookingDate = computed(() => {
  if (props.notify.body && typeof props.notify.body === 'object') {
    const body = props.notify.body;
    let dateString = '';

    if (body.day && typeof body.day === 'string') {
      dateString = body.day;
    } else if (body.date && typeof body.date === 'string') {
      dateString = body.date;
    }

    if (dateString) {
      return formatDate(dateString);
    }
  }
  return '';
});

// Extract booking time from notification body (for artists)
const bookingTime = computed(() => {
  if (props.notify.body && typeof props.notify.body === 'object') {
    const body = props.notify.body;
    const startTime = body.start || body.startTime;
    const endTime = body.endTime;

    if (startTime && typeof startTime === 'string') {
      const formattedStart = formatTime(startTime);
      if (endTime && typeof endTime === 'string') {
        const formattedEnd = formatTime(endTime);
        return `${formattedStart} - ${formattedEnd}`;
      }
      return formattedStart;
    }
  }
  return '';
});

// Get notification details from body
const notificationDetails = computed(() => {
  if (props.notify.body && typeof props.notify.body === 'object') {
    // Try to extract meaningful information from body
    const body = props.notify.body;
    if (body.message && typeof body.message === 'string') return body.message;
    if (body.description && typeof body.description === 'string') return body.description;
  }

  return '';
});

// Extract booking status for guests (accepted/rejected)
const bookingStatus = computed(() => {
  const type = props.notify.type;
  if (type === NotificationType.BookingAccepted) return 'accepted';
  if (type === NotificationType.BookingRejected) return 'rejected';
  return '';
});

// Get booking status icon
const bookingStatusIcon = computed(() => {
  if (bookingStatus.value === 'accepted') return 'check_circle';
  if (bookingStatus.value === 'rejected') return 'cancel';
  return '';
});

// Get booking status label
const bookingStatusLabel = computed(() => {
  if (bookingStatus.value === 'accepted') return 'Booking Accepted';
  if (bookingStatus.value === 'rejected') return 'Booking Rejected';
  return '';
});

// Extract reject reason for guests
const rejectReason = computed(() => {
  if (props.notify.body && typeof props.notify.body === 'object') {
    const body = props.notify.body;
    if (body.rejectNote && typeof body.rejectNote === 'string') {
      return body.rejectNote;
    }
    if (body.rejectReason && typeof body.rejectReason === 'string') {
      return body.rejectReason;
    }
  }
  return '';
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

  return null;
});

const handleClick = () => {
  if (notificationLink.value) {
    void router.push(notificationLink.value);
  }
};
</script>

<style lang="scss" scoped>
.notification-item {
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

  &--viewed {
    opacity: 0.5;
  }
}
</style>
