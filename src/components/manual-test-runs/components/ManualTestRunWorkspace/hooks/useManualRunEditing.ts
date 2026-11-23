// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { ManualTestRunRead } from '@/redux/apis/generatedApi';

import { useManageScenariosDialog } from '../../ManageScenariosDialog';
import { useEditManualRunDetailsDialog } from '../../ManualRunDetailsDialog';
import type { useManualRun } from './useManualRun';

interface UseManualRunEditingOptions {
  projectId: string;
  selectedRunId?: string;
  run: ManualTestRunRead | undefined;
  completed: boolean;
  writesBlocked: boolean;
  getRun: ReturnType<typeof useManualRun>['getRun'];
  mutate: ReturnType<typeof useManualRun>['mutate'];
}

export const useManualRunEditing = ({
  projectId,
  selectedRunId,
  run,
  completed,
  writesBlocked,
  getRun,
  mutate,
}: UseManualRunEditingOptions) => {
  const openEditDialog = useEditManualRunDetailsDialog(projectId, selectedRunId);
  const openManageDialog = useManageScenariosDialog(projectId, selectedRunId);

  const openEdit = () => {
    if (!run || completed || writesBlocked) return;
    openEditDialog({
      projectId,
      runId: run.id,
      runTitle: run.title,
      existing: run.scenarios,
      environmentProperties: run.environmentProperties,
      getRun,
      mutate,
    });
  };

  const openManageScenarios = () => {
    if (!run || completed || writesBlocked) return;
    openManageDialog({
      projectId,
      runId: run.id,
      runTitle: run.title,
      existing: run.scenarios,
      getRun,
      mutate,
    });
  };

  return { openEdit, openManageScenarios };
};
