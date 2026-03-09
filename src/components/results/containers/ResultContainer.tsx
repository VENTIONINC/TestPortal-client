import { type ComponentProps, useEffect, useMemo, useRef } from 'react';
import { Box, HStack, VStack } from '@chakra-ui/react';
import { FormProvider } from 'react-hook-form';
import { useDebounce } from 'use-debounce';

import { Filter, DateToggle } from '@/components/ui';
import { ResultsSelectionProvider, useResultsSelection } from '@/contexts/results-selection';
import { useSelectedProjectId } from '@/redux/slices/projects';
import { type ResultsStats as ResultsStatsResponse, useGetApiV2ResultsStatsQuery } from '@/redux/apis/generatedApi';
import { useResultsActions, useSelectedDates } from '@/redux/slices/results';

import { ResultsList, ResultsStats, TopSectionContainer } from '../components';
import { filterConfig } from '../configs';
import { useFixedOnScroll, useResultsData, useResultsEffectiveFilters } from '../hooks';

interface ResultsFloatingHeaderProps {
  availableDates: ComponentProps<typeof DateToggle>['days'];
  statistics?: ResultsStatsResponse;
  toggleDate: (day: string) => void;
}

const ResultsFloatingHeaderContent = ({ availableDates, statistics, toggleDate }: ResultsFloatingHeaderProps) => {
  return (
    <>
      <DateToggle days={availableDates} toggleHandler={(day) => toggleDate(day.yyyy_mm_dd)} />
      <ResultsStats statistics={statistics} />
    </>
  );
};

const ResultsFloatingHeader = ({ availableDates, statistics, toggleDate }: ResultsFloatingHeaderProps) => {
  const {
    wrapperRef: fixedBlockWrapperRef,
    contentRef: fixedBlockContentRef,
    isFixed,
    fixedMetrics,
  } = useFixedOnScroll();

  const isMeasured = fixedMetrics.height > 0 && fixedMetrics.width > 0;

  return (
    <Box ref={fixedBlockWrapperRef} w="100%" position="relative">
      <Box
        ref={fixedBlockContentRef}
        bg="bg.page"
        visibility={isFixed ? 'hidden' : 'visible'}
        pointerEvents={isFixed ? 'none' : 'auto'}
      >
        <ResultsFloatingHeaderContent availableDates={availableDates} statistics={statistics} toggleDate={toggleDate} />
      </Box>

      {isFixed && isMeasured && (
        <Box
          w={`${fixedMetrics.width}px`}
          position="fixed"
          top="0px"
          left={`${fixedMetrics.left}px`}
          zIndex={10}
          bg="bg.page"
          boxShadow="sm"
        >
          <ResultsFloatingHeaderContent
            availableDates={availableDates}
            statistics={statistics}
            toggleDate={toggleDate}
          />
        </Box>
      )}
    </Box>
  );
};

export const ResultContainerInner = ({ showFilters = true }: { showFilters?: boolean }) => {
  const selectedDates = useSelectedDates();
  const selectedProjectId = useSelectedProjectId();
  const { setSelectedDates, toggleDate } = useResultsActions();
  const { selectAll, getSelectedCount, getSelectedIds } = useResultsSelection();
  const hasInitializedDateSelectionRef = useRef(false);

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

  useEffect(() => {
    if (hasInitializedDateSelectionRef.current) {
      return;
    }

    if (selectedDates.length > 0) {
      hasInitializedDateSelectionRef.current = true;
      return;
    }

    const lastAvailableDate = availableDates.at(-1)?.yyyy_mm_dd;

    if (!lastAvailableDate) {
      return;
    }

    setSelectedDates([lastAvailableDate]);
    hasInitializedDateSelectionRef.current = true;
  }, [availableDates, selectedDates, setSelectedDates]);

  return (
    <FormProvider {...filterFormMethods}>
      <HStack gap={4} w="100%" display="grid" alignItems="start" gridTemplateColumns="auto 1fr">
        <Filter showFilters={showFilters} config={filterConfig} {...filterProps} />

        <VStack as="section" align="stretch" flex={1} minW={0} h="100%" overflow="visible" position="relative">
          <ResultsFloatingHeader availableDates={availableDates} statistics={statistics} toggleDate={toggleDate} />
          <Box position="relative">
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
          </Box>
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
