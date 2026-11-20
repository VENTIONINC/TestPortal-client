// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';

import {
  useLazyGetApiV2UsersQuery,
  usePatchApiV2ManualTestRunsByRunIdScenariosAndScenarioIdAssigneeMutation,
  usePostApiV2ManualTestRunsByRunIdScenariosBulkMutation,
  usePutApiV2ManualTestRunsByRunIdScenariosAndScenarioIdResultMutation,
  usePutApiV2ManualTestRunsByRunIdScenariosOrderMutation,
} from '@/redux/apis/extendedApi';
import type {
  ManualTestRunRead,
  ManualTestRunScenarioRead,
  ManualTestRunScenarioResult,
} from '@/redux/apis/generatedApi';

import { MANUAL_RUN_RESULT } from '../../constants';
import { RESULTS } from '../manualRunResults';
import { useManualRunScenarioFilters } from '../useManualRunScenarioFilters';
import type { useManualRun } from './useManualRun';

interface UseManualRunScenariosOptions {
  projectId: string;
  selectedRunId?: string;
  run: ManualTestRunRead | undefined;
  completed: boolean;
  writesBlocked: boolean;
  mutate: ReturnType<typeof useManualRun>['mutate'];
}

export const useManualRunScenarios = ({
  projectId,
  selectedRunId,
  run,
  completed,
  writesBlocked,
  mutate,
}: UseManualRunScenariosOptions) => {
  const [expandedScenarioId, setExpandedScenarioId] = useState<string>();
  const scenarioFilters = useManualRunScenarioFilters(projectId, selectedRunId, run?.scenarios);
  const { filteredScenarios, visibleScenarios, selectedScenarioIds, setSelectedScenarioIds } = scenarioFilters;
  const [loadUsers, usersQuery] = useLazyGetApiV2UsersQuery();
  const [bulkScenarios] = usePostApiV2ManualTestRunsByRunIdScenariosBulkMutation();
  const [setScenarioAssignee] = usePatchApiV2ManualTestRunsByRunIdScenariosAndScenarioIdAssigneeMutation();
  const [setScenarioResult] = usePutApiV2ManualTestRunsByRunIdScenariosAndScenarioIdResultMutation();
  const [saveOrder] = usePutApiV2ManualTestRunsByRunIdScenariosOrderMutation();

  useEffect(() => {
    setExpandedScenarioId(undefined);
  }, [projectId, selectedRunId]);

  const selectedIds = useMemo(() => new Set(selectedScenarioIds), [selectedScenarioIds]);
  const selectedScenarios = useMemo(
    () => (run?.scenarios ?? []).filter((scenario) => selectedIds.has(scenario.id)),
    [run?.scenarios, selectedIds],
  );
  const selectionIsResolved = selectedScenarioIds.length > 0 && selectedScenarios.length === selectedScenarioIds.length;
  const bulkStatusWillReset = (result: ManualTestRunScenarioResult) =>
    selectionIsResolved && selectedScenarios.every((scenario) => scenario.result === result);

  const bulkResultActions = RESULTS.map((result) => ({
    result,
    nextResult: bulkStatusWillReset(result) ? MANUAL_RUN_RESULT.UNTESTED : result,
  }));
  const selectedCount = selectedScenarioIds.length;
  const canSelectAll = filteredScenarios.some((scenario) => !selectedIds.has(scenario.id));

  const updateResult = (scenario: ManualTestRunScenarioRead, result: ManualTestRunScenarioResult) =>
    mutate((runId) =>
      setScenarioResult({
        projectId,
        runId,
        scenarioId: scenario.id,
        manualTestRunScenarioResultRequest: {
          result: scenario.result === result ? MANUAL_RUN_RESULT.UNTESTED : result,
        },
      }).unwrap(),
    );
  const updateAssignee = (scenarioId: string, assigneeId: string | null) =>
    mutate((runId) =>
      setScenarioAssignee({
        projectId,
        runId,
        scenarioId,
        manualTestRunScenarioAssigneeRequest: { assigneeId },
      }).unwrap(),
    );
  const updateBulk = (input: { result?: ManualTestRunScenarioResult; assigneeId?: string | null }) =>
    mutate((runId) =>
      bulkScenarios({
        projectId,
        runId,
        manualTestRunScenarioBulkRequest: { scenarioIds: selectedScenarioIds, ...input },
      }).unwrap(),
    );

  const reorderScenarios = (sourceId: string, targetId: string) => {
    if (!run || sourceId === targetId) return;
    const ids = run.scenarios.map((item) => item.id);
    const from = ids.indexOf(sourceId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;
    ids.splice(to, 0, ids.splice(from, 1)[0]);
    void mutate((runId) =>
      saveOrder({ projectId, runId, manualTestRunScenarioOrderRequest: { scenarioIds: ids } }).unwrap(),
    );
  };

  const activateResult = (scenario: ManualTestRunScenarioRead, event: KeyboardEvent) => {
    if (completed || writesBlocked || event.target !== event.currentTarget) return;
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      const index = run?.scenarios.findIndex((item) => item.id === scenario.id) ?? -1;
      const neighbor = run?.scenarios[index + (event.key === 'ArrowUp' ? -1 : 1)];
      if (neighbor) {
        event.preventDefault();
        reorderScenarios(scenario.id, neighbor.id);
      }
      return;
    }
    const keys: Record<string, ManualTestRunScenarioResult> = {
      p: MANUAL_RUN_RESULT.PASSED,
      f: MANUAL_RUN_RESULT.FAILED,
      b: MANUAL_RUN_RESULT.BLOCKED,
      s: MANUAL_RUN_RESULT.SKIPPED,
    };
    const chosen = keys[event.key.toLowerCase()];
    if (chosen) {
      event.preventDefault();
      void updateResult(scenario, chosen).then(() => {
        const currentIndex = visibleScenarios.findIndex((item) => item.id === scenario.id);
        const nextScenario = visibleScenarios[currentIndex + 1];
        const row = nextScenario ? document.getElementById(`manual-run-scenario-${nextScenario.id}`) : null;
        row?.focus();
      });
    }
  };

  const loadScenarioUsers = () => void loadUsers();
  const setBulkResult = (result: ManualTestRunScenarioResult) => void updateBulk({ result });
  const setBulkAssignee = (assigneeId: string | null) => void updateBulk({ assigneeId });
  const selectAllFilteredScenarios = () => setSelectedScenarioIds(filteredScenarios.map((scenario) => scenario.id));
  const clearSelection = () => setSelectedScenarioIds([]);

  return {
    scenarioFilters,
    expandedScenarioId,
    setExpandedScenarioId,
    users: usersQuery.currentData ?? [],
    loadScenarioUsers,
    updateAssignee,
    updateResult,
    activateResult,
    reorderScenarios,
    showReorderHint: !completed && visibleScenarios.length > 1,
    showBulkActions: !completed && selectedCount > 0,
    selectedCount,
    canSelectAll,
    bulkResultActions,
    setBulkResult,
    setBulkAssignee,
    selectAllFilteredScenarios,
    clearSelection,
  };
};
