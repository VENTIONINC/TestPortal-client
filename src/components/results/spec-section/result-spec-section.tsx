import { memo, useMemo } from 'react';

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
  const selectedDates = useSelectedDates();
  const filters = useResultsFilters();
  const user = useCurrentUser();
  const projectId = useSelectedProjectId();
  const handleExecutionContextMenu = useExecutionContextMenu();
  const handleResultContextMenu = useResultContextMenu();

  const { updateFilters, toggleDate } = useResultsActions();

  const dateFilters = useMemo(() => {
    const allDates = getDatesBetween(filters.from, filters.to);

    return allDates.map((date) => {
      const statuses = allExecutions
        .filter(({ results }) => results.some((result) => result.startTime.split('T')[0] === date))
        .flatMap(({ results }) => results.map((result) => result.status));

      return {
        yyyy_mm_dd: date,
        stats: statuses,
        isActive: selectedDates.includes(date),
        display: getDateDisplayName(date),
      };
    });
  }, [filters.from, filters.to, selectedDates, allExecutions]);

  const filteredExecutions = useMemo(() => {
    // Executions are already filtered by date in results-list.tsx, just sort them
    const sorted = executions.sort(
      (a, b) => new Date(b.execution.createdAt).getTime() - new Date(a.execution.createdAt).getTime(),
    );

    return sorted.map(({ execution, results }) => ({
      execution,
      results,
      serialized: serializeExecution(execution, user),
    }));
  }, [executions, user]);

  const handleDateToggle = (dayFilter: { yyyy_mm_dd: string }) => {
    toggleDate(dayFilter.yyyy_mm_dd);
  };

  const handleTagClick = (tag: string) => {
    updateFilters({ tag });
  };

  // Hide spec section if no executions match filters and selected dates
  if (executions.length === 0) {
    return null;
  }

  return (
    <ResultSpecSectionView
      specKey={spec.key}
      specFile={sanitizeFileName(spec.file)}
      specTitle={spec.title}
      specTags={spec.tags}
      dateFilters={dateFilters}
      filteredExecutions={filteredExecutions}
      projectId={projectId}
      onDateToggle={handleDateToggle}
      onTagClick={handleTagClick}
      onExecutionContextMenu={handleExecutionContextMenu}
      onResultContextMenu={handleResultContextMenu}
    />
  );
});
