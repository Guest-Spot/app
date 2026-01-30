<template>
  <div class="guest-spot-bookings-list flex column q-gap-md">
    <TabsComp
      size="sm"
      unelevated
      send-initial-tab
      :tabs="filterTabs"
      :activeTab="activeFilterTab"
      use-query
      @set-active-tab="setActiveTab"
    />

    <LoadingState
      v-if="loading && !filteredBookings.length"
      :is-loading="loading"
      title="Loading bookings..."
      description="Please wait while we fetch the bookings"
      spinner-name="dots"
    />

    <VirtualListV2
      v-else-if="filteredBookings.length"
      :items="filteredBookings"
      :min-item-size="200"
      :gap="16"
      :loading="loading"
      :has-more="hasMore"
      @load-more="$emit('load-more')"
    >
      <template #default="{ item }">
        <GuestSpotBookingCard
          :booking="asBooking(item)"
          @approve="handleApprove"
          @reject="handleReject"
          @view-details="handleViewDetails"
        />
      </template>
    </VirtualListV2>

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
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import type { IGuestSpotBooking } from 'src/interfaces/guestSpot';
import { EGuestSpotBookingStatus as Status } from 'src/interfaces/enums';
import type { EGuestSpotBookingStatus } from 'src/interfaces/enums';
import { TabsComp, LoadingState, NoResult } from 'src/components';
import type { ITab } from 'src/interfaces/tabs';
import VirtualListV2 from 'src/components/VirtualListV2.vue';
import GuestSpotBookingCard from 'src/components/GuestSpot/GuestSpotBookingCard.vue';

const route = useRoute();
const VALID_TAB_VALUES = ['pending', 'accepted', 'rejected'] as const;

interface Props {
  bookings: IGuestSpotBooking[];
  loading?: boolean;
  hasMore?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  hasMore: true,
});

const emit = defineEmits<{
  approve: [documentId: string];
  reject: [documentId: string, rejectNote?: string];
  viewDetails: [booking: IGuestSpotBooking];
  'load-more': [];
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

watch(
  () => route.query.tab as string | undefined,
  (tabFromUrl) => {
    if (tabFromUrl && VALID_TAB_VALUES.includes(tabFromUrl as (typeof VALID_TAB_VALUES)[number])) {
      const tabObj = filterTabs.find((t) => t.tab === tabFromUrl);
      if (tabObj) activeFilterTab.value = tabObj;
    }
  },
  { immediate: true },
);

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

const asBooking = (item: unknown): IGuestSpotBooking => item as IGuestSpotBooking;
</script>

<style scoped lang="scss">
.guest-spot-bookings-list {
  width: 100%;
}

.bookings-header {
  width: 100%;
}
</style>
