<template>
  <div class="public-shop-artists-tab">
    <!-- Artists List -->
    <div class="artists-section">
      <div class="section-header q-mb-md bg-block border-radius-md">
        <h3 class="text-subtitle1 text-bold q-my-none">Shop Artists ({{ artists.length }})</h3>
      </div>

      <!-- Artists Grid -->
      <div class="artists-grid" v-if="artists.length">
        <ArtistCard
          v-for="artist in artists"
          :key="artist.id"
          :artist="artist"
          @click="handleArtistClick"
          @favorite="handleFavorite"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state bg-block border-radius-lg">
        <q-icon name="people" size="60px" color="grey-6" />
        <h3 class="empty-title">No Artists Yet</h3>
        <p class="empty-description text-grey-6">This shop hasn't added any artists yet</p>
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
}

.empty-title {
  margin: 16px 0 8px 0;
  font-size: 20px;
  font-weight: 600;
}

.empty-description {
  margin: 0;
  font-size: 16px;
}
</style>
