// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react';

import type { TestScenarioSummary } from '@/redux/apis/generatedApi';

import type { ExistingRunScenario } from './ScenarioSelectionTable';

interface ManageScenarioSelectionOptions {
  existing: ExistingRunScenario[];
  initialIds?: string[];
  onSelectionChange?: () => void;
}

export const useManageScenarioSelection = ({
  existing,
  initialIds,
  onSelectionChange,
}: ManageScenarioSelectionOptions) => {
  const [ids, setIds] = useState(() => initialIds ?? existing.map((item) => item.sourceScenarioId));

  const original = existing.map((item) => item.sourceScenarioId);
  const added = ids.filter((id) => !original.includes(id)).length;
  const removed = original.filter((id) => !ids.includes(id)).length;

  const removedResults = existing.filter((item) => !ids.includes(item.sourceScenarioId) && item.result !== 'untested');
  const resultBreakdown = (['passed', 'failed', 'blocked', 'skipped'] as const)
    .map((result) => ({ result, count: removedResults.filter((item) => item.result === result).length }))
    .filter((item) => item.count > 0)
    .map((item) => `${item.count} ${item.result}`)
    .join(', ');

  const toggleScenario = (id: string) => {
    onSelectionChange?.();
    setIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const togglePage = (rows: TestScenarioSummary[], allSelected: boolean) => {
    onSelectionChange?.();
    setIds((current) =>
      allSelected
        ? current.filter((id) => !rows.some((row) => row.id === id))
        : [...new Set([...current, ...rows.map((row) => row.id)])],
    );
  };

  return { ids, added, removed, removedResults, resultBreakdown, toggleScenario, togglePage };
};
