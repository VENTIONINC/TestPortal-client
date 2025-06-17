import { useState, useMemo, useEffect, useCallback } from 'react';
import { Flex, HStack, Spinner, Text, VStack } from '@chakra-ui/react';
import { useDebounce } from 'use-debounce';

import { ResultsFilters, ResultSpecSection, ResultsStats } from '@/components/results';
import { ResultsSelectionProvider, useResultsSelection } from '@/contexts/results-selection';
import { useGetResultsQuery } from '@/redux/apis/extendedApi';
import { useResultsFilters } from '@/redux/slices/results';
import { getDateRangeMap, DateConfig } from '@/utils/dateRange';
import { BaseResult, ResultExecution, ResultSpec } from '@/types';

import { BulkActions } from '../../BulkActions';

const ResultsContent = () => {
  const filters = useResultsFilters();
  const { selectAll, getSelectedCount, getSelectedIds } = useResultsSelection();

  const [debouncedFilters] = useDebounce(filters, 500);
  const { data, isFetching } = useGetResultsQuery(debouncedFilters);

  const [dateConfigs, setDateConfigs] = useState<DateConfig[]>([]);

  const { results, activeDaysResultsIds } = useMemo(() => {
    const filteredResults = data?.results || [];
    const activeDates = new Set(dateConfigs.filter((day) => day.isActive).map(({ date }) => date));

    const resultsMap = new Map<
      string,
      { spec: ResultSpec; executions: { execution: ResultExecution; results: BaseResult[] }[] }
    >();

    const activeIds: number[] = [];

    filteredResults.forEach((result) => {
      const resultDate = result.startTime.split('T')[0];
      const isActiveDate = activeDates.has(resultDate);

      const baseResult = {
        id: result.id,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        allureLink: result.allureLink,
        retry: result.retry,
        status: result.status,
        duration: result.duration,
        startTime: result.startTime,
        specId: result.specId,
        executionId: result.executionId,
        errors: result.errors,
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

    return {
      results: resultsMap,
      activeDaysResultsIds: activeIds,
    };
  }, [data?.results, dateConfigs]);

  useEffect(() => {
    setDateConfigs(getDateRangeMap(filters.from, filters.to));
  }, [filters.from, filters.to]);

  const handleSelectAll = () => {
    selectAll(activeDaysResultsIds);
  };

  const toggleDayActive = useCallback(
    (dayToToggle: DateConfig) => {
      setDateConfigs((prevConfigs) =>
        prevConfigs.map((d) => (d.date === dayToToggle.date ? { ...d, isActive: !d.isActive } : d)),
      );
    },
    [setDateConfigs],
  );

  const selectedCount = getSelectedCount();
  const selectedResults = useMemo(
    () => data?.results.filter(({ id }) => getSelectedIds().includes(id)) || [],
    [data?.results, getSelectedIds],
  );

  return (
    <HStack gap={4} align="flex-start" w="100%">
      <ResultsFilters as="aside" zIndex={10} />

      <VStack as="section" align="stretch" w="100%">
        <VStack align="stretch" p={2} bg="gray.100" borderRadius="md">
          <HStack>
            {dateConfigs.map((day) => (
              <Flex
                key={day.date}
                onClick={() => toggleDayActive(day)}
                flex={1}
                justify="center"
                p={1}
                bg={day.isActive ? 'gray.800' : 'white'}
                color={day.isActive ? 'white' : 'black'}
                borderRadius="sm"
                cursor="pointer"
                textAlign="center"
                shadow="sm"
                _hover={{ bg: day.isActive ? 'gray.600' : 'gray.200' }}
              >
                <Text>{day.name}</Text>
              </Flex>
            ))}
          </HStack>
          <ResultsStats dateConfigs={dateConfigs} />
        </VStack>

        <HStack gap={4} p={2} border="1px solid" borderColor="gray.200" borderRadius="md" textStyle="sm" minH={12}>
          <label>
            <input
              type="checkbox"
              checked={activeDaysResultsIds.length !== 0 && selectedCount === activeDaysResultsIds.length}
              onChange={handleSelectAll}
            />
            Select all
          </label>
          <pre>
            Shown {activeDaysResultsIds.length}.Selected {selectedCount}
          </pre>
          <BulkActions selectedResults={selectedResults} />
          {isFetching && <Spinner />}
        </HStack>

        <VStack align="stretch" gap={4}>
          {results.size > 0 ? (
            <>
              {Array.from(results.entries()).map(([specKey, { spec, executions }]) => (
                <ResultSpecSection key={specKey} spec={spec} executions={executions} dateConfigs={dateConfigs} />
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
