import { computed, ref } from "vue";
import { useCitiesStore } from "src/stores/cities";
import { useLazyQuery } from '@vue/apollo-composable';
import { CITIES_QUERY } from 'src/apollo/types/city';
import type { IGraphQLCitiesResult } from 'src/interfaces/city';

const useCities = () => {
  const citiesStore = useCitiesStore();
  const isLoading = ref(false);

  const cities = computed(() => citiesStore.getCities);

  const fetchCities = async () => {
    isLoading.value = true;
    try {
      const { result, load, error } = useLazyQuery<IGraphQLCitiesResult>(CITIES_QUERY);
      await load();

      if (error.value) {
        console.error('Error fetching cities:', error);
        return [];
      }

      citiesStore.setCities(result.value?.cities || []);
      return result.value?.cities || [];
    } catch (error) {
      console.error('Error fetching cities:', error);
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  return {
    cities,
    isLoading,
    fetchCities,
  };
};

export default useCities;
