import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { useFilterQueryParams } from './useFilterQueryParams';

type FilterValue = string | number | boolean | null | undefined | string[];
type FilterValues = Record<string, string>;

const toStringFilters = (filters: Record<string, FilterValue>): FilterValues => {
  return Object.fromEntries(
    Object.entries(filters)
      .filter(([, value]) => typeof value === 'string' || Array.isArray(value))
      .map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : String(value)]),
  ) as FilterValues;
};

interface UseFiltersWithUrlParams<TFilters> {
  currentFilters: TFilters;

  initialFilters: TFilters;

  onUpdateFilters: (filters: TFilters) => void;

  normalizeFilters?: (filters: FilterValues) => FilterValues;
}

interface UseFiltersWithUrlReturn {
  formMethods: ReturnType<typeof useForm<FilterValues>>;
  filterProps: {
    filters: FilterValues;
    initialFilters: FilterValues;
    onApplyFilters: (filters: FilterValues) => void;
  };
}

export const useFiltersWithUrl = <TFilters extends Record<string, FilterValue>>({
  currentFilters,
  initialFilters,
  onUpdateFilters,
  normalizeFilters,
}: UseFiltersWithUrlParams<TFilters>): UseFiltersWithUrlReturn => {
  const stringFilters = useMemo(() => toStringFilters(currentFilters), [currentFilters]);

  const stringInitialFilters = useMemo(() => toStringFilters(initialFilters), [initialFilters]);

  const {
    updateFilters: updateUrlFilters,
    filters: urlFiltersRaw,
    searchParams,
  } = useFilterQueryParams({
    defaultFilters: stringInitialFilters,
    onFiltersChange: (newFilters) => {
      const normalizedFilters = normalizeFilters?.(newFilters as FilterValues) ?? (newFilters as FilterValues);
      onUpdateFilters({ ...currentFilters, ...normalizedFilters } as TFilters);
    },
  });

  const urlFilters = useMemo(() => {
    const entries = Object.entries(urlFiltersRaw)
      .filter(([key]) => searchParams.has(key))
      .map(([key, value]) => [key, String(value ?? '')]);

    return Object.fromEntries(entries) as FilterValues;
  }, [urlFiltersRaw, searchParams]);

  const mergedFilters = useMemo(
    () => normalizeFilters?.({ ...stringFilters, ...urlFilters }) ?? { ...stringFilters, ...urlFilters },
    [normalizeFilters, stringFilters, urlFilters],
  );

  const formMethods = useForm<FilterValues>({
    defaultValues: mergedFilters,
  });

  useEffect(() => {
    formMethods.reset(mergedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mergedFilters]);

  const handleApplyFilters = (newFilters: FilterValues) => {
    const normalizedFilters = normalizeFilters?.(newFilters) ?? newFilters;
    updateUrlFilters(normalizedFilters);
    onUpdateFilters({ ...currentFilters, ...normalizedFilters } as TFilters);
  };

  return {
    formMethods,
    filterProps: {
      filters: mergedFilters,
      initialFilters: stringInitialFilters,
      onApplyFilters: handleApplyFilters,
    },
  };
};
