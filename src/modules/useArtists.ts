import { computed, ref } from "vue";
import { useArtistsStore } from "src/stores/artists";
import type { IArtist } from "src/interfaces/artist";
import type { IFilters } from 'src/interfaces/filters';
import { useLazyQuery } from '@vue/apollo-composable';
import { ARTISTS_QUERY, ARTIST_QUERY } from 'src/apollo/types/artist';

const useArtists = () => {
  const artistsStore = useArtistsStore();
  const isLoading = ref(false);

  const artists = computed(() => artistsStore.getArtists);

  const fetchArtists = async (filters?: IFilters, params?: { sort?: { column: string; direction: 'asc' | 'desc' } }) => {
    isLoading.value = true;
    const { result, load, error } = useLazyQuery<IArtist[]>(ARTISTS_QUERY, { filters, params });
    try {
      await load();

      if (error) {
        console.error('Error fetching artists:', error);
        return;
      }

      artistsStore.setArtists(result.value || []);
    } catch (error) {
      console.error('Error fetching artists:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const fetchArtistByDocumentId = async (documentId: string) => {
    isLoading.value = true;
    const { result, load, error } = useLazyQuery<IArtist>(ARTIST_QUERY, { documentId });
    try {
      await load();

      if (error) {
        console.error('Error fetching artist by documentId:', error);
        return null;
      }

      return result.value;
    } catch (error) {
      console.error('Error fetching artist by documentId:', error);
      return null;
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
    fetchArtistByDocumentId,
    findArtistByDocumentIdInStore
  };
};

export default useArtists;
