// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { DefaultDialogProps } from '@/types';

import {
  useManualRunDetailsSave,
  type ManualRunEditScope,
} from '../ManualRunDetailsDialog/hooks/useManualRunDetailsSave';
import { ScenarioSelectionDialog } from './ScenarioSelectionDialog';
import type { ExistingRunScenario } from './ScenarioSelectionTable';

export interface ManageScenariosDialogProps extends ManualRunEditScope {
  runTitle: string;
  existing: ExistingRunScenario[];
}

export const ManageScenariosDialog = ({
  projectId,
  runId,
  runTitle,
  existing,
  getRun,
  mutate,
  closeDialog,
}: ManageScenariosDialogProps & DefaultDialogProps) => {
  const { saving, saveBlocked, error, removedResults, clearRemovalWarning, save } = useManualRunDetailsSave(
    { projectId, runId, getRun, mutate },
    closeDialog,
  );

  return (
    <ScenarioSelectionDialog
      projectId={projectId}
      title={`Manage scenarios in ${runTitle}`}
      existing={existing}
      saving={saving}
      saveBlocked={saveBlocked}
      error={error}
      removedResults={removedResults}
      onSelectionChange={clearRemovalWarning}
      onClose={closeDialog}
      onSave={(ids) => void save(ids)}
    />
  );
};
