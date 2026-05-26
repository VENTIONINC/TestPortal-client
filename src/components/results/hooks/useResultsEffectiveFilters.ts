// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';
import { useDebounce } from 'use-debounce';

import { initialFilters, useResultsActions, useResultsFilters } from '@/redux/slices/results';
import { useFiltersWithUrl } from '@/hooks';
import { ResultsFilters } from '@/types';
import { formatDate, parseDateString } from '@/utils/dateUtils';

const MAX_RESULTS_DATE_RANGE_DAYS = 7;
const MILLISECONDS_IN_DAY = 1000 * 60 * 60 * 24;

const normalizeResultsDateRange = (filters: Record<string, string>): Record<string, string> => {
  const from = filters.from;
  const to = filters.to;

  if (!from || !to) {
    return filters;
  }

  const fromDate = parseDateString(from);
  const toDate = parseDateString(to);

  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime()) || fromDate > toDate) {
    return filters;
  }

  const inclusiveDays = Math.floor((toDate.getTime() - fromDate.getTime()) / MILLISECONDS_IN_DAY) + 1;

  if (inclusiveDays <= MAX_RESULTS_DATE_RANGE_DAYS) {
    return filters;
  }

  const normalizedFrom = new Date(toDate);
  normalizedFrom.setDate(toDate.getDate() - (MAX_RESULTS_DATE_RANGE_DAYS - 1));

  return {
    ...filters,
    from: formatDate(normalizedFrom),
  };
};

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
    normalizeFilters: normalizeResultsDateRange,
  });

  const effectiveFilters = useMemo(() => {
    const merged = { ...filters, ...filterProps.filters };
    return {
      ...merged,
      tags: typeof merged.tags === 'string'
        ? (merged.tags as string).split(',').filter(Boolean)
        : merged.tags,
      page: Number(merged.page) || 1,
    } as ResultsFilters;
  }, [filters, filterProps.filters]);

  const [debouncedFilters] = useDebounce(effectiveFilters, 500);

  return { effectiveFilters, debouncedFilters, filterFormMethods, filterProps };
};
