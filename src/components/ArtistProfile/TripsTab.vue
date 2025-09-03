<template>
  <div class="trips-tab flex column q-gap-md">
    <!-- Trips Header -->
    <ListHeader :title="`Artist Trips (${trips.length})`">
      <q-btn
        color="primary"
        icon="add"
        size="sm"
        @click="addNewTrip"
        round
        unelevated
      />
    </ListHeader>

    <!-- Loading State -->
    <LoadingState
      v-if="isLoading"
      :is-loading="isLoading"
      title="Loading Trips"
      description="Please wait while we fetch your trips data"
      spinner-name="dots"
    />

    <!-- Trips List -->
    <div v-else-if="trips.length" class="trips-list">
      <ArtistTripCard
        v-for="(trip, index) in trips"
        :key="index"
        :trip="trip"
        editable
        @edit="editTrip(index)"
      />
    </div>

    <!-- Empty State -->
    <NoResult
      v-else
      icon="train"
      title="No trips recorded yet"
      description="Start documenting your performances and travels"
      link-label="Add Your First Trip"
      link-icon="add"
      @click="addNewTrip"
    />

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
import ArtistTripCard from 'src/components/ArtistTripCard.vue';
import LoadingState from 'src/components/LoadingState.vue';
import NoResult from 'src/components/NoResult.vue';
import type { ITrip, ITripForm } from 'src/interfaces/trip';
import ListHeader from 'src/components/ListHeader.vue';

// State
const isLoading = ref(false);

// Mock trips data
const trips = ref<ITrip[]>([
  {
    uuid: '1',
    title: 'Go to New York',
    location: 'New York, NY',
    date: '2024-01-15',
    startTime: '20:00',
    endTime: '22:30',
    description: 'Amazing performance at one of the most iconic venues in the world. The crowd was incredible and the energy was electric.',
    status: '',
    artistUuid: '1'
  },
  {
    uuid: '2',
    title: 'Go to Los Angeles',
    location: 'Los Angeles, CA',
    date: '2024-02-20',
    startTime: '19:30',
    endTime: '21:45',
    description: 'Excited to perform at this legendary outdoor amphitheater. It\'s going to be an unforgettable experience.',
    status: '',
    artistUuid: '2'
  },
  {
    uuid: '3',
    title: 'Go to Miami',
    location: 'Miami, FL',
    date: '2024-01-30',
    startTime: '23:00',
    endTime: '01:30',
    description: 'Great club show with an intimate crowd. The sound system was perfect and the atmosphere was amazing.',
    status: '',
    artistUuid: '3'
  }
]);

// Dialog state
const showTripDialog = ref(false);
const isEditingTrip = ref(false);
const currentTrip = ref<ITrip>({
  uuid: '',
  location: '',
  date: '',
  startTime: '',
  endTime: '',
  description: '',
  title: '',
  status: '',
  artistUuid: '4'
});

const addNewTrip = () => {
  isEditingTrip.value = false;
  currentTrip.value = {
    uuid: '',
    location: '',
    date: '',
    startTime: '',
    endTime: '',
    description: '',
    title: '',
    status: '',
    artistUuid: ''
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
