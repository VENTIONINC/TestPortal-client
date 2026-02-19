import { memo, useMemo, useEffect, useState } from 'react';

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

const dateFilters = ({
  filters,
  selectedDates,
  allExecutions,
  user,
}: {
  filters: any;
  selectedDates: string[];
  allExecutions: { execution: ResultExecution; results: BaseResult[] }[];
  user: ReturnType<typeof useCurrentUser> extends { currentUser: infer U } ? U : never;
}) => {
  const allDates = getDatesBetween(filters.from, filters.to);

  console.log('sdsds');
  return allDates
    .map((date) => {
      const data = allExecutions.filter(({ results }) =>
        results.some((result) => result.startTime.split('T')[0] === date),
      );

      const statuses = data.flatMap(({ results }) => results.map((result) => result.status));

      return {
        yyyy_mm_dd: date,
        stats: statuses,
        isActive: selectedDates.includes(date),
        display: getDateDisplayName(date),
        results: data[0]?.results ?? [],
        execution: data[0]?.execution ?? {},
        serialized: data[0]?.execution ? serializeExecution(data[0]?.execution, user) : {},
      };
    })
    .filter((day) => day.results.length > 0);
};
// const filteredExecutions = useMemo(() => {
//   // Executions are already filtered by date in results-list.tsx, just sort them
//   const sorted = executions.sort(
//     (a, b) => new Date(b.execution.createdAt).getTime() - new Date(a.execution.createdAt).getTime(),
//   );

//   return sorted.map(({ execution, results }) => ({
//     execution,
//     results,
//     serialized: serializeExecution(execution, user),
//   }));
// }, [executions, user]);

export const ResultSpecSection = memo(({ spec, executions, allExecutions }: ResultSpecSectionProps) => {
  const selectedDates = useSelectedDates();
  const filters = useResultsFilters();
  const user = useCurrentUser();
  const projectId = useSelectedProjectId();
  const handleExecutionContextMenu = useExecutionContextMenu();
  const handleResultContextMenu = useResultContextMenu();
  const [sectionDays, setSectionDays] = useState(() => dateFilters({ filters, selectedDates, allExecutions, user }));

  const { updateFilters, toggleDate } = useResultsActions();

  const handleDateToggle = ({ ...props }) => {
    setSectionDays((prev) =>
      prev.map((day) => (day.yyyy_mm_dd === props.yyyy_mm_dd ? { ...day, isActive: !day.isActive } : day)),
    );
  };

  const handleTagClick = (tag: string) => {
    updateFilters({ tag });
  };

  useEffect(() => {
    // setSectionDays(prev => prev.map(day => day))

    setSectionDays((prev) =>
      prev.map((day) => ({ ...day, isActive: selectedDates.find((d) => d === day.yyyy_mm_dd) })),
    );
  }, [selectedDates]);

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
      sectionDays={sectionDays}
      filteredExecutions={[]}
      projectId={projectId}
      onDateToggle={handleDateToggle}
      onTagClick={handleTagClick}
      handleDateToggle={handleDateToggle}
      onExecutionContextMenu={handleExecutionContextMenu}
      onResultContextMenu={handleResultContextMenu}
    />
  );
});
