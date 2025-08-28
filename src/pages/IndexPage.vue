<template>
  <q-page class="q-pb-xl q-pt-lg flex column items-start q-gap-md">
    <div class="q-my-auto full-width">
      <div class="container">
        <!-- Search Section -->
        <SearchBar
          v-model="searchQuery"
          @update:filters="updateFilters"
        />

        <!-- Navigation Tabs -->
         <div class="q-my-lg">
          <SearchTabs v-model="activeTab" />
        </div>

        <!-- Main Content Area -->
        <div class="main-content flex column q-gap-md">
          <!-- Shops Tab Content -->
          <div v-if="activeTab === TAB_SHOPS" class="tab-content">
            <div v-if="filteredShops.length === 0" class="no-results bg-block border-radius-md">
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
import { useRouter } from 'vue-router';
import { SearchBar, SearchTabs, ShopCard, ArtistCard, TAB_SHOPS, TAB_ARTISTS } from '../components/SearchPage';
import type { IShop } from 'src/interfaces/shop';
import type { IArtist } from 'src/interfaces/artist';

// Router
const router = useRouter();

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
const shops = ref<IShop[]>([
  {
    id: 1,
    username: 'ink_paradise',
    title: 'Ink Paradise',
    location: 'Downtown, NY',
    description: 'Professional tattoo studio with 15+ years of experience',
    avatar: 'https://picsum.photos/300/300?random=1',
    phone: '+1 (555) 123-4567',
    email: 'info@inkparadise.com',
    dateOpened: '2008-01-15',
    workingHoursStart: '09:00',
    workingHoursEnd: '21:00',
    pricing: '$$$',
    instagram: '@inkparadise',
    facebook: 'Ink Paradise Studio'
  },
  {
    id: 2,
    username: 'artistic_ink',
    title: 'Artistic Ink',
    location: 'Brooklyn, NY',
    description: 'Custom designs and traditional tattoo styles',
    avatar: 'https://picsum.photos/300/300?random=2',
    phone: '+1 (555) 234-5678',
    email: 'hello@artisticink.com',
    dateOpened: '2012-03-20',
    workingHoursStart: '10:00',
    workingHoursEnd: '20:00',
    pricing: '$$',
    instagram: '@artisticink',
    facebook: 'Artistic Ink Brooklyn'
  },
  {
    id: 3,
    username: 'modern_tattoo',
    title: 'Modern Tattoo Co.',
    location: 'Manhattan, NY',
    description: 'Contemporary tattoo art and piercing services',
    avatar: 'https://picsum.photos/300/300?random=3',
    phone: '+1 (555) 345-6789',
    email: 'contact@moderntattoo.com',
    dateOpened: '2015-07-10',
    workingHoursStart: '11:00',
    workingHoursEnd: '22:00',
    pricing: '$$$',
    instagram: '@moderntattooco',
    facebook: 'Modern Tattoo Company'
  },
  {
    id: 4,
    username: 'classic_ink',
    title: 'Classic Ink Studio',
    location: 'Queens, NY',
    description: 'Traditional and neo-traditional tattoo designs',
    avatar: 'https://picsum.photos/300/300?random=4',
    phone: '+1 (555) 456-7890',
    email: 'studio@classicink.com',
    dateOpened: '2010-11-05',
    workingHoursStart: '09:00',
    workingHoursEnd: '19:00',
    pricing: '$$',
    instagram: '@classicinkstudio',
    facebook: 'Classic Ink Studio Queens'
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
      shop.title.toLowerCase().includes(query) ||
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

// Methods
const selectShop = (shop: IShop) => {
  void router.push(`/shop/${shop.id}`);
};

const selectArtist = (artist: IArtist) => {
  void router.push(`/artist/${artist.id}`);
};

const toggleFavorite = (id: number) => {
  console.log('Toggle favorite for ID:', id);
  // Toggle favorite status is now handled by the card components
};

const updateFilters = (filters: SearchFilters) => {
  activeFilters.value = filters;
  console.log('Filters updated:', filters);
  // Apply filters to search results
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

.no-results {
  text-align: center;
  padding: 60px 20px;
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
