import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { ModelledResultRecord } from '../utils/toModels';
import type { FilterParamsState } from '../hooks/useFilterParams';
import { getDateRangeMap } from '../utils/dateRange';
import type { DateConfig } from '../utils/dateRange'; // Type-only import
import { filterResults as applyAllFilters } from '../utils/filterResults';
import { Spec, Result as ResultModel } from '../utils/models'; // For types. Renamed Result to ResultModel to avoid conflict.

// Import actual child components
import SpecSection from './SpecSection';
import StatSection from './StatSection';
import BulkActions from './BulkActions';

import '../styles/Results.css'; // Import styles

const ITEMS_PER_PAGE = 10; // Define items per page for pagination

interface ResultsProps {
  results: ModelledResultRecord[];
  filterParams: FilterParamsState;
  setFilterParams: React.Dispatch<React.SetStateAction<FilterParamsState>>;
}

const Results: React.FC<ResultsProps> = ({
  results: modelledResultsFromProps,
  filterParams,
  setFilterParams,
}) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(250); // For CSS transition, actual width set by inline style
  const [selectAll, setSelectAll] = useState(false);
  const [dateConfigs, setDateConfigs] = useState<DateConfig[]>([]);
  const [totalPages, setTotalPages] = useState(1); // Now set by useEffect

  // Make a mutable copy of results for local state changes (selection, active status)
  // This is one way to handle direct manipulations; could be refactored to manage IDs separately.
  const [internalResults, setInternalResults] = useState<
    ModelledResultRecord[]
  >([]);

  useEffect(() => {
    // Sync internalResults when props.results changes (e.g. new data from API)
    // This basic sync might need to be smarter if local changes (selections) should be preserved across prop updates.
    setInternalResults(
      modelledResultsFromProps.map((r) => ({
        ...r,
        result: new ResultModel(r.result),
      }))
    ); // Ensure result is an instance with methods
  }, [modelledResultsFromProps]);

  useEffect(() => {
    setDateConfigs(getDateRangeMap(filterParams.from, filterParams.to));
  }, [filterParams.from, filterParams.to]);

  const activeDaysResults = useMemo(() => {
    return internalResults.filter(({ result }) => {
      const dayConfig = dateConfigs.find(
        (config) => config.date === result.dateKey
      );
      return dayConfig?.isActive;
    });
  }, [internalResults, dateConfigs]);

  const filteredResultsFromActive = useMemo(() => {
    return applyAllFilters(activeDaysResults, filterParams);
  }, [activeDaysResults, filterParams]);

  // Calculate totalPages based on filteredResultsFromActive
  useEffect(() => {
    const totalResults = filteredResultsFromActive.length;
    setTotalPages(Math.ceil(totalResults / ITEMS_PER_PAGE) || 1); // Ensure at least 1 page
  }, [filteredResultsFromActive]);

  const groups = useMemo(() => {
    const relevantSpecs = new Set<Spec>();
    filteredResultsFromActive.forEach((model) => {
      relevantSpecs.add(model.spec);
    });

    const specMap = new Map<Spec, ModelledResultRecord[]>();
    relevantSpecs.forEach((spec) => {
      const allResultsForThisSpec = internalResults.filter(
        (internalModel) => internalModel.spec.id === spec.id
      );
      if (allResultsForThisSpec.length > 0) {
        specMap.set(spec, allResultsForThisSpec);
      }
    });
    return specMap;
  }, [filteredResultsFromActive, internalResults]);

  const selectedResults = useMemo(() => {
    // Selected results should be based on the items currently displayed and their selection state
    // If groups now contain all items for a spec (active or not), this needs care.
    // The Svelte version's selectedResults was $derived.by(() => Array.from(groups.values()).flat().filter(model => model.result.isSelected));
    // This implies selection is on the items within the groups.
    // And SpecSection toggles selection on *its* received results.
    // For now, this seems okay, assuming Result instances within internalResults (and thus groups) handle their own selection state.
    return Array.from(groups.values())
      .flat()
      .filter((model) => model.result.isSelected);
  }, [groups]);

  const shownTotal = useMemo(
    () => filteredResultsFromActive.length, // Total items matching all filters including active days
    [filteredResultsFromActive]
  );
  const selectedTotal = useMemo(
    () => selectedResults.length, // Count based on the derived selectedResults
    [selectedResults]
  );

  // Event Handlers ( كثير منها سيتطلب تعديل `internalResults` )
  const nextPage = useCallback(() => {
    if (filterParams.page < totalPages) {
      setFilterParams((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  }, [filterParams.page, totalPages, setFilterParams]);

  const prevPage = useCallback(() => {
    if (filterParams.page > 1) {
      setFilterParams((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  }, [filterParams.page, totalPages, setFilterParams]);

  const toggleSidebar = useCallback(() => {
    setSidebarExpanded((prev) => !prev);
    setSidebarWidth((prev) => (prev === 250 ? 0 : 250));
  }, []);

  const toggleDayActive = useCallback(
    (dayToToggle: DateConfig) => {
      setDateConfigs((prevConfigs) =>
        prevConfigs.map((d) =>
          d.date === dayToToggle.date ? { ...d, isActive: !d.isActive } : d
        )
      );
    },
    [setDateConfigs]
  );

  // New handler for SpecSection date toggles
  const handleSpecDateToggle = useCallback(
    (dateKeyToToggle: string) => {
      setDateConfigs((prevConfigs) =>
        prevConfigs.map((d) =>
          d.date === dateKeyToToggle ? { ...d, isActive: !d.isActive } : d
        )
      );
    },
    [setDateConfigs]
  );

  const handleSelectAll = useCallback(() => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    // This should affect items in filteredResultsFromActive as per Svelte logic of selectAll
    // Svelte: for (const group of groups.values()) { for (const model of group) { if (model.result.isActive) { model.result.isSelected = selectAll; } } }
    // The key part is model.result.isActive. Result objects in internalResults manage their own isActive state via dateConfigs.
    // This needs to ensure only results that *would be* active (based on current dateConfigs) are selected.

    const activeDayKeys = new Set(
      dateConfigs.filter((dc) => dc.isActive).map((dc) => dc.date)
    );

    setInternalResults((prevResults) =>
      prevResults.map((model) => {
        // Only modify selection if the result's dateKey corresponds to an active day
        if (activeDayKeys.has(model.result.dateKey)) {
          const newResult = new ResultModel(model.result);
          newResult.isSelected = newSelectAll;
          return { ...model, result: newResult };
        }
        return model;
      })
    );
  }, [selectAll, dateConfigs, setInternalResults]); // Added dateConfigs and setInternalResults dependency

  const handleResultsUpdate = useCallback(
    (updatedRecords: ModelledResultRecord[]) => {
      setInternalResults((prevInternalResults) => {
        const updatedMap = new Map(
          updatedRecords.map((record) => [record.result.id, record])
        );
        return prevInternalResults.map(
          (record) => updatedMap.get(record.result.id) || record
        );
      });
    },
    [setInternalResults]
  );

  // TODO: Handlers for individual item selection if needed.
  // TODO: useEffect for totalPages calculation based on filteredResultsFromActive.length / itemsPerPage.

  if (!modelledResultsFromProps) {
    return <p>Loading results data or no data passed...</p>; // Should be handled by App.tsx typically
  }

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
                className={`day-toggle col button ${
                  day.isActive ? 'dark' : 'outline'
                }`}
                onClick={() => toggleDayActive(day)}
              >
                <div>{day.name}</div>
              </div>
            ))}
          </div>
          <StatSection specGroups={activeDaysResults} />
        </div>

        <h2>Results</h2>

        <div className="bulk-panel row">
          <label>
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
            />{' '}
            Select all
          </label>
          <pre>
            Shown {shownTotal}. Selected {selectedTotal}
          </pre>
          <BulkActions
            selectedResults={selectedResults}
            onResultsUpdate={handleResultsUpdate}
          />
        </div>

        <div className="results-list">
          {groups.size > 0 ? (
            Array.from(groups.entries()).map(([spec, allResultsForSpec]) => (
              <div key={spec.id} className="result-card">
                <SpecSection
                  spec={spec}
                  results={allResultsForSpec}
                  dateConfigs={dateConfigs}
                  onDateToggle={handleSpecDateToggle}
                />
              </div>
            ))
          ) : (
            <p>No results found matching your filters.</p>
          )}
        </div>

        <div className="pagination">
          <button
            onClick={prevPage}
            disabled={filterParams.page === 1 || totalPages === 0}
          >
            Previous
          </button>
          <span>
            Page {totalPages === 0 ? 0 : filterParams.page} of {totalPages}
          </span>
          <button
            onClick={nextPage}
            disabled={filterParams.page === totalPages || totalPages === 0}
          >
            Next
          </button>
        </div>
      </section>

      <button className="toggle-btn" onClick={toggleSidebar}>
        {sidebarExpanded ? '\u00AB Hide Filters' : '\u00BB Show Filters'}
      </button>
    </div>
  );
};

export default Results;
