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

    <VirtualListV2
      v-else-if="bookings.length"
      :items="bookings"
      key-field="documentId"
      :min-item-size="200"
      :gap="16"
      :loading="loading"
      :has-more="hasMore"
      @load-more="emit('load-more')"
    >
      <template #default="{ item }">
        <GuestSpotBookingCard
          :booking="asBooking(item)"
          view-as="artist"
          @click="handleViewBooking(asBooking(item))"
        />
      </template>
    </VirtualListV2>

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
import VirtualListV2 from 'src/components/VirtualListV2.vue';
import GuestSpotBookingCard from './GuestSpotBookingCard.vue';

interface Props {
  bookings: IGuestSpotBooking[];
  loading?: boolean;
  hasMore?: boolean;
}

withDefaults(defineProps<Props>(), {
  loading: false,
  hasMore: true,
});

const emit = defineEmits<{
  viewBooking: [booking: IGuestSpotBooking];
  loadMore: [];
}>();

const asBooking = (item: unknown): IGuestSpotBooking => item as IGuestSpotBooking;

const handleViewBooking = (booking: IGuestSpotBooking) => {
  emit('viewBooking', booking);
};
</script>

<style scoped lang="scss">
.artist-guest-spot-bookings {
  width: 100%;
}

</style>
