<template>
  <q-page class="q-pb-xl q-pt-lg flex column items-start q-gap-md">
    <div class="q-my-auto full-width">
      <div class="container">
        <!-- Search Section -->
        <SearchBar
          v-model="searchQuery"
          @update:filters="updateFilters"
          class="q-mb-md"
        />

        <!-- Navigation Tabs -->
        <SearchTabs v-model="activeTab" />

        <!-- Main Content Area -->
        <div class="main-content flex column q-gap-md">
          <!-- Results Counter -->
          <div class="results-counter">
            <span class="counter-text">
              {{ activeTab === TAB_SHOPS ? filteredShops.length : filteredArtists.length }} 
              {{ activeTab === TAB_SHOPS ? 'shops' : 'artists' }} found
            </span>
            <span v-if="searchQuery || hasActiveFilters" class="filter-info">
              (filtered results)
            </span>
          </div>

          <!-- Shops Tab Content -->
          <div v-if="activeTab === TAB_SHOPS" class="tab-content">
            <div v-if="filteredShops.length === 0" class="no-results">
              <q-icon name="search_off" size="60px" color="grey-5" />
              <h3 class="no-results-title">No shops found</h3>
              <p class="no-results-description">Try adjusting your search or filters</p>
            </div>
            <div v-else class="content-grid">
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
            <div v-if="filteredArtists.length === 0" class="no-results">
              <q-icon name="search_off" size="60px" color="grey-5" />
              <h3 class="no-results-title">No artists found</h3>
              <p class="no-results-description">Try adjusting your search or filters</p>
            </div>
            <div v-else class="content-grid">
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

// Filters
interface SearchFilters {
  location: string | null;
  category: string | null;
  rating: string | null;
  priceRange: string | null;
}

const activeFilters = ref<SearchFilters>({
  location: null,
  category: null,
  rating: null,
  priceRange: null
});

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
  let filtered = shops.value;
  
  // Apply search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(shop => 
      shop.name.toLowerCase().includes(query) ||
      shop.location.toLowerCase().includes(query) ||
      shop.description.toLowerCase().includes(query)
    );
  }
  
  // Apply location filter
  if (activeFilters.value.location) {
    filtered = filtered.filter(shop => 
      shop.location === activeFilters.value.location
    );
  }
  
  // Apply category filter (if shops have categories)
  if (activeFilters.value.category) {
    // For now, we'll filter by description containing the category
    filtered = filtered.filter(shop => 
      shop.description.toLowerCase().includes(activeFilters.value.category!.toLowerCase())
    );
  }
  
  return filtered;
});

const filteredArtists = computed(() => {
  let filtered = artists.value;
  
  // Apply search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(artist => 
      artist.name.toLowerCase().includes(query) ||
      artist.specialty.toLowerCase().includes(query) ||
      artist.bio.toLowerCase().includes(query)
    );
  }
  
  // Apply location filter (if artists have locations)
  if (activeFilters.value.location) {
    // For now, we'll skip location filter for artists as they don't have location field
    // In the future, you can add location field to artists
  }
  
  // Apply category filter
  if (activeFilters.value.category) {
    filtered = filtered.filter(artist => 
      artist.specialty.toLowerCase().includes(activeFilters.value.category!.toLowerCase())
    );
  }
  
  return filtered;
});

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return Object.values(activeFilters.value).some(filter => filter !== null);
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

const updateFilters = (filters: SearchFilters) => {
  activeFilters.value = filters;
  console.log('Filters updated:', filters);
  // Apply filters to search results
};
</script>

<style scoped lang="scss">
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

.filter-info {
  font-size: 14px;
  color: var(--text-secondary);
  font-style: italic;
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
  background: rgba(255, 255, 255, 0.8);
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
  margin: 0;
  color: var(--text-secondary);
  font-size: 16px;
  line-height: 1.5;
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
