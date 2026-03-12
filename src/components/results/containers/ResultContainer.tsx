import { type ComponentProps, useEffect, useMemo } from 'react';
import { Box, HStack, VStack } from '@chakra-ui/react';
import { FormProvider } from 'react-hook-form';
import { useDebounce } from 'use-debounce';

import { Filter, DateToggle, LoaderOverlay } from '@/components/ui';
import { ResultsSelectionProvider, useResultsSelection } from '@/contexts/results-selection';
import { useSelectedProjectId } from '@/redux/slices/projects';
import { type ResultsStats as ResultsStatsResponse, useGetApiV2ResultsStatsQuery } from '@/redux/apis/generatedApi';
import { useResultsActions, useSelectedDates } from '@/redux/slices/results';
import { getEffectiveDatesInRange } from '@/utils/dateUtils';

import { ResultsList, ResultsStats, TopSectionContainer } from '../components';
import { filterConfig } from '../configs';
import { useFixedOnScroll, useResultsData, useResultsEffectiveFilters } from '../hooks';

interface ResultsFloatingHeaderProps {
  availableDates: ComponentProps<typeof DateToggle>['days'];
  statistics?: ResultsStatsResponse;
  toggleDate: (day: string) => void;
  isFetching?: boolean;
}

const ResultsFloatingHeaderContent = ({ availableDates, statistics, toggleDate, isFetching }: ResultsFloatingHeaderProps) => {
  return (
    <>
      <DateToggle days={availableDates} toggleHandler={(day) => toggleDate(day.yyyy_mm_dd)} />
      <ResultsStats statistics={statistics} isFetching={isFetching} />
    </>
  );
};

const ResultsFloatingHeader = ({ availableDates, statistics, toggleDate, isFetching }: ResultsFloatingHeaderProps) => {
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
        bg="bg.section"
        visibility={isFixed ? 'hidden' : 'visible'}
        pointerEvents={isFixed ? 'none' : 'auto'}
      >
        <ResultsFloatingHeaderContent availableDates={availableDates} statistics={statistics} toggleDate={toggleDate} isFetching={isFetching} />
      </Box>

      {isFixed && isMeasured && (
        <Box
          w={`${fixedMetrics.width}px`}
          position="fixed"
          top="0px"
          left={`${fixedMetrics.left}px`}
          zIndex={10}
          bg="bg.section"
          boxShadow="sm"
        >
          <ResultsFloatingHeaderContent
            availableDates={availableDates}
            statistics={statistics}
            toggleDate={toggleDate}
            isFetching={isFetching}
          />
        </Box>
      )}
    </Box>
  );
};

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
      <HStack  w="100%" display="grid" alignItems="start" gridTemplateColumns="auto 1fr">
        <Filter config={filterConfig} {...filterProps} />

        <VStack as="section" align="stretch" flex={1} minW={0} h="100%" overflow="visible" position="relative" ml={5} mr={6} mt={5}>
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
