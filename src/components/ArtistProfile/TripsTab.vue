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
              class="bg-block"
              icon="edit"
              size="sm"
              unelevated
              @click="editTrip(index)"
            />
          </div>
        </div>

        <div class="trip-content">
          <div class="trip-info">
            <div class="info-row">
              <span class="info-label">Date:</span>
              <span class="info-value text-grey-6">{{ trip.date }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Location:</span>
              <span class="info-value text-grey-6">{{ trip.location }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Start time:</span>
              <span class="info-value text-grey-6">{{ trip.startTime }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">End time:</span>
              <span class="info-value text-grey-6">{{ trip.endTime }}</span>
            </div>
          </div>

          <div class="trip-description">
            <p>{{ trip.description }}</p>
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
import type { ITrip, ITripForm } from 'src/interfaces/trip';

// Mock trips data
const trips = ref<ITrip[]>([
  {
    id: 1,
    uuid: '1',
    title: 'Go to New York',
    location: 'New York, NY',
    date: '2024-01-15',
    startTime: '20:00',
    endTime: '22:30',
    description: 'Amazing performance at one of the most iconic venues in the world. The crowd was incredible and the energy was electric.',
    artist: {
      id: 1,
      uuid: '1',
      name: 'John Doe',
      bio: 'Experienced tattoo artist specializing in traditional American style tattoos with a modern twist.',
      avatar: 'artists/artist1.jpeg'
    }
  },
  {
    id: 2,
    uuid: '2',
    title: 'Go to Los Angeles',
    location: 'Los Angeles, CA',
    date: '2024-02-20',
    startTime: '19:30',
    endTime: '21:45',
    description: 'Excited to perform at this legendary outdoor amphitheater. It\'s going to be an unforgettable experience.',
    artist: {
      id: 2,
      uuid: '2',
      name: 'Jane Smith',
      bio: 'Creative artist known for beautiful watercolor style tattoos and unique designs.',
      avatar: 'artists/artist2.jpg'
    }
  },
  {
    id: 3,
    uuid: '3',
    title: 'Go to Miami',
    location: 'Miami, FL',
    date: '2024-01-30',
    startTime: '23:00',
    endTime: '01:30',
    description: 'Great club show with an intimate crowd. The sound system was perfect and the atmosphere was amazing.',
    artist: {
      id: 3,
      uuid: '3',
      name: 'Mike Johnson',
      bio: 'Master of realistic black and grey tattoos, specializing in portraits and detailed artwork.',
      avatar: 'artists/artist3.jpg'
    }
  }
]);

// Dialog state
const showTripDialog = ref(false);
const isEditingTrip = ref(false);
const currentTrip = ref<ITrip>({
  id: 0,
  uuid: '',
  location: '',
  date: '',
  startTime: '',
  endTime: '',
  description: '',
  title: '',
  artist: {
    id: 0,
    uuid: '',
    name: '',
    bio: '',
    avatar: ''
  }
});

const addNewTrip = () => {
  isEditingTrip.value = false;
  currentTrip.value = {
    id: Date.now(), // Generate temporary ID
    uuid: '',
    location: '',
    date: '',
    startTime: '',
    endTime: '',
    description: '',
    title: '',
    artist: {
      id: 0,
      uuid: '',
      name: '',
      bio: '',
      avatar: ''
    }
  };
  showTripDialog.value = true;
};

const editTrip = (index: number) => {
  isEditingTrip.value = true;
  currentTrip.value = { ...trips.value[index] } as ITrip;
  showTripDialog.value = true;
};

const handleTripConfirm = (trip: ITripForm) => {
  console.log('trip', trip);
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
