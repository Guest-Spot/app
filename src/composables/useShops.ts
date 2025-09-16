import { ref, computed } from 'vue';
import { useLazyQuery } from '@vue/apollo-composable';
import { SHOPS_QUERY } from 'src/apollo/types/shop';
import type { IGraphQLShopsResult } from 'src/interfaces/shop';
import type { IFilters } from 'src/interfaces/filters';
import { useShopsStore } from 'src/stores/shops';
import useHelpers from 'src/modules/useHelpers';

interface SortSettings {
  sortBy: string | null;
  sortDirection: 'asc' | 'desc';
}

export default function useShops() {
  const shopsStore = useShopsStore();
  const { convertFiltersToGraphQLFilters } = useHelpers();

  // Pagination
  const ITEMS_PER_PAGE = 15;
  const shopsPage = ref(2); // Start from page 2 since page 1 is loaded initially
  const hasMoreShops = ref(true);

  // Infinite scroll done callback
  let shopsScrollDone: ((stop?: boolean) => void) | null = null;

  const {
    load: loadShops,
    refetch: refetchShops,
    loading: isLoadingShops,
    onResult: onResultShops,
    onError: onErrorShops,
  } = useLazyQuery<IGraphQLShopsResult>(SHOPS_QUERY);

  // Separate query for infinite scroll
  const {
    load: loadMoreShopsQuery,
    onResult: onResultLoadMoreShops,
    onError: onErrorLoadMoreShops,
  } = useLazyQuery<IGraphQLShopsResult>(SHOPS_QUERY);

  const shops = computed(() => shopsStore.getShops);

  const loadMoreShops = (index: number, done: (stop?: boolean) => void, activeFilters: IFilters, searchQuery: string | null, sortSettings: SortSettings) => {
    if (!hasMoreShops.value) {
      done(true);
      return;
    }

    shopsScrollDone = done;

    void loadMoreShopsQuery(null, {
      filters: convertFiltersToGraphQLFilters({
        ...activeFilters,
        name: searchQuery || null,
      }),
      sort: sortSettings.sortBy
        ? [`${sortSettings.sortBy}:${sortSettings.sortDirection}`]
        : undefined,
      pagination: {
        page: shopsPage.value,
        pageSize: ITEMS_PER_PAGE,
      },
    });
  };

  const resetShopsPagination = () => {
    shopsPage.value = 2; // Start from page 2 since we're loading page 1 initially
    hasMoreShops.value = true;
    shopsStore.clearShops();
  };

  const initializeShops = (activeFilters: IFilters, searchQuery: string | null, sortSettings: SortSettings) => {
    void loadShops(null, {
      filters: convertFiltersToGraphQLFilters({
        ...activeFilters,
        name: searchQuery || null,
      }),
      sort: sortSettings.sortBy
        ? [`${sortSettings.sortBy}:${sortSettings.sortDirection}`]
        : undefined,
      pagination: {
        page: 1,
        pageSize: ITEMS_PER_PAGE,
      },
    });
  };

  const refetchShopsData = (activeFilters: IFilters, searchQuery: string | null, sortSettings: SortSettings) => {
    void refetchShops({
      filters: convertFiltersToGraphQLFilters({ ...activeFilters, name: searchQuery || null }),
      sort: sortSettings.sortBy
        ? [`${sortSettings.sortBy}:${sortSettings.sortDirection}`]
        : undefined,
      pagination: {
        page: 1,
        pageSize: ITEMS_PER_PAGE,
      },
    });
  };

  // Result handlers
  onResultShops(({ data, loading }) => {
    if (!loading && data?.shops) {
      shopsStore.setShops(data.shops);
      // Check if we got fewer items than requested for the first load
      if (data.shops.length < ITEMS_PER_PAGE) {
        hasMoreShops.value = false;
      }
    }
  });

  onErrorShops((error) => {
    console.error('Error fetching shops:', error);
  });

  // Infinite scroll result handlers
  onResultLoadMoreShops(({ data, loading }) => {
    if (!loading && data?.shops) {
      if (data.shops.length > 0) {
        shopsStore.addShops(data.shops);
        shopsPage.value++;

        // Check if we got fewer items than requested (means we've reached the end)
        if (data.shops.length < ITEMS_PER_PAGE) {
          hasMoreShops.value = false;
          shopsScrollDone?.(true);
        } else {
          shopsScrollDone?.();
        }
      } else {
        hasMoreShops.value = false;
        shopsScrollDone?.(true);
      }
      shopsScrollDone = null;
    }
  });

  onErrorLoadMoreShops((error) => {
    console.error('Error loading more shops:', error);
    hasMoreShops.value = false;
    shopsScrollDone?.(true);
    shopsScrollDone = null;
  });

  return {
    shops,
    isLoadingShops,
    hasMoreShops,
    loadMoreShops,
    resetShopsPagination,
    initializeShops,
    refetchShopsData,
  };
}
