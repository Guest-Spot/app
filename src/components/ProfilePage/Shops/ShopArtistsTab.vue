<template>
  <div class="shop-artists-tab">
    <!-- Artists List -->
    <div class="artists-section">
      <div class="section-header q-mb-md">
        <h3 class="text-subtitle1 text-bold q-my-none">Shop Artists ({{ artists.length }})</h3>
        <q-btn
          color="dark"
          icon="person_add"
          @click="showAddArtistDialog = true"
          round
          size="sm"
          unelevated
        />
      </div>

      <!-- Artists Grid -->
      <div class="artists-grid" v-if="artists.length > 0">
        <ArtistCard
          v-for="artist in artists"
          :key="artist.id"
          :artist="artist"
          @click="handleArtistClick"
          @favorite="handleFavoriteToggle"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <q-icon name="people" size="60px" color="grey-6" />
        <h3 class="empty-title">No Artists Yet</h3>
        <p class="empty-description">Invite your first artist to showcase their work</p>
        <q-btn
          color="dark"
          icon="person_add"
          label="Invite First Artist"
          @click="showAddArtistDialog = true"
          rounded
          unelevated
        />
      </div>
    </div>

    <!-- Invite Artist Dialog -->
    <ArtistInviteDialog
      v-model="showAddArtistDialog"
      :shop-id="shopId"
    />
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
    id: 1,
    name: 'John Doe',
    specialty: 'Traditional Tattoo',
    bio: 'Experienced tattoo artist specializing in traditional American style tattoos.',
    avatar: 'https://picsum.photos/300/300?random=1',
    experience: 8
  },
  {
    id: 2,
    name: 'Jane Smith',
    specialty: 'Watercolor Tattoo',
    bio: 'Creative artist known for beautiful watercolor style tattoos.',
    avatar: 'https://picsum.photos/300/300?random=2',
    experience: 5
  }
]);

// Dialog state
const showAddArtistDialog = ref(false);

// Shop ID (this should come from props or store in real app)
const shopId = ref(1);

const handleArtistClick = (artist: IArtist) => {
  // Handle artist card click - could navigate to artist profile or show details
  console.log('Artist clicked:', artist);
};

const handleFavoriteToggle = (artistId: number) => {
  // Handle favorite toggle - could update local state or make API call
  console.log('Favorite toggled for artist:', artistId);
};

// Expose data for parent component
defineExpose({
  artists
});
</script>

<style scoped lang="scss">
.section-header {
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
  font-size: 24px;
  font-weight: 600;
  color: var(--brand-dark);
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
  color: var(--brand-dark);
}

.empty-description {
  margin: 0 0 24px 0;
  color: #666;
}


</style>
