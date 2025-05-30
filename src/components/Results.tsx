import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Flex, HStack, Text, VStack } from '@chakra-ui/react';

import { ResultsFilters } from '@/components/results/filters';
import { useGetResultsQuery } from '@/redux/apis/resultsApi';
import { useFilterParams } from '@/hooks/useFilterParams';
import { getDateRangeMap, DateConfig } from '@/utils/dateRange';
import { filterResults } from '@/utils/filterResults';
import { BaseResult, ResultExecution, ResultGroup, ResultSpec } from '@/types';

import { SpecSection } from './SpecSection';
import { StatSection } from './StatSection';
import { BulkActions } from './BulkActions';

export const Results = () => {
  const { filterParams, setFilterParams } = useFilterParams();

  const { data } = useGetResultsQuery({
    from: filterParams.from,
    to: filterParams.to,
    status: filterParams.status,
    page: filterParams.page,
  });

  const [dateConfigs, setDateConfigs] = useState<DateConfig[]>([]);
  const [selectedResultsIds, setSelectedResultsIds] = useState<number[]>([]);

  const results: ResultGroup = useMemo(() => {
    const resultsMap = new Map<
      string,
      { spec: ResultSpec; executions: { execution: ResultExecution; results: BaseResult[] }[] }
    >();

    filterResults(data?.results || [], filterParams).forEach((result) => {
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

      if (resultsMap.has(result.spec.key)) {
        const savedResult = resultsMap.get(result.spec.key);

        const savedExecution = savedResult?.executions.find((e) => e.execution.id === result.execution.id);

        if (savedExecution) {
          savedExecution.results.push(baseResult);
        } else {
          savedResult?.executions.push({ execution: result.execution, results: [baseResult] });
        }
      } else {
        resultsMap.set(result.spec.key, {
          spec: result.spec,
          executions: [{ execution: result.execution, results: [baseResult] }],
        });
      }
    });

    return resultsMap;
  }, [data?.results, filterParams]);

  useEffect(() => {
    setDateConfigs(getDateRangeMap(filterParams.from, filterParams.to));
  }, [filterParams.from, filterParams.to]);

  const activeDaysResultsIds = useMemo(() => {
    const activeDates = dateConfigs.filter((day) => day.isActive).map(({ date }) => date);

    return Array.from(results.values()).flatMap(({ executions }) => {
      return executions
        .filter(({ results }) => results.some((result) => activeDates.includes(result.startTime.split('T')[0])))
        .flatMap(({ results }) => results.map((result) => result.id));
    });
  }, [results, dateConfigs]);

  const activeDaysResultsWithoutFilters = useMemo(() => {
    const activeDates = dateConfigs.filter((day) => day.isActive).map(({ date }) => date);

    return data?.results.filter((result) => activeDates.includes(result.startTime.split('T')[0])) || [];
  }, [data?.results, dateConfigs]);

  const handleSelectAll = () => {
    setSelectedResultsIds((prev) => (prev.length === activeDaysResultsIds.length ? [] : activeDaysResultsIds));
  };

  const handleSelectResult = (resultId: number | number[]) => {
    if (Array.isArray(resultId)) {
      setSelectedResultsIds((prev) => {
        const allSelected = resultId.every((id) => prev.includes(id));

        if (allSelected) {
          return prev.filter((id) => !resultId.includes(id));
        } else {
          const newIds = resultId.filter((id) => !prev.includes(id));
          return [...prev, ...newIds];
        }
      });
    } else {
      setSelectedResultsIds((prev) =>
        prev.includes(resultId) ? prev.filter((id) => id !== resultId) : [...prev, resultId],
      );
    }
  };

  const toggleDayActive = useCallback(
    (dayToToggle: DateConfig) => {
      setDateConfigs((prevConfigs) =>
        prevConfigs.map((d) => (d.date === dayToToggle.date ? { ...d, isActive: !d.isActive } : d)),
      );
    },
    [setDateConfigs],
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
        <HStack gap={4} p={2} border="1px solid" borderColor="gray.200" borderRadius="md" textStyle="sm">
          <label>
            <input
              type="checkbox"
              checked={activeDaysResultsIds.length !== 0 && selectedResultsIds.length === activeDaysResultsIds.length}
              onChange={handleSelectAll}
            />
            Select all
          </label>
          <pre>
            Shown {activeDaysResultsIds.length}.Selected {selectedResultsIds.length}
          </pre>
          <BulkActions selectedResults={data?.results.filter(({ id }) => selectedResultsIds.includes(id)) || []} />
        </HStack>

        <VStack align="stretch" gap={4}>
          {results.size > 0 ? (
            Array.from(results.entries()).map(([specKey, { spec, executions }]) => (
              <SpecSection
                key={specKey}
                spec={spec}
                executions={executions}
                dateConfigs={dateConfigs}
                selectedResultsIds={selectedResultsIds}
                onSelectResult={handleSelectResult}
              />
            ))
          ) : (
            <p>No results found matching your filters.</p>
          )}
        </VStack>
      </VStack>
    </HStack>
  );
};
