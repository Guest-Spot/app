<template>
  <div class="guest-spot-bookings-list flex column q-gap-md">
    <TabsComp
      size="sm"
      unelevated
      send-initial-tab
      :tabs="filterTabs"
      :activeTab="activeFilterTab"
      @set-active-tab="setActiveTab"
    />

    <LoadingState
      v-if="loading && !filteredBookings.length"
      :is-loading="loading"
      title="Loading bookings..."
      description="Please wait while we fetch the bookings"
      spinner-name="dots"
    />

    <div v-else-if="filteredBookings.length" class="bookings-grid">
      <GuestSpotBookingCard
        v-for="booking in filteredBookings"
        :key="booking.documentId"
        :booking="booking"
        @approve="handleApprove"
        @reject="handleReject"
        @view-details="handleViewDetails"
      />
    </div>

    <NoResult
      v-else
      icon="event_busy"
      title="No bookings yet"
      description="Guest spot booking requests will appear here"
      no-btn
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { IGuestSpotBooking, EGuestSpotBookingStatus } from 'src/interfaces/guestSpot';
import { EGuestSpotBookingStatus as Status } from 'src/interfaces/enums';
import { TabsComp, LoadingState, NoResult } from 'src/components';
import type { ITab } from 'src/interfaces/tabs';
import GuestSpotBookingCard from 'src/components/GuestSpot/GuestSpotBookingCard.vue';

interface Props {
  bookings: IGuestSpotBooking[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<{
  approve: [documentId: string];
  reject: [documentId: string, rejectNote?: string];
  viewDetails: [booking: IGuestSpotBooking];
}>();

const PENDING_TAB = 'pending';
const ACCEPTED_TAB = 'accepted';
const REJECTED_TAB = 'rejected';

const filterTabs: ITab[] = [
  { label: 'Pending', tab: PENDING_TAB },
  { label: 'Accepted', tab: ACCEPTED_TAB },
  { label: 'Rejected', tab: REJECTED_TAB },
];

const activeFilterTab = ref<ITab>(filterTabs[0]!);

const filteredBookings = computed(() => {
  const statusMap: Record<string, EGuestSpotBookingStatus> = {
    [PENDING_TAB]: Status.Pending,
    [ACCEPTED_TAB]: Status.Accepted,
    [REJECTED_TAB]: Status.Rejected,
  };

  const targetStatus = statusMap[activeFilterTab.value.tab];
  return props.bookings.filter((booking) => booking.status === targetStatus);
});

const setActiveTab = (tab: ITab) => {
  activeFilterTab.value = tab;
};

const handleApprove = (documentId: string) => {
  emit('approve', documentId);
};

const handleReject = (documentId: string, rejectNote?: string) => {
  emit('reject', documentId, rejectNote);
};

const handleViewDetails = (booking: IGuestSpotBooking) => {
  emit('viewDetails', booking);
};
</script>

<style scoped lang="scss">
.guest-spot-bookings-list {
  width: 100%;
}

.bookings-header {
  width: 100%;
}

.bookings-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
