// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useDialogActions } from '@/redux/slices/dialog';

import { DeleteManualRunDialog, type DeleteManualRunDialogProps } from '../DeleteManualRunDialog';

export const useDeleteManualRunDialog = (projectId: string, runId?: string) => {
  const { openDialog } = useDialogActions(JSON.stringify([projectId, runId]));

  return (props: DeleteManualRunDialogProps) => openDialog(DeleteManualRunDialog, props);
};
