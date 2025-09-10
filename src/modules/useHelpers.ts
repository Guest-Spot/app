import type { IFilters, IGraphQLFilters } from 'src/interfaces/filters';

const useHelpers = () => {
  const convertFiltersToGraphQLFilters = (filters: IFilters): IGraphQLFilters => {
    return {
      ...(filters.name && {
        name: {
          contains: filters.name || null,
        },
      }),
      ...(filters.city && {
        location: {
          city: {
            containsi: filters.city || null,
          },
        },
      }),
    };
  };

  return {
    convertFiltersToGraphQLFilters,
  };
};

export default useHelpers;
