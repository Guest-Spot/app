<template>
  <div class="public-trips-tab flex column q-gap-md">
    <!-- Trips List -->
    <div class="trips-list" v-if="trips.length">
      <div
        v-for="(trip, index) in trips"
        :key="`trip-${index}`"
        class="trip-item bg-block border-radius-md q-pa-lg"
      >
        <q-chip
          :label="trip.status"
          :color="getStatusColor(trip.status)"
          text-color="white"
          size="sm"
          class="trip-status absolute-top-right q-ma-md"
        />
        <div class="trip-header flex column q-gap-sm q-mb-md">
          <h4 class="trip-title">{{ trip.title }}</h4>
          <p class="trip-description text-grey-6">{{ trip.description }}</p>
        </div>
        <div class="trip-content">
          <div class="trip-dates">
            <div class="date-item">
              <q-icon name="event" size="16px" color="grey-6" />
              <span class="date-label">Start:</span>
              <span class="date-value text-grey-6">{{ formatDate(trip.startTime) }}</span>
            </div>
            <div class="date-item">
              <q-icon name="event" size="16px" color="grey-6" />
              <span class="date-label">End:</span>
              <span class="date-value text-grey-6">{{ formatDate(trip.endTime) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state bg-block border-radius-lg">
      <q-icon name="flight" size="60px" color="grey-6" />
      <h3 class="empty-title">No trips planned yet</h3>
      <p class="empty-description text-grey-6">This artist hasn't announced any upcoming trips or tours</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ITrip } from 'src/interfaces/trip';

interface Props {
  trips: ITrip[];
}

defineProps<Props>();

const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'upcoming':
      return 'positive';
    case 'ongoing':
      return 'primary';
    case 'completed':
      return 'grey-6';
    case 'planning':
      return 'warning';
    default:
      return 'grey-6';
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
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
