import { computed, ref } from 'vue';
import { useShopsStore } from 'src/stores/shops';
import type { IGraphQLShopsResult, IGraphQLShopResult, IGraphQLShopArtistsResult } from 'src/interfaces/shop';
import type { IFilters } from 'src/interfaces/filters';
import { SHOPS_QUERY, SHOP_QUERY, SHOP_ARTISTS_QUERY } from 'src/apollo/types/shop';
import { useLazyQuery } from '@vue/apollo-composable';
import type { IArtist } from 'src/interfaces/artist';
import useHelpers from 'src/modules/useHelpers';

const useShops = () => {
  const shopsStore = useShopsStore();
  const { convertFiltersToGraphQLFilters } = useHelpers();

  const {
    load: loadShops,
    refetch: refetchShops,
    loading: isLoadingShops,
    onResult: onResultShops,
    onError: onErrorShops,
  } = useLazyQuery<IGraphQLShopsResult>(SHOPS_QUERY);

  const isLoading = ref(false);

  const shops = computed(() => shopsStore.getShops);

  const fetchShops = (filters?: IFilters, params?: { sort?: string[] }) => {
    const graphQLFilters = convertFiltersToGraphQLFilters(filters || {});
    void loadShops(null, {
      variables: {
        filters: graphQLFilters,
        sort: params?.sort ? params.sort : undefined,
      },
    });
  };

  const fetchShopByDocumentId = async (documentId: string) => {
    isLoading.value = true;
    try {
      const { result, load, error } = useLazyQuery<IGraphQLShopResult>(SHOP_QUERY);
      await load(null, {
        variables: {
          documentId,
        },
      });

      if (error.value) {
        console.error('Error fetching shop by documentId:', error.value);
        return null;
      }

      return result.value?.shop;
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
      const { result, load, error } = useLazyQuery<IGraphQLShopArtistsResult>(SHOP_ARTISTS_QUERY);
      await load(null, {
        variables: {
          documentId: shopDocumentId,
        },
      });

      if (error.value) {
        console.error('Error fetching shop artists:', error.value);
        return [];
      }

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

  onResultShops((result) => {
    shopsStore.setShops(result.data?.shops || []);
  });

  onErrorShops((error) => {
    console.error('Error fetching shops:', error);
  });

  return {
    shops,
    isLoading,
    isLoadingShops,
    fetchShops,
    refetchShops,
    fetchShopByDocumentId,
    fetchShopArtists,
    findShopByDocumentIdInStore
  };
};

export default useShops;
