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
import type { IGraphQLFilters } from 'src/interfaces/filters';
import { mergePortfoliosPreserveOrder } from 'src/utils/portfolios';

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

  const {
    load: loadPortfoliosBackground,
    onResult: onResultPortfoliosBackground,
    onError: onErrorPortfoliosBackground,
  } = useLazyQuery<IGraphQLPortfoliosResult>(PORTFOLIOS_QUERY);

  const { mutate: createPortfolioMutation } = useMutation(CREATE_PORTFOLIO_MUTATION);
  const { mutate: updatePortfolioMutation } = useMutation(UPDATE_PORTFOLIO_MUTATION);
  const { mutate: deletePortfolioMutation } = useMutation(DELETE_PORTFOLIO_MUTATION);

  const portfolios = computed(() => portfoliosStore.getPortfolios);
  const totalPortfolios = computed(() => portfoliosStore.getTotal);
  const hasMorePortfolios = computed(() => portfoliosStore.getHasMore);

  const buildQueryVariables = (
    activeFilters?: IFilters,
    searchQuery?: string | null,
    sortSettings?: SortSettings,
    page = portfoliosStore.getPage,
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filters: any = {};

    const styleConditions: IGraphQLFilters[] = [];

    if (searchQuery) {
      styleConditions.push({ name: { containsi: searchQuery } });
    }

    if (activeFilters?.styles?.length) {
      styleConditions.push({ name: { in: activeFilters.styles } });
    }

    if (styleConditions.length > 0) {
      if (styleConditions.length === 1) {
        filters.styles = styleConditions[0];
      } else {
        filters.and = styleConditions.map((cond) => ({ styles: cond }));
      }
    }

    if (activeFilters?.city) {
      filters.owner = {
        city: { containsi: activeFilters.city },
      };
    }

    const sort =
      sortSettings?.sortBy && sortSettings?.sortDirection
        ? [`${sortSettings.sortBy}:${sortSettings.sortDirection}`]
        : ['updatedAt:desc'];

    return {
      filters,
      sort,
      pagination: {
        page,
        pageSize: PAGINATION_PAGE_SIZE,
      },
    };
  };

  const fetchPortfolios = (
    activeFilters?: IFilters,
    searchQuery?: string | null,
    sortSettings?: SortSettings,
  ) => {
    void loadPortfolios(
      null,
      buildQueryVariables(activeFilters, searchQuery, sortSettings),
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
    void refetchPortfolios({
      ...buildQueryVariables(activeFilters, searchQuery, sortSettings, 1),
    });
  };

  const refreshPortfoliosData = (
    activeFilters?: IFilters,
    searchQuery?: string | null,
    sortSettings?: SortSettings,
  ) => {
    void loadPortfoliosBackground(
      null,
      buildQueryVariables(activeFilters, searchQuery, sortSettings, 1),
      {
        fetchPolicy: 'network-only',
      },
    );
  };

  const createPortfolio = async (data: PortfolioInput) => {
    const result = await createPortfolioMutation({
      data,
    });
    return result?.data?.createPortfolio;
  };

  const updatePortfolio = async (documentId: string, data: PortfolioInput) => {
    const result = await updatePortfolioMutation({
      documentId,
      data,
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
      const hadItems = portfoliosStore.getPortfolios.length > 0;
      // Append new data for load more
      if (data.portfolios.length > 0) {
        const merged = mergePortfoliosPreserveOrder(
          portfoliosStore.getPortfolios,
          data.portfolios,
        );
        portfoliosStore.setPortfolios(merged);
        portfoliosStore.setPage(portfoliosStore.getPage + 1);
        if (!hadItems) {
          portfoliosStore.setHasMore(true);
        }
      } else {
        portfoliosStore.setHasMore(false);
      }
    }
  });

  onResultPortfoliosBackground(({ data, loading }) => {
    if (!loading && data?.portfolios) {
      portfoliosStore.setTotal(data.portfolios_connection.pageInfo.total);

      const incoming = data.portfolios;
      const hadItems = portfoliosStore.getPortfolios.length > 0;
      const merged = mergePortfoliosPreserveOrder(portfoliosStore.getPortfolios, incoming);
      portfoliosStore.setPortfolios(merged);
      if (!hadItems) {
        portfoliosStore.setPage(merged.length > 0 ? 2 : 1);
        portfoliosStore.setHasMore(merged.length > 0);
      }
    }
  });

  onErrorPortfolios((error) => {
    console.error('Error fetching portfolios:', error);
    portfoliosStore.setHasMore(false);
  });

  onErrorPortfoliosBackground((error) => {
    console.error('Error fetching portfolios in background:', error);
  });

  return {
    portfolios,
    totalPortfolios,
    isLoadingPortfolios,
    hasMorePortfolios,
    resetPortfoliosPagination,
    fetchPortfolios,
    refetchPortfoliosData,
    refreshPortfoliosData,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
  };
}
