<template>
  <div class="guest-bookings-list flex column q-gap-md">
    <!-- Loading State -->
    <LoadingState
      v-if="loading"
      :is-loading="loading"
      title="Loading bookings..."
      description="Please wait"
      spinner-name="dots"
    />

    <!-- Empty State -->
    <NoResults
      v-else-if="!bookings.length"
      icon="event_note"
      title="No booking requests yet"
      description="When you send booking requests to artists, they will appear here"
      no-btn
    />

    <!-- Bookings Grid -->
    <div v-else class="bookings-grid">
      <GuestBookingCard
        v-for="booking in bookings"
        :key="booking.documentId"
        :booking="booking"
        @click="openBookingDetails"
      />
    </div>

    <!-- Booking Details Dialog -->
    <BookingDetailsDialog
      v-model="showDetailsDialog"
      :booking="convertedBooking"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useQuery } from '@vue/apollo-composable';
import type { IGuestBooking, IBookingsQueryResponse, IBooking } from 'src/interfaces/booking';
import { BOOKINGS_QUERY } from 'src/apollo/types/queries/booking';
import GuestBookingCard from './GuestBookingCard.vue';
import BookingDetailsDialog from 'src/components/Dialogs/BookingDetailsDialog.vue';
import LoadingState from 'src/components/LoadingState.vue';
import NoResults from 'src/components/NoResult.vue';

const { result, loading, refetch } = useQuery<IBookingsQueryResponse>(BOOKINGS_QUERY, {}, {
  fetchPolicy: 'network-only',
});

const bookings = ref<IGuestBooking[]>([]);
const showDetailsDialog = ref(false);
const selectedBooking = ref<IGuestBooking | null>(null);

// Watch for query results
watch(
  () => result.value?.bookings,
  (newBookings) => {
    if (newBookings) {
      bookings.value = newBookings;
    }
  },
  { immediate: true }
);

// Convert IGuestBooking to IBooking format for BookingDetailsDialog
const convertedBooking = computed<IBooking | null>(() => {
  if (!selectedBooking.value) return null;

  const guestBooking = selectedBooking.value;

  // Create a formatted title from available data
  const titleParts = [];
  if (guestBooking.placement) titleParts.push(guestBooking.placement);
  if (guestBooking.size) titleParts.push(guestBooking.size);
  const title = titleParts.length > 0
    ? titleParts.join(' - ')
    : guestBooking.name || 'Booking Request';

  // Map reaction to status
  const statusMap = {
    pending: 'pending',
    accepted: 'accepted',
    rejected: 'rejected',
  } as const;

  const booking: IBooking = {
    documentId: guestBooking.documentId,
    title: title,
    description: guestBooking.description || '',
    artist: guestBooking.artist || '',
    startTime: guestBooking.start || '00:00:00',
    endTime: '00:00:00', // Guest bookings don't have end time
    date: guestBooking.day,
    status: statusMap[guestBooking.reaction] || 'pending',
  };

  // Add location if it exists
  if (guestBooking.location) {
    booking.location = guestBooking.location;
  }

  return booking;
});

const openBookingDetails = (booking: IGuestBooking) => {
  selectedBooking.value = booking;
  showDetailsDialog.value = true;
};

// Expose refetch for parent components
defineExpose({
  refetch,
});
</script>

<style scoped lang="scss">
.guest-bookings-list {
  .bookings-grid {
    display: grid;
    gap: 16px;
  }
}
</style>

