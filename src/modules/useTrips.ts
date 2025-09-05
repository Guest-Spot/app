import { ref } from "vue";
import type { ITrip } from "src/interfaces/trip";
import { createClient } from '@supabase/supabase-js';
import { API_URL, API_KEY } from 'src/config/constants';

const useTrips = () => {
  const supabase = createClient(API_URL as string, API_KEY as string);
  const isLoading = ref(false);
  const trips = ref<ITrip[]>([]);

  const fetchTripsByArtistUuid = async (artistUuid: string) => {
    isLoading.value = true;
    try {
      const { data, error } = await supabase.functions.invoke(`artistTrips/${artistUuid}`);

      if (error) {
        console.error('Error fetching trips by artist UUID:', error);
        return [];
      }

      trips.value = data || [];
      return data;
    } catch (error) {
      console.error('Error fetching trips by artist UUID:', error);
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  const createTrip = async (trip: Omit<ITrip, 'uuid'>) => {
    isLoading.value = true;
    try {
      const { data, error } = await supabase
        .from('trips')
        .insert([trip])
        .select();

      if (error) {
        console.error('Error creating trip:', error);
        return null;
      }

      return data?.[0];
    } catch (error) {
      console.error('Error creating trip:', error);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const updateTrip = async (uuid: string, updates: Partial<ITrip>) => {
    isLoading.value = true;
    try {
      const { data, error } = await supabase
        .from('trips')
        .update(updates)
        .eq('uuid', uuid)
        .select();

      if (error) {
        console.error('Error updating trip:', error);
        return null;
      }

      return data?.[0];
    } catch (error) {
      console.error('Error updating trip:', error);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteTrip = async (uuid: string) => {
    isLoading.value = true;
    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('uuid', uuid);

      if (error) {
        console.error('Error deleting trip:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting trip:', error);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    trips,
    isLoading,
    fetchTripsByArtistUuid,
    createTrip,
    updateTrip,
    deleteTrip
  };
};

export default useTrips;
