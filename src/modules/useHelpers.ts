import type { IFilters, IGraphQLFilters } from 'src/interfaces/filters';

const useHelpers = () => {
  const convertFiltersToGraphQLFilters = (filters: IFilters): IGraphQLFilters => {
    return {
      ...(filters.name && {
        name: {
          containsi: filters.name || null,
        },
      }),
      ...(filters.city && {
        city: {
          containsi: filters.city || null,
        },
      }),
      ...(filters.styles &&
        filters.styles.length > 0 && {
          styles: {
            name: {
              in: filters.styles,
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
