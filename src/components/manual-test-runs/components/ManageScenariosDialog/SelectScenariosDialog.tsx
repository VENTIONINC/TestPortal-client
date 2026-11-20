// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { DefaultDialogProps } from '@/types';

import { ScenarioSelectionDialog } from './ScenarioSelectionDialog';
import type { ExistingRunScenario } from './ScenarioSelectionTable';

export interface SelectScenariosDialogProps {
  projectId: string;
  existing: ExistingRunScenario[];
  initialIds: string[];
  onSelectionChange: (ids: string[]) => void;
  finalFocusEl: () => HTMLElement | null;
}

export const SelectScenariosDialog = ({
  projectId,
  existing,
  initialIds,
  onSelectionChange,
  finalFocusEl,
  closeDialog,
}: SelectScenariosDialogProps & DefaultDialogProps) => {
  const handleDone = (ids: string[]) => {
    onSelectionChange(ids);
    closeDialog();
  };

  return (
    <ScenarioSelectionDialog
      projectId={projectId}
      title="Select scenarios"
      existing={existing}
      initialIds={initialIds}
      pickerMode
      onClose={closeDialog}
      onSave={handleDone}
      finalFocusEl={finalFocusEl}
    />
  );
};
