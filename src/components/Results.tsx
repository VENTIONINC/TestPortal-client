import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Flex, HStack, Text, VStack } from '@chakra-ui/react';

import { ResultsFilters } from '@/components/results/filters';
import { ResultsSelectionProvider, useResultsSelection } from '@/contexts/results-selection';
import { useGetResultsQuery } from '@/redux/apis/extendedApi';
import { useFilterParams } from '@/hooks/useFilterParams';
import { getDateRangeMap, DateConfig } from '@/utils/dateRange';
import { filterResults } from '@/utils/filterResults';
import { BaseResult, ResultExecution, ResultSpec, Result } from '@/types';

import { SpecSection } from './SpecSection';
import { StatSection } from './StatSection';
import { BulkActions } from './BulkActions';

const ResultsContent = () => {
  const { filterParams, setFilterParams } = useFilterParams();
  const { selectAll, getSelectedCount, getSelectedIds } = useResultsSelection();

  const { data } = useGetResultsQuery({
    from: filterParams.from,
    to: filterParams.to,
    status: filterParams.status,
    page: filterParams.page,
  });

  const [dateConfigs, setDateConfigs] = useState<DateConfig[]>([]);

  const { results, activeDaysResultsIds, activeDaysResultsWithoutFilters } = useMemo(() => {
    const filteredResults = filterResults(data?.results || [], filterParams);
    const activeDates = new Set(dateConfigs.filter((day) => day.isActive).map(({ date }) => date));

    const resultsMap = new Map<
      string,
      { spec: ResultSpec; executions: { execution: ResultExecution; results: BaseResult[] }[] }
    >();

    const activeIds: number[] = [];
    const activeResultsWithoutFilters: Result[] = [];

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

    if (data?.results) {
      data.results.forEach((result) => {
        const resultDate = result.startTime.split('T')[0];
        if (activeDates.has(resultDate)) {
          activeResultsWithoutFilters.push(result);
        }
      });
    }

    return {
      results: resultsMap,
      activeDaysResultsIds: activeIds,
      activeDaysResultsWithoutFilters: activeResultsWithoutFilters,
    };
  }, [data?.results, filterParams, dateConfigs]);

  useEffect(() => {
    setDateConfigs(getDateRangeMap(filterParams.from, filterParams.to));
  }, [filterParams.from, filterParams.to]);

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
      <ResultsFilters filterParams={filterParams} setFilterParams={setFilterParams} as="aside" zIndex={10} />

      <VStack as="section" align="stretch" w="100%">
        <VStack align="stretch" gap={0} p={2} bg="gray.100" borderRadius="md">
          <HStack>
            {dateConfigs.map((day) => (
              <Flex
                key={day.date}
                onClick={() => toggleDayActive(day)}
                flex={1}
                justify="center"
                p={2}
                bg={day.isActive ? 'gray.800' : 'white'}
                color={day.isActive ? 'white' : 'black'}
                border="1px solid"
                borderColor="gray.300"
                borderRadius="sm"
                cursor="pointer"
                textAlign="center"
                textStyle="md"
              >
                <Text>{day.name}</Text>
              </Flex>
            ))}
          </HStack>
          <StatSection results={activeDaysResultsWithoutFilters} />
        </VStack>

        <h2>Results</h2>
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
        </HStack>

        <VStack align="stretch" gap={4}>
          {results.size > 0 ? (
            Array.from(results.entries()).map(([specKey, { spec, executions }]) => (
              <SpecSection key={specKey} spec={spec} executions={executions} dateConfigs={dateConfigs} />
            ))
          ) : (
            <p>No results found matching your filters.</p>
          )}
        </VStack>
      </VStack>
    </HStack>
  );
};

export const Results = () => {
  return (
    <ResultsSelectionProvider>
      <ResultsContent />
    </ResultsSelectionProvider>
  );
};
