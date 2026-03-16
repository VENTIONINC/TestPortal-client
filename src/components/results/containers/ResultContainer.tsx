import { useEffect, useMemo } from 'react';
import { Box, HStack, VStack } from '@chakra-ui/react';
import { FormProvider } from 'react-hook-form';
import { useDebounce } from 'use-debounce';

import { Filter, LoaderOverlay } from '@/components/ui';
import { ResultsSelectionProvider, useResultsSelection } from '@/contexts/results-selection';
import { useSelectedProjectId } from '@/redux/slices/projects';
import { useGetApiV2ResultsStatsQuery } from '@/redux/apis/generatedApi';
import { useResultsActions, useSelectedDates } from '@/redux/slices/results';
import { getEffectiveDatesInRange } from '@/utils/dateUtils';

import { ResultsFloatingHeader, ResultsList, TopSectionContainer } from '../components';
import { filterConfig } from '../configs';
import { useResultsData, useResultsEffectiveFilters } from '../hooks';

export const ResultContainerInner = () => {
  const selectedDates = useSelectedDates();
  const selectedProjectId = useSelectedProjectId();
  const { toggleDate, setSelectedDates } = useResultsActions();
  const { selectAll, getSelectedCount, getSelectedIds } = useResultsSelection();

  const { effectiveFilters, debouncedFilters, filterFormMethods, filterProps } = useResultsEffectiveFilters();

  useEffect(() => {
    setSelectedDates([effectiveFilters.to]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveFilters.to]);

  const { results, unfilteredResultsMap, activeDaysResultsIds, availableDates, rawResults, isFetching } =
    useResultsData({
      effectiveFilters,
      debouncedFilters,
      selectedDates,
      selectedProjectId: selectedProjectId!,
    });

  const handleSelectAll = () => selectAll(activeDaysResultsIds);

  const selectedCount = getSelectedCount();
  const selectedResults = useMemo(
    () => rawResults.filter(({ id }) => getSelectedIds().includes(id)),
    [rawResults, getSelectedIds],
  );

  const activeDates = useMemo(
    () => getEffectiveDatesInRange(selectedDates, effectiveFilters.from, effectiveFilters.to),
    [selectedDates, effectiveFilters.from, effectiveFilters.to],
  );

  const [debouncedDates] = useDebounce(activeDates, 200);
  const { data: statisticsData, isFetching: isStatsFetching } = useGetApiV2ResultsStatsQuery(
    { dates: debouncedDates, projectId: selectedProjectId! },
    { skip: debouncedDates.length === 0 },
  );

  const statistics = debouncedDates.length === 0 ? undefined : statisticsData;

  return (
    <FormProvider {...filterFormMethods}>
      <HStack  w="100%" display="grid" alignItems="start" gap={0} gridTemplateColumns="auto 1fr">
        <Filter config={filterConfig} {...filterProps} />

        <VStack as="section" align="stretch" flex={1} minW={0} overflow="visible" position="relative" ml={6} mr={6} mt={4}>
          <LoaderOverlay isLoading={isFetching || isStatsFetching} />
          <ResultsFloatingHeader availableDates={availableDates} statistics={statistics} toggleDate={toggleDate} isFetching={isStatsFetching} />
          <Box position="relative">
            <TopSectionContainer statistics={statistics} isFetching={isStatsFetching} />

            <ResultsList
              activeDaysResultsIds={activeDaysResultsIds}
              handleSelectAll={handleSelectAll}
              selectedCount={selectedCount}
              selectedResults={selectedResults}
              isFetching={isFetching}
              results={results}
              unfilteredResultsMap={unfilteredResultsMap}
            />
          </Box>
        </VStack>
      </HStack>
    </FormProvider>
  );
};

export const ResultContainer = () => {
  return (
    <ResultsSelectionProvider>
      <ResultContainerInner />
    </ResultsSelectionProvider>
  );
};
