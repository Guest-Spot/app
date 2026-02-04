import type { RouteLocationNormalized } from 'vue-router';
import type { IFilters } from 'src/interfaces/filters';
import { UserType } from 'src/interfaces/enums';

interface SortSettings {
  sortBy: string | null;
  sortDirection: 'asc' | 'desc';
}

interface FilterState {
  filters: IFilters;
  searchQuery: string | null;
  sortSettings: SortSettings;
}

const STORAGE_PREFIX = 'guestspot_filters_';

const DEFAULT_STATE: FilterState = {
  filters: {
    type: null,
    city: null,
    styles: null,
    guestSpotEnabled: false,
  },
  searchQuery: null,
  sortSettings: {
    sortBy: null,
    sortDirection: 'asc',
  },
};

const FILTER_QUERY_KEYS = ['search', 'type', 'city', 'styles', 'guestSpotEnabled', 'sort'] as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value != null && typeof value === 'object' && !Array.isArray(value);

const resolveValue = <T>(value: T | null | undefined, fallback: T | null): T | null =>
  value === undefined ? fallback : value;

const normalizeNullableString = (value: unknown): string | null | undefined => {
  if (value === null) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }
  if (Array.isArray(value)) {
    const first = value.find((item) => typeof item === 'string');
    if (typeof first === 'string') {
      const trimmed = first.trim();
      return trimmed.length ? trimmed : null;
    }
    return undefined;
  }
  return undefined;
};

const normalizeNullableStringArray = (value: unknown): string[] | null | undefined => {
  if (value === null) return null;
  if (Array.isArray(value)) {
    const items = value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    return items.length ? items : null;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length ? [trimmed] : null;
  }
  return undefined;
};

const normalizeUserTypeValue = (value: unknown): UserType | null | undefined => {
  const normalized = normalizeNullableString(value);
  if (normalized === undefined || normalized === null) {
    return normalized;
  }
  return Object.values(UserType).includes(normalized as UserType)
    ? (normalized as UserType)
    : undefined;
};

const normalizeSortDirection = (
  value: unknown,
  fallback: 'asc' | 'desc',
): 'asc' | 'desc' => {
  if (value === 'asc' || value === 'desc') return value;
  return fallback;
};

const normalizeSortSettings = (value: unknown, fallback: SortSettings): SortSettings => {
  if (!isRecord(value)) {
    return { ...fallback };
  }
  const sortBy = resolveValue(normalizeNullableString(value.sortBy), fallback.sortBy ?? null);
  const sortDirection = normalizeSortDirection(value.sortDirection, fallback.sortDirection);
  return { sortBy, sortDirection };
};

const normalizeFilters = (value: unknown, fallback: IFilters): IFilters => {
  if (!isRecord(value)) {
    return { ...fallback };
  }
  const type = resolveValue(normalizeUserTypeValue(value.type), fallback.type ?? null);
  const city = resolveValue(normalizeNullableString(value.city), fallback.city ?? null);
  const styles = resolveValue(normalizeNullableStringArray(value.styles), fallback.styles ?? null);
  const guestSpotEnabled = resolveValue(
    value.guestSpotEnabled === true || value.guestSpotEnabled === 'true' ? true : null,
    fallback.guestSpotEnabled ?? null,
  );

  return {
    ...fallback,
    type,
    city,
    styles,
    guestSpotEnabled,
  };
};

const normalizeSearchQuery = (value: unknown, fallback: string | null): string | null =>
  resolveValue(normalizeNullableString(value), fallback ?? null);

const normalizeFilterState = (value: unknown, fallback: FilterState): FilterState => {
  if (!isRecord(value)) {
    return {
      filters: { ...fallback.filters },
      searchQuery: fallback.searchQuery ?? null,
      sortSettings: { ...fallback.sortSettings },
    };
  }

  return {
    filters: normalizeFilters(value.filters, fallback.filters),
    searchQuery: normalizeSearchQuery(value.searchQuery, fallback.searchQuery),
    sortSettings: normalizeSortSettings(value.sortSettings, fallback.sortSettings),
  };
};

