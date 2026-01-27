<template>
  <q-page class="page q-pb-xl q-pt-lg flex column items-start q-gap-md">
    <template v-if="isAuthenticated">
      <div class="container">
        <GuestSpotBookingsList
          :bookings="bookings"
          :loading="isLoadingBookings"
          @approve="handleApproveBooking"
          @reject="handleRejectBooking"
          @view-details="handleViewBookingDetails"
        />
      </div>

      <!-- Booking Details Dialog -->
      <q-dialog v-model="showBookingDetails">
        <q-card v-if="selectedBooking" style="min-width: 400px">
          <q-card-section>
            <div class="text-h6">Booking Details</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <GuestSpotBookingCard
              v-if="selectedBooking"
              :booking="selectedBooking"
              @approve="handleApproveBooking"
              @reject="handleRejectBooking"
            />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Close" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </template>

    <SingInToContinue v-else-if="!hasTokens" class="fixed-center full-width" title="Guest Spot Bookings" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import useUser from 'src/modules/useUser';
import useTokens from 'src/modules/useTokens';
import useGuestSpot from 'src/composables/useGuestSpot';
import type { IGuestSpotBooking } from 'src/interfaces/guestSpot';
import GuestSpotBookingsList from 'src/components/ShopProfile/GuestSpotTab/GuestSpotBookingsList.vue';
import GuestSpotBookingCard from 'src/components/GuestSpot/GuestSpotBookingCard.vue';
import SingInToContinue from 'src/components/SingInToContinue.vue';

const { isAuthenticated, user } = useUser();
const { getStoredTokens } = useTokens();
const hasTokens = computed(() => getStoredTokens()?.accessToken);
const $q = useQuasar();

const {
  bookings,
  isLoadingBookings,
  loadBookings,
  approveBooking,
  rejectBooking,
} = useGuestSpot();

const showBookingDetails = ref(false);
const selectedBooking = ref<IGuestSpotBooking | null>(null);

onMounted(async () => {
  if (user.value?.documentId) {
    await loadBookings({ shopDocumentId: user.value.documentId });
  }
});

const handleApproveBooking = async (documentId: string) => {
  const success = await approveBooking(documentId);
  if (success && user.value?.documentId) {
    await loadBookings({ shopDocumentId: user.value.documentId });
  }
};

const handleRejectBooking = (documentId: string, rejectNote?: string) => {
  $q.dialog({
    title: 'Reject Booking',
    message: 'Are you sure you want to reject this booking?',
    prompt: {
      model: rejectNote || '',
      type: 'text',
      label: 'Reason (optional)',
    },
    cancel: true,
    persistent: true,
  }).onOk((note?: string) => {
    void (async () => {
      const success = await rejectBooking(documentId, note);
      if (success && user.value?.documentId) {
        await loadBookings({ shopDocumentId: user.value.documentId });
      }
    })();
  });
};

const handleViewBookingDetails = (booking: IGuestSpotBooking) => {
  selectedBooking.value = booking;
  showBookingDetails.value = true;
};
</script>
