<template>
  <div class="public-trips-tab flex column q-gap-md">
    <ListHeader :title="`Artist Trips (${trips.length})`" />

    <LoadingState
      v-if="loading && !trips.length"
      :is-loading="loading"
      title="Loading trips..."
      description="Please wait while we fetch the latest trips"
      spinner-name="dots"
    />

    <!-- Trips List -->
    <div class="trips-list" v-else-if="trips.length">
      <ArtistTripCard v-for="(trip, index) in trips" :key="`trip-${index}`" :trip="trip" />
    </div>

    <!-- Empty State -->
    <NoResult
      v-else
      icon="flight"
      title="No trips planned yet"
      description="This artist hasn't announced any upcoming trips or tours"
      no-btn
    />
  </div>
</template>

<script setup lang="ts">
import type { ITrip } from 'src/interfaces/trip';
import ListHeader from 'src/components/ListHeader.vue';
import { NoResult, LoadingState, ArtistTripCard } from 'src/components';

interface Props {
  trips: ITrip[];
  loading: boolean;
}

defineProps<Props>();
</script>

<style scoped lang="scss">
.public-trips-tab {
  width: 100%;
}

.trips-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.trip-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
}

.trip-status {
  font-weight: 600;
  font-size: 12px;
}

.trip-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.trip-description {
  margin: 0;
  line-height: 1.5;
  font-size: 16px;
}

.trip-dates {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.date-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-label {
  font-weight: 600;
  font-size: 14px;
  min-width: 50px;
}

.date-value {
  color: var(--grey-6);
  font-size: 14px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-title {
  margin: 20px 0 12px 0;
  font-size: 20px;
  font-weight: 700;
}

.empty-description {
  margin: 0;
  font-size: 16px;
}
</style>
