import { computed, ref } from 'vue';
import { useShopsStore } from 'src/stores/shops';
import type { IShop, IShopArtist } from 'src/interfaces/shop';
import type { IFilters } from 'src/interfaces/filters';
import { SHOPS_QUERY, SHOP_QUERY, SHOP_ARTISTS_QUERY } from 'src/apollo/types/shop';
import { useLazyQuery } from '@vue/apollo-composable';
import type { IArtist } from 'src/interfaces/artist';

const useShops = () => {
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

  const fetchShopArtists = async (shopDocumentId: string): Promise<IArtist[]> => {
    isLoading.value = true;
    try {
      const { result, load, error } = useLazyQuery<IShopArtist>(SHOP_ARTISTS_QUERY);
      await load(null, {
        variables: {
          documentId: shopDocumentId,
        },
      });

      if (error) {
        console.error('Error fetching shop artists:', error);
        return [];
      }
      console.log('result.value', result.value);
      return result.value?.artists || [];
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
    findShopByDocumentIdInStore
  };
};

export default useShops;
