import { useMemo } from 'react';

import { useGetResultsQuery } from '@/redux/apis/extendedApi';
import { getDatesBetween, getDateDisplayName, getEffectiveDatesInRange } from '@/utils/dateUtils';
import { Result, ResultsFilters } from '@/types';

import { SpecGroup, addToSpecGroup, matchesFilters, toBaseResult } from '../utils';

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
  });

  const { results, unfilteredResultsMap, activeDaysResultsIds, availableDates } = useMemo(() => {
    const allResults = data?.results || [];
    const allDates = getDatesBetween(effectiveFilters.from, effectiveFilters.to);
    const activeDates = getEffectiveDatesInRange(selectedDates, effectiveFilters.from, effectiveFilters.to);
    const selectedDatesSet = new Set(selectedDates);
    const activeDatesSet = new Set(activeDates);
    const unfilteredMap = new Map<string, SpecGroup>();
    const resultsMap = new Map<string, SpecGroup>();
    const activeIds: string[] = [];

    for (const result of allResults) {
      const baseResult = toBaseResult(result);

      addToSpecGroup(unfilteredMap, result, baseResult);

      const resultDate = result.startTime.split('T')[0];
      const isActiveDate = activeDatesSet.has(resultDate);
      const matchesFilter = matchesFilters(result, debouncedFilters);
      const shouldInclude = isActiveDate && matchesFilter;

      if (shouldInclude) {
        addToSpecGroup(resultsMap, result, baseResult);
        activeIds.push(result.id);
      }
    }

    const dateItems = allDates.map((date) => ({
      yyyy_mm_dd: date,
      display: getDateDisplayName(date),
      isActive: selectedDatesSet.has(date),
    }));

    return {
      results: resultsMap,
      unfilteredResultsMap: unfilteredMap,
      activeDaysResultsIds: activeIds,
      availableDates: dateItems,
    };
  }, [data?.results, selectedDates, effectiveFilters.from, effectiveFilters.to, debouncedFilters]);

  return {
    results,
    unfilteredResultsMap,
    activeDaysResultsIds,
    availableDates,
    rawResults: data?.results ?? [],
    isFetching,
  };
};
