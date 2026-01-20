import { computed } from 'vue';
import { useLazyQuery } from '@vue/apollo-composable';
import { USERS_QUERY } from 'src/apollo/types/user';
import type { IGraphQLUsersResult } from 'src/interfaces/user';
import type { IFilters } from 'src/interfaces/filters';
import { useShopsStore } from 'src/stores/shops';
import useHelpers from 'src/modules/useHelpers';
import { UserType } from 'src/interfaces/enums';
import { PAGINATION_PAGE_SIZE } from 'src/config/constants';
import { getSortParams, type SortSettings } from 'src/utils/sort';
import { useUserStore } from 'src/stores/user';
import { useTokens } from 'src/modules/useTokens';
import { mergeUsersPreserveOrder } from 'src/utils/users';

export default function useShops() {
  const shopsStore = useShopsStore();
  const { convertFiltersToGraphQLFilters } = useHelpers();
  const userStore = useUserStore();
  const { isAuthenticated: hasValidSession } = useTokens();

  const canUseDistanceSort = () => userStore.getIsAuthenticated || hasValidSession();

  const normalizeSortSettings = (sortSettings: SortSettings): SortSettings => {
    if (canUseDistanceSort()) return sortSettings;
    if (sortSettings.sortBy && sortSettings.sortBy !== 'distance') return sortSettings;
    return { sortBy: 'createdAt', sortDirection: 'desc' };
  };

  const {
    load: loadShops,
    refetch: refetchShops,
    loading: isLoadingShops,
    onResult: onResultShops,
    onError: onErrorShops,
  } = useLazyQuery<IGraphQLUsersResult>(USERS_QUERY);

  const {
    load: loadShopsBackground,
    onResult: onResultShopsBackground,
    onError: onErrorShopsBackground,
  } = useLazyQuery<IGraphQLUsersResult>(USERS_QUERY);

  const shops = computed(() => shopsStore.getShops);
  const totalShops = computed(() => shopsStore.getTotal);
  const hasMoreShops = computed(() => shopsStore.getHasMore);

  const buildQueryVariables = (
    activeFilters: IFilters,
    searchQuery: string | null,
    sortSettings: SortSettings,
    page: number,
  ) => {
    const { sort, distanceSort } = getSortParams(normalizeSortSettings(sortSettings));

    return {
      filters: {
        type: {
          eq: UserType.Shop,
        },
        ...convertFiltersToGraphQLFilters({
          ...activeFilters,
          name: searchQuery || null,
        }),
      },
      sort,
      distanceSort,
      pagination: {
        page,
        pageSize: PAGINATION_PAGE_SIZE,
      },
    };
  };

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
      buildQueryVariables(activeFilters, searchQuery, sortSettings, shopsStore.getPage),
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
      ...buildQueryVariables(activeFilters, searchQuery, sortSettings, shopsStore.getPage),
    });
  };

  const refreshShopsData = (
    activeFilters: IFilters,
    searchQuery: string | null,
    sortSettings: SortSettings,
  ) => {
    void loadShopsBackground(
      null,
      buildQueryVariables(activeFilters, searchQuery, sortSettings, 1),
      {
        fetchPolicy: 'network-only',
      },
    );
  };

  // Result handlers
  onResultShops(({ data, loading }) => {
    if (!loading && data?.usersPermissionsUsers) {
      const total = data.usersPermissionsUsers_connection.pageInfo.total;
      shopsStore.setTotal(total);
      // Append new data for load more
      if (data.usersPermissionsUsers.length > 0) {
        const merged = mergeUsersPreserveOrder(shopsStore.getShops, data.usersPermissionsUsers);
        shopsStore.setShops(merged);
        shopsStore.setPage(shopsStore.getPage + 1);
      } else {
        shopsStore.setHasMore(false);
      }
    }
  });

  onResultShopsBackground(({ data, loading }) => {
    if (!loading && data?.usersPermissionsUsers) {
      const total = data.usersPermissionsUsers_connection.pageInfo.total;
      shopsStore.setTotal(total);

      const incoming = data.usersPermissionsUsers;
      const hadItems = shopsStore.getShops.length > 0;
      const merged = mergeUsersPreserveOrder(shopsStore.getShops, incoming);
      shopsStore.setShops(merged);
      if (!hadItems) {
        shopsStore.setPage(merged.length > 0 ? 2 : 1);
        shopsStore.setHasMore(merged.length > 0);
      }
    }
  });

  onErrorShops((error) => {
    console.error('Error fetching shops:', error);
    shopsStore.setHasMore(false);
  });

  onErrorShopsBackground((error) => {
    console.error('Error fetching shops in background:', error);
  });

  return {
    shops,
    totalShops,
    isLoadingShops,
    hasMoreShops,
    resetShopsPagination,
    fetchShops,
    refetchShopsData,
    refreshShopsData,
  };
}
