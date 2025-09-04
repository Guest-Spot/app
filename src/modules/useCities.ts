import { computed, inject, ref } from "vue";
import { useCitiesStore } from "src/stores/cities";
import type { SupabaseClient } from '@supabase/supabase-js';

const useCities = () => {
  const supabase = inject('supabase') as SupabaseClient;
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
