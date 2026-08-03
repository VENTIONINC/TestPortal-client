// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';
import { useDebounce } from 'use-debounce';

import { useGetResultsQuery } from '@/redux/apis/extendedApi';
import { getDatesBetween, getDateDisplayName, getEffectiveDatesInRange } from '@/utils/dateUtils';
import { Result, ResultsFilters } from '@/types';

import { SpecGroup, buildResultsGroups } from '../utils';

interface UseResultsDataParams {
  effectiveFilters: ResultsFilters;
  debouncedFilters: ResultsFilters;
  selectedDates: string[];
  selectedProjectId: string;
}

export interface UseResultsDataReturn {
  results: Map<string, SpecGroup>;
  unfilteredResultsMap: Map<string, SpecGroup>;
  activeDaysResultsIds: string[];
  availableDates: { yyyy_mm_dd: string; display: string; isActive: boolean }[];
  rawResults: Result[];
  isFetching: boolean;
}

export const useResultsData = ({
  effectiveFilters,
  debouncedFilters,
  selectedDates,
  selectedProjectId,
}: UseResultsDataParams): UseResultsDataReturn => {
  const activeDates = useMemo(
    () => getEffectiveDatesInRange(selectedDates, effectiveFilters.from, effectiveFilters.to),
    [selectedDates, effectiveFilters.from, effectiveFilters.to],
  );
  const [debouncedDates] = useDebounce(activeDates, 200);
  const { data, isFetching } = useGetResultsQuery({
    from: debouncedFilters.from,
    to: debouncedFilters.to,
    status: debouncedFilters.status || undefined,
    page: effectiveFilters.page,
    projectId: selectedProjectId,
    tag: debouncedFilters.tags.join(',') || undefined,
    specId: debouncedFilters.specId || undefined,
    specFile: debouncedFilters.specFile || undefined,
    specName: debouncedFilters.specName || undefined,
    environment: debouncedFilters.environment || undefined,
    type: debouncedFilters.type || undefined,
    reviewStatus: debouncedFilters.reviewStatus || undefined,
    errorMessage: debouncedFilters.errorMessage || undefined,
    issueName: debouncedFilters.issueName || undefined,
    dates: debouncedDates,
  });

  const { results, unfilteredResultsMap, activeDaysResultsIds, availableDates } = useMemo(() => {
    const filteredResults = data?.results || [];
    const rawResults = data?.rawResults || [];
    const allDates = getDatesBetween(effectiveFilters.from, effectiveFilters.to);
    const selectedDatesSet = new Set(selectedDates);
    const groupedResults = buildResultsGroups(filteredResults, rawResults, activeDates, debouncedFilters);

    const dateItems = allDates.map((date) => ({
      yyyy_mm_dd: date,
      display: getDateDisplayName(date),
      isActive: selectedDatesSet.has(date),
    }));

    return {
      ...groupedResults,
      availableDates: dateItems,
    };
  }, [data?.results, data?.rawResults, selectedDates, effectiveFilters.from, effectiveFilters.to, debouncedFilters, activeDates]);

  return {
    results,
    unfilteredResultsMap,
    activeDaysResultsIds,
    availableDates,
    rawResults: data?.rawResults ?? [],
    isFetching,
  };
};
