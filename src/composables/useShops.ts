import { computed } from 'vue';
import { useLazyQuery } from '@vue/apollo-composable';
import { USERS_QUERY } from 'src/apollo/types/user';
import type { IGraphQLUsersResult } from 'src/interfaces/user';
import type { IFilters } from 'src/interfaces/filters';
import { useShopsStore } from 'src/stores/shops';
import useHelpers from 'src/modules/useHelpers';
import { UserType } from 'src/interfaces/enums';
import { PAGINATION_PAGE_SIZE } from 'src/config/constants';

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
  } = useLazyQuery<IGraphQLUsersResult>(USERS_QUERY);

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

    void loadShops(
      null,
      {
        filters: {
          type: {
            eq: UserType.Shop,
          },
          ...convertFiltersToGraphQLFilters({
            ...activeFilters,
            name: searchQuery || null,
          }),
        },
        sort: sortSettings.sortBy
          ? [`${sortSettings.sortBy}:${sortSettings.sortDirection}`]
          : ['createdAt:desc'],
        pagination: {
          page: shopsStore.getPage,
          pageSize: PAGINATION_PAGE_SIZE,
        },
      },
      {
        fetchPolicy: 'network-only',
      },
    );
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
      filters: {
        type: {
          eq: UserType.Shop,
        },
        ...convertFiltersToGraphQLFilters({ ...activeFilters, name: searchQuery || null }),
      },
      sort: sortSettings.sortBy
        ? [`${sortSettings.sortBy}:${sortSettings.sortDirection}`]
        : ['createdAt:desc'],
      pagination: {
        page: shopsStore.getPage,
        pageSize: PAGINATION_PAGE_SIZE,
      },
    });
  };

  // Result handlers
  onResultShops(({ data, loading }) => {
    if (!loading && data?.usersPermissionsUsers) {
      shopsStore.setTotal(data.usersPermissionsUsers_connection.pageInfo.total);
      // Append new data for load more
      if (data.usersPermissionsUsers.length > 0) {
        // NOTE: bad practice to use Set to avoid duplicates, but it's the only way to avoid duplicates in the store
        const shops = new Set([...shopsStore.getShops, ...data.usersPermissionsUsers]);
        shopsStore.setShops([...shops]);
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
