import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { VStack } from '@chakra-ui/react';

import { ResultsFilters } from '@/components/results/filters';
import { useGetResultsQuery } from '@/redux/apis/resultsApi';
import type { FilterParamsState } from '@/hooks/useFilterParams';
import { getDateRangeMap, DateConfig } from '@/utils/dateRange';
import { filterResults } from '@/utils/filterResults';
import { BaseResult, ResultExecution, ResultGroup, ResultSpec } from '@/types';

import { SpecSection } from './SpecSection';
import { StatSection } from './StatSection';
import { BulkActions } from './BulkActions';

import '../styles/Results.css';

interface ResultsProps {
  filterParams: FilterParamsState;
  setFilterParams: React.Dispatch<React.SetStateAction<FilterParamsState>>;
}

export const Results = ({ filterParams, setFilterParams }: ResultsProps) => {
  const { data } = useGetResultsQuery({
    from: filterParams.from,
    to: filterParams.to,
    status: filterParams.status,
    page: filterParams.page,
  });

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

  const [dateConfigs, setDateConfigs] = useState<DateConfig[]>([]);

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

  const [selectedResultsIds, setSelectedResultsIds] = useState<number[]>([]);

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

  const handleSpecDateToggle = useCallback(
    (dateKeyToToggle: string) => {
      setDateConfigs((prevConfigs) =>
        prevConfigs.map((d) => (d.date === dateKeyToToggle ? { ...d, isActive: !d.isActive } : d)),
      );
    },
    [setDateConfigs],
  );

  return (
    <div className="main-container">
      <ResultsFilters filterParams={filterParams} setFilterParams={setFilterParams} as="aside" zIndex={10} />

      <VStack as="section" align="stretch" px={4} w="100%">
        <div className="card day-stats">
          <div className="row">
            {dateConfigs.map((day) => (
              <div
                key={day.date}
                className={`day-toggle col button ${day.isActive ? 'dark' : 'outline'}`}
                onClick={() => toggleDayActive(day)}
              >
                <div>{day.name}</div>
              </div>
            ))}
          </div>
          <StatSection results={data?.results.filter((result) => activeDaysResultsIds.includes(result.id)) || []} />
        </div>

        <h2>Results</h2>

        <div className="bulk-panel row">
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
        </div>

        <VStack align="stretch">
          {results.size > 0 ? (
            Array.from(results.entries()).map(([specKey, { spec, executions }]) => (
              <SpecSection
                key={specKey}
                spec={spec}
                executions={executions}
                dateConfigs={dateConfigs}
                onDateToggle={handleSpecDateToggle}
                selectedResultsIds={selectedResultsIds}
                onSelectResult={handleSelectResult}
              />
            ))
          ) : (
            <p>No results found matching your filters.</p>
          )}
        </VStack>
      </VStack>
    </div>
  );
};
