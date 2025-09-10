import { computed, ref } from "vue";
import { useShopsStore } from "src/stores/shops";
import type { IShop } from "src/interfaces/shop";
import { createClient } from '@supabase/supabase-js';
import type { IFilters } from 'src/interfaces/filters';
import { API_URL, API_KEY } from "src/config/constants";
import { SHOPS_QUERY, SHOP_QUERY } from 'src/apollo/types/shop';
import { useLazyQuery } from '@vue/apollo-composable';

const useShops = () => {
  const supabase = createClient(API_URL as string, API_KEY as string);
  const shopsStore = useShopsStore();
  const isLoading = ref(false);

  const shops = computed(() => shopsStore.getShops);

  const fetchShops = async (filters?: IFilters, params?: { sort?: { column: string; direction: 'asc' | 'desc' } }) => {
    const { result, load, error } = useLazyQuery<IShop[]>(SHOPS_QUERY);
    isLoading.value = true;
    try {
      await load(null, {
        variables: {
          filters,
          sort: params?.sort ? [params.sort.column] : undefined,
        },
      });

      if (error) {
        console.error('Error fetching shops:', error);
        return;
      }

      shopsStore.setShops(result.value || []);
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const fetchShopByDocumentId = async (documentId: string) => {
    const { result, load, error } = useLazyQuery<IShop>(SHOP_QUERY);
    isLoading.value = true;
    try {
      await load(null, {
        variables: {
          documentId,
        },
      });

      if (error) {
        console.error('Error fetching shop by documentId:', error);
        return null;
      }

      return result.value;
    } catch (error) {
      console.error('Error fetching shop by documentId:', error);
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

  const updateShop = async (documentId: string, updates: Partial<IShop>) => {
    isLoading.value = true;
    try {
      const { data, error } = await supabase
        .from('shops')
        .update(updates)
        .eq('documentId', documentId)
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

  const deleteShop = async (documentId: string) => {
    isLoading.value = true;
    try {
      const { error } = await supabase
        .from('shops')
        .delete()
        .eq('documentId', documentId);

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

  const fetchShopArtists = async (shopDocumentId: string) => {
    isLoading.value = true;
    try {
      const { data, error } = await supabase.functions.invoke(`shopArtists/${shopDocumentId}`);

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

  const findShopByDocumentIdInStore = (documentId: string) => {
    return shops.value.find(shop => shop.documentId === documentId);
  };

  return {
    shops,
    isLoading,
    fetchShops,
    fetchShopByDocumentId,
    fetchShopArtists,
    createShop,
    updateShop,
    deleteShop,
    findShopByDocumentIdInStore
  };
};

export default useShops;
