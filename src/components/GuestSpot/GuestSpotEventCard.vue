<template>
  <div class="guest-spot-event-card bg-block border-radius-md q-pa-md">
    <div class="event-header flex items-center q-gap-sm q-mb-sm">
      <q-icon :name="eventIcon" :color="eventColor" size="24px" />
      <div class="event-type text-weight-medium">{{ eventTypeLabel }}</div>
      <div class="event-date text-grey-6 text-caption">
        {{ formattedDate }}
      </div>
    </div>
    
    <div class="event-title text-subtitle2 q-mb-xs">{{ event.title }}</div>
    <div class="event-description text-body2 text-grey-7 q-mb-md">{{ event.description }}</div>
    
    <div class="event-participants flex items-center q-gap-md">
      <div v-if="event.shop" class="participant flex items-center q-gap-xs">
        <q-avatar v-if="event.shop.avatar?.url" size="24px">
          <q-img :src="event.shop.avatar.url" fit="cover" />
        </q-avatar>
        <span class="text-caption">{{ event.shop.name }}</span>
        <VerifiedBadge v-if="event.shop.verified" :size="12" />
      </div>
      
      <div v-if="event.artist" class="participant flex items-center q-gap-xs">
        <q-icon name="arrow_forward" size="16px" color="grey-6" />
        <q-avatar v-if="event.artist.avatar?.url" size="24px">
          <q-img :src="event.artist.avatar.url" fit="cover" />
        </q-avatar>
        <span class="text-caption">{{ event.artist.name }}</span>
        <VerifiedBadge v-if="event.artist.verified" :size="12" />
      </div>
    </div>
    
    <div v-if="event.slot || event.booking" class="event-actions q-mt-md">
      <q-btn
        v-if="event.slot"
        flat
        dense
        size="sm"
        color="primary"
        label="View Slot"
        @click="$emit('viewSlot', event.slot)"
      />
      <q-btn
        v-if="event.booking"
        flat
        dense
        size="sm"
        color="primary"
        label="View Booking"
        @click="$emit('viewBooking', event.booking)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { IGuestSpotEvent } from 'src/interfaces/guestSpot';
import { EGuestSpotEventType } from 'src/interfaces/enums';
import VerifiedBadge from 'src/components/VerifiedBadge.vue';
import useDate from 'src/modules/useDate';

interface Props {
  event: IGuestSpotEvent;
}

const props = defineProps<Props>();

defineEmits<{
  viewSlot: [slot: IGuestSpotEvent['slot']];
  viewBooking: [booking: IGuestSpotEvent['booking']];
}>();

const { formatDate } = useDate();

const eventIcon = computed(() => {
  switch (props.event.type) {
    case EGuestSpotEventType.SlotOpened:
      return 'add_circle';
    case EGuestSpotEventType.SlotUpdated:
      return 'edit';
    case EGuestSpotEventType.BookingCreated:
      return 'event_available';
    case EGuestSpotEventType.BookingAccepted:
      return 'check_circle';
    case EGuestSpotEventType.BookingRejected:
      return 'cancel';
    case EGuestSpotEventType.BookingCompleted:
      return 'done_all';
    default:
      return 'info';
  }
});

const eventColor = computed(() => {
  switch (props.event.type) {
    case EGuestSpotEventType.SlotOpened:
    case EGuestSpotEventType.BookingAccepted:
    case EGuestSpotEventType.BookingCompleted:
      return 'positive';
    case EGuestSpotEventType.BookingRejected:
      return 'negative';
    case EGuestSpotEventType.SlotUpdated:
    case EGuestSpotEventType.BookingCreated:
      return 'primary';
    default:
      return 'grey';
  }
});

const eventTypeLabel = computed(() => {
  switch (props.event.type) {
    case EGuestSpotEventType.SlotOpened:
      return 'Slot Opened';
    case EGuestSpotEventType.SlotUpdated:
      return 'Slot Updated';
    case EGuestSpotEventType.BookingCreated:
      return 'Booking Request';
    case EGuestSpotEventType.BookingAccepted:
      return 'Booking Accepted';
    case EGuestSpotEventType.BookingRejected:
      return 'Booking Rejected';
    case EGuestSpotEventType.BookingCompleted:
      return 'Booking Completed';
    default:
      return 'Event';
  }
});

const formattedDate = computed(() => {
  if (!props.event.createdAt) return '';
  const date = new Date(props.event.createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return formatDate(props.event.createdAt, { useUsFormat: true });
});
</script>

<style scoped lang="scss">
.guest-spot-event-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .event-header {
    .event-type {
      flex: 1;
    }
  }

  .event-title {
    font-weight: 600;
  }

  .event-participants {
    .participant {
      display: flex;
      align-items: center;
    }
  }
}
</style>
