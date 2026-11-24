// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { usePostApiV2TestSuitesBySuiteIdMembershipChangesMutation } from '@/redux/apis/extendedApi';
import type { DefaultDialogProps } from '@/types';

import type { SuiteMembershipUndo } from '../../types';
import { getActionErrorMessage } from '../../utils';
import { useCatalogConfirmation } from '../hooks/useCatalogConfirmation';
import { useSuiteScenarioSelection } from './hooks/useSuiteScenarioSelection';
import { TestSuiteAddScenariosDialogView, type ScenarioFolderOption } from './TestSuiteAddScenariosDialogView';

export interface TestSuiteAddScenariosDialogProps extends DefaultDialogProps {
  projectId: string;
  suiteId: string;
  suiteName: string;
  membershipRevision: number;
  originalIds: string[];
  folderOptions: ScenarioFolderOption[];
  unfiledScenarioCount: number;
  totalScenarioCount: number;
  onSaved: (undo: SuiteMembershipUndo) => void;
}

export const TestSuiteAddScenariosDialog = ({
  projectId,
  suiteId,
  suiteName,
  membershipRevision,
  originalIds,
  folderOptions,
  unfiledScenarioCount,
  totalScenarioCount,
  onSaved,
  closeDialog,
}: TestSuiteAddScenariosDialogProps) => {
  const { error: queryError, ...selection } = useSuiteScenarioSelection(projectId, originalIds);
  const [saveMembership] = usePostApiV2TestSuitesBySuiteIdMembershipChangesMutation();
  const { error, isSubmitting, onCancel, onConfirm } = useCatalogConfirmation(
    () =>
      saveMembership({
        suiteId,
        body: {
          projectId,
          expectedMembershipRevision: membershipRevision,
          expectedScenarioIds: originalIds,
          addScenarioIds: selection.selectedIds.filter((id) => !originalIds.includes(id)),
          removeScenarioIds: originalIds.filter((id) => !selection.selectedIds.includes(id)),
        },
      }).unwrap(),
    closeDialog,
    (response) =>
      onSaved({
        restoreData: response.restoreData,
        expectedMembershipRevision: response.membershipRevision,
        expectedScenarioIds: response.scenarioIds,
      }),
  );
  const handleSave = () => {
    if (selection.hasChanges) void onConfirm();
  };

  return (
    <TestSuiteAddScenariosDialogView
      {...selection}
      suiteName={suiteName}
      folderOptions={folderOptions}
      unfiledScenarioCount={unfiledScenarioCount}
      totalScenarioCount={totalScenarioCount}
      existingIds={originalIds}
      emptyState="no-results"
      error={error ?? (queryError ? getActionErrorMessage(queryError) : undefined)}
      isAdding={isSubmitting}
      onAdd={handleSave}
      onClose={onCancel}
    />
  );
};
