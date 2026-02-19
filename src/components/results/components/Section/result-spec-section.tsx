import { memo, useMemo, useState } from 'react';

import { useResultsActions, useResultsFilters } from '@/redux/slices/results';
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
  const user = useCurrentUser();
  const projectId = useSelectedProjectId();
  const handleExecutionContextMenu = useExecutionContextMenu();
  const handleResultContextMenu = useResultContextMenu();

  const { updateFilters } = useResultsActions();

  // Track which dates the user has explicitly collapsed (toggled off) in this spec section.
  // All dates with data are expanded by default.
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());

  // Compute section days from all executions (unfiltered data) for the date range.
  // isActive = true by default (all dates expanded), unless explicitly collapsed.
  const sectionDays = useMemo(() => {
    const allDates = getDatesBetween(filters.from, filters.to);
    return allDates
      .map((date) => {
        const execsForDate = allExecutions.filter(({ results }) =>
          results.some((result) => result.startTime.split('T')[0] === date),
        );
        const statuses = execsForDate.flatMap(({ results }) => results.map((r) => r.status));
        const firstExec = execsForDate[0];

        return {
          yyyy_mm_dd: date,
          stats: statuses,
          display: getDateDisplayName(date),
          results: firstExec?.results ?? [],
          execution: firstExec?.execution,
          serialized: firstExec?.execution ? serializeExecution(firstExec.execution, user) : undefined,
          isActive: !collapsedDates.has(date),
        };
      })
      .filter((day) => day.results.length > 0);
  }, [filters.from, filters.to, allExecutions, user, collapsedDates]);

  const handleDateToggle = ({ yyyy_mm_dd }: { yyyy_mm_dd: string }) => {
    setCollapsedDates((prev) => {
      const next = new Set(prev);
      if (next.has(yyyy_mm_dd)) {
        next.delete(yyyy_mm_dd);
      } else {
        next.add(yyyy_mm_dd);
      }
      return next;
    });
  };

  const handleTagClick = (tag: string) => {
    updateFilters({ tag });
  };

  if (executions.length === 0) {
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
