import React, { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';

type FilterValue = string | number | boolean | null | undefined;
type Filters = Record<string, FilterValue>;

interface UseFilterQueryParamsOptions {
  defaultFilters?: Filters;
  onFiltersChange?: (filters: Filters) => void;
  syncKeys?: string[];
}

export const useFilterQueryParams = (options: UseFilterQueryParamsOptions = {}) => {
  const { defaultFilters = {}, onFiltersChange, syncKeys } = options;
  const [searchParams, setSearchParams] = useSearchParams();

  const keysToSync = useMemo(() => syncKeys ?? Object.keys(defaultFilters), [syncKeys, defaultFilters]);

  const filters = useMemo(() => {
    const result: Filters = { ...defaultFilters };

    keysToSync.forEach((key) => {
      const paramValue = searchParams.get(key);
      if (paramValue !== null) {
        const defaultValue = defaultFilters[key];

        if (typeof defaultValue === 'number') {
          const numValue = Number(paramValue);
          result[key] = isNaN(numValue) ? defaultValue : numValue;
        } else if (typeof defaultValue === 'boolean') {
          result[key] = paramValue === 'true';
        } else {
          result[key] = paramValue;
        }
      }
    });

    return result;
  }, [searchParams, defaultFilters, keysToSync]);

  const updateFilters = useCallback(
    (newFilters: Partial<Filters>, replace = false) => {
      const updatedFilters = { ...filters, ...newFilters };

      const newSearchParams = new URLSearchParams();

      keysToSync.forEach((key) => {
        const value = updatedFilters[key];

        if (value !== null && value !== undefined && value !== defaultFilters[key]) {
          newSearchParams.set(key, String(value));
        }
      });

      setSearchParams(newSearchParams, { replace });

      onFiltersChange?.(updatedFilters);
    },
    [filters, keysToSync, defaultFilters, setSearchParams, onFiltersChange],
  );

  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
    onFiltersChange?.(defaultFilters);
  }, [setSearchParams, onFiltersChange, defaultFilters]);

  const lastSyncedFiltersRef = React.useRef<Filters | null>(null);

  useEffect(() => {
    if (onFiltersChange) {
      const filtersChanged = JSON.stringify(filters) !== JSON.stringify(lastSyncedFiltersRef.current);
      if (filtersChanged) {
        onFiltersChange(filters);
        lastSyncedFiltersRef.current = filters;
      }
    }
  }, [filters, onFiltersChange, lastSyncedFiltersRef]);

  return {
    filters,
    updateFilters,
    resetFilters,
    searchParams,
  };
};
