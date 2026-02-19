import { useMemo } from 'react';
import { useDebounce } from 'use-debounce';

import { initialFilters, useResultsActions, useResultsFilters } from '@/redux/slices/results';
import { useFiltersWithUrl } from '@/hooks';
import { ResultsFilters } from '@/types';

export interface UseResultsEffectiveFiltersReturn {
  effectiveFilters: ResultsFilters;
  debouncedFilters: ResultsFilters;
  filterFormMethods: ReturnType<typeof useFiltersWithUrl>['formMethods'];
  filterProps: ReturnType<typeof useFiltersWithUrl>['filterProps'];
}

export const useResultsEffectiveFilters = (): UseResultsEffectiveFiltersReturn => {
  const filters = useResultsFilters();
  const { updateFilters } = useResultsActions();

  const { formMethods: filterFormMethods, filterProps } = useFiltersWithUrl({
    currentFilters: filters,
    initialFilters,
    onUpdateFilters: updateFilters,
  });

  const effectiveFilters = useMemo(
    () => ({ ...filters, ...filterProps.filters }),
    [filters, filterProps.filters],
  );

  const [debouncedFilters] = useDebounce(effectiveFilters, 500);

  return { effectiveFilters, debouncedFilters, filterFormMethods, filterProps };
};
