import { computed } from 'vue';
import { useLazyQuery } from '@vue/apollo-composable';
import { USERS_QUERY } from 'src/apollo/types/user';
import type { IGraphQLUsersResult } from 'src/interfaces/user';
import type { IFilters } from 'src/interfaces/filters';
import { useArtistsStore } from 'src/stores/artists';
import useHelpers from 'src/modules/useHelpers';
import { UserType } from 'src/interfaces/enums';

interface SortSettings {
  sortBy: string | null;
  sortDirection: 'asc' | 'desc';
}

export default function useArtists() {
  const artistsStore = useArtistsStore();
  const { convertFiltersToGraphQLFilters } = useHelpers();

  const {
    load: loadArtists,
    refetch: refetchArtists,
    loading: isLoadingArtists,
    onResult: onResultArtists,
    onError: onErrorArtists,
  } = useLazyQuery<IGraphQLUsersResult>(USERS_QUERY);

  const artists = computed(() => artistsStore.getArtists);
  const totalArtists = computed(() => artistsStore.getTotal);
  const hasMoreArtists = computed(() => artistsStore.getHasMore);

  const fetchArtists = (
    activeFilters: IFilters,
    searchQuery: string | null,
    sortSettings: SortSettings,
  ) => {
    if (!artistsStore.getHasMore) {
      return;
    }

    void loadArtists(null, {
      filters: {
        type: {
          eq: UserType.Artist,
        },
        ...convertFiltersToGraphQLFilters({
          ...activeFilters,
          name: searchQuery || null,
        }),
      },
      sort: sortSettings.sortBy
        ? [`${sortSettings.sortBy}:${sortSettings.sortDirection}`]
        : undefined,
      pagination: {
        page: artistsStore.getPage,
        pageSize: artistsStore.getPageSize,
      },
    }, {
      fetchPolicy: 'network-only',
    });
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
      filters: {
        type: {
          eq: UserType.Artist,
        },
        ...convertFiltersToGraphQLFilters({ ...activeFilters, name: searchQuery || null }),
      },
      sort: sortSettings.sortBy
        ? [`${sortSettings.sortBy}:${sortSettings.sortDirection}`]
        : undefined,
      pagination: {
        page: 1,
        pageSize: artistsStore.getPageSize,
      },
    });
  };

  // Result handlers
  onResultArtists(({ data, loading }) => {
    if (!loading && data?.usersPermissionsUsers) {
      artistsStore.setTotal(data.usersPermissionsUsers_connection.pageInfo.total);
      // Append new data for load more
      if (data.usersPermissionsUsers.length > 0) {
        artistsStore.setArtists([...artistsStore.getArtists, ...data.usersPermissionsUsers]);
        artistsStore.setPage(artistsStore.getPage + 1);
      } else {
        artistsStore.setHasMore(false);
      }
    }
  });

  onErrorArtists((error) => {
    console.error('Error fetching artists:', error);
    artistsStore.setHasMore(false);
  });

  return {
    artists,
    totalArtists,
    isLoadingArtists,
    hasMoreArtists,
    fetchArtists,
    resetArtistsPagination,
    refetchArtistsData,
  };
}
