<template>
  <div class="trip-item bg-block border-radius-md q-pa-lg">
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
          <q-icon name="location_on" size="16px" color="grey-6" />
          <span class="date-label">Location:</span>
          <span class="date-value text-grey-6">{{ trip.location }}</span>
        </div>
        <div class="date-item">
          <q-icon name="event" size="16px" color="grey-6" />
          <span class="date-label">Date:</span>
          <span class="date-value text-grey-6">{{ formatDate(trip.date) }}</span>
        </div>
        <div class="date-item">
          <q-icon name="schedule" size="16px" color="grey-6" />
          <span class="date-label">Start:</span>
          <span class="date-value text-grey-6">{{ formatTime(trip.startTime) }}</span>
        </div>
        <div class="date-item">
          <q-icon name="schedule" size="16px" color="grey-6" />
          <span class="date-label">End:</span>
          <span class="date-value text-grey-6">{{ formatTime(trip.endTime) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ITrip } from 'src/interfaces/trip';
import useDate from 'src/modules/useDate';

interface Props {
  trip: ITrip;
}

defineProps<Props>();
const { formatTime, formatDate } = useDate();

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
</script>

<style scoped lang="scss">
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
</style>
