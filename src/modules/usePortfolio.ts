import { ref } from "vue";
import type { IGraphQLPortfolioResult } from "src/interfaces/portfolio";
import { PORTFOLIO_QUERY } from 'src/apollo/types/portfolio';
import { useLazyQuery } from '@vue/apollo-composable';

const usePortfolio = () => {
  const isLoading = ref(false);
  const { result, load, error } = useLazyQuery<IGraphQLPortfolioResult>(PORTFOLIO_QUERY);

  const fetchPortfolioByOwnerDocumentId = async (ownerDocumentId: string) => {
    isLoading.value = true;
    try {
      await load(null, {
        documentId: ownerDocumentId,
      });

      if (error) {
        console.error('Error fetching portfolio by owner documentId:', error);
        return [];
      }

      return result.value?.portfolio || [];
    } catch (error) {
      console.error('Error fetching portfolio by owner documentId:', error);
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    fetchPortfolioByOwnerDocumentId,
  };
};

export default usePortfolio;
