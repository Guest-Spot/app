<template>
  <q-page class="page q-pb-xl q-pt-lg flex column items-start q-gap-md">
    <!-- Navigation Tabs -->
    <div class="container">
      <div class="flex items-center q-gap-sm no-wrap">
        <q-btn flat round icon="bookmark_border" color="primary" class="bg-block" to="/bookmarks" />
        <SearchTabs v-model="activeTab" />
      </div>
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

      <FilterDialog v-model="showFilterDialog" v-model:filterValue="activeFilters" no-styles />

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
          <VirtualList
            v-else-if="shops.length > 0"
            :items="shops"
            :item-height="320"
            dynamic-height
            :gap="16"
            :loading="isLoadingShops"
            :has-more="hasMoreShops"
            @load-more="loadMoreShopsWrapper"
          >
            <template #default="{ item: shop }">
              <ShopCard :shop="castUser(shop)" @click="selectShop" />
            </template>
          </VirtualList>
          <NoResult
            v-else
            icon="search_off"
            title="No shops found"
            description="Try adjusting your search or filters"
            no-btn
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
          <VirtualList
            v-else-if="artists.length > 0"
            :items="artists"
            :item-height="120"
            dynamic-height
            :gap="16"
            :loading="isLoadingArtists"
            :has-more="hasMoreArtists"
            @load-more="loadMoreArtistsWrapper"
          >
            <template #default="{ item: artist }">
              <ArtistCard :artist="castUser(artist)" @click="selectArtist" />
            </template>
          </VirtualList>
          <NoResult
            v-else
            icon="search_off"
            title="No artists found"
            description="Try adjusting your search or filters"
            no-btn
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
import type { IUser } from 'src/interfaces/user';
import { NoResult, LoadingState } from 'src/components';
import { FilterDialog, SortDialog, SearchDialog } from 'src/components/Dialogs';
import type { IFilters } from 'src/interfaces/filters';
import { useLazyQuery } from '@vue/apollo-composable';
import { CITIES_QUERY } from 'src/apollo/types/city';
import { useCitiesStore } from 'src/stores/cities';
import type { IGraphQLCitiesResult } from 'src/interfaces/city';
import useShops from 'src/composables/useShops';
import useArtists from 'src/composables/useArtists';
import VirtualList from 'src/components/VirtualList.vue';
import { PAGINATION_PAGE_SIZE } from 'src/config/constants';
import type { UserType } from 'src/interfaces/enums';

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

const castUser = (item: unknown): IUser => item as IUser;

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
  type: route.query.type as UserType | null,
  city: route.query.city as string | null,
  styles: route.query.styles
    ? ((Array.isArray(route.query.styles)
        ? route.query.styles
        : [route.query.styles]) as string[])
    : null,
});

const sortSettings = ref<SortSettings>({
  sortBy: route.query.sort?.toString().split(':')[0] as string | null,
  sortDirection: route.query.sort?.toString().split(':')[1] as 'asc' | 'desc',
});

const hasActiveFilters = computed(() =>
  Object.values(activeFilters.value).some((filter) =>
    Array.isArray(filter) ? filter.length > 0 : !!filter
  )
);
const hasActiveSort = computed(() => !!sortSettings.value.sortBy);
const shopsTitle = computed(() => {
  if (totalShops.value === 0) {
    return `Shops`;
  }
  if (totalShops.value <= PAGINATION_PAGE_SIZE) {
    return `Shops (${shops.value.length})`;
  }
  return `Shops (${shops.value.length}/${totalShops.value})`;
});
const artistsTitle = computed(() => {
  if (totalArtists.value === 0) {
    return `Artists`;
  }
  if (totalArtists.value <= PAGINATION_PAGE_SIZE) {
    return `Artists (${artists.value.length})`;
  }
  return `Artists (${artists.value.length}/${totalArtists.value})`;
});

const selectShop = (shop: IUser) => {
  void router.push(`/shop/${shop.documentId}`);
};

const selectArtist = (artist: IUser) => {
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
