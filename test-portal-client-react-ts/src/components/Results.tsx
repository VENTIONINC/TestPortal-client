import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { VStack } from '@chakra-ui/react';

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

  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(250);
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

  const handleSelectResult = (resultId: number) => {
    setSelectedResultsIds((prev) =>
      prev.includes(resultId) ? prev.filter((id) => id !== resultId) : [...prev, resultId],
    );
  };

  const toggleSidebar = useCallback(() => {
    setSidebarExpanded((prev) => !prev);
    setSidebarWidth((prev) => (prev === 250 ? 0 : 250));
  }, []);

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
      <aside className="sidebar" style={{ width: `${sidebarWidth}px` }}>
        {sidebarExpanded && (
          <div>
            <div className="filter-group">
              <h3>Result Filters</h3>
              <label>
                Status:
                <select
                  value={filterParams.status}
                  onChange={(e) =>
                    setFilterParams((prev) => ({
                      ...prev,
                      status: e.target.value,
                      page: 1,
                    }))
                  }
                >
                  <option value="">All</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                  <option value="skipped">Skipped</option>
                </select>
              </label>

              <label>
                Review Status:
                <select
                  value={filterParams.reviewStatus}
                  onChange={(e) =>
                    setFilterParams((prev) => ({
                      ...prev,
                      reviewStatus: e.target.value,
                      page: 1,
                    }))
                  }
                >
                  <option value="">All</option>
                  <option value="completed">Completed</option>
                  <option value="inCompleted">Not Completed</option>
                </select>
              </label>

              <label>
                Error Message:
                <input
                  type="text"
                  value={filterParams.errorMessage}
                  onChange={(e) =>
                    setFilterParams((prev) => ({
                      ...prev,
                      errorMessage: e.target.value,
                      page: 1,
                    }))
                  }
                />
              </label>

              <label>
                From:
                <input
                  type="date"
                  value={filterParams.from}
                  onChange={(e) =>
                    setFilterParams((prev) => ({
                      ...prev,
                      from: e.target.value,
                      page: 1,
                    }))
                  }
                />
              </label>

              <label>
                To:
                <input
                  type="date"
                  value={filterParams.to}
                  onChange={(e) =>
                    setFilterParams((prev) => ({
                      ...prev,
                      to: e.target.value,
                      page: 1,
                    }))
                  }
                />
              </label>
            </div>

            <div className="filter-group">
              <h3>Spec Filters</h3>
              <label>
                Tags:
                <input
                  type="text"
                  value={filterParams.tag}
                  onChange={(e) =>
                    setFilterParams((prev) => ({
                      ...prev,
                      tag: e.target.value,
                      page: 1,
                    }))
                  }
                />
              </label>
              <label>
                Spec ID:
                <input
                  type="text"
                  value={filterParams.specId}
                  onChange={(e) =>
                    setFilterParams((prev) => ({
                      ...prev,
                      specId: e.target.value,
                      page: 1,
                    }))
                  }
                />
              </label>
              <label>
                Spec File:
                <input
                  type="text"
                  value={filterParams.specFile}
                  onChange={(e) =>
                    setFilterParams((prev) => ({
                      ...prev,
                      specFile: e.target.value,
                      page: 1,
                    }))
                  }
                />
              </label>
              <label>
                Spec Name:
                <input
                  type="text"
                  value={filterParams.specName}
                  onChange={(e) =>
                    setFilterParams((prev) => ({
                      ...prev,
                      specName: e.target.value,
                      page: 1,
                    }))
                  }
                />
              </label>
            </div>

            <div className="filter-group">
              <h3>Execution Filters</h3>
              <label>
                Environment:
                <input
                  type="text"
                  value={filterParams.environment}
                  onChange={(e) =>
                    setFilterParams((prev) => ({
                      ...prev,
                      environment: e.target.value,
                      page: 1,
                    }))
                  }
                />
              </label>
              <label>
                Type:
                <input
                  type="text"
                  value={filterParams.type}
                  onChange={(e) =>
                    setFilterParams((prev) => ({
                      ...prev,
                      type: e.target.value,
                      page: 1,
                    }))
                  }
                />
              </label>
            </div>
          </div>
        )}
      </aside>

      <section className="content">
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
      </section>

      <button className="toggle-btn" onClick={toggleSidebar}>
        {sidebarExpanded ? '\u00AB Hide Filters' : '\u00BB Show Filters'}
      </button>
    </div>
  );
};