const getStorageKey = (pageKey: string) => `${STORAGE_PREFIX}${pageKey}`;

const hasQueryKey = (
  routeQuery: RouteLocationNormalized['query'],
  key: string,
): boolean => Object.prototype.hasOwnProperty.call(routeQuery, key);

const hasFilterQuery = (routeQuery: RouteLocationNormalized['query']): boolean =>
  FILTER_QUERY_KEYS.some((key) => hasQueryKey(routeQuery, key));

const parseSortFromQuery = (
  value: unknown,
  fallback: SortSettings,
): SortSettings => {
  const raw = normalizeNullableString(value);
  if (!raw) {
    return { ...fallback };
  }
  const [sortByValue, sortDirectionValue] = raw.split(':');
  const sortBy = sortByValue && sortByValue.trim().length > 0 ? sortByValue : null;
  const sortDirection = normalizeSortDirection(sortDirectionValue, fallback.sortDirection);
  return { sortBy, sortDirection };
};

const readFiltersFromQuery = (
  routeQuery: RouteLocationNormalized['query'],
  defaults: FilterState,
): FilterState => {
  const filters = { ...defaults.filters };

  if (hasQueryKey(routeQuery, 'type')) {
    filters.type = resolveValue(
      normalizeUserTypeValue(routeQuery.type),
      defaults.filters.type ?? null,
    );
  }

  if (hasQueryKey(routeQuery, 'city')) {
    filters.city = resolveValue(
      normalizeNullableString(routeQuery.city),
      defaults.filters.city ?? null,
    );
  }

  if (hasQueryKey(routeQuery, 'styles')) {
    filters.styles = resolveValue(
      normalizeNullableStringArray(routeQuery.styles),
      defaults.filters.styles ?? null,
    );
  }

  if (hasQueryKey(routeQuery, 'guestSpotEnabled')) {
    const val = routeQuery.guestSpotEnabled;
    filters.guestSpotEnabled = val === 'true' ? true : null;
  }

  const searchQuery = hasQueryKey(routeQuery, 'search')
    ? resolveValue(normalizeNullableString(routeQuery.search), defaults.searchQuery ?? null)
    : defaults.searchQuery ?? null;

  const sortSettings = hasQueryKey(routeQuery, 'sort')
    ? parseSortFromQuery(routeQuery.sort, defaults.sortSettings)
    : { ...defaults.sortSettings };

  return {
    filters,
    searchQuery,
    sortSettings,
  };
};

export function useFilterPersistence() {
  const saveFilters = (
    pageKey: string,
    filters: IFilters,
    searchQuery: string | null,
    sortSettings: SortSettings,
  ): void => {
    try {
      const payload = normalizeFilterState(
        { filters, searchQuery, sortSettings },
        DEFAULT_STATE,
      );
      localStorage.setItem(getStorageKey(pageKey), JSON.stringify(payload));
    } catch (error) {
      console.error('Failed to save filters to localStorage:', error);
    }
  };

  const loadFilters = (
    pageKey: string,
    routeQuery: RouteLocationNormalized['query'],
    defaults?: FilterState,
  ): FilterState => {
    const fallbackState = normalizeFilterState(defaults ?? DEFAULT_STATE, DEFAULT_STATE);

    if (hasFilterQuery(routeQuery)) {
      return readFiltersFromQuery(routeQuery, fallbackState);
    }

    try {
      const raw = localStorage.getItem(getStorageKey(pageKey));
      if (!raw) {
        return fallbackState;
      }
      const parsed = JSON.parse(raw) as unknown;
      return normalizeFilterState(parsed, fallbackState);
    } catch (error) {
      console.error('Failed to load filters from localStorage:', error);
      return fallbackState;
    }
  };

  const clearFilters = (pageKey: string): void => {
    try {
      localStorage.removeItem(getStorageKey(pageKey));
    } catch (error) {
      console.error('Failed to clear filters from localStorage:', error);
    }
  };

  return { saveFilters, loadFilters, clearFilters };
}

export type { FilterState, SortSettings };
