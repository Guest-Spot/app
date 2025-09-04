import { computed, inject, ref } from "vue";
import { useShopsStore } from "src/stores/shops";
import type { IShop } from "src/interfaces/shop";
import type { SupabaseClient } from '@supabase/supabase-js';
import type { IFilters } from 'src/interfaces/filters';

const useShops = () => {
  const supabase = inject('supabase') as SupabaseClient;
  const shopsStore = useShopsStore();
  const isLoading = ref(false);

  const shops = computed(() => shopsStore.getShops);

      const fetchShops = async (filters?: IFilters) => {
    isLoading.value = true;
    try {
      let query = supabase
        .from('shops_with_opening_times')
        .select('*');

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
        console.error('Error fetching shops:', error);
        return;
      }

      shopsStore.setShops(data || []);
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const fetchShopByUuid = async (uuid: string) => {
    isLoading.value = true;
    try {
      const { data, error } = await supabase.functions.invoke(`shop/${uuid}`);

      if (error) {
        console.error('Error fetching shop by UUID:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching shop by UUID:', error);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const createShop = async (shop: Omit<IShop, 'id'>) => {
    isLoading.value = true;
    try {
      const { data, error } = await supabase
        .from('shops')
        .insert([shop])
        .select();

      if (error) {
        console.error('Error creating shop:', error);
        return null;
      }

      await fetchShops();
      return data?.[0];
    } catch (error) {
      console.error('Error creating shop:', error);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const updateShop = async (id: number, updates: Partial<IShop>) => {
    isLoading.value = true;
    try {
      const { data, error } = await supabase
        .from('shops')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error updating shop:', error);
        return null;
      }

      await fetchShops();
      return data?.[0];
    } catch (error) {
      console.error('Error updating shop:', error);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteShop = async (id: number) => {
    isLoading.value = true;
    try {
      const { error } = await supabase
        .from('shops')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting shop:', error);
        return false;
      }

      await fetchShops();
      return true;
    } catch (error) {
      console.error('Error deleting shop:', error);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchShopArtists = async (shopUuid: string) => {
    isLoading.value = true;
    try {
      const { data, error } = await supabase.functions.invoke(`shopArtists/${shopUuid}`);

      if (error) {
        console.error('Error fetching shop artists:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching shop artists:', error);
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  const findShopByUuidInStore = (uuid: string) => {
    return shops.value.find(shop => shop.uuid === uuid);
  };

  return {
    shops,
    isLoading,
    fetchShops,
    fetchShopByUuid,
    fetchShopArtists,
    createShop,
    updateShop,
    deleteShop,
    findShopByUuidInStore
  };
};

export default useShops;
