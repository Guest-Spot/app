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

  // Infinite scroll done callback
  let artistsScrollDone: ((stop?: boolean) => void) | null = null;

  const {
    load: loadArtists,
    refetch: refetchArtists,
    loading: isLoadingArtists,
    onResult: onResultArtists,
    onError: onErrorArtists,
  } = useLazyQuery<IGraphQLArtistsResult>(ARTISTS_QUERY);

  // Separate query for infinite scroll
  const {
    load: loadMoreArtistsQuery,
    onResult: onResultLoadMoreArtists,
    onError: onErrorLoadMoreArtists,
  } = useLazyQuery<IGraphQLArtistsResult>(ARTISTS_QUERY);

  const artists = computed(() => artistsStore.getArtists);

  const loadMoreArtists = (index: number, done: (stop?: boolean) => void, activeFilters: IFilters, searchQuery: string | null, sortSettings: SortSettings) => {
    if (!hasMoreArtists.value) {
      done(true);
      return;
    }

    artistsScrollDone = done;

    void loadMoreArtistsQuery(null, {
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

  const initializeArtists = (activeFilters: IFilters, searchQuery: string | null, sortSettings: SortSettings) => {
    void loadArtists(null, {
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
      artistsStore.setArtists(data.artists);
      // Check if we got fewer items than requested for the first load
      if (data.artists.length < ITEMS_PER_PAGE) {
        hasMoreArtists.value = false;
      }
    }
  });

  onErrorArtists((error) => {
    console.error('Error fetching artists:', error);
  });

  // Infinite scroll result handlers
  onResultLoadMoreArtists(({ data, loading }) => {
    if (!loading && data?.artists) {
      if (data.artists.length > 0) {
        artistsStore.addArtists(data.artists);
        artistsPage.value++;

        // Check if we got fewer items than requested (means we've reached the end)
        if (data.artists.length < ITEMS_PER_PAGE) {
          hasMoreArtists.value = false;
          artistsScrollDone?.(true);
        } else {
          artistsScrollDone?.();
        }
      } else {
        hasMoreArtists.value = false;
        artistsScrollDone?.(true);
      }
      artistsScrollDone = null;
    }
  });

  onErrorLoadMoreArtists((error) => {
    console.error('Error loading more artists:', error);
    hasMoreArtists.value = false;
    artistsScrollDone?.(true);
    artistsScrollDone = null;
  });

  return {
    artists,
    isLoadingArtists,
    hasMoreArtists,
    loadMoreArtists,
    resetArtistsPagination,
    initializeArtists,
    refetchArtistsData,
  };
}
