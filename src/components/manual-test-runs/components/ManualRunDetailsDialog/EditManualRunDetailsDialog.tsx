// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react';

import type { ManualTestRunEnvironmentProperty, ManualTestRunScenarioRead } from '@/redux/apis/generatedApi';
import type { DefaultDialogProps } from '@/types';

import { useManualRunDetailsSave, type ManualRunEditScope } from './hooks/useManualRunDetailsSave';
import { ManualRunDetailsDialog } from './ManualRunDetailsDialog';

export interface EditManualRunDetailsDialogProps extends ManualRunEditScope {
  runTitle: string;
  existing: ManualTestRunScenarioRead[];
  environmentProperties: ManualTestRunEnvironmentProperty[];
}

export const EditManualRunDetailsDialog = ({
  projectId,
  runId,
  runTitle,
  existing,
  environmentProperties,
  getRun,
  mutate,
  closeDialog,
}: EditManualRunDetailsDialogProps & DefaultDialogProps) => {
  const [name, setName] = useState(runTitle);
  const [selectedIds, setSelectedIds] = useState(() => existing.map((scenario) => scenario.sourceScenarioId));
  const [environment, setEnvironment] = useState(environmentProperties);
  const { saving, saveBlocked, error, removedResults, clearRemovalWarning, save } = useManualRunDetailsSave(
    { projectId, runId, getRun, mutate },
    closeDialog,
  );

  const handleSelectionChange = (ids: string[]) => {
    setSelectedIds(ids);
    clearRemovalWarning();
  };

  return (
    <ManualRunDetailsDialog
      projectId={projectId}
      mode="edit"
      name={name}
      onNameChange={setName}
      selectedIds={selectedIds}
      onSelectionChange={handleSelectionChange}
      existing={existing}
      environment={environment}
      onEnvironmentChange={setEnvironment}
      saving={saving}
      saveBlocked={saveBlocked}
      removedResultsCount={removedResults.length}
      error={error}
      onClose={closeDialog}
      onSubmit={() => void save(selectedIds, { title: name, environmentProperties: environment })}
    />
  );
};
