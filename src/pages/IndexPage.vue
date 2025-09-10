<template>
  <q-page class="page q-pb-xl q-pt-lg flex column items-start q-gap-md">
    <!-- Navigation Tabs -->
    <div class="container">
      <SearchTabs
        v-model="activeTab"
      />
    </div>

    <div class="container">
      <SearchHeader
        v-model="searchQuery"
        :title="activeTab === TAB_SHOPS ? `Shops (${shops.length})` : `Artists (${artists.length})`"
        :has-filters="hasActiveFilters"
        :has-sort="hasActiveSort"
        @toggle-search="showSearchDialog = true"
        @toggle-filters="showFilterDialog = true"
        @toggle-sort="showSortDialog = true"
      />

      <!-- Dialogs -->
      <SearchDialog
        v-model="showSearchDialog"
        v-model:query="searchQuery"
      />

      <FilterDialog
        v-model="showFilterDialog"
        v-model:filterValue="activeFilters"
      />

      <SortDialog
        v-model="showSortDialog"
        v-model:sortValue="sortSettings"
      />

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
          <div v-else-if="shops.length" class="flex column q-gap-md">
            <ShopCard
              v-for="shop in shops"
              :key="shop.documentId"
              :shop="shop"
              @click="selectShop"
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
            v-if="isLoadingArtists && !artists.length"
            :is-loading="isLoadingArtists"
            title="Loading artists..."
            description="Please wait while we fetch the latest artists"
            spinner-name="dots"
          />
          <div v-else-if="artists.length" class="flex column q-gap-md">
            <ArtistCard
              v-for="artist in artists"
              :key="artist.documentId"
              :artist="artist"
              @click="selectArtist"
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
import { ref, computed, onBeforeMount, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { SearchTabs, ShopCard, ArtistCard, TAB_SHOPS, TAB_ARTISTS } from '../components/SearchPage';
import type { IShop } from 'src/interfaces/shop';
import type { IArtist } from 'src/interfaces/artist';
import NoResult from 'src/components/NoResult.vue';
import LoadingState from 'src/components/LoadingState.vue';
import SearchHeader from 'src/components/SearchPage/SearchHeader.vue';
import { FilterDialog, SortDialog, SearchDialog } from 'src/components/Dialogs';
import useCities from 'src/modules/useCities';
import type { IFilters } from 'src/interfaces/filters';
import { useLazyQuery } from '@vue/apollo-composable';
import { SHOPS_QUERY } from 'src/apollo/types/shop';
import { ARTISTS_QUERY } from 'src/apollo/types/artist';
import type { IGraphQLShopsResult } from 'src/interfaces/shop';
import useHelpers from 'src/modules/useHelpers';
import { useShopsStore } from 'src/stores/shops';
import { useArtistsStore } from 'src/stores/artists';
import type { IGraphQLArtistsResult } from 'src/interfaces/artist';

// Sort settings
interface SortSettings {
  sortBy: string | null;
  sortDirection: 'asc' | 'desc';
}

// Router
const route = useRoute();
const router = useRouter();

// const { artists, fetchArtists, isLoading: isLoadingArtists } = useArtists();
const { fetchCities } = useCities();
const { convertFiltersToGraphQLFilters } = useHelpers();
const shopsStore = useShopsStore();
const artistsStore = useArtistsStore();

const {
  load: loadShops,
  refetch: refetchShops,
  loading: isLoadingShops,
  onResult: onResultShops,
  onError: onErrorShops,
} = useLazyQuery<IGraphQLShopsResult>(SHOPS_QUERY);

const {
  load: loadArtists,
  refetch: refetchArtists,
  loading: isLoadingArtists,
  onResult: onResultArtists,
  onError: onErrorArtists,
} = useLazyQuery<IGraphQLArtistsResult>(ARTISTS_QUERY);

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
  sortDirection: route.query.sort?.toString().split(':')[1] as 'asc' | 'desc'
});

const hasActiveFilters = computed(() => Object.values(activeFilters.value).some(filter => !!filter));
const hasActiveSort = computed(() => !!sortSettings.value.sortBy);
const shops = computed(() => shopsStore.getShops);
const artists = computed(() => artistsStore.getArtists);

const selectShop = (shop: IShop) => {
  void router.push(`/shop/${shop.documentId}`);
};

const selectArtist = (artist: IArtist) => {
  void router.push(`/artist/${artist.documentId}`);
};

watch([activeFilters, searchQuery, sortSettings], ([newFilters, newSearchQuery, newSortSettings]) => {
  void refetchShops({
    filters: convertFiltersToGraphQLFilters({ ...newFilters, name: newSearchQuery || null }),
    sort: newSortSettings.sortBy ? [`${newSortSettings.sortBy}:${newSortSettings.sortDirection}`] : undefined,
  });
  void refetchArtists({
    filters: convertFiltersToGraphQLFilters({ ...newFilters, name: newSearchQuery || null }),
    sort: newSortSettings.sortBy ? [`${newSortSettings.sortBy}:${newSortSettings.sortDirection}`] : undefined,
  });
});

onResultShops(({ data, loading }) => {
  if (!loading) shopsStore.setShops(data?.shops || []);
});

onErrorShops((error) => {
  console.error('Error fetching shops:', error);
});

onResultArtists(({ data, loading }) => {
  if (!loading) artistsStore.setArtists(data?.artists || []);
});

onErrorArtists((error) => {
  console.error('Error fetching artists:', error);
});

onBeforeMount(() => {
  void loadShops(null, {
    filters: convertFiltersToGraphQLFilters({ ...activeFilters.value, name: searchQuery.value || null }),
    sort: sortSettings.value.sortBy ? [`${sortSettings.value.sortBy}:${sortSettings.value.sortDirection}`] : undefined,
  });
  void loadArtists(null, {
    filters: convertFiltersToGraphQLFilters({ ...activeFilters.value, name: searchQuery.value || null }),
    sort: sortSettings.value.sortBy ? [`${sortSettings.value.sortBy}:${sortSettings.value.sortDirection}`] : undefined,
  });
  void fetchCities();
});
</script>
