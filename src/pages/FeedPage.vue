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
      <LoadingState
        v-if="isLoadingPortfolios && !portfolios.length"
        :is-loading="isLoadingPortfolios"
        title="Loading feed..."
        description="Please wait while we fetch the latest portfolio items"
        spinner-name="dots"
      />

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
import { onBeforeMount, onBeforeUnmount, ref, watch, computed } from 'vue';
import type { EventBus } from 'quasar';
import { inject } from 'vue';
import { useRoute } from 'vue-router';
import FeedItemCard from 'src/components/FeedItemCard.vue';
import { NoResult, LoadingState, PortfolioGrid } from 'src/components';
import usePortfolios from 'src/composables/usePortfolios';
import { SearchHeader } from 'src/components/SearchPage';
import { FilterDialog, SearchDialog } from 'src/components/Dialogs';
import type { IFilters } from 'src/interfaces/filters';

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
  refetchPortfoliosData,
} = usePortfolios();

const portfoliosGridRef = ref<InstanceType<typeof PortfolioGrid> | null>(null);

const hasActiveFilters = computed(() =>
  Object.values(activeFilters.value).some((filter) =>
    Array.isArray(filter) ? filter.length > 0 : !!filter
  )
);

// Search, Filter, Sort State
const showSearchDialog = ref(false);
const showFilterDialog = ref(false);
const searchQuery = ref(route.query.search as string | null);

const activeFilters = ref<IFilters>({
  type: null,
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

const loadMorePortfolios = () => {
  fetchPortfolios(activeFilters.value, searchQuery.value, sortSettings.value);
};

const initializeFeed = () => {
  if (!portfolios.value.length) {
    fetchPortfolios(activeFilters.value, searchQuery.value, sortSettings.value);
  }
};

const forceCloseSingleView = () => {
  portfoliosGridRef.value?.forceCloseSingleView();
};

// Watchers
watch(
  [activeFilters, searchQuery, sortSettings],
  ([newFilters, newSearchQuery, newSortSettings]) => {
    resetPortfoliosPagination();
    refetchPortfoliosData(newFilters, newSearchQuery, newSortSettings);
  },
  { deep: true },
);

onBeforeUnmount(() => {
  bus.off('opened-feed-page', forceCloseSingleView);
});

onBeforeMount(() => {
  bus.on('opened-feed-page', forceCloseSingleView);
  initializeFeed();
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
