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
    <BookingDetailsDialog
      v-model="showDetailsDialog"
      :booking="selectedBooking"
      @cancel-booking="handleBookingCancellation"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue';
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
import useStripe from 'src/composables/useStripe';

const userStore = useUserStore();
const { addBrowserFinishedListener, removeAllBrowserListeners } = useStripe();

const { result, loading, refetch } = useQuery<IBookingsQueryResponse>(
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
    pagination: {
      limit: 100,
    },
  },
  {
    fetchPolicy: 'network-only',
  },
);

const bookings = ref<IBooking[]>([]);
const showDetailsDialog = ref<boolean>(false);
const selectedBooking = ref<IBooking | null>(null);

const ALL_TAB = 'all';
const PENDING_TAB = 'pending';
const ACCEPTED_TAB = 'accepted';
const REJECTED_TAB = 'rejected';

const pendingBookings = computed(() =>
  bookings.value.filter((booking) => booking.reaction === EReactions.Pending),
);

const acceptedBookings = computed(() =>
  bookings.value.filter((booking) => booking.reaction === EReactions.Accepted),
);

const rejectedBookings = computed(() =>
  bookings.value.filter((booking) => booking.reaction === EReactions.Rejected),
);

const allBookingsSorted = computed(() => {
  return [...bookings.value].sort((bookingA, bookingB) => {
    const aPending = bookingA.reaction === EReactions.Pending;
    const bPending = bookingB.reaction === EReactions.Pending;

    if (aPending && !bPending) {
      return -1;
    }

    if (!aPending && bPending) {
      return 1;
    }

    return 0;
  });
});

const filterTabs = computed<ITab[]>(() => [
  { label: 'All', tab: ALL_TAB, count: bookings.value.length },
  { label: 'Pending', tab: PENDING_TAB, count: pendingBookings.value.length },
  { label: 'Accepted', tab: ACCEPTED_TAB, count: acceptedBookings.value.length },
  { label: 'Rejected', tab: REJECTED_TAB, count: rejectedBookings.value.length },
]);

const activeTab = ref<ITab>(filterTabs.value[0]!);

const currentBookings = computed(() => {
  switch (activeTab.value.tab) {
    case ALL_TAB:
      return allBookingsSorted.value;
    case PENDING_TAB:
      return pendingBookings.value;
    case ACCEPTED_TAB:
      return acceptedBookings.value;
    case REJECTED_TAB:
      return rejectedBookings.value;
    default:
      return allBookingsSorted.value;
  }
});

const emptyState = computed(() => {
  switch (activeTab.value.tab) {
    case ALL_TAB:
      return {
        icon: 'event',
        title: 'No booking requests yet',
        description: 'When you send booking requests to artists, they will appear here',
      };
    case PENDING_TAB:
      return {
        icon: 'event_note',
        title: 'No pending booking requests',
        description: 'When you send booking requests to artists, they will appear here',
      };
    case ACCEPTED_TAB:
      return {
        icon: 'thumb_up',
        title: 'No accepted booking requests yet',
        description: 'Once artists accept your requests, the bookings will appear here',
      };
    case REJECTED_TAB:
      return {
        icon: 'thumb_down',
        title: 'No rejected booking requests yet',
        description: 'If an artist rejects your request, the booking will appear here',
      };
    default:
      return {
        icon: 'event',
        title: 'No booking requests yet',
        description: 'When you send booking requests to artists, they will appear here',
      };
  }
});

const refetchBookings = async () => {
  try {
    await refetch();
  } catch (error) {
    console.error('Failed to refetch bookings:', error);
  }
};

const handleBrowserFinished = async () => {
  await refetchBookings();
};

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

const handleBookingCancellation = async (documentId: string) => {
  bookings.value = bookings.value.filter((booking) => booking.documentId !== documentId);

  if (selectedBooking.value?.documentId === documentId) {
    selectedBooking.value = null;
    showDetailsDialog.value = false;
  }

  await refetchBookings();
};

const openBookingDetails = (booking: IBooking) => {
  selectedBooking.value = booking;
  showDetailsDialog.value = true;
};

onMounted(() => {
  addBrowserFinishedListener(() => void handleBrowserFinished());
});

onBeforeUnmount(async () => {
  await removeAllBrowserListeners();
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
