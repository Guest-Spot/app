<template>
  <div class="trips-tab flex column q-gap-md">
    <!-- Trips Header -->
    <div class="trips-header">
      <h3 class="text-subtitle1 text-bold q-my-none">My Trips & Performances ({{ trips.length }})</h3>
      <q-btn
        color="dark"
        icon="add"
        size="sm"
        @click="addNewTrip"
        round
        unelevated
      />
    </div>

    <!-- Trips List -->
    <div class="trips-list">
      <div
        v-for="(trip, index) in trips"
        :key="index"
        class="trip-item"
      >
        <div class="trip-header">
          <div class="trip-location">
            <q-icon name="location_on" color="primary" size="20px" />
            <span class="location-text">{{ trip.location }}</span>
          </div>
          <div class="trip-actions">
            <q-btn
              round
              color="dark"
              icon="edit"
              size="sm"
              @click="editTrip(index)"
            />
            <!-- <q-btn
              round
              color="negative"
              icon="delete"
              size="sm"
              @click="deleteTrip(index)"
            /> -->
          </div>
        </div>
        
        <div class="trip-content">
          <div class="trip-info">
            <div class="info-row">
              <span class="info-label">Date:</span>
              <span class="info-value">{{ trip.date }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Venue:</span>
              <span class="info-value">{{ trip.venue }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Type:</span>
              <q-chip
                :label="trip.type"
                :color="getTripTypeColor(trip.type)"
                text-color="white"
                size="sm"
              />
            </div>
            <div class="info-row">
              <span class="info-label">Status:</span>
              <q-chip
                :label="trip.status"
                :color="getStatusColor(trip.status)"
                text-color="white"
                size="sm"
              />
            </div>
          </div>
          
          <div class="trip-description">
            <p>{{ trip.description }}</p>
          </div>
          
          <div class="trip-photos" v-if="trip.photos && trip.photos.length > 0">
            <h5 class="photos-title">Photos from this trip:</h5>
            <div class="photos-grid">
              <q-img
                v-for="(photo, photoIndex) in trip.photos"
                :key="photoIndex"
                :src="photo"
                :ratio="1"
                class="trip-photo"
                spinner-color="primary"
                spinner-size="32px"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="trips.length === 0" class="empty-state">
      <q-icon name="flight_takeoff" size="80px" color="grey-5" />
      <h3 class="empty-title">No trips recorded yet</h3>
      <p class="empty-description">Start documenting your performances and travels</p>
      <q-btn
        color="primary"
        icon="add"
        label="Add Your First Trip"
        @click="addNewTrip"
        rounded
        unelevated
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Trip {
  id: number;
  location: string;
  date: string;
  venue: string;
  type: string;
  status: string;
  description: string;
  photos: string[];
}

// Mock trips data
const trips = ref<Trip[]>([
  {
    id: 1,
    location: 'New York, NY',
    date: '2024-01-15',
    venue: 'Madison Square Garden',
    type: 'Concert',
    status: 'Completed',
    description: 'Amazing performance at one of the most iconic venues in the world. The crowd was incredible and the energy was electric.',
    photos: [
      'https://picsum.photos/200/200?random=10',
      'https://picsum.photos/200/200?random=11'
    ]
  },
  {
    id: 2,
    location: 'Los Angeles, CA',
    date: '2024-02-20',
    venue: 'The Hollywood Bowl',
    type: 'Festival',
    status: 'Upcoming',
    description: 'Excited to perform at this legendary outdoor amphitheater. It\'s going to be an unforgettable experience.',
    photos: []
  },
  {
    id: 3,
    location: 'Miami, FL',
    date: '2024-01-30',
    venue: 'American Airlines Arena',
    type: 'Club Show',
    status: 'Completed',
    description: 'Great club show with an intimate crowd. The sound system was perfect and the atmosphere was amazing.',
    photos: [
      'https://picsum.photos/200/200?random=12'
    ]
  }
]);

const getTripTypeColor = (type: string): string => {
  const colors: { [key: string]: string } = {
    'Concert': 'primary',
    'Festival': 'secondary',
    'Club Show': 'accent',
    'Studio Session': 'info'
  };
  return colors[type] || 'grey';
};

const getStatusColor = (status: string): string => {
  const colors: { [key: string]: string } = {
    'Completed': 'positive',
    'Upcoming': 'warning',
    'Cancelled': 'negative',
    'In Progress': 'info'
  };
  return colors[status] || 'grey';
};

const addNewTrip = () => {
  console.log('Add new trip clicked');
  // TODO: Implement add new trip functionality
};

const editTrip = (index: number) => {
  console.log('Edit trip clicked', index);
  // TODO: Implement edit trip functionality
};

// const deleteTrip = (index: number) => {
//   console.log('Delete trip clicked', index);
//   // TODO: Implement delete trip functionality
//   trips.value.splice(index, 1);
// };

// Expose data for parent component
defineExpose({
  trips
});
</script>

<style scoped lang="scss">
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

.section-title {
  margin: 0;
  color: var(--brand-dark);
  font-size: 24px;
  font-weight: 600;
}

.trips-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.trip-item {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid var(--shadow-light);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px var(--shadow-light);
  }
}

.trip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.4);
  // backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--shadow-light);
}

.trip-location {
  display: flex;
  align-items: center;
  gap: 10px;
}

.location-text {
  font-weight: 600;
  color: var(--brand-dark);
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
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-label {
  font-weight: 600;
  color: var(--brand-dark);
  min-width: 60px;
}

.info-value {
  color: var(--brand-dark);
}

.trip-description {
  margin-bottom: 20px;
  
  p {
    margin: 0;
    color: var(--brand-dark);
    line-height: 1.6;
  }
}

.trip-photos {
  border-top: 1px solid var(--shadow-light);
  padding-top: 20px;
}

.photos-title {
  margin: 0 0 15px 0;
  color: var(--brand-dark);
  font-size: 16px;
  font-weight: 600;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
}

.trip-photo {
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  border: 1px solid var(--shadow-light);
}

.empty-title {
  margin: 20px 0 10px 0;
  color: var(--brand-dark);
  font-size: 24px;
  font-weight: 600;
}

.empty-description {
  margin: 0 0 30px 0;
  color: var(--brand-dark);
  font-size: 16px;
  line-height: 1.5;
}
</style>
