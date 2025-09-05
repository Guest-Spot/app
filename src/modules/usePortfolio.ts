import { ref } from "vue";
import type { IPortfolio } from "src/interfaces/portfolio";
import { createClient } from '@supabase/supabase-js';
import { API_URL, API_KEY } from 'src/config/constants';

const usePortfolio = () => {
  const supabase = createClient(API_URL as string, API_KEY as string);
  const isLoading = ref(false);
  const portfolioItems = ref<IPortfolio[]>([]);

  const fetchPortfolioByOwnerUuid = async (ownerUuid: string) => {
    isLoading.value = true;
    try {
      const { data, error } = await supabase.functions.invoke(`portfolio/${ownerUuid}`);

      if (error) {
        console.error('Error fetching portfolio by owner UUID:', error);
        return [];
      }

      portfolioItems.value = data || [];
      return data;
    } catch (error) {
      console.error('Error fetching portfolio by owner UUID:', error);
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  const createPortfolioItem = async (portfolioItem: Omit<IPortfolio, 'uuid'>) => {
    isLoading.value = true;
    try {
      const { data, error } = await supabase
        .from('portfolio')
        .insert([portfolioItem])
        .select();

      if (error) {
        console.error('Error creating portfolio item:', error);
        return null;
      }

      return data?.[0];
    } catch (error) {
      console.error('Error creating portfolio item:', error);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const updatePortfolioItem = async (uuid: string, updates: Partial<IPortfolio>) => {
    isLoading.value = true;
    try {
      const { data, error } = await supabase
        .from('portfolio')
        .update(updates)
        .eq('uuid', uuid)
        .select();

      if (error) {
        console.error('Error updating portfolio item:', error);
        return null;
      }

      return data?.[0];
    } catch (error) {
      console.error('Error updating portfolio item:', error);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const deletePortfolioItem = async (uuid: string) => {
    isLoading.value = true;
    try {
      const { error } = await supabase
        .from('portfolio')
        .delete()
        .eq('uuid', uuid);

      if (error) {
        console.error('Error deleting portfolio item:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    portfolioItems,
    isLoading,
    fetchPortfolioByOwnerUuid,
    createPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem
  };
};

export default usePortfolio;
