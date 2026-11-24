// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useRef, useState } from 'react';

import { usePutApiV2ManualTestRunsByRunIdDetailsMutation } from '@/redux/apis/generatedApi';
import type { ManualTestRunEnvironmentProperty, ManualTestRunRead } from '@/redux/apis/generatedApi';

import { MANUAL_RUN_RESULT, MANUAL_RUN_STATUS } from '../../../constants';
import { useRunRecoveryLocked } from '../../../recoveryLock';
import type { ExistingRunScenario } from '../../ManageScenariosDialog/ScenarioSelectionTable';
import type { useManualRun } from '../../ManualTestRunWorkspace/hooks/useManualRun';
import { normalizeEnvironment } from '../normalizeEnvironment';

export interface ManualRunEditScope {
  projectId: string;
  runId: string;
  getRun: () => ManualTestRunRead | undefined;
  mutate: ReturnType<typeof useManualRun>['mutate'];
}

interface ManualRunDetailsDraft {
  title: string;
  environmentProperties: ManualTestRunEnvironmentProperty[];
}

export const useManualRunDetailsSave = (
  { projectId, runId, getRun, mutate }: ManualRunEditScope,
  closeDialog: () => void,
) => {
  const [updateDetails] = usePutApiV2ManualTestRunsByRunIdDetailsMutation();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [removedResults, setRemovedResults] = useState<ExistingRunScenario[]>([]);
  const submitting = useRef(false);
  const recoveryRequired = useRunRecoveryLocked(projectId, runId);

  const clearRemovalWarning = () => setRemovedResults([]);

  const save = async (scenarioIds: string[], draft?: ManualRunDetailsDraft) => {
    if (submitting.current || recoveryRequired || scenarioIds.length === 0) return;

    const latestRun = getRun();
    if (!latestRun || latestRun.status !== MANUAL_RUN_STATUS.IN_PROGRESS) {
      setError('The run is no longer available for editing.');
      return;
    }

    const title = (draft?.title ?? latestRun.title).trim();
    if (!title) return;

    const selected = new Set(scenarioIds);
    const proposedRemovals = latestRun.scenarios.filter(
      (scenario) => !selected.has(scenario.sourceScenarioId) && scenario.result !== MANUAL_RUN_RESULT.UNTESTED,
    );
    const needsConfirmation = proposedRemovals.some((scenario) =>
      removedResults.every(
        (removed) => removed.sourceScenarioId !== scenario.sourceScenarioId || removed.result !== scenario.result,
      ),
    );
    if (needsConfirmation) {
      setRemovedResults(proposedRemovals);
      return;
    }

    submitting.current = true;
    setSaving(true);
    setError(undefined);
    try {
      const saved = await mutate(() =>
        updateDetails({
          projectId,
          runId,
          manualTestRunDetailsRequest: {
            title,
            scenarioIds,
            environmentProperties: normalizeEnvironment(
              draft?.environmentProperties ?? latestRun.environmentProperties,
            ),
          },
        }).unwrap(),
      );
      if (saved) closeDialog();
      else setError('Could not save the run. Your changes are still here.');
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };

  return {
    saving,
    saveBlocked: recoveryRequired,
    error: !saving && recoveryRequired ? 'Close this dialog and retry the run refresh before making changes.' : error,
    removedResults,
    clearRemovalWarning,
    save,
  };
};
