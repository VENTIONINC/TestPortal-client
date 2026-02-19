import { useMemo } from 'react';
import { HStack, VStack } from '@chakra-ui/react';
import { FormProvider } from 'react-hook-form';

import { Filter, DateToggle } from '@/components/ui';
import { ResultsSelectionProvider, useResultsSelection } from '@/contexts/results-selection';
import { useResultsActions, useSelectedDates } from '@/redux/slices/results';
import { useSelectedProjectId } from '@/redux/slices/projects';

import { ResultsList, ResultsStats } from '../components';
import { filterConfig } from '../configs';
import { useResultsData, useResultsEffectiveFilters } from '../hooks';

export const ResultContainerInner = ({ showFilters = true }: { showFilters?: boolean }) => {
  const selectedDates = useSelectedDates();
  const selectedProjectId = useSelectedProjectId();
  const { toggleDate } = useResultsActions();
  const { selectAll, getSelectedCount, getSelectedIds } = useResultsSelection();

  const { effectiveFilters, debouncedFilters, filterFormMethods, filterProps } = useResultsEffectiveFilters();

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

  return (
    <FormProvider {...filterFormMethods}>
      <HStack gap={4} w="100%" display="grid" alignItems="start" gridTemplateColumns="auto 1fr">
        <Filter showFilters={showFilters} config={filterConfig} {...filterProps} />

        <VStack as="section" align="stretch" flex={1} minW={0} h="100%" overflow="visible" position="relative">
          <DateToggle days={availableDates} toggleHandler={(day) => toggleDate(day.yyyy_mm_dd)} />
          <ResultsStats filter={effectiveFilters} />
          <ResultsList
            activeDaysResultsIds={activeDaysResultsIds}
            handleSelectAll={handleSelectAll}
            selectedCount={selectedCount}
            selectedResults={selectedResults}
            isFetching={isFetching}
            results={results}
            unfilteredResultsMap={unfilteredResultsMap}
          />
        </VStack>
      </HStack>
    </FormProvider>
  );
};

export const ResultContainer = ({ showFilters = true }: { showFilters?: boolean }) => {
  return (
    <ResultsSelectionProvider>
      <ResultContainerInner showFilters={showFilters} />
    </ResultsSelectionProvider>
  );
};
