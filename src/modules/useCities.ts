import { computed, ref } from "vue";
import { useCitiesStore } from "src/stores/cities";
import { createClient } from '@supabase/supabase-js';
import { API_URL, API_KEY } from 'src/config/constants';

const useCities = () => {
  const supabase = createClient(API_URL as string, API_KEY as string);
  const citiesStore = useCitiesStore();
  const isLoading = ref(false);

  const cities = computed(() => citiesStore.getCities);

  const fetchCities = async () => {
    isLoading.value = true;
    try {
      const { data, error } = await supabase
        .from('cities_view')
        .select('name');

      if (error) {
        console.error('Error fetching cities:', error);
        return [];
      }

      citiesStore.setCities(data.map((city: { name: string }) => city.name) || []);
      return data;
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
