<template>
  <q-page class="page q-pb-xl q-pt-lg flex column items-start q-gap-md">
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
          <LoadingState
            v-if="isLoadingShops && !filteredShops.length"
            :is-loading="isLoadingShops"
            title="Loading shops..."
            description="Please wait while we fetch the latest shops"
            spinner-name="dots"
          />
          <div v-else-if="filteredShops.length" class="flex column q-gap-md">
            <ShopCard
              v-for="shop in filteredShops"
              :key="shop.uuid"
              :shop="shop"
              @click="selectShop"
              @favorite="toggleFavorite"
            />
          </div>
          <NoResult
            v-else
            icon="search_off"
            title="No shops found"
            description="Try adjusting your search or filters"
          />
        </div>

        <!-- Artists Tab Content -->
        <div v-else-if="activeTab === TAB_ARTISTS" class="tab-content">
          <div v-if="filteredArtists.length" class="flex column q-gap-md">
            <ArtistCard
              v-for="artist in filteredArtists"
              :key="artist.uuid"
              :artist="artist"
              @click="selectArtist"
              @favorite="toggleFavorite"
            />
          </div>
          <NoResult
            v-else
            icon="search_off"
            title="No artists found"
            description="Try adjusting your search or filters"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { SearchBar, SearchTabs, ShopCard, ArtistCard, TAB_SHOPS, TAB_ARTISTS } from '../components/SearchPage';
import type { IShop } from 'src/interfaces/shop';
import type { IArtist } from 'src/interfaces/artist';
import NoResult from 'src/components/NoResult.vue';
import LoadingState from 'src/components/LoadingState.vue';
import useShops from 'src/modules/useShops';

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

const { shops, fetchShops, isLoading: isLoadingShops } = useShops();

// Mock data for artists
const artists = ref([
  {
    uuid: '1',
    name: 'Sarah Chen',
    bio: 'Specializing in Irezumi and modern Japanese styles',
    avatar: 'artists/artist1.jpeg',
    location: 'New York, NY'
  },
  {
    uuid: '2',
    name: 'Mike Rodriguez',
    bio: 'Portrait and realistic tattoo artist with 8 years experience',
    avatar: 'artists/artist2.jpg',
    location: 'Los Angeles, CA'
  },
  {
    uuid: '3',
    name: 'Emma Thompson',
    bio: 'Creative artist specializing in unique watercolor designs',
    avatar: 'artists/artist3.jpg',
    location: 'Chicago, IL'
  },
  {
    uuid: '4',
    name: 'Alex Johnson',
    bio: 'Clean lines and precise geometric tattoo designs',
    avatar: 'artists/artist4.jpg',
    location: 'San Francisco, CA'
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
      artist.location.toLowerCase().includes(activeFilters.value.category!.toLowerCase())
    );
  }

  return filtered;
});

// Methods
const selectShop = (shop: IShop) => {
  void router.push(`/shop/${shop.uuid}`);
};

const selectArtist = (artist: IArtist) => {
  void router.push(`/artist/${artist.uuid}`);
};

const toggleFavorite = (shopUuid: string) => {
  console.log('Toggle favorite for ID:', shopUuid);
  // Toggle favorite status is now handled by the card components
};

const updateFilters = (filters: SearchFilters) => {
  activeFilters.value = filters;
  console.log('Filters updated:', filters);
  // Apply filters to search results
};

onBeforeMount(() => {
  void fetchShops();
});
</script>
