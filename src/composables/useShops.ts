import { computed } from 'vue';
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

  const {
    load: loadShops,
    refetch: refetchShops,
    loading: isLoadingShops,
    onResult: onResultShops,
    onError: onErrorShops,
  } = useLazyQuery<IGraphQLShopsResult>(SHOPS_QUERY);

  const shops = computed(() => shopsStore.getShops);
  const totalShops = computed(() => shopsStore.getTotal);
  const hasMoreShops = computed(() => shopsStore.getHasMore);

  const fetchShops = (
    activeFilters: IFilters,
    searchQuery: string | null,
    sortSettings: SortSettings,
  ) => {
    if (!shopsStore.getHasMore) {
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
        page: shopsStore.getPage,
        pageSize: shopsStore.getPageSize,
      },
    }, {
      fetchPolicy: 'network-only',
    });
  };

  const resetShopsPagination = () => {
    shopsStore.setPage(1);
    shopsStore.setHasMore(true);
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
        page: shopsStore.getPage,
        pageSize: shopsStore.getPageSize,
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
        shopsStore.setPage(shopsStore.getPage + 1);
      } else {
        shopsStore.setHasMore(false);
      }
    }
  });

  onErrorShops((error) => {
    console.error('Error fetching shops:', error);
    shopsStore.setHasMore(false);
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
