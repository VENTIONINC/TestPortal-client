import { useMemo } from 'react';

import { useGetResultsQuery } from '@/redux/apis/extendedApi';
import { getDatesBetween, getDateDisplayName } from '@/utils/dateUtils';
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
  });

  const { results, unfilteredResultsMap, activeDaysResultsIds, availableDates } = useMemo(() => {
    const allResults = data?.results || [];
    const unfilteredMap = new Map<string, SpecGroup>();
    const resultsMap = new Map<string, SpecGroup>();
    const activeIds: string[] = [];

    for (const result of allResults) {
      const baseResult = toBaseResult(result);

      addToSpecGroup(unfilteredMap, result, baseResult);

      // For active (selected) dates: apply filters. For other dates: show all.
      const resultDate = result.startTime.split('T')[0];
      const isActiveDate = selectedDates.includes(resultDate);
      const shouldInclude = !isActiveDate || matchesFilters(result, debouncedFilters);

      if (shouldInclude) {
        addToSpecGroup(resultsMap, result, baseResult);
        activeIds.push(result.id);
      }
    }

    const dates = getDatesBetween(effectiveFilters.from, effectiveFilters.to);
    const dateItems = dates.map((date) => ({
      yyyy_mm_dd: date,
      display: getDateDisplayName(date),
      isActive: selectedDates.includes(date),
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
