export interface SortSettings {
  sortBy: string | null;
  sortDirection: 'asc' | 'desc';
}

export const getSortParams = (sortSettings: SortSettings) => {
  const sort =
    sortSettings.sortBy && sortSettings.sortBy !== 'distance'
      ? [`${sortSettings.sortBy}:${sortSettings.sortDirection}`]
      : undefined;
  const distanceSort =
    sortSettings.sortBy === 'distance' ? sortSettings.sortDirection : undefined;

  return { sort, distanceSort };
};
