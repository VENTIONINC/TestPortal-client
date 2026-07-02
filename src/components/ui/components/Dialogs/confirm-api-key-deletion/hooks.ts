// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useDialogActions } from '@/redux/slices/dialog';

import { ConfirmApiKeyDeletionDialog } from './confirm-api-key-deletion-dialog';

interface UseConfirmApiKeyDeletionDialogProps {
  onConfirm: (keyId: string, projectName: string) => void;
}

export const useConfirmApiKeyDeletionDialog = (props: UseConfirmApiKeyDeletionDialogProps) => {
  const { openDialog } = useDialogActions();

  return (keyId: string, projectName: string) =>
    openDialog(ConfirmApiKeyDeletionDialog, {
      onConfirm: () => props.onConfirm(keyId, projectName),
    });
};
