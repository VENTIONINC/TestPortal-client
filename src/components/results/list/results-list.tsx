import { useMemo } from 'react';
import { HStack, Mark, Spinner, Text, VStack } from '@chakra-ui/react';
import { useDebounce } from 'use-debounce';

import { Checkbox } from '@/components/ui';
import { ResultsFilters, ResultSpecSection, ResultsStats } from '@/components/results';
import { ResultsSelectionProvider, useResultsSelection } from '@/contexts/results-selection';
import { useGetResultsQuery } from '@/redux/apis/extendedApi';
import { useResultsActions, useSelectedDates, useResultsFilters } from '@/redux/slices/results';
import { getDatesBetween, getDateDisplayName } from '@/utils/dateUtils';
import { BaseResult, ResultExecution, ResultSpec } from '@/types';
import { BulkActions } from '@/components/BulkActions';
import { useSelectedProjectId } from '@/redux/slices/projects';

import { DateList } from './date-list';

const ResultsContent = () => {
  const filters = useResultsFilters();
  const selectedDates = useSelectedDates();
  const selectedProjectId = useSelectedProjectId();

  const { selectAll, getSelectedCount, getSelectedIds } = useResultsSelection();

  const [debouncedFilters] = useDebounce(filters, 500);
  const { data, isFetching } = useGetResultsQuery({ ...debouncedFilters, projectId: selectedProjectId! });

  const { toggleDate } = useResultsActions();

  const { results, activeDaysResultsIds, availableDates } = useMemo(() => {
    const filteredResults = data?.results || [];
    const activeDates = new Set(selectedDates);

    const resultsMap = new Map<
      string,
      { spec: ResultSpec; executions: { execution: ResultExecution; results: BaseResult[] }[] }
    >();

    const activeIds: string[] = [];

    filteredResults.forEach((result) => {
      const resultDate = result.startTime.split('T')[0];
      const isActiveDate = activeDates.has(resultDate);

      const baseResult: BaseResult = {
        id: result.id,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        reportPortalLink: result.reportPortalLink,
        retry: result.retry,
        status: result.status,
        duration: result.duration,
        startTime: result.startTime,
        specId: result.specId,
        executionId: result.executionId,
        errors: result.errors,
        analysisCategory: result.analysisCategory,
        analysisConfidence: result.analysisConfidence,
        analysisStatus: result.analysisStatus,
        analysisConclusion: result.analysisConclusion,
        analysisErrorQuality: result.analysisErrorQuality,
        analysisErrorQualityConclusion: result.analysisErrorQualityConclusion,
      };

      const specKey = result.spec.key;
      if (resultsMap.has(specKey)) {
        const savedResult = resultsMap.get(specKey)!;
        const savedExecution = savedResult.executions.find((e) => e.execution.id === result.execution.id);

        if (savedExecution) {
          savedExecution.results.push(baseResult);
        } else {
          savedResult.executions.push({ execution: result.execution, results: [baseResult] });
        }
      } else {
        resultsMap.set(specKey, {
          spec: result.spec,
          executions: [{ execution: result.execution, results: [baseResult] }],
        });
      }

      if (isActiveDate) {
        activeIds.push(result.id);
      }
    });

    const dates = getDatesBetween(filters.from, filters.to);
    const dateItems = dates.map((date) => ({
      date,
      name: getDateDisplayName(date),
      isActive: selectedDates.includes(date),
    }));

    return {
      results: resultsMap,
      activeDaysResultsIds: activeIds,
      availableDates: dateItems,
    };
  }, [data?.results, selectedDates, filters.from, filters.to]);

  const handleSelectAll = () => {
    selectAll(activeDaysResultsIds);
  };

  const selectedCount = getSelectedCount();
  const selectedResults = useMemo(
    () => data?.results.filter(({ id }) => getSelectedIds().includes(id)) || [],
    [data?.results, getSelectedIds],
  );

  return (
    <HStack gap={4} w="100%" px={4} display="grid" alignItems="start" gridTemplateColumns="auto 1fr">
      <ResultsFilters as="aside" zIndex={10} />

      <VStack as="section" align="stretch" flex={1} minW={0} h="100%" overflow="hidden">
        <VStack align="stretch" p={2} bg="gray.100" borderRadius="md" flexShrink={0}>
          <DateList dateConfigs={availableDates} toggleDateConfig={toggleDate} />
          <ResultsStats />
        </VStack>

        <HStack gap={4} p={2} border="1px solid" borderColor="gray.200" borderRadius="md" minH={12} flexShrink={0}>
          <Checkbox
            checked={activeDaysResultsIds.length !== 0 && selectedCount === activeDaysResultsIds.length}
            onCheckedChange={handleSelectAll}
          >
            Select all
          </Checkbox>
          <Text textStyle="sm">
            Shown <Mark fontWeight={600}>{activeDaysResultsIds.length}</Mark>. Selected{' '}
            <Mark fontWeight={600}>{selectedCount}</Mark>
          </Text>
          <BulkActions selectedResults={selectedResults} />
          {isFetching && <Spinner />}
        </HStack>

        <VStack
          align="stretch"
          gap={4}
          flex={1}
          overflowY="auto"
          overflowX="hidden"
          pr={2}
          css={{
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'var(--chakra-colors-gray-100)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'var(--chakra-colors-gray-300)',
              borderRadius: '4px',
              '&:hover': {
                background: 'var(--chakra-colors-gray-400)',
              },
            },
          }}
        >
          {results.size > 0 ? (
            <>
              {Array.from(results.entries()).map(([, { spec, executions }]) => (
                <ResultSpecSection key={spec.id} spec={spec} executions={executions} />
              ))}
              {activeDaysResultsIds.length === 0 && <Text>No results found matching date config.</Text>}
            </>
          ) : (
            <Text>No results found matching your filters.</Text>
          )}
        </VStack>
      </VStack>
    </HStack>
  );
};

export const ResultsList = () => {
  return (
    <ResultsSelectionProvider>
      <ResultsContent />
    </ResultsSelectionProvider>
  );
};
