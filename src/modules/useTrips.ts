import { ref } from "vue";
import type { ITrip } from "src/interfaces/trip";
import { createClient } from '@supabase/supabase-js';
import { API_URL, API_KEY } from 'src/config/constants';

const useTrips = () => {
  const supabase = createClient(API_URL as string, API_KEY as string);
  const isLoading = ref(false);
  const trips = ref<ITrip[]>([]);

  const fetchTripsByArtistDocumentId = async (artistDocumentId: string) => {
    isLoading.value = true;
    try {
      const { data, error } = await supabase.functions.invoke(`artistTrips/${artistDocumentId}`);

      if (error) {
        console.error('Error fetching trips by artist documentId:', error);
        return [];
      }

      trips.value = data || [];
      return data;
    } catch (error) {
      console.error('Error fetching trips by artist documentId:', error);
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  const createTrip = async (trip: Omit<ITrip, 'documentId'>) => {
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

  const updateTrip = async (documentId: string, updates: Partial<ITrip>) => {
    isLoading.value = true;
    try {
      const { data, error } = await supabase
        .from('trips')
        .update(updates)
        .eq('documentId', documentId)
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

  const deleteTrip = async (documentId: string) => {
    isLoading.value = true;
    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('documentId', documentId);

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
    fetchTripsByArtistDocumentId,
    createTrip,
    updateTrip,
    deleteTrip
  };
};

export default useTrips;
