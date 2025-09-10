import { ref } from "vue";
import type { IGraphQLTripsResult } from "src/interfaces/trip";
import { TRIPS_QUERY } from 'src/apollo/types/trip';
import { useLazyQuery } from '@vue/apollo-composable';

const useTrips = () => {
  const { result, load, error } = useLazyQuery<IGraphQLTripsResult>(TRIPS_QUERY);
  const isLoading = ref(false);

  const fetchTripsByArtistDocumentId = async (artistDocumentId: string) => {
    isLoading.value = true;
    try {
      await load(null, {
        documentId: artistDocumentId,
      });

      if (error) {
        console.error('Error fetching trips by artist documentId:', error);
        return [];
      }

      return result.value?.trips || [];
    } catch (error) {
      console.error('Error fetching trips by artist documentId:', error);
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    fetchTripsByArtistDocumentId,
  };
};

export default useTrips;
