<template>
  <q-page class="q-pb-xl q-pt-lg flex column items-start q-gap-md">
    <div class="container">
      <!-- Navigation Tabs -->
      <SearchTabs v-model="activeTab" />

      <!-- Main Content Area -->
      <div class="main-content flex column q-gap-md q-mt-lg">
        <!-- Shops Tab Content -->
        <div v-if="activeTab === TAB_SHOPS" class="tab-content">
          <div v-if="favoriteShops.length === 0" class="no-results bg-block border-radius-md">
            <q-icon name="bookmark_border" size="60px" color="grey-6" />
            <h3 class="no-results-title">No shops bookmarked yet</h3>
            <p class="no-results-description text-grey-6">Start exploring and add your favorite shops to bookmarks</p>
            <q-btn
              label="Explore Shops"
              icon="explore"
              class="bg-block"
              rounded
              unelevated
              @click="$router.push('/')"
            />
          </div>
          <div v-else class="content-grid">
            <ShopCard
              v-for="shop in favoriteShops"
              :key="shop.id"
              :shop="shop"
              @click="selectShop"
              @favorite="toggleFavorite"
            />
          </div>
        </div>

        <!-- Artists Tab Content -->
        <div v-else-if="activeTab === TAB_ARTISTS" class="tab-content">
          <div v-if="favoriteArtists.length === 0" class="no-results bg-block border-radius-md">
            <q-icon name="bookmark_border" size="60px" color="grey-6" />
            <h3 class="no-results-title">No artists bookmarked yet</h3>
            <p class="no-results-description text-grey-6">Start exploring and add your favorite artists to bookmarks</p>
            <q-btn
              label="Explore Artists"
              icon="explore"
              class="bg-block"
              rounded
              unelevated
              @click="$router.push('/')"
            />
          </div>
          <div v-else class="content-grid">
            <ArtistCard
              v-for="artist in favoriteArtists"
              :key="artist.id"
              :artist="artist"
              @click="selectArtist"
              @favorite="toggleFavorite"
            />
          </div>
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
import type { IShop } from '../interfaces/shop';
import type { IArtist } from '../interfaces/artist';

// Tab management
const activeTab = ref(TAB_SHOPS);

// Use favorites composable
const {
  favoriteShops,
  favoriteArtists,
} = useFavorites();

const router = useRouter();

// Methods
const selectShop = (shop: IShop) => {
  void router.push(`/shop/${shop.id}`);
};

const selectArtist = (artist: IArtist) => {
  void router.push(`/artist/${artist.id}`);
};

const toggleFavorite = (id: number) => {
  console.log('Toggle favorite for ID:', id);
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

.tab-content {
  min-height: 400px;
}

.content-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
}

.no-results {
  text-align: center;
  padding: 60px 20px;
}

.no-results-title {
  margin: 20px 0 10px 0;
  font-size: 24px;
  font-weight: 600;
}

.no-results-description {
  margin: 0 0 20px 0;
  font-size: 16px;
  line-height: 1.5;
}

.clear-dialog {
  min-width: 400px;
}
</style>
