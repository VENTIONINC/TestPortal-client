// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { toaster } from '@/components/ui/toaster';
import { useDeleteApiV2ExecutionsByExecutionIdMutation } from '@/redux/apis/generatedApi';
import { useDialogActions } from '@/redux/slices/dialog';

import { ConfirmExecutionDeletionDialog } from './confirm-execution-deletion-dialog';

export const useConfirmExecutionDeletionDialog = () => {
  const { openDialog } = useDialogActions();

  return (executionId: string, executionName: string, projectId: string) =>
    openDialog(ConfirmExecutionDeletionDialog, { executionId, executionName, projectId });
};

export const useConfirmExecutionDeletionBusinessLogic = (
  closeDialog: () => void,
  executionId: string,
  projectId: string,
) => {
  const [deleteExecution] = useDeleteApiV2ExecutionsByExecutionIdMutation();

  const onConfirm = async () => {
    try {
      await deleteExecution({
        executionId,
        projectId: projectId,
      }).unwrap();

      toaster.create({
        title: 'Execution deleted successfully.',
        type: 'success',
      });

      closeDialog();
    } catch {
      toaster.create({
        title: 'Failed to delete execution.',
        type: 'error',
      });
    }
  };

  return {
    onConfirm,
  };
};
