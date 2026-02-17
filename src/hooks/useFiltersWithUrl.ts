import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { useFilterQueryParams } from './useFilterQueryParams';

type FilterValues = Record<string, string>;

interface UseFiltersWithUrlParams<TFilters> {
  currentFilters: TFilters;

  initialFilters: TFilters;

  onUpdateFilters: (filters: TFilters) => void;
}

interface UseFiltersWithUrlReturn {
  formMethods: ReturnType<typeof useForm<FilterValues>>;
  filterProps: {
    filters: FilterValues;
    initialFilters: FilterValues;
    onApplyFilters: (filters: FilterValues) => void;
  };
}

export const useFiltersWithUrl = <TFilters extends Record<string, any>>({
  currentFilters,
  initialFilters,
  onUpdateFilters,
}: UseFiltersWithUrlParams<TFilters>): UseFiltersWithUrlReturn => {
  const stringFilters = useMemo(
    () => Object.fromEntries(Object.entries(currentFilters).filter(([, value]) => typeof value === 'string')),
    [currentFilters],
  );

  const stringInitialFilters = useMemo(
    () => Object.fromEntries(Object.entries(initialFilters).filter(([, value]) => typeof value === 'string')),
    [initialFilters],
  );

  const { updateFilters: updateUrlFilters, filters: urlFiltersRaw } = useFilterQueryParams({
    defaultFilters: stringInitialFilters,
    onFiltersChange: (newFilters) => {
      onUpdateFilters({ ...currentFilters, ...newFilters } as TFilters);
    },
  });

  const urlFilters = useMemo(() => {
    const entries = Object.entries(urlFiltersRaw).map(([key, value]) => [key, String(value ?? '')]);
    return Object.fromEntries(entries) as FilterValues;
  }, [urlFiltersRaw]);

  const mergedFilters = useMemo(() => ({ ...stringFilters, ...urlFilters }), [stringFilters, urlFilters]);

  const formMethods = useForm<FilterValues>({
    defaultValues: mergedFilters,
  });

  useEffect(() => {
    formMethods.reset(mergedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mergedFilters]);

  const handleApplyFilters = (newFilters: FilterValues) => {
    updateUrlFilters(newFilters);
    onUpdateFilters({ ...currentFilters, ...newFilters } as TFilters);
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
