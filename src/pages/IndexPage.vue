<template>
  <q-page class="page q-pb-xl q-pt-lg flex column items-start q-gap-md">
    <!-- Navigation Tabs -->
    <div class="container">
      <SearchTabs v-model="activeTab" />
    </div>

    <div class="container">
      <SearchHeader
        v-model="searchQuery"
        :title="activeTab === TAB_SHOPS ? shopsTitle : artistsTitle"
        :has-filters="hasActiveFilters"
        :has-sort="hasActiveSort"
        @toggle-search="showSearchDialog = true"
        @toggle-filters="showFilterDialog = true"
        @toggle-sort="showSortDialog = true"
      />

      <!-- Dialogs -->
      <SearchDialog v-model="showSearchDialog" v-model:query="searchQuery" />

      <FilterDialog v-model="showFilterDialog" v-model:filterValue="activeFilters" />

      <SortDialog v-model="showSortDialog" v-model:sortValue="sortSettings" />

      <!-- Main Content Area -->
      <div class="main-content flex column q-gap-md">
        <!-- Shops Tab Content -->
        <div v-if="activeTab === TAB_SHOPS" class="tab-content">
          <LoadingState
            v-if="isLoadingShops && !shops.length"
            :is-loading="isLoadingShops"
            title="Loading shops..."
            description="Please wait while we fetch the latest shops"
            spinner-name="dots"
          />
          <InfiniteScrollWrapper
            v-else-if="shops.length > 0"
            class="flex column q-gap-md"
            :offset="250"
            :loading="isLoadingShops"
            :stop="!hasMoreShops"
            @load-more="loadMoreShopsWrapper"
          >
            <ShopCard
              v-for="shop in shops"
              :key="shop.documentId"
              :shop="shop"
              @click="selectShop"
            />
          </InfiniteScrollWrapper>
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
            v-if="isLoadingArtists && !artists.length"
            :is-loading="isLoadingArtists"
            title="Loading artists..."
            description="Please wait while we fetch the latest artists"
            spinner-name="dots"
          />
          <InfiniteScrollWrapper
            v-else-if="artists.length > 0"
            @load-more="loadMoreArtistsWrapper"
            :offset="250"
            :loading="isLoadingArtists"
            :stop="!hasMoreArtists"
            class="flex column q-gap-md"
          >
            <ArtistCard
              v-for="artist in artists"
              :key="artist.documentId"
              :artist="artist"
              @click="selectArtist"
            />
            <template v-slot:loading>
              <div class="row justify-center q-my-md">
                <q-spinner-dots color="primary" size="40px" />
              </div>
            </template>
          </InfiniteScrollWrapper>
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
import { ref, computed, onBeforeMount, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  SearchTabs,
  ShopCard,
  ArtistCard,
  SearchHeader,
  TAB_SHOPS,
  TAB_ARTISTS,
} from '../components/SearchPage';
import type { IShop } from 'src/interfaces/shop';
import type { IArtist } from 'src/interfaces/artist';
import { NoResult, LoadingState } from 'src/components';
import { FilterDialog, SortDialog, SearchDialog } from 'src/components/Dialogs';
import type { IFilters } from 'src/interfaces/filters';
import { useLazyQuery } from '@vue/apollo-composable';
import { CITIES_QUERY } from 'src/apollo/types/city';
import { useCitiesStore } from 'src/stores/cities';
import type { IGraphQLCitiesResult } from 'src/interfaces/city';
import useShops from 'src/composables/useShops';
import useArtists from 'src/composables/useArtists';
import InfiniteScrollWrapper from 'src/components/InfiniteScrollWrapper.vue';

// Sort settings
interface SortSettings {
  sortBy: string | null;
  sortDirection: 'asc' | 'desc';
}

// Router
const route = useRoute();
const router = useRouter();

const citiesStore = useCitiesStore();

// Use composables
const {
  shops,
  totalShops,
  isLoadingShops,
  hasMoreShops,
  resetShopsPagination,
  fetchShops,
  refetchShopsData,
} = useShops();

const {
  artists,
  totalArtists,
  isLoadingArtists,
  hasMoreArtists,
  fetchArtists,
  resetArtistsPagination,
  refetchArtistsData,
} = useArtists();

const {
  load: loadCities,
  onResult: onResultCities,
  onError: onErrorCities,
} = useLazyQuery<IGraphQLCitiesResult>(CITIES_QUERY);

// Tab management
const activeTab = ref(TAB_SHOPS);
const showSearchDialog = ref(false);
const showFilterDialog = ref(false);
const showSortDialog = ref(false);
const searchQuery = ref(route.query.search as string | null);

const activeFilters = ref<IFilters>({
  city: route.query.city as string | null,
});

const sortSettings = ref<SortSettings>({
  sortBy: route.query.sort?.toString().split(':')[0] as string | null,
  sortDirection: route.query.sort?.toString().split(':')[1] as 'asc' | 'desc',
});

const hasActiveFilters = computed(() =>
  Object.values(activeFilters.value).some((filter) => !!filter),
);
const hasActiveSort = computed(() => !!sortSettings.value.sortBy);
const shopsTitle = computed(() =>
  totalShops.value > 0 ? `Shops (${shops.value.length}/${totalShops.value})` : `Shops`,
);
const artistsTitle = computed(() =>
  totalArtists.value > 0 ? `Artists (${artists.value.length}/${totalArtists.value})` : `Artists`,
);

const selectShop = (shop: IShop) => {
  void router.push(`/shop/${shop.documentId}`);
};

const selectArtist = (artist: IArtist) => {
  void router.push(`/artist/${artist.documentId}`);
};

// Load more functions for infinite scroll
const loadMoreShopsWrapper = () => {
  fetchShops(activeFilters.value, searchQuery.value, sortSettings.value);
};

const loadMoreArtistsWrapper = () => {
  fetchArtists(activeFilters.value, searchQuery.value, sortSettings.value);
};

// Reset pagination when filters change
const resetPagination = () => {
  resetShopsPagination();
  resetArtistsPagination();
};

const fetchListings = () => {
  if (!shops.value.length) {
    fetchShops(activeFilters.value, searchQuery.value, sortSettings.value);
  }
  if (!artists.value.length) {
    fetchArtists(activeFilters.value, searchQuery.value, sortSettings.value);
  }
};

watch(
  [activeFilters, searchQuery, sortSettings],
  ([newFilters, newSearchQuery, newSortSettings]) => {
    resetPagination();
    refetchShopsData(newFilters, newSearchQuery, newSortSettings);
    refetchArtistsData(newFilters, newSearchQuery, newSortSettings);
  },
);

onResultCities(({ data, loading }) => {
  if (!loading) citiesStore.setCities(data?.cities || []);
});

onErrorCities((error) => {
  console.error('Error fetching cities:', error);
});

onBeforeMount(() => {
  void fetchListings();
  void loadCities();
});
</script>
