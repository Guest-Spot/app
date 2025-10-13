<template>
  <q-page class="page q-pb-xl q-pt-lg flex column items-start q-gap-md">
    <div class="container">
      <!-- Navigation Tabs -->
      <SearchTabs v-model="activeTab" />
    </div>

    <div class="container">
      <!-- Main Content Area -->
      <div class="flex column q-gap-md flex">
        <!-- Shops Tab Content -->
        <div v-if="activeTab === TAB_SHOPS" class="tab-content">
          <div v-if="favoriteShops.length" class="flex column q-gap-md">
            <ShopCard
              v-for="shop in favoriteShops"
              :key="shop.documentId"
              :shop="shop"
              @click="selectShop"
              @favorite="toggleFavorite"
            />
          </div>
          <NoResult
            v-else
            icon="bookmark_border"
            title="No shops bookmarked yet"
            description="Start exploring and add your favorite shops to bookmarks"
            btnLabel="Explore Shops"
            btnIcon="explore"
            class="q-my-auto"
            @click-btn="$router.push('/?tab=shops')"
          />
        </div>

        <!-- Artists Tab Content -->
        <div v-else-if="activeTab === TAB_ARTISTS" class="tab-content">
          <div v-if="favoriteArtists.length" class="flex column q-gap-md">
            <ArtistCard
              v-for="artist in favoriteArtists"
              :key="artist.documentId"
              :artist="artist"
              @click="selectArtist"
              @favorite="toggleFavorite"
            />
          </div>
          <NoResult
            v-else
            icon="bookmark_border"
            title="No artists bookmarked yet"
            description="Start exploring and add your favorite artists to bookmarks"
            btnLabel="Explore Artists"
            btnIcon="explore"
            @click-btn="$router.push('/?tab=artists')"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { SearchTabs, ShopCard, ArtistCard, TAB_SHOPS, TAB_ARTISTS } from '../components/SearchPage';
import { useFavorites } from '../modules/useFavorites';
import { useRouter } from 'vue-router';
import type { IUser } from '../interfaces/user';
import NoResult from 'src/components/NoResult.vue';

// Tab management
const activeTab = ref(TAB_SHOPS);

// Use favorites composable
const { favoriteShops, favoriteArtists } = useFavorites();

const router = useRouter();

// Methods
const selectShop = (shop: IUser) => {
  void router.push(`/shop/${shop.documentId}`);
};

const selectArtist = (artist: IUser) => {
  void router.push(`/artist/${artist.documentId}`);
};

const toggleFavorite = (shopDocumentId: string) => {
  console.log('Toggle favorite for ID:', shopDocumentId);
  // Toggle favorite status is handled by the card components
};
</script>

<style scoped lang="scss">
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-left {
  flex: 1;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 700;
}

.page-subtitle {
  margin: 0;
  font-size: 16px;
  line-height: 1.5;
}

.header-right {
  flex-shrink: 0;
}

.counter-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--brand-dark);
}
</style>
