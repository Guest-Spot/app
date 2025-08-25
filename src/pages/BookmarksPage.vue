<template>
  <q-page class="q-pb-xl q-pt-lg flex column items-start q-gap-md">
    <div class="container">
      <!-- Header Section -->
      <div class="bookmarks-header q-mb-lg hidden">
        <div class="header-content">
          <div class="header-left">
            <h6 class="page-title">Bookmarks</h6>
            <p class="page-subtitle">Your saved shops and artists</p>
          </div>
        </div>
        
        <!-- Stats -->
        <div class="stats-container">
          <div class="stat-item">
            <span class="stat-number">{{ favoriteShops.length }}</span>
            <span class="stat-label">Shops</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ favoriteArtists.length }}</span>
            <span class="stat-label">Artists</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ totalFavorites }}</span>
            <span class="stat-label">Total</span>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <SearchTabs v-model="activeTab" />

      <!-- Main Content Area -->
      <div class="main-content flex column q-gap-md">
        <!-- Results Counter -->
        <div class="results-counter">
          <span class="counter-text">
            {{ activeTab === TAB_SHOPS ? favoriteShops.length : favoriteArtists.length }} 
            {{ activeTab === TAB_SHOPS ? 'shops' : 'artists' }} saved
          </span>
        </div>

        <!-- Shops Tab Content -->
        <div v-if="activeTab === TAB_SHOPS" class="tab-content">
          <div v-if="favoriteShops.length === 0" class="no-results">
            <q-icon name="bookmark_border" size="60px" color="grey-5" />
            <h3 class="no-results-title">No shops bookmarked yet</h3>
            <p class="no-results-description">Start exploring and add your favorite shops to bookmarks</p>
            <q-btn
              color="dark"
              label="Explore Shops"
              icon="explore"
              rounded
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
          <div v-if="favoriteArtists.length === 0" class="no-results">
            <q-icon name="bookmark_border" size="60px" color="grey-5" />
            <h3 class="no-results-title">No artists bookmarked yet</h3>
            <p class="no-results-description">Start exploring and add your favorite artists to bookmarks</p>
            <q-btn
              color="dark"
              label="Explore Artists"
              icon="explore"
              rounded
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
import { useFavorites, type FavoriteShop, type FavoriteArtist } from '../modules/useFavorites';
import { useRouter } from 'vue-router';

// Types for compatibility
type Shop = {
  id: number;
  name: string;
  location: string;
  description: string;
  image?: string;
  addedAt?: number;
};

type Artist = {
  id: number;
  name: string;
  specialty: string;
  bio: string;
  avatar?: string;
  addedAt?: number;
};

// Tab management
const activeTab = ref(TAB_SHOPS);

// Use favorites composable
const {
  favoriteShops,
  favoriteArtists,
  totalFavorites,
} = useFavorites();

const router = useRouter();

// Methods
const selectShop = (shop: FavoriteShop | Shop) => {
  void router.push(`/shop/${shop.id}`);
};

const selectArtist = (artist: FavoriteArtist | Artist) => {
  void router.push(`/artist/${artist.id}`);
};

const toggleFavorite = (id: number) => {
  console.log('Toggle favorite for ID:', id);
  // Toggle favorite status is handled by the card components
};

</script>

<style scoped lang="scss">
.bookmarks-header {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 24px;
  border: 1px solid var(--shadow-light);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.header-left {
  flex: 1;
}

.page-title {
  margin: 0 0 8px 0;
  color: var(--brand-dark);
  font-size: 32px;
  font-weight: 700;
}

.page-subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: 16px;
  line-height: 1.5;
}

.header-right {
  flex-shrink: 0;
}

.stats-container {
  display: flex;
  gap: 24px;
  justify-content: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  min-width: 80px;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: var(--brand-dark);
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.results-counter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 4px 16px;
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
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid var(--shadow-light);
}

.no-results-title {
  margin: 20px 0 10px 0;
  color: var(--brand-dark);
  font-size: 24px;
  font-weight: 600;
}

.no-results-description {
  margin: 0 0 20px 0;
  color: var(--text-secondary);
  font-size: 16px;
  line-height: 1.5;
}

.clear-dialog {
  min-width: 400px;
}

// Responsive design
@media (min-width: 768px) {
  .content-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stats-container {
    justify-content: flex-start;
  }
}

@media (min-width: 1024px) {
  .content-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
