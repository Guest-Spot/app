import { computed } from 'vue';
import { useLazyQuery } from '@vue/apollo-composable';
import { USERS_QUERY } from 'src/apollo/types/user';
import type { IGraphQLUsersResult } from 'src/interfaces/user';
import type { IFilters } from 'src/interfaces/filters';
import { useArtistsStore } from 'src/stores/artists';
import useHelpers from 'src/modules/useHelpers';
import { UserType } from 'src/interfaces/enums';
import { PAGINATION_PAGE_SIZE } from 'src/config/constants';
import { getSortParams, type SortSettings } from 'src/utils/sort';
import { useUserStore } from 'src/stores/user';
import { useTokens } from 'src/modules/useTokens';
import { mergeUsersPreserveOrder } from 'src/utils/users';

export default function useArtists() {
  const artistsStore = useArtistsStore();
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
    load: loadArtists,
    refetch: refetchArtists,
    loading: isLoadingArtists,
    onResult: onResultArtists,
    onError: onErrorArtists,
  } = useLazyQuery<IGraphQLUsersResult>(USERS_QUERY);

  const {
    load: loadArtistsBackground,
    onResult: onResultArtistsBackground,
    onError: onErrorArtistsBackground,
  } = useLazyQuery<IGraphQLUsersResult>(USERS_QUERY);

  const artists = computed(() => artistsStore.getArtists);
  const totalArtists = computed(() => artistsStore.getTotal);
  const hasMoreArtists = computed(() => artistsStore.getHasMore);

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
          eq: UserType.Artist,
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

  const fetchArtists = (
    activeFilters: IFilters,
    searchQuery: string | null,
    sortSettings: SortSettings,
  ) => {
    if (!artistsStore.getHasMore) {
      return;
    }

    void loadArtists(
      null,
      buildQueryVariables(activeFilters, searchQuery, sortSettings, artistsStore.getPage),
      {
        fetchPolicy: 'network-only',
      },
    );
  };

  const resetArtistsPagination = () => {
    artistsStore.setPage(1);
    artistsStore.setHasMore(true);
    artistsStore.clearArtists();
  };

  const refetchArtistsData = (
    activeFilters: IFilters,
    searchQuery: string | null,
    sortSettings: SortSettings,
  ) => {
    void refetchArtists({
      ...buildQueryVariables(activeFilters, searchQuery, sortSettings, 1),
    });
  };

  const refreshArtistsData = (
    activeFilters: IFilters,
    searchQuery: string | null,
    sortSettings: SortSettings,
  ) => {
    void loadArtistsBackground(
      null,
      buildQueryVariables(activeFilters, searchQuery, sortSettings, 1),
      {
        fetchPolicy: 'network-only',
      },
    );
  };

  // Result handlers
  onResultArtists(({ data, loading }) => {
    if (!loading && data?.usersPermissionsUsers) {
      const total = data.usersPermissionsUsers_connection.pageInfo.total;
      artistsStore.setTotal(total);
      // Append new data for load more
      if (data.usersPermissionsUsers.length > 0) {
        const merged = mergeUsersPreserveOrder(artistsStore.getArtists, data.usersPermissionsUsers);
        artistsStore.setArtists(merged);
        artistsStore.setPage(artistsStore.getPage + 1);
      } else {
        artistsStore.setHasMore(false);
      }
    }
  });

  onResultArtistsBackground(({ data, loading }) => {
    if (!loading && data?.usersPermissionsUsers) {
      const total = data.usersPermissionsUsers_connection.pageInfo.total;
      artistsStore.setTotal(total);

      const incoming = data.usersPermissionsUsers;
      const hadItems = artistsStore.getArtists.length > 0;
      const merged = mergeUsersPreserveOrder(artistsStore.getArtists, incoming);
      artistsStore.setArtists(merged);
      if (!hadItems) {
        artistsStore.setPage(merged.length > 0 ? 2 : 1);
        artistsStore.setHasMore(merged.length > 0);
      }
    }
  });

  onErrorArtists((error) => {
    console.error('Error fetching artists:', error);
    artistsStore.setHasMore(false);
  });

  onErrorArtistsBackground((error) => {
    console.error('Error fetching artists in background:', error);
  });

  return {
    artists,
    totalArtists,
    isLoadingArtists,
    hasMoreArtists,
    fetchArtists,
    resetArtistsPagination,
    refetchArtistsData,
    refreshArtistsData,
  };
}
