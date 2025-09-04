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
          :key="artist.uuid"
          :artist="artist"
          @click="handleArtistClick"
          @favorite="handleFavorite"
        >
          <template #footer>
            <q-btn
              class="bg-block full-width"
              text-color="primary"
              unelevated
              rounded
              label="Book Artist"
              :disable="!artist.uuid"
              icon="calendar_month"
              @click.stop
            />
          </template>
        </ArtistCard>
      </div>

      <!-- Empty State -->
      <NoResult
        v-else
        icon="people"
        title="No Artists Yet"
        description="This shop hasn't added any artists yet"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArtistCard } from '../SearchPage/index';
import { useRouter } from 'vue-router';
import type { IArtist } from '../../interfaces/artist';
import LoadingState from 'src/components/LoadingState.vue';
import NoResult from 'src/components/NoResult.vue';

interface Props {
  artists: IArtist[];
  loading: boolean;
}

const router = useRouter();

defineProps<Props>();

const handleArtistClick = (artist: IArtist) => {
  void router.push(`/artist/${artist.uuid}`);
};

const handleFavorite = (artistUuid: string) => {
  // Handle favorite toggle if needed
  console.log('Artist favorited:', artistUuid);
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
