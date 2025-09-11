<template>
  <div class="trip-item bg-block border-radius-md">
    <div class="trip-header bg-block q-pa-md">
      <div class="trip-location">
        <q-icon name="train" color="primary" size="20px" />
        <span class="location-text">{{ trip.name }}</span>
      </div>
      <div class="trip-actions">
        <q-btn
          v-if="editable"
          round
          class="bg-block"
          icon="edit"
          size="sm"
          unelevated
          @click="$emit('edit', trip)"
        />
      </div>
    </div>

    <div class="trip-content">
      <div class="trip-description text-grey-6 q-mb-md">
        <p>{{ trip.description }}</p>
      </div>

      <div class="trip-info">
        <div class="info-row">
          <q-icon name="location_on" color="grey-6" size="20px" />
          <span class="info-label">Location:</span>
          <span class="info-value text-grey-6"
            >{{ trip.location.city }}, {{ trip.location.address }}</span
          >
        </div>
        <div class="info-row">
          <q-icon name="event" color="grey-6" size="20px" />
          <span class="info-label">Date:</span>
          <span class="info-value text-grey-6">{{ trip.date }}</span>
        </div>
        <div class="info-row">
          <q-icon name="schedule" color="grey-6" size="20px" />
          <span class="info-label">Start time:</span>
          <span class="info-value text-grey-6">{{ trip.startTime }}</span>
        </div>
        <div class="info-row">
          <q-icon name="schedule" color="grey-6" size="20px" />
          <span class="info-label">End time:</span>
          <span class="info-value text-grey-6">{{ trip.endTime }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ITrip } from 'src/interfaces/trip';

defineProps<{
  trip: ITrip;
  editable?: boolean;
}>();

defineEmits<{
  (e: 'edit', trip: ITrip): void;
}>();
</script>

<style scoped lang="scss">
.trip-item {
  overflow: hidden;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.trip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trip-location {
  display: flex;
  align-items: center;
  gap: 10px;
}

.location-text {
  font-weight: 600;
  font-size: 18px;
}

.trip-actions {
  display: flex;
  gap: 10px;
}

.trip-content {
  padding: 20px;
}

.trip-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-label {
  font-weight: 600;
  min-width: 90px;
}

.trip-description {
  p {
    margin: 0;
    line-height: 1.6;
  }
}
</style>
