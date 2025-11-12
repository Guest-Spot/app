import { computed } from 'vue';
import { useLazyQuery } from '@vue/apollo-composable';
import { PORTFOLIOS_QUERY } from 'src/apollo/types/portfolio';
import type { IGraphQLPortfoliosResult } from 'src/interfaces/portfolio';
import { usePortfoliosStore } from 'src/stores/portfolios';
import { PAGINATION_PAGE_SIZE } from 'src/config/constants';

export default function usePortfolios() {
  const portfoliosStore = usePortfoliosStore();

  const {
    load: loadPortfolios,
    refetch: refetchPortfolios,
    loading: isLoadingPortfolios,
    onResult: onResultPortfolios,
    onError: onErrorPortfolios,
  } = useLazyQuery<IGraphQLPortfoliosResult>(PORTFOLIOS_QUERY);

  const portfolios = computed(() => portfoliosStore.getPortfolios);
  const totalPortfolios = computed(() => portfoliosStore.getTotal);
  const hasMorePortfolios = computed(() => portfoliosStore.getHasMore);

  const fetchPortfolios = () => {
    if (!portfoliosStore.getHasMore) {
      return;
    }

    void loadPortfolios(
      null,
      {
        sort: ['createdAt:desc'],
        pagination: {
          page: portfoliosStore.getPage,
          pageSize: PAGINATION_PAGE_SIZE,
        },
      },
      {
        fetchPolicy: 'network-only',
      },
    );
  };

  const resetPortfoliosPagination = () => {
    portfoliosStore.setPage(1);
    portfoliosStore.setHasMore(true);
    portfoliosStore.clearPortfolios();
  };

  const refetchPortfoliosData = () => {
    void refetchPortfolios({
      sort: ['createdAt:desc'],
      pagination: {
        page: portfoliosStore.getPage,
        pageSize: PAGINATION_PAGE_SIZE,
      },
    });
  };

  // Result handlers
  onResultPortfolios(({ data, loading }) => {
    if (!loading && data?.portfolios) {
      portfoliosStore.setTotal(data.portfolios_connection.pageInfo.total);
      // Append new data for load more
      if (data.portfolios.length > 0) {
        // NOTE: bad practice to use Set to avoid duplicates, but it's the only way to avoid duplicates in the store
        const portfolios = new Set([...portfoliosStore.getPortfolios, ...data.portfolios]);
        portfoliosStore.setPortfolios([...portfolios]);
        portfoliosStore.setPage(portfoliosStore.getPage + 1);
      } else {
        portfoliosStore.setHasMore(false);
      }
    }
  });

  onErrorPortfolios((error) => {
    console.error('Error fetching portfolios:', error);
    portfoliosStore.setHasMore(false);
  });

  return {
    portfolios,
    totalPortfolios,
    isLoadingPortfolios,
    hasMorePortfolios,
    resetPortfoliosPagination,
    fetchPortfolios,
    refetchPortfoliosData,
  };
}

