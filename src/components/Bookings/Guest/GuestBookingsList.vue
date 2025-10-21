<template>
  <div class="guest-bookings-list flex items-start column q-gap-md">
    <TabsComp
      size="sm"
      unelevated
      :tabs="filterTabs"
      :activeTab="activeTab"
      @set-active-tab="setActiveTab"
    />

    <!-- Loading State -->
    <LoadingState
      v-if="loading"
      :is-loading="loading"
      title="Loading bookings..."
      description="Please wait"
      spinner-name="dots"
      class="full-width"
    />

    <!-- Empty State -->
    <NoResults
      v-else-if="!currentBookings.length"
      :icon="emptyState.icon"
      :title="emptyState.title"
      :description="emptyState.description"
      no-btn
    />

    <!-- Bookings Grid -->
    <div v-else class="bookings-grid full-width">
      <GuestBookingCard
        v-for="booking in currentBookings"
        :key="booking.documentId"
        :booking="booking"
        @click="openBookingDetails"
      />
    </div>

    <!-- Booking Details Dialog -->
    <BookingDetailsDialog v-model="showDetailsDialog" :booking="selectedBooking" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useQuery } from '@vue/apollo-composable';
import type { IBooking, IBookingsQueryResponse } from 'src/interfaces/booking';
import { BOOKINGS_QUERY } from 'src/apollo/types/queries/booking';
import GuestBookingCard from './GuestBookingCard.vue';
import BookingDetailsDialog from 'src/components/Dialogs/BookingDetailsDialog.vue';
import LoadingState from 'src/components/LoadingState.vue';
import NoResults from 'src/components/NoResult.vue';
import { useUserStore } from 'src/stores/user';
import TabsComp from 'src/components/TabsComp.vue';
import type { ITab } from 'src/interfaces/tabs';
import { EReactions } from 'src/interfaces/enums';

const userStore = useUserStore();

const { result, loading } = useQuery<IBookingsQueryResponse>(
  BOOKINGS_QUERY,
  {
    filters: {
      owner: {
        documentId: {
          eq: userStore.getUser?.documentId,
        },
      },
    },
    sort: ['createdAt:desc'],
  },
  {
    fetchPolicy: 'network-only',
  },
);

const bookings = ref<IBooking[]>([]);
const showDetailsDialog = ref<boolean>(false);
const selectedBooking = ref<IBooking | null>(null);

const PENDING_TAB = 'pending';
const OTHER_TAB = 'other';

const pendingBookings = computed(() =>
  bookings.value.filter((booking) => booking.reaction === EReactions.Pending),
);

const otherBookings = computed(() =>
  bookings.value.filter((booking) => booking.reaction !== EReactions.Pending),
);

const filterTabs = computed<ITab[]>(() => [
  { label: 'Pending', tab: PENDING_TAB, count: pendingBookings.value.length },
  { label: 'Other', tab: OTHER_TAB, count: otherBookings.value.length },
]);

const activeTab = ref<ITab>(filterTabs.value[0]!);

const currentBookings = computed(() => {
  return activeTab.value.tab === PENDING_TAB ? pendingBookings.value : otherBookings.value;
});

const emptyState = computed(() => {
  if (activeTab.value.tab === PENDING_TAB) {
    return {
      icon: 'event_note',
      title: 'No pending booking requests',
      description: 'When you send booking requests to artists, they will appear here',
    };
  }

  return {
    icon: 'history',
    title: 'No other booking requests yet',
    description: 'Accepted or rejected bookings will appear here once artists respond',
  };
});

// Watch for query results
watch(
  () => result.value?.bookings,
  (newBookings) => {
    if (newBookings) {
      bookings.value = newBookings;
    }
  },
  { immediate: true },
);

watch(
  filterTabs,
  (newTabs) => {
    const matchingTab = newTabs.find((tab) => tab.tab === activeTab.value.tab);
    activeTab.value = matchingTab ?? newTabs[0]!;
  },
  { immediate: true },
);

const setActiveTab = (tab: ITab) => {
  activeTab.value = tab;
};

const openBookingDetails = (booking: IBooking) => {
  selectedBooking.value = booking;
  showDetailsDialog.value = true;
};
</script>

<style scoped lang="scss">
.guest-bookings-list {
  .bookings-grid {
    display: grid;
    gap: 16px;
  }
}
</style>
