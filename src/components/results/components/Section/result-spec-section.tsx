// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { memo, useEffect, useMemo, useRef, useState } from 'react';

import { useResultsFilterDateRange, useSelectedDates } from '@/redux/slices/results';
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
  activeTags: string[];
  onToggleTag: (tag: string) => void;
}

export const ResultSpecSection = memo(({ spec, executions, allExecutions, activeTags, onToggleTag }: ResultSpecSectionProps) => {
  const dateRange = useResultsFilterDateRange();
  const selectedDates = useSelectedDates();
  const user = useCurrentUser();
  const projectId = useSelectedProjectId();
  const handleExecutionContextMenu = useExecutionContextMenu();
  const handleResultContextMenu = useResultContextMenu();

  // Track per-date local overrides relative to the global date selection.
  const [locallyToggledDates, setLocallyToggledDates] = useState<Set<string>>(new Set());
  const previousGlobalStateRef = useRef<{
    from: string;
    to: string;
    selectedDates: string[];
  } | null>(null);

  const allDates = useMemo(() => getDatesBetween(dateRange.from, dateRange.to), [dateRange.from, dateRange.to]);
  const activeDatesSet = useMemo(() => new Set(selectedDates), [selectedDates]);

  const sectionDays = useMemo(() => {
    const computedDays = allDates.map((date) => {
      const isGloballyActive = activeDatesSet.has(date);
      const hasLocalOverride = locallyToggledDates.has(date);
      const isActive = hasLocalOverride ? !isGloballyActive : isGloballyActive;
      const executionsToUse = isGloballyActive ? executions : allExecutions;

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
        isVisible: isActive,
      };
    });

    return computedDays;
  }, [allDates, activeDatesSet, locallyToggledDates, executions, allExecutions, user]);

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
    const previousGlobalState = previousGlobalStateRef.current;

    if (!previousGlobalState) {
      previousGlobalStateRef.current = {
        from: dateRange.from,
        to: dateRange.to,
        selectedDates,
      };
      return;
    }

    const currentDates = new Set(getDatesBetween(dateRange.from, dateRange.to));
    const previousDates = new Set(getDatesBetween(previousGlobalState.from, previousGlobalState.to));

    setLocallyToggledDates((prev) => {
      let next: Set<string> | null = null;

      for (const date of prev) {
        if (!currentDates.has(date)) {
          next ??= new Set(prev);
          next.delete(date);
        }
      }

      for (const date of currentDates) {
        if (!previousDates.has(date)) {
          continue;
        }

        const previousIsActive = previousGlobalState.selectedDates.includes(date);
        const currentIsActive = activeDatesSet.has(date);

        if (previousIsActive !== currentIsActive && prev.has(date)) {
          next ??= new Set(prev);
          next.delete(date);
        }
      }

      return next ?? prev;
    });

    previousGlobalStateRef.current = {
      from: dateRange.from,
      to: dateRange.to,
      selectedDates,
    };
  }, [selectedDates, activeDatesSet, dateRange.from, dateRange.to]);

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
      activeTags={activeTags}
      onToggleTag={onToggleTag}
    />
  );
});
