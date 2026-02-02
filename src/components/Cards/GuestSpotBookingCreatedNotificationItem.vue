<template>
  <div
    class="notification-item guest-spot-booking-created-notification-item bg-block border-radius-md q-pa-md flex column q-gap-xs"
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

    <div class="notification-item-content flex column q-gap-xs">
      <div v-if="bookingDate" class="flex items-center q-gap-xs">
        <q-icon name="event" size="16px" color="grey-6" />
        <span class="text-grey-5">{{ bookingDate }}</span>
      </div>
      <div v-if="artistName" class="flex items-center q-gap-xs">
        <q-icon name="account_circle" size="16px" color="grey-6" />
        <span class="text-grey-5">{{ artistName }}</span>
      </div>
      <div v-if="comment" class="notification-item-description text-grey-5">
        {{ comment }}
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
import useDate from 'src/modules/useDate';

defineOptions({
  name: 'GuestSpotBookingCreatedNotificationItem',
});

interface Props {
  notify: INotify;
  isViewed?: boolean;
}

const props = defineProps<Props>();
const router = useRouter();

const { formatTimeAgo, formatDate } = useDate();

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

const cardTitle = 'Guest Spot Booking Created';

const bookingDate = computed(() => {
  const dateString =
    pickString('selectedDate') ||
    pickString('bookingDate') ||
    pickString('day') ||
    pickString('date');
  return dateString ? formatDate(dateString) : '';
});

const artistName = computed(() => {
  const name = pickString('artistName');
  if (name) return name;
  const artist = body.value?.artist;
  if (isRecord(artist) && typeof artist.name === 'string') {
    return artist.name;
  }
  return '';
});

const comment = computed(() => {
  return pickString('comment') || pickString('message') || '';
});

const handleClick = () => {
  const bookingId = body.value?.documentId;
  const query: Record<string, string> = {};
  if (typeof bookingId === 'string') {
    query.bookingId = bookingId;
  }
  void router.push(
    Object.keys(query).length
      ? { path: '/guest-spot-bookings', query }
      : { path: '/guest-spot-bookings' },
  );
};
</script>

<style scoped lang="scss">
.guest-spot-booking-created-notification-item {
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
}

.notification-item--viewed {
  opacity: 0.5;
}
</style>
