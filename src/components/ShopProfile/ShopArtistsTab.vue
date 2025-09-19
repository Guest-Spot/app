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
    <ArtistInviteDialog
      v-model="showAddArtistDialog"
      :shop-id="shopId"
      @artist-invited="handleArtistInvited"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ArtistInviteDialog } from 'src/components/Dialogs';
import { ArtistCard } from 'src/components/SearchPage/index';
import type { IArtist } from 'src/interfaces/artist';
import { SHOP_ARTISTS_QUERY } from 'src/apollo/types/shop';
import { useLazyQuery } from '@vue/apollo-composable';
import type { IGraphQLShopArtistsResult } from 'src/interfaces/shop';
import { useProfileStore } from 'src/stores/profile';

const {
  load: loadShopArtists,
  onResult: onResultShopArtists,
  onError: onErrorShopArtists,
} = useLazyQuery<IGraphQLShopArtistsResult>(SHOP_ARTISTS_QUERY);

const profileStore = useProfileStore();

// Artists data
const artists = ref<IArtist[]>([]);

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

const handleArtistInvited = (artist: IArtist) => {
  // Handle artist invitation - could add to shop artists or show confirmation
  console.log('Artist invited to shop:', artist);
  // In a real app, you might want to add the artist to the shop's artist list
  // or refresh the data from the server
};

onResultShopArtists(({ data }) => {
  artists.value = data.shopArtists;
});

onErrorShopArtists((error) => {
  console.error('Error fetching invites:', error);
});

watch(() => profileStore.getShopProfile, (newProfile) => {
  if (newProfile) {
    void loadShopArtists(null, {
      documentId: newProfile.documentId,
    }, { fetchPolicy: 'network-only' });
  }
}, { immediate: true });

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
