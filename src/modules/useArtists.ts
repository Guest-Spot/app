import { computed, ref } from "vue";
import { useArtistsStore } from "src/stores/artists";
import type { IArtist } from "src/interfaces/artist";
import type { IFilters } from 'src/interfaces/filters';
import { createClient } from '@supabase/supabase-js';
import { API_URL, API_KEY } from 'src/config/constants';

const useArtists = () => {
  const supabase = createClient(API_URL as string, API_KEY as string);
  const artistsStore = useArtistsStore();
  const isLoading = ref(false);

  const artists = computed(() => artistsStore.getArtists);

  const fetchArtists = async (filters?: IFilters, params?: { sort?: { column: string; direction: 'asc' | 'desc' } }) => {
    isLoading.value = true;
    try {
      let query = supabase.from('artists').select('*');

      if (params?.sort) {
        query = query.order(params.sort.column, { ascending: params.sort.direction === 'asc' });
      }
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value && value !== null && value !== undefined) {
            if (key === 'name') {
              query = query.ilike(key, `%${value}%`);
            } else {
              query = query.eq(key, value);
            }
          }
        });
      }
      const { data, error } = await query;

      if (error) {
        console.error('Error fetching artists:', error);
        return;
      }

      artistsStore.setArtists(data || []);
    } catch (error) {
      console.error('Error fetching artists:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const fetchArtistByUuid = async (uuid: string) => {
    isLoading.value = true;
    try {
      const { data, error } = await supabase.functions.invoke(`artist/${uuid}`);

      if (error) {
        console.error('Error fetching artist by UUID:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching artist by UUID:', error);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const createArtist = async (artist: Omit<IArtist, 'id'>) => {
    isLoading.value = true;
    try {
      const { data, error } = await supabase
        .from('artists')
        .insert([artist])
        .select();

      if (error) {
        console.error('Error creating artist:', error);
        return null;
      }

      await fetchArtists();
      return data?.[0];
    } catch (error) {
      console.error('Error creating artist:', error);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const updateArtist = async (uuid: string, updates: Partial<IArtist>) => {
    isLoading.value = true;
    try {
      const { data, error } = await supabase
        .from('artists')
        .update(updates)
        .eq('uuid', uuid)
        .select();

      if (error) {
        console.error('Error updating artist:', error);
        return null;
      }

      await fetchArtists();
      return data?.[0];
    } catch (error) {
      console.error('Error updating artist:', error);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteArtist = async (uuid: string) => {
    isLoading.value = true;
    try {
      const { error } = await supabase
        .from('artists')
        .delete()
        .eq('uuid', uuid);

      if (error) {
        console.error('Error deleting artist:', error);
        return false;
      }

      await fetchArtists();
      return true;
    } catch (error) {
      console.error('Error deleting artist:', error);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const findArtistByUuidInStore = (uuid: string) => {
    return artists.value.find(artist => artist.uuid === uuid);
  };

  return {
    artists,
    isLoading,
    fetchArtists,
    fetchArtistByUuid,
    createArtist,
    updateArtist,
    deleteArtist,
    findArtistByUuidInStore
  };
};

export default useArtists;
