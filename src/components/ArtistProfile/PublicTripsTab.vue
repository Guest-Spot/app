<template>
  <div class="public-trips-tab flex column q-gap-md">
    <!-- Trips Header -->
    <div class="trips-header">
      <h3 class="text-subtitle1 text-bold q-my-none">Trips & Tours ({{ trips.length }})</h3>
    </div>

    <!-- Trips List -->
    <div class="trips-list" v-if="trips.length > 0">
      <div
        v-for="(trip, index) in trips"
        :key="index"
        class="trip-item"
      >
        <div class="trip-header">
          <h4 class="trip-title">{{ trip.title }}</h4>
          <q-chip
            :label="trip.status"
            :color="getStatusColor(trip.status)"
            text-color="white"
            size="sm"
            class="trip-status"
          />
        </div>
        <div class="trip-content">
          <p class="trip-description">{{ trip.description }}</p>
          <div class="trip-dates">
            <div class="date-item">
              <q-icon name="event" size="16px" color="grey-6" />
              <span class="date-label">Start:</span>
              <span class="date-value">{{ formatDate(trip.startDate) }}</span>
            </div>
            <div class="date-item">
              <q-icon name="event" size="16px" color="grey-6" />
              <span class="date-label">End:</span>
              <span class="date-value">{{ formatDate(trip.endDate) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <q-icon name="flight" size="80px" color="grey-5" />
      <h3 class="empty-title">No trips planned yet</h3>
      <p class="empty-description">This artist hasn't announced any upcoming trips or tours</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Trip {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface Props {
  trips: Trip[];
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

.trips-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 4px 4px 4px 16px;
}

.trips-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.trip-item {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px var(--shadow-light);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.trip-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.trip-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--brand-dark);
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
  color: var(--text-secondary);
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
  color: var(--brand-dark);
  font-size: 14px;
  min-width: 50px;
}

.date-value {
  color: var(--text-secondary);
  font-size: 14px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  border: 1px solid var(--shadow-light);
}

.empty-title {
  margin: 20px 0 12px 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--brand-dark);
}

.empty-description {
  margin: 0;
  color: var(--text-secondary);
  font-size: 16px;
}
</style>
