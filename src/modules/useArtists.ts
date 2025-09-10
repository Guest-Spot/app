import { computed, ref } from "vue";
import { useArtistsStore } from "src/stores/artists";
import type { IGraphQLArtistsResult } from "src/interfaces/artist";
import type { IFilters } from 'src/interfaces/filters';
import { useLazyQuery } from '@vue/apollo-composable';
import { ARTISTS_QUERY } from 'src/apollo/types/artist';

const useArtists = () => {
  const artistsStore = useArtistsStore();

  const isLoading = ref(false);

  const artists = computed(() => artistsStore.getArtists);

  const fetchArtists = async (filters?: IFilters, params?: { sort?: { column: string; direction: 'asc' | 'desc' } }) => {
    isLoading.value = true;
    try {
      const { result, load, error } = useLazyQuery<IGraphQLArtistsResult>(ARTISTS_QUERY, { filters, params });
      await load();

      if (error.value) {
        console.error('Error fetching artists:', error.value);
        return;
      }

      artistsStore.setArtists(result.value?.artists || []);
    } catch (error) {
      console.error('Error fetching artists:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const findArtistByDocumentIdInStore = (documentId: string) => {
    return artists.value.find(artist => artist.documentId === documentId);
  };

  return {
    artists,
    isLoading,
    fetchArtists,
    findArtistByDocumentIdInStore
  };
};

export default useArtists;
