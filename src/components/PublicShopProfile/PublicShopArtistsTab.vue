<template>
  <div class="public-shop-artists-tab">
    <!-- Artists List -->
    <div class="artists-section">
      <div class="section-header q-mb-md bg-block border-radius-md">
        <h3 class="text-subtitle1 text-bold q-my-none">Shop Artists ({{ artists.length }})</h3>
      </div>

      <LoadingState
        v-if="loading && !artists.length"
        :is-loading="loading"
        title="Loading artists..."
        description="Please wait while we fetch the latest artists"
        spinner-name="dots"
      />

      <!-- Artists Grid -->
      <div class="artists-grid" v-if="artists.length">
        <ArtistCard
          v-for="artist in artists"
          :key="artist.documentId"
          :artist="artist"
          @click="handleArtistClick"
          @favorite="handleFavorite"
        />
      </div>

      <!-- Empty State -->
      <NoResult
        v-else
        icon="people"
        title="No Artists Yet"
        description="This shop hasn't added any artists yet"
        no-btn
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArtistCard } from '../SearchPage/index';
import { useRouter } from 'vue-router';
import type { IUser } from 'src/interfaces/user';
import LoadingState from 'src/components/LoadingState.vue';
import NoResult from 'src/components/NoResult.vue';

interface Props {
  artists: IUser[];
  loading: boolean;
}

const router = useRouter();

defineProps<Props>();

const handleArtistClick = (artist: IUser) => {
  void router.push(`/artist/${artist.documentId}`);
};

const handleFavorite = (artistDocumentId: string) => {
  // Handle favorite toggle if needed
  console.log('Artist favorited:', artistDocumentId);
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
