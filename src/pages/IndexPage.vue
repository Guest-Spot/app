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
          <VirtualListV2
            v-else-if="shops.length > 0"
            :items="shops"
            :min-item-size="320"
            :gap="16"
            :loading="isLoadingShops"
            :has-more="hasMoreShops"
            @load-more="loadMoreShopsWrapper"
          >
            <template #default="{ item: shop }">
              <ShopCard :shop="castUser(shop)" @click="selectShop" />
            </template>
          </VirtualListV2>
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
          <VirtualListV2
            v-else-if="artists.length > 0"
            :items="artists"
            :min-item-size="120"
            :gap="16"
            :loading="isLoadingArtists"
            :has-more="hasMoreArtists"
            @load-more="loadMoreArtistsWrapper"
          >
            <template #default="{ item: artist }">
              <ArtistCard :artist="castUser(artist)" @click="selectArtist" />
            </template>
          </VirtualListV2>
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
import { ref, computed, onBeforeMount, onMounted, onActivated, watch } from 'vue';
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
import VirtualListV2 from 'src/components/VirtualListV2.vue';
import { PAGINATION_PAGE_SIZE } from 'src/config/constants';
import { useUserStore } from 'src/stores/user';
import { useTokens } from 'src/modules/useTokens';
import { useFilterPersistence } from 'src/modules/useFilterPersistence';

// Sort settings
interface SortSettings {
  sortBy: string | null;
  sortDirection: 'asc' | 'desc';
}

// Router
const route = useRoute();
const router = useRouter();

const citiesStore = useCitiesStore();
const userStore = useUserStore();
const { isAuthenticated: hasValidSession } = useTokens();

// Use composables
const {
  shops,
  totalShops,
  isLoadingShops,
  hasMoreShops,
  resetShopsPagination,
  fetchShops,
  refreshShopsData,
} = useShops();

const {
  artists,
  totalArtists,
  isLoadingArtists,
  hasMoreArtists,
  fetchArtists,
  resetArtistsPagination,
  refreshArtistsData,
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

const canUseDistanceSort = () => {
  const isAuthorized = userStore.getIsAuthenticated || hasValidSession();
  const user = userStore.getUser;
  const hasCoordinates = user?.profile?.lat != null && user?.profile?.lng != null;
  return isAuthorized && hasCoordinates;
};

const normalizeSortSettings = (settings: SortSettings): SortSettings => {
  if (canUseDistanceSort()) return settings;
  if (settings.sortBy && settings.sortBy !== 'distance') return settings;
  return { sortBy: 'createdAt', sortDirection: 'desc' };
};

const { loadFilters, saveFilters } = useFilterPersistence();
const defaultFilterState = {
  filters: {
    type: null,
    city: null,
    styles: null,
  },
  searchQuery: null,
  sortSettings: normalizeSortSettings({ sortBy: 'distance', sortDirection: 'asc' }),
};
const {
  filters: initialFilters,
  searchQuery: initialSearchQuery,
  sortSettings: initialSortSettings,
} = loadFilters('index', route.query, defaultFilterState);

const searchQuery = ref(initialSearchQuery);
const activeFilters = ref<IFilters>(initialFilters);
const sortSettings = ref<SortSettings>(normalizeSortSettings(initialSortSettings));

const hasMounted = ref(false);
const lastRefreshAt = ref<number | null>(null);
const REFRESH_TTL_MS = 90 * 1000;

const shouldRefresh = () => {
  if (lastRefreshAt.value == null) return true;
  return Date.now() - lastRefreshAt.value > REFRESH_TTL_MS;
};

const touchRefresh = () => {
  lastRefreshAt.value = Date.now();
};

const isServiceSortChange = (
  previous: SortSettings | undefined,
  next: SortSettings | undefined,
) => {
  if (!previous || !next) return false;
  if (canUseDistanceSort()) return false;
  const wasDistance = !previous.sortBy || previous.sortBy === 'distance';
  const isFallback = next.sortBy === 'createdAt' && next.sortDirection === 'desc';
  return wasDistance && isFallback;
};

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
  const shouldFetchShops = !shops.value.length && hasMoreShops.value;
  if (shouldFetchShops) {
    fetchShops(activeFilters.value, searchQuery.value, sortSettings.value);
  } else {
    refreshShopsData(activeFilters.value, searchQuery.value, sortSettings.value);
  }
  const shouldFetchArtists = !artists.value.length && hasMoreArtists.value;
  if (shouldFetchArtists) {
    fetchArtists(activeFilters.value, searchQuery.value, sortSettings.value);
  } else {
    refreshArtistsData(activeFilters.value, searchQuery.value, sortSettings.value);
  }
  touchRefresh();
};

watch(
  [activeFilters, searchQuery, sortSettings],
  ([newFilters, newSearchQuery, newSortSettings], [, , oldSortSettings]) => {
    saveFilters('index', newFilters, newSearchQuery, newSortSettings);
    if (!hasMounted.value || isServiceSortChange(oldSortSettings, newSortSettings)) {
      return;
    }
    resetPagination();
    fetchShops(newFilters, newSearchQuery, newSortSettings);
    fetchArtists(newFilters, newSearchQuery, newSortSettings);
    touchRefresh();
  },
);

onResultCities(({ data, loading }) => {
  if (!loading) citiesStore.setCities(data?.cities || []);
});

onErrorCities((error) => {
  console.error('Error fetching cities:', error);
});

onBeforeMount(() => {
  saveFilters('index', activeFilters.value, searchQuery.value, sortSettings.value);
  void fetchListings();
  void loadCities();
});

onActivated(() => {
  if (!shouldRefresh()) return;
  refreshShopsData(activeFilters.value, searchQuery.value, sortSettings.value);
  refreshArtistsData(activeFilters.value, searchQuery.value, sortSettings.value);
  touchRefresh();
});

onMounted(() => {
  hasMounted.value = true;
});
</script>
