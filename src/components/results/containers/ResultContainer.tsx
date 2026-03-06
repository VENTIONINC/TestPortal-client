import { useMemo } from 'react';
import { Box, HStack, VStack } from '@chakra-ui/react';
import { FormProvider } from 'react-hook-form';
import { useDebounce } from 'use-debounce';

import { Filter, DateToggle } from '@/components/ui';
import { ResultsSelectionProvider, useResultsSelection } from '@/contexts/results-selection';
import { useResultsActions, useSelectedDates } from '@/redux/slices/results';
import { useSelectedProjectId } from '@/redux/slices/projects';
import { useGetApiV2ResultsStatsQuery } from '@/redux/apis/generatedApi';

import { ResultsList, ResultsStats, TopSectionContainer } from '../components';
import { filterConfig } from '../configs';
import { useResultsData, useResultsEffectiveFilters } from '../hooks';
import { useFixedOnScroll } from '../hooks/useFixedOnScroll';

export const ResultContainerInner = ({ showFilters = true }: { showFilters?: boolean }) => {
  const {
    wrapperRef: fixedBlockWrapperRef,
    contentRef: fixedBlockContentRef,
    isFixed,
    fixedMetrics,
  } = useFixedOnScroll();

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

  const statsFilter = useMemo(
    () => ({ from: effectiveFilters.from, to: effectiveFilters.to }),
    [effectiveFilters.from, effectiveFilters.to],
  );

  const handleSelectAll = () => selectAll(activeDaysResultsIds);

  const selectedCount = getSelectedCount();
  const selectedResults = useMemo(
    () => rawResults.filter(({ id }) => getSelectedIds().includes(id)),
    [rawResults, getSelectedIds],
  );

  const activeDates = useMemo(
    () => selectedDates.filter((date) => date >= statsFilter.from && date <= statsFilter.to),
    [selectedDates, statsFilter.from, statsFilter.to],
  );

  const [debouncedDates] = useDebounce(activeDates, 200);
  const { data: statisticsData } = useGetApiV2ResultsStatsQuery(
    { dates: debouncedDates, projectId: selectedProjectId! },
    { skip: debouncedDates.length === 0 },
  );

  const statistics = debouncedDates.length === 0 ? undefined : statisticsData;

  return (
    <FormProvider {...filterFormMethods}>
      <HStack gap={4} w="100%" display="grid" alignItems="start" gridTemplateColumns="auto 1fr">
        <Filter showFilters={showFilters} config={filterConfig} {...filterProps} />

        <VStack as="section" align="stretch" flex={1} minW={0} h="100%" overflow="visible" position="relative">
          <Box ref={fixedBlockWrapperRef} w="100%" minH={isFixed ? `${fixedMetrics.height}px` : undefined}>
            <Box
              ref={fixedBlockContentRef}
              w={isFixed ? `${fixedMetrics.width}px` : '100%'}
              position={isFixed ? 'fixed' : 'static'}
              top={isFixed ? '0px' : undefined}
              left={isFixed ? `${fixedMetrics.left}px` : undefined}
              zIndex={isFixed ? 10 : undefined}
              bg="bg.page"
            >
              <DateToggle days={availableDates} toggleHandler={(day) => toggleDate(day.yyyy_mm_dd)} />
              <ResultsStats statistics={statistics} />
            </Box>
          </Box>
          <TopSectionContainer statistics={statistics} />

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
