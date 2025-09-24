<template>
  <div class="shop-artists-tab">
    <!-- Artists List -->
    <div class="artists-section">
      <div class="section-header q-mb-md bg-block border-radius-md">
        <div class="flex q-gap-xs">
          <TabsComp
            size="sm"
            unelevated
            send-initial-tab
            :tabs="filterTabs"
            :activeTab="activeFilter"
            @set-active-tab="setActiveFilter"
          />
        </div>
        <q-btn
          color="primary"
          icon="person_add"
          flat
          @click="showAddArtistDialog = true"
          round
          class="bg-block"
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
      :invited-document-ids="invitedDocumentIds"
      @artist-invited="handleArtistInvited"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { ArtistInviteDialog } from 'src/components/Dialogs';
import { ArtistCard } from 'src/components/SearchPage/index';
import type { IArtist } from 'src/interfaces/artist';
import { SHOP_ARTISTS_QUERY } from 'src/apollo/types/shop';
import { useLazyQuery } from '@vue/apollo-composable';
import type { IGraphQLShopArtistsResult } from 'src/interfaces/shop';
import { useProfileStore } from 'src/stores/profile';
import type { ITab } from 'src/interfaces/tabs';
import TabsComp from 'src/components/TabsComp.vue';

const ACCEPTED_TAB = 'accepted';
const PENDING_TAB = 'pending';

const {
  load: loadShopArtists,
  onResult: onResultShopArtists,
  onError: onErrorShopArtists,
  refetch: refetchShopArtists,
} = useLazyQuery<IGraphQLShopArtistsResult>(SHOP_ARTISTS_QUERY);
const profileStore = useProfileStore();

// Artists data
const artists = ref<IArtist[]>([]);
const showAddArtistDialog = ref(false);
const shopId = ref(1);

const invitedDocumentIds = computed(() => artists.value.map((artist) => artist.documentId));
const filterTabs = computed<ITab[]>(() => [
  { label: 'Accepted', tab: ACCEPTED_TAB, count: artists.value.length },
  { label: 'Pending', tab: PENDING_TAB, count: 0 },
]);

const activeFilter = ref<ITab>(filterTabs.value[0]!);

const setActiveFilter = (filter: ITab) => {
  activeFilter.value = filter;
};

const handleArtistClick = (artist: IArtist) => {
  console.log('Artist clicked:', artist);
};

const handleFavoriteToggle = (artistDocumentId: string) => {
  console.log('Favorite toggled for artist:', artistDocumentId);
};

const handleArtistInvited = () => {
  void refetchShopArtists();
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
