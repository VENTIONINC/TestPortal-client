import { memo, useEffect, useMemo, useState } from 'react';

import { useResultsActions, useResultsFilters, useSelectedDates } from '@/redux/slices/results';
import { useSelectedProjectId } from '@/redux/slices/projects';
import { getDateDisplayName, getDatesBetween } from '@/utils/dateUtils';
import { BaseResult, ResultExecution, ResultSpec } from '@/types';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useExecutionContextMenu, useResultContextMenu } from '@/hooks';

import { sanitizeFileName, serializeExecution } from './helpers';
import { ResultSpecSectionView } from './result-spec-section-view';

interface ResultSpecSectionProps {
  spec: ResultSpec;
  executions: { execution: ResultExecution; results: BaseResult[] }[];
  allExecutions: { execution: ResultExecution; results: BaseResult[] }[];
}

export const ResultSpecSection = memo(({ spec, executions, allExecutions }: ResultSpecSectionProps) => {
  const filters = useResultsFilters();
  const selectedDates = useSelectedDates();
  const user = useCurrentUser();
  const projectId = useSelectedProjectId();
  const handleExecutionContextMenu = useExecutionContextMenu();
  const handleResultContextMenu = useResultContextMenu();

  const { updateFilters } = useResultsActions();

  // Track dates that user manually toggled locally
  // For dates in selectedDates: toggled = hidden (inverted)
  // For dates not in selectedDates: toggled = shown
  const [locallyToggledDates, setLocallyToggledDates] = useState<Set<string>>(new Set());

  // Compute section days: use filtered data for selected dates, all data for other dates
  const sectionDays = useMemo(() => {
    const allDates = getDatesBetween(filters.from, filters.to);
    return allDates
      .map((date) => {
        const isInSelectedDates = selectedDates.includes(date);
        const isLocallyToggled = locallyToggledDates.has(date);

        const isActive = isInSelectedDates ? !isLocallyToggled : isLocallyToggled;

        const executionsToUse = isInSelectedDates ? executions : allExecutions;

        const execsForDate = executionsToUse.filter(({ results }) =>
          results.some((result) => result.startTime.split('T')[0] === date),
        );

        // Filter results to only include those from the current date
        const resultsForDate = execsForDate.flatMap(({ results }) =>
          results.filter((r) => r.startTime.split('T')[0] === date),
        );

        const statuses = resultsForDate.map((r) => r.status);
        const firstExec = execsForDate[0];

        return {
          yyyy_mm_dd: date,
          stats: statuses,
          display: getDateDisplayName(date),
          results: resultsForDate,
          execution: firstExec?.execution,
          serialized: firstExec?.execution ? serializeExecution(firstExec.execution, user) : undefined,
          isActive,
        };
      })
      .filter((day) => day.results.length > 0);
  }, [filters.from, filters.to, selectedDates, locallyToggledDates, executions, allExecutions, user]);

  const handleDateToggle = ({ yyyy_mm_dd }: { yyyy_mm_dd: string }) => {
    setLocallyToggledDates((prev) => {
      const next = new Set(prev);
      // Toggle local state for any date
      if (next.has(yyyy_mm_dd)) {
        next.delete(yyyy_mm_dd);
      } else {
        next.add(yyyy_mm_dd);
      }
      return next;
    });
  };

  useEffect(() => {
    // Clear local toggles when selectedDates change to reset to default state
    setLocallyToggledDates(new Set());
  }, [selectedDates]);
  const handleTagClick = (tag: string) => {
    updateFilters({ tag });
  };

  // Show spec if there are any executions (filtered or unfiltered)
  if (allExecutions.length === 0) {
    return null;
  }

  if (sectionDays.length === 0) {
    return null;
  }

  return (
    <ResultSpecSectionView
      specKey={spec.key}
      specFile={sanitizeFileName(spec.file)}
      specTitle={spec.title}
      specTags={spec.tags}
      sectionDays={sectionDays}
      projectId={projectId}
      handleDateToggle={handleDateToggle}
      onTagClick={handleTagClick}
      onExecutionContextMenu={handleExecutionContextMenu}
      onResultContextMenu={handleResultContextMenu}
    />
  );
});
