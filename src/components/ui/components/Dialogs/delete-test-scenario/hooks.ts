// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useDialogActions } from '@/redux/slices/dialog';

import { DeleteTestScenarioDialog } from './delete-test-scenario-dialog';

export const useDeleteTestScenarioDialog = () => {
  const { openDialog } = useDialogActions();

  return (scenarioId: string, projectId: string, scenarioTitle: string, onDeleted?: () => void) =>
    openDialog(DeleteTestScenarioDialog, { scenarioId, projectId, scenarioTitle, onDeleted });
};
