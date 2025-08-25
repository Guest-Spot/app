<template>
  <div class="public-shop-artists-tab">
    <!-- Artists List -->
    <div class="artists-section">
      <div class="section-header q-mb-md">
        <h3 class="text-subtitle1 text-bold q-my-none">Shop Artists ({{ artists.length }})</h3>
      </div>

      <!-- Artists Grid -->
      <div class="artists-grid" v-if="artists.length > 0">
        <ArtistCard
          v-for="artist in artists"
          :key="artist.id"
          :artist="artist"
          @click="handleArtistClick"
          @favorite="handleFavorite"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <q-icon name="people" size="60px" color="grey-6" />
        <h3 class="empty-title">No Artists Yet</h3>
        <p class="empty-description">This shop hasn't added any artists yet</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArtistCard } from '../SearchPage/index';
import { useRouter } from 'vue-router';
import type { IArtist } from '../../interfaces/artist';

interface Props {
  artists: IArtist[];
}

const router = useRouter();

defineProps<Props>();

const handleArtistClick = (artist: IArtist) => {
  void router.push(`/artist/${artist.id}`);
};

const handleFavorite = (artistId: number) => {
  // Handle favorite toggle if needed
  console.log('Artist favorited:', artistId);
};
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

.artists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  border: 1px solid var(--shadow-light);
}

.empty-title {
  margin: 16px 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--brand-dark);
}

.empty-description {
  margin: 0;
  color: #666;
  font-size: 16px;
}

// Responsive design
@media (max-width: 768px) {
  .artists-grid {
    grid-template-columns: 1fr;
  }
}
</style>
