import { ref, computed } from 'vue';
import { useLazyQuery } from '@vue/apollo-composable';
import { ARTISTS_QUERY } from 'src/apollo/types/artist';
import type { IGraphQLArtistsResult } from 'src/interfaces/artist';
import type { IFilters } from 'src/interfaces/filters';
import { useArtistsStore } from 'src/stores/artists';
import useHelpers from 'src/modules/useHelpers';

interface SortSettings {
  sortBy: string | null;
  sortDirection: 'asc' | 'desc';
}

export default function useArtists() {
  const artistsStore = useArtistsStore();
  const { convertFiltersToGraphQLFilters } = useHelpers();

  // Pagination
  const ITEMS_PER_PAGE = 15;
  const artistsPage = ref(2); // Start from page 2 since page 1 is loaded initially
  const hasMoreArtists = ref(true);

  const {
    load: loadArtists,
    refetch: refetchArtists,
    loading: isLoadingArtists,
    onResult: onResultArtists,
    onError: onErrorArtists,
  } = useLazyQuery<IGraphQLArtistsResult>(ARTISTS_QUERY);

  const artists = computed(() => artistsStore.getArtists);
  const totalArtists = computed(() => artistsStore.getTotal);

  const fetchArtists = (activeFilters: IFilters, searchQuery: string | null, sortSettings: SortSettings) => {
    if (!hasMoreArtists.value) {
      return;
    }

    void loadArtists(null, {
      filters: convertFiltersToGraphQLFilters({
        ...activeFilters,
        name: searchQuery || null,
      }),
      sort: sortSettings.sortBy
        ? [`${sortSettings.sortBy}:${sortSettings.sortDirection}`]
        : undefined,
      pagination: {
        page: artistsPage.value,
        pageSize: ITEMS_PER_PAGE,
      },
    });
  };

  const resetArtistsPagination = () => {
    artistsPage.value = 2; // Start from page 2 since we're loading page 1 initially
    hasMoreArtists.value = true;
    artistsStore.clearArtists();
  };

  const refetchArtistsData = (activeFilters: IFilters, searchQuery: string | null, sortSettings: SortSettings) => {
    void refetchArtists({
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
  onResultArtists(({ data, loading }) => {
    if (!loading && data?.artists) {
      artistsStore.setTotal(data.artists_connection.pageInfo.total);
      // Append new data for load more
      if (data.artists.length > 0) {
        artistsStore.setArtists([...artistsStore.getArtists, ...data.artists]);
        artistsPage.value++;

        // Check if we got fewer items than requested (means we've reached the end)
        if (data.artists.length < ITEMS_PER_PAGE) {
          hasMoreArtists.value = false;
        }
      } else {
        hasMoreArtists.value = false;
      }
    }
  });

  onErrorArtists((error) => {
    console.error('Error fetching artists:', error);
    hasMoreArtists.value = false;
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
