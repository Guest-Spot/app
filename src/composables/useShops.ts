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

  const {
    load: loadShops,
    refetch: refetchShops,
    loading: isLoadingShops,
    onResult: onResultShops,
    onError: onErrorShops,
  } = useLazyQuery<IGraphQLShopsResult>(SHOPS_QUERY);

  const shops = computed(() => shopsStore.getShops);
  const totalShops = computed(() => shopsStore.getTotal);

  const fetchShops = (
    activeFilters: IFilters,
    searchQuery: string | null,
    sortSettings: SortSettings,
  ) => {
    if (!hasMoreShops.value) {
      return;
    }

    void loadShops(null, {
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

  const refetchShopsData = (
    activeFilters: IFilters,
    searchQuery: string | null,
    sortSettings: SortSettings,
  ) => {
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
      shopsStore.setTotal(data.shops_connection.pageInfo.total);
      // Append new data for load more
      if (data.shops.length > 0) {
        shopsStore.setShops([...shopsStore.getShops, ...data.shops]);
        shopsPage.value++;

        // Check if we got fewer items than requested (means we've reached the end)
        if (data.shops.length < ITEMS_PER_PAGE) {
          hasMoreShops.value = false;
        }
      } else {
        hasMoreShops.value = false;
      }
    }
  });

  onErrorShops((error) => {
    console.error('Error fetching shops:', error);
    hasMoreShops.value = false;
  });

  return {
    shops,
    totalShops,
    isLoadingShops,
    hasMoreShops,
    resetShopsPagination,
    fetchShops,
    refetchShopsData,
  };
}
