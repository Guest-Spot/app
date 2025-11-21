import { computed } from 'vue';
import { useLazyQuery, useMutation } from '@vue/apollo-composable';
import {
  PORTFOLIOS_QUERY,
  CREATE_PORTFOLIO_MUTATION,
  UPDATE_PORTFOLIO_MUTATION,
  DELETE_PORTFOLIO_MUTATION,
} from 'src/apollo/types/portfolio';
import type { IGraphQLPortfoliosResult } from 'src/interfaces/portfolio';
import { usePortfoliosStore } from 'src/stores/portfolios';
import { PAGINATION_PAGE_SIZE } from 'src/config/constants';
import type { IFilters } from 'src/interfaces/filters';

interface PortfolioInput {
  owner: string;
  title: string;
  description: string;
  pictures: (string | number)[];
  styles: string[];
}

interface SortSettings {
  sortBy: string | null;
  sortDirection: 'asc' | 'desc';
}

export default function usePortfolios() {
  const portfoliosStore = usePortfoliosStore();

  const {
    load: loadPortfolios,
    refetch: refetchPortfolios,
    loading: isLoadingPortfolios,
    onResult: onResultPortfolios,
    onError: onErrorPortfolios,
  } = useLazyQuery<IGraphQLPortfoliosResult>(PORTFOLIOS_QUERY);

  const { mutate: createPortfolioMutation } = useMutation(CREATE_PORTFOLIO_MUTATION);
  const { mutate: updatePortfolioMutation } = useMutation(UPDATE_PORTFOLIO_MUTATION);
  const { mutate: deletePortfolioMutation } = useMutation(DELETE_PORTFOLIO_MUTATION);

  const portfolios = computed(() => portfoliosStore.getPortfolios);
  const totalPortfolios = computed(() => portfoliosStore.getTotal);
  const hasMorePortfolios = computed(() => portfoliosStore.getHasMore);

  const fetchPortfolios = (
    activeFilters?: IFilters,
    searchQuery?: string | null,
    sortSettings?: SortSettings,
  ) => {
    if (!portfoliosStore.getHasMore) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filters: any = {};

    if (searchQuery) {
      filters.title = { containsi: searchQuery };
    }

    if (activeFilters?.city) {
      filters.owner = {
        city: { containsi: activeFilters.city },
      };
    }

    const sort =
      sortSettings?.sortBy && sortSettings?.sortDirection
        ? [`${sortSettings.sortBy}:${sortSettings.sortDirection}`]
        : ['createdAt:desc'];

    void loadPortfolios(
      null,
      {
        filters,
        sort,
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

  const refetchPortfoliosData = (
    activeFilters?: IFilters,
    searchQuery?: string | null,
    sortSettings?: SortSettings,
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filters: any = {};

    if (searchQuery) {
      filters.title = { containsi: searchQuery };
    }

    if (activeFilters?.city) {
      filters.owner = {
        city: { containsi: activeFilters.city },
      };
    }

    const sort =
      sortSettings?.sortBy && sortSettings?.sortDirection
        ? [`${sortSettings.sortBy}:${sortSettings.sortDirection}`]
        : ['createdAt:desc'];

    void refetchPortfolios({
      filters,
      sort,
      pagination: {
        page: 1, // Reset to page 1 on refetch
        pageSize: PAGINATION_PAGE_SIZE,
      },
    });
  };

  const createPortfolio = async (data: PortfolioInput) => {
    const result = await createPortfolioMutation({
      data: {
        ...data,
        styles: data.styles.map((name) => ({
          __typename: 'ComponentTattooStyles',
          __component: 'tattoo.styles',
          name,
        })),
      },
    });
    return result?.data?.createPortfolio;
  };

  const updatePortfolio = async (documentId: string, data: PortfolioInput) => {
    const result = await updatePortfolioMutation({
      documentId,
      data: {
        ...data,
        styles: data.styles.map((name) => ({
          __typename: 'ComponentTattooStyles',
          __component: 'tattoo.styles',
          name,
        })),
      },
    });
    return result?.data?.updatePortfolio;
  };

  const deletePortfolio = async (documentId: string) => {
    const result = await deletePortfolioMutation({ documentId });
    return result?.data?.deletePortfolio;
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
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
  };
}

