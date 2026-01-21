<template>
  <q-page class="page feed-page q-pb-xl q-pt-lg flex column items-center">
    <div class="container full-width">
      <!-- Search Header -->
      <SearchHeader
        v-model="searchQuery"
        title="Feed"
        no-sort
        :has-filters="hasActiveFilters"
        @toggle-search="showSearchDialog = true"
        @toggle-filters="showFilterDialog = true"
        class="feed-header"
      />

      <!-- Dialogs -->
      <SearchDialog
        v-model="showSearchDialog"
        v-model:query="searchQuery"
        placeholder="Search by style"
      />
      <FilterDialog no-city v-model="showFilterDialog" v-model:filterValue="activeFilters" />

      <!-- Loading State -->
      <div v-if="isLoadingPortfolios && !portfolios.length" class="flex column q-gap-md">
        <div class="flex no-wrap q-gap-md">
          <q-skeleton width="100%" height="200px" class="border-radius-lg" />
          <q-skeleton width="100%" height="200px" class="border-radius-lg" />
        </div>
        <div class="flex no-wrap q-gap-md">
          <q-skeleton width="100%" height="200px" class="border-radius-lg" />
          <q-skeleton width="100%" height="200px" class="border-radius-lg" />
        </div>
        <div class="flex no-wrap q-gap-md">
          <q-skeleton width="100%" height="200px" class="border-radius-lg" />
          <q-skeleton width="100%" height="200px" class="border-radius-lg" />
        </div>
      </div>

      <!-- Feed Content - Tile View -->
      <PortfolioGrid
        v-else-if="portfolios.length > 0"
        ref="portfoliosGridRef"
        :items="portfolios"
        :offset="250"
        :loading="isLoadingPortfolios"
        :has-more="hasMorePortfolios"
        @load-more="loadMorePortfolios"
      >
        <template #default="{ item, selectItem }">
          <FeedItemCard :item="item" view-mode="tile" @click="selectItem" />
        </template>
      </PortfolioGrid>

      <!-- No Results -->
      <NoResult
        v-else
        icon="photo_library"
        title="No portfolio items yet"
        description="Start exploring artists and shops to see their work here"
        no-btn
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onActivated, onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { EventBus } from 'quasar';
import { inject } from 'vue';
import { useRoute } from 'vue-router';
import FeedItemCard from 'src/components/FeedItemCard.vue';
import { NoResult, PortfolioGrid } from 'src/components';
import usePortfolios from 'src/composables/usePortfolios';
import { SearchHeader } from 'src/components/SearchPage';
import { FilterDialog, SearchDialog } from 'src/components/Dialogs';
import type { IFilters } from 'src/interfaces/filters';
import { useFilterPersistence } from 'src/modules/useFilterPersistence';

// Sort settings
interface SortSettings {
  sortBy: string | null;
  sortDirection: 'asc' | 'desc';
}

const bus = inject('bus') as EventBus;
const route = useRoute();

const {
  portfolios,
  isLoadingPortfolios,
  hasMorePortfolios,
  fetchPortfolios,
  resetPortfoliosPagination,
  refreshPortfoliosData,
} = usePortfolios();

const portfoliosGridRef = ref<InstanceType<typeof PortfolioGrid> | null>(null);

const { loadFilters, saveFilters } = useFilterPersistence();
const defaultFilterState: {
  filters: IFilters;
  searchQuery: string | null;
  sortSettings: SortSettings;
} = {
  filters: {
    type: null,
    city: null,
    styles: null,
  },
  searchQuery: null,
  sortSettings: {
    sortBy: null,
    sortDirection: 'desc',
  },
};
const {
  filters: initialFilters,
  searchQuery: initialSearchQuery,
  sortSettings: initialSortSettings,
} = loadFilters('feed', route.query, defaultFilterState);

// Search, Filter, Sort State
const showSearchDialog = ref(false);
const showFilterDialog = ref(false);
const searchQuery = ref(initialSearchQuery);
const activeFilters = ref<IFilters>(initialFilters);
const sortSettings = ref<SortSettings>(initialSortSettings);

const hasActiveFilters = computed(() =>
  Object.values(activeFilters.value).some((filter) =>
    Array.isArray(filter) ? filter.length > 0 : !!filter
  )
);

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

const loadMorePortfolios = () => {
  fetchPortfolios(activeFilters.value, searchQuery.value, sortSettings.value);
};

const forceCloseSingleView = () => {
  portfoliosGridRef.value?.forceCloseSingleView();
};

const hasQueryKey = (query: Record<string, unknown>, key: string) =>
  Object.prototype.hasOwnProperty.call(query, key);

// Watchers
watch(
  [activeFilters, searchQuery, sortSettings],
  ([newFilters, newSearchQuery, newSortSettings]) => {
    saveFilters('feed', newFilters, newSearchQuery, newSortSettings);
    if (!hasMounted.value) return;
    resetPortfoliosPagination();
    fetchPortfolios(newFilters, newSearchQuery, newSortSettings);
    touchRefresh();
  },
  { deep: true },
);

watch(
  () => route.query,
  (newQuery, oldQuery) => {
    if (route.name !== 'Feed') return;
    const shouldSyncCity =
      hasQueryKey(newQuery, 'city') || (oldQuery ? hasQueryKey(oldQuery, 'city') : false);
    const shouldSyncStyles =
      hasQueryKey(newQuery, 'styles') || (oldQuery ? hasQueryKey(oldQuery, 'styles') : false);
    if (!shouldSyncCity && !shouldSyncStyles) return;

    const newStyles = hasQueryKey(newQuery, 'styles') && newQuery.styles
      ? ((Array.isArray(newQuery.styles)
          ? newQuery.styles
          : [newQuery.styles]) as string[])
      : null;

    const newCity = hasQueryKey(newQuery, 'city') ? (newQuery.city as string | null) : null;

    const currentStyles = activeFilters.value.styles;
    const stylesChanged = JSON.stringify(currentStyles) !== JSON.stringify(newStyles);
    const cityChanged = activeFilters.value.city !== newCity;

    if (stylesChanged || cityChanged) {
      activeFilters.value = {
        ...activeFilters.value,
        city: newCity,
        styles: newStyles,
      };
      forceCloseSingleView();
    }
  },
);

onBeforeUnmount(() => {
  bus.off('opened-feed-page', forceCloseSingleView);
});

onBeforeMount(() => {
  bus.on('opened-feed-page', forceCloseSingleView);
  saveFilters('feed', activeFilters.value, searchQuery.value, sortSettings.value);
  if (!portfolios.value.length) {
    fetchPortfolios(activeFilters.value, searchQuery.value, sortSettings.value);
  } else {
    refreshPortfoliosData(activeFilters.value, searchQuery.value, sortSettings.value);
  }
  touchRefresh();
});

onActivated(() => {
  if (!shouldRefresh()) return;
  if (!portfolios.value.length) {
    fetchPortfolios(activeFilters.value, searchQuery.value, sortSettings.value);
  } else {
    refreshPortfoliosData(activeFilters.value, searchQuery.value, sortSettings.value);
  }
  touchRefresh();
});

onMounted(() => {
  hasMounted.value = true;
});
</script>

<style scoped lang="scss">
.feed-header {
  max-width: 250px;
  position: sticky;
  margin: 0 auto;
  top: env(safe-area-inset-top);
  z-index: 1;
}
</style>
