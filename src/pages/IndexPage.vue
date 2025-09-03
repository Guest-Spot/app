<template>
  <q-page class="page q-pb-xl q-pt-lg flex column items-start q-gap-md">
    <div class="container">
      <!-- Navigation Tabs -->
      <SearchTabs v-model="activeTab" />

      <!-- Search Section -->
      <SearchBar
        v-model="searchQuery"
        @update:filters="updateFilters"
        class="q-mt-lg q-mb-md"
      />

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
          <LoadingState
            v-if="isLoadingArtists && !filteredArtists.length"
            :is-loading="isLoadingArtists"
            title="Loading artists..."
            description="Please wait while we fetch the latest artists"
            spinner-name="dots"
          />
          <div v-else-if="filteredArtists.length" class="flex column q-gap-md">
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
import useArtists from 'src/modules/useArtists';

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
const { artists, fetchArtists, isLoading: isLoadingArtists } = useArtists();

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
      artist.bio.toLowerCase().includes(query) ||
      (artist.location && artist.location.toLowerCase().includes(query))
    );
  }

  // Apply location filter
  if (activeFilters.value.location) {
    filtered = filtered.filter(artist =>
      artist.location && artist.location === activeFilters.value.location
    );
  }

  // Apply category filter
  if (activeFilters.value.category) {
    filtered = filtered.filter(artist =>
      artist.bio.toLowerCase().includes(activeFilters.value.category!.toLowerCase())
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
  void fetchArtists();
});
</script>
