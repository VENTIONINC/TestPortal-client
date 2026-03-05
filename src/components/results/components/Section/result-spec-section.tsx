import { memo, useEffect, useMemo, useState } from 'react';

import { useResultsFilters, useSelectedDates } from '@/redux/slices/results';
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
  const hasSelectedDates = selectedDates.length > 0;
  const user = useCurrentUser();
  const projectId = useSelectedProjectId();
  const handleExecutionContextMenu = useExecutionContextMenu();
  const handleResultContextMenu = useResultContextMenu();

  // Track dates selected locally in section chips
  const [locallyToggledDates, setLocallyToggledDates] = useState<Set<string>>(new Set());
  const hasLocalSelections = locallyToggledDates.size > 0;

  // Compute section days:
  // - with selected dates in main panel: show selected dates by default
  //   and switch to local selections after user toggles dates in section
  // - without selected dates in main panel: cards are shown only for locally selected dates
  const sectionDays = useMemo(() => {
    const allDates = getDatesBetween(filters.from, filters.to);
    const sectionDays = allDates.map((date) => {
      const isInSelectedDates = selectedDates.includes(date);
      const isLocallyToggled = locallyToggledDates.has(date);

      const isActive = hasSelectedDates
        ? hasLocalSelections
          ? isLocallyToggled
          : isInSelectedDates
        : isLocallyToggled;

      const isVisible = hasSelectedDates
        ? hasLocalSelections
          ? isLocallyToggled
          : isInSelectedDates
        : isLocallyToggled;

      const executionsToUse = hasSelectedDates ? (isInSelectedDates ? executions : allExecutions) : executions;

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
        results: resultsForDate.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
        execution: firstExec?.execution,
        serialized: firstExec?.execution ? serializeExecution(firstExec.execution, user) : undefined,
        isActive,
        isVisible,
      };
    });

    return sectionDays;
  }, [
    filters.from,
    filters.to,
    hasSelectedDates,
    hasLocalSelections,
    selectedDates,
    locallyToggledDates,
    executions,
    allExecutions,
    user,
  ]);

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
      onExecutionContextMenu={handleExecutionContextMenu}
      onResultContextMenu={handleResultContextMenu}
    />
  );
});
