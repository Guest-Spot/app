<template>
  <div class="trips-tab flex column q-gap-md">
    <!-- Trips Header -->
    <div class="trips-header bg-block border-radius-lg">
      <h3 class="text-subtitle1 text-bold q-my-none">My Portfolio ({{ trips.length }})</h3>
      <q-btn
        color="primary"
        icon="add"
        size="sm"
        @click="addNewTrip"
        round
        unelevated
      />
    </div>

    <!-- Trips List -->
    <div v-if="trips.length" class="trips-list">
      <div
        v-for="(trip, index) in trips"
        :key="index"
        class="trip-item bg-block border-radius-md"
      >
        <div class="trip-header bg-block q-pa-md">
          <div class="trip-location">
            <q-icon name="location_on" color="primary" size="20px" />
            <span class="location-text">{{ trip.location }}</span>
          </div>
          <div class="trip-actions">
            <q-btn
              round
              color="bg-block"
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
              <span class="info-label">Start time:</span>
              <span class="info-value">{{ trip.startTime }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">End time:</span>
              <span class="info-value">{{ trip.endTime }}</span>
            </div>
          </div>

          <div class="trip-description">
            <p>{{ trip.description }}</p>
          </div>

          <div class="trip-photos hidden" v-if="trip.photos && trip.photos.length > 0">
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
    <div v-else class="empty-state bg-block border-radius-lg">
      <q-icon name="flight_takeoff" size="60px" color="grey-6" />
      <h3 class="empty-title">No trips recorded yet</h3>
      <p class="empty-description">Start documenting your performances and travels</p>
      <q-btn
        class="bg-block"
        icon="add"
        label="Add Your First Trip"
        @click="addNewTrip"
        rounded
        unelevated
      />
    </div>

    <!-- Trip Dialog -->
    <TripDialog
      v-model="showTripDialog"
      :trip="currentTrip"
      :is-editing="isEditingTrip"
      @confirm="handleTripConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TripDialog from 'src/components/Dialogs/TripDialog.vue';

interface Trip {
  id: number;
  location: string;
  date: string;
  venue: string;
  startTime: string;
  endTime: string;
  description: string;
  photos: string[];
}

interface TripForm {
  id: number;
  location: string;
  date: string;
  venue: string;
  startTime: string;
  endTime: string;
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
    startTime: '20:00',
    endTime: '22:30',
    description: 'Amazing performance at one of the most iconic venues in the world. The crowd was incredible and the energy was electric.',
    photos: [
      'examples/example1.jpg',
      'examples/example2.jpeg'
    ]
  },
  {
    id: 2,
    location: 'Los Angeles, CA',
    date: '2024-02-20',
    venue: 'The Hollywood Bowl',
    startTime: '19:30',
    endTime: '21:45',
    description: 'Excited to perform at this legendary outdoor amphitheater. It\'s going to be an unforgettable experience.',
    photos: []
  },
  {
    id: 3,
    location: 'Miami, FL',
    date: '2024-01-30',
    venue: 'American Airlines Arena',
    startTime: '23:00',
    endTime: '01:30',
    description: 'Great club show with an intimate crowd. The sound system was perfect and the atmosphere was amazing.',
    photos: [
      'examples/example1.jpg',
      'examples/example2.jpeg'
    ]
  }
]);

// Dialog state
const showTripDialog = ref(false);
const isEditingTrip = ref(false);
const currentTrip = ref<TripForm>({
  id: 0,
  location: '',
  date: '',
  venue: '',
  startTime: '',
  endTime: '',
  description: '',
  photos: []
});

const addNewTrip = () => {
  isEditingTrip.value = false;
  currentTrip.value = {
    id: Date.now(), // Generate temporary ID
    location: '',
    date: '',
    venue: '',
    startTime: '',
    endTime: '',
    description: '',
    photos: []
  };
  showTripDialog.value = true;
};

const editTrip = (index: number) => {
  isEditingTrip.value = true;
  currentTrip.value = { ...trips.value[index] } as TripForm;
  showTripDialog.value = true;
};

const handleTripConfirm = (trip: TripForm) => {
  if (isEditingTrip.value) {
    // Update existing trip
    const index = trips.value.findIndex(t => t.id === trip.id);
    if (index !== -1) {
      trips.value[index] = { ...trip };
    }
  } else {
    // Add new trip
    trips.value.push({ ...trip });
  }
};

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
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
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
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-label {
  font-weight: 600;
  min-width: 60px;
}

.trip-description {
  p {
    margin: 0;
    line-height: 1.6;
  }
}

.trip-photos {
  padding-top: 20px;
}

.photos-title {
  margin: 0 0 15px 0;
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
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-title {
  margin: 20px 0 10px 0;
  font-size: 24px;
  font-weight: 600;
}

.empty-description {
  margin: 0 0 30px 0;
  font-size: 16px;
  line-height: 1.5;
}
</style>
