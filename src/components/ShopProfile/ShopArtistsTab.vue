<template>
  <div class="shop-artists-tab">
    <!-- Artists List -->
    <div class="artists-section">
      <div class="section-header q-mb-md bg-block border-radius-md">
        <h3 class="text-subtitle1 text-bold q-my-none">Shop Artists ({{ artists.length }})</h3>
        <q-btn
          color="primary"
          icon="person_add"
          @click="showAddArtistDialog = true"
          round
          size="sm"
          unelevated
        />
      </div>

      <!-- Artists Grid -->
      <div class="artists-grid" v-if="artists.length">
        <ArtistCard
          v-for="artist in artists"
          :key="artist.documentId"
          :artist="artist"
          @click="handleArtistClick"
          @favorite="handleFavoriteToggle"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state bg-block border-radius-lg">
        <q-icon name="people" size="60px" color="grey-6" />
        <h3 class="empty-title">No Artists Yet</h3>
        <p class="empty-description text-grey-6">Invite your first artist to showcase their work</p>
        <q-btn
          class="bg-block"
          icon="person_add"
          label="Invite First Artist"
          @click="showAddArtistDialog = true"
          rounded
          unelevated
        />
      </div>
    </div>

    <!-- Invite Artist Dialog -->
    <ArtistInviteDialog v-model="showAddArtistDialog" :shop-id="shopId" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ArtistInviteDialog } from 'src/components/Dialogs';
import { ArtistCard } from 'src/components/SearchPage/index';
import type { IArtist } from 'src/interfaces/artist';

// Artists data
const artists = ref<IArtist[]>([
  {
    documentId: '1',
    createdAt: '2021-01-01',
    updatedAt: '2021-01-01',
    name: 'John Doe',
    description: 'Experienced tattoo artist specializing in traditional American style tattoos.',
    avatar: {
      url: 'artists/artist1.jpeg',
      id: '1',
    },
    location: {
      city: 'San Francisco, CA',
      address: '123 Main St, San Francisco, CA',
      latitude: '37.7749',
      longitude: '-122.4194',
    },
    experience: 8,
  },
  {
    documentId: '2',
    createdAt: '2021-01-02',
    updatedAt: '2021-01-02',
    name: 'Jane Smith',
    description: 'Creative artist known for beautiful watercolor style tattoos.',
    avatar: {
      url: 'artists/artist2.jpg',
      id: '2',
    },
    location: {
      city: 'New York, NY',
      address: '456 Main St, New York, NY',
      latitude: '40.7128',
      longitude: '-74.0060',
    },
    experience: 5,
  },
]);

// Dialog state
const showAddArtistDialog = ref(false);

// Shop ID (this should come from props or store in real app)
const shopId = ref(1);

const handleArtistClick = (artist: IArtist) => {
  // Handle artist card click - could navigate to artist profile or show details
  console.log('Artist clicked:', artist);
};

const handleFavoriteToggle = (artistDocumentId: string) => {
  // Handle favorite toggle - could update local state or make API call
  console.log('Favorite toggled for artist:', artistDocumentId);
};

// Expose data for parent component
defineExpose({
  artists,
});
</script>

<style scoped lang="scss">
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 4px 4px 16px;
}

.section-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.artists-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// ArtistCard component handles its own styling

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-title {
  margin: 16px 0 8px 0;
  font-size: 20px;
  font-weight: 600;
}

.empty-description {
  margin: 0 0 24px 0;
}
</style>
