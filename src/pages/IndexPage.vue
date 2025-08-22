<template>
  <q-page class="q-pb-xl q-pt-lg flex column items-start q-gap-md">
    <div class="q-my-auto full-width">
      <div class="container">
        <!-- Search Section -->
        <SearchBar
          v-model="searchQuery"
          @toggle-filters="showFilters = !showFilters"
        />

        <!-- Navigation Tabs -->
        <SearchTabs v-model="activeTab" />

        <!-- Main Content Area -->
        <div class="main-content flex column q-gap-md">
          <!-- Shops Tab Content -->
          <div v-if="activeTab === TAB_SHOPS" class="tab-content">
            <div class="content-grid">
              <ShopCard
                v-for="shop in filteredShops"
                :key="shop.id"
                :shop="shop"
                @click="selectShop"
                @favorite="toggleFavorite"
              />
            </div>
          </div>

          <!-- Artists Tab Content -->
          <div v-else-if="activeTab === TAB_ARTISTS" class="tab-content">
            <div class="content-grid">
              <ArtistCard
                v-for="artist in filteredArtists"
                :key="artist.id"
                :artist="artist"
                @click="selectArtist"
                @favorite="toggleFavorite"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { SearchBar, SearchTabs, ShopCard, ArtistCard, TAB_SHOPS, TAB_ARTISTS } from '../components/SearchPage';

// Types from components
type Shop = {
  id: number;
  name: string;
  location: string;
  description: string;
  image?: string;
};

type Artist = {
  id: number;
  name: string;
  specialty: string;
  bio: string;
  avatar?: string;
};

// Tab management
const activeTab = ref(TAB_SHOPS);
const searchQuery = ref('');
const showFilters = ref(false);

// Mock data for shops
const shops = ref([
  {
    id: 1,
    name: 'Ink Paradise',
    location: 'Downtown, NY',
    description: 'Professional tattoo studio with 15+ years of experience',
    image: 'https://picsum.photos/300/300?random=1'
  },
  {
    id: 2,
    name: 'Artistic Ink',
    location: 'Brooklyn, NY',
    description: 'Custom designs and traditional tattoo styles',
    image: 'https://picsum.photos/300/300?random=2'
  },
  {
    id: 3,
    name: 'Modern Tattoo Co.',
    location: 'Manhattan, NY',
    description: 'Contemporary tattoo art and piercing services',
    image: 'https://picsum.photos/300/300?random=3'
  },
  {
    id: 4,
    name: 'Classic Ink Studio',
    location: 'Queens, NY',
    description: 'Traditional and neo-traditional tattoo designs',
    image: 'https://picsum.photos/300/300?random=4'
  }
]);

// Mock data for artists
const artists = ref([
  {
    id: 1,
    name: 'Sarah Chen',
    specialty: 'Japanese Traditional',
    bio: 'Specializing in Irezumi and modern Japanese styles',
    avatar: 'https://picsum.photos/80/80?random=1'
  },
  {
    id: 2,
    name: 'Mike Rodriguez',
    specialty: 'Black & Grey Realism',
    bio: 'Portrait and realistic tattoo artist with 8 years experience',
    avatar: 'https://picsum.photos/80/80?random=2'
  },
  {
    id: 3,
    name: 'Emma Thompson',
    specialty: 'Watercolor & Abstract',
    bio: 'Creative artist specializing in unique watercolor designs',
    avatar: 'https://picsum.photos/80/80?random=3'
  },
  {
    id: 4,
    name: 'Alex Johnson',
    specialty: 'Geometric & Minimalist',
    bio: 'Clean lines and precise geometric tattoo designs',
    avatar: 'https://picsum.photos/80/80?random=4'
  }
]);

// Computed properties for filtered results
const filteredShops = computed(() => {
  if (!searchQuery.value) return shops.value;
  const query = searchQuery.value.toLowerCase();
  return shops.value.filter(shop => 
    shop.name.toLowerCase().includes(query) ||
    shop.location.toLowerCase().includes(query) ||
    shop.description.toLowerCase().includes(query)
  );
});

const filteredArtists = computed(() => {
  if (!searchQuery.value) return artists.value;
  const query = searchQuery.value.toLowerCase();
  return artists.value.filter(artist => 
    artist.name.toLowerCase().includes(query) ||
    artist.specialty.toLowerCase().includes(query) ||
    artist.bio.toLowerCase().includes(query)
  );
});

// Methods
const selectShop = (shop: Shop) => {
  console.log('Selected shop:', shop);
  // Navigate to shop profile or show details
};

const selectArtist = (artist: Artist) => {
  console.log('Selected artist:', artist);
  // Navigate to artist profile or show details
};

const toggleFavorite = (id: number) => {
  console.log('Toggle favorite for ID:', id);
  // Toggle favorite status
};
</script>

<style scoped lang="scss">
.tab-content {
  min-height: 400px;
}

.content-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
}

// Responsive design
@media (min-width: 768px) {
  .content-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .content-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
