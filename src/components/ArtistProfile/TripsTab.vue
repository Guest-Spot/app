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
    documentId: '1',
    name: 'Go to New York',
    location: {
      city: 'New York',
      address: 'New York, NY',
      latitude: '40.7128',
      longitude: '-74.0060'
    },
    date: '2024-01-15',
    startTime: '20:00',
    endTime: '22:30',
    description: 'Amazing performance at one of the most iconic venues in the world. The crowd was incredible and the energy was electric.',
    ownerDocumentId: '1'
  },
  {
    documentId: '2',
    name: 'Go to  Los Angeles',
    location: {
      city: 'Los Angeles',
      address: 'Los Angeles, CA',
      latitude: '34.0522',
      longitude: '-118.2437'
    },
    date: '2024-02-20',
    startTime: '19:30',
    endTime: '21:45',
    description: 'Excited to perform at this legendary outdoor amphitheater. It\'s going to be an unforgettable experience.',
    ownerDocumentId: '2'
  },
  {
    documentId: '3',
    name: 'Go to Miami',
    location: {
      city: 'Miami',
      address: 'Miami, FL',
      latitude: '25.7617',
      longitude: '-80.1918'
    },
    date: '2024-01-30',
    startTime: '23:00',
    endTime: '01:30',
    description: 'Great club show with an intimate crowd. The sound system was perfect and the atmosphere was amazing.',
    ownerDocumentId: '3'
  }
]);

// Dialog state
const showTripDialog = ref(false);
const isEditingTrip = ref(false);
const currentTrip = ref<ITrip>({
  documentId: '',
  location: {
    city: '',
    address: '',
    latitude: '',
    longitude: ''
  },
  date: '',
  startTime: '',
  endTime: '',
  description: '',
  name: '',
  ownerDocumentId: '4'
});

const addNewTrip = () => {
  isEditingTrip.value = false;
  currentTrip.value = {
    documentId: '',
    location: {
      city: '',
      address: '',
      latitude: '',
      longitude: ''
    },
    date: '',
    startTime: '',
    endTime: '',
    description: '',
    name: '',
    ownerDocumentId: ''
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
