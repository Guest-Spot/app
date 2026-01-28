<template>
  <div class="artist-guest-spot-bookings flex column q-gap-md">
    <ListHeader title="My Guest Spot Bookings" />

    <LoadingState
      v-if="loading && !bookings.length"
      :is-loading="loading"
      title="Loading bookings..."
      description="Please wait while we fetch your bookings"
      spinner-name="dots"
    />

    <div v-else-if="bookings.length" class="bookings-list">
      <GuestSpotBookingCard
        v-for="booking in bookings"
        :key="booking.documentId"
        :booking="booking"
        @click="handleViewBooking"
      />
    </div>

    <NoResult
      v-else
      icon="event_busy"
      title="No guest spot bookings yet"
      description="Your guest spot bookings will appear here"
      no-btn
    />
  </div>
</template>

<script setup lang="ts">
import type { IGuestSpotBooking } from 'src/interfaces/guestSpot';
import { ListHeader, LoadingState, NoResult } from 'src/components';
import GuestSpotBookingCard from './GuestSpotBookingCard.vue';

interface Props {
  bookings: IGuestSpotBooking[];
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<{
  viewBooking: [booking: IGuestSpotBooking];
}>();

const handleViewBooking = (booking: IGuestSpotBooking) => {
  emit('viewBooking', booking);
};
</script>

<style scoped lang="scss">
.artist-guest-spot-bookings {
  width: 100%;
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
