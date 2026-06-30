// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { toaster } from '@/components/ui/toaster';
import { useDeleteApiV2ResultsByResultIdMutation } from '@/redux/apis/generatedApi';
import { useDialogActions } from '@/redux/slices/dialog';

import { ConfirmResultDeletionDialog } from './confirm-result-deletion-dialog';

export const useConfirmResultDeletionDialog = () => {
  const { openDialog } = useDialogActions();

  return (resultId: string, resultRetry: number, specName: string, projectId: string) =>
    openDialog(ConfirmResultDeletionDialog, {
      resultId,
      resultRetry,
      specName,
      projectId,
    });
};

export const useConfirmResultDeletionBusinessLogic = (
  closeDialog: () => void,
  resultId: string,
  projectId: string,
) => {
  const [deleteResult] = useDeleteApiV2ResultsByResultIdMutation();

  const onConfirm = async () => {
    try {
      await deleteResult({
        resultId,
        projectId,
      }).unwrap();

      toaster.create({
        title: 'Result deleted successfully.',
        type: 'success',
      });

      closeDialog();
    } catch {
      toaster.create({
        title: 'Failed to delete result.',
        type: 'error',
      });
    }
  };

  return {
    onConfirm,
  };
};
