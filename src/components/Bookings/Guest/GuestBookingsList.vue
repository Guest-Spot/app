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
      :booking="selectedBooking"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useQuery } from '@vue/apollo-composable';
import type { IBooking, IBookingsQueryResponse, IBooking } from 'src/interfaces/booking';
import { BOOKINGS_QUERY } from 'src/apollo/types/queries/booking';
import GuestBookingCard from './GuestBookingCard.vue';
import BookingDetailsDialog from 'src/components/Dialogs/BookingDetailsDialog.vue';
import LoadingState from 'src/components/LoadingState.vue';
import NoResults from 'src/components/NoResult.vue';

const { result, loading } = useQuery<IBookingsQueryResponse>(BOOKINGS_QUERY, {}, {
  fetchPolicy: 'network-only',
});

const bookings = ref<IBooking[]>([]);
const showDetailsDialog = ref<boolean>(false);
const selectedBooking = ref<IBooking | null>(null);

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

const openBookingDetails = (booking: IBooking) => {
  selectedBooking.value = booking;
  showDetailsDialog.value = true;
}
</script>

<style scoped lang="scss">
.guest-bookings-list {
  .bookings-grid {
    display: grid;
    gap: 16px;
  }
}
</style>

