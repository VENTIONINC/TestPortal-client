// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useDialogActions } from '@/redux/slices/dialog';

import { ConfirmIssueDeletionDialog } from './confirm-issue-deteletion-dialog';

interface UseConfirmIssueDeletionDialogProps {
  onConfirm: () => void;
}

export const useConfirmIssueDeletionDialog = (props: UseConfirmIssueDeletionDialogProps) => {
  const { openDialog } = useDialogActions();

  return () => openDialog(ConfirmIssueDeletionDialog, props);
};
