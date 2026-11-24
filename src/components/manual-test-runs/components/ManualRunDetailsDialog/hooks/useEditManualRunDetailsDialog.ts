// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useDialogActions } from '@/redux/slices/dialog';

import { EditManualRunDetailsDialog, type EditManualRunDetailsDialogProps } from '../EditManualRunDetailsDialog';

export const useEditManualRunDetailsDialog = (projectId: string, runId?: string) => {
  const { openDialog } = useDialogActions(JSON.stringify([projectId, runId]));

  return (props: EditManualRunDetailsDialogProps) => openDialog(EditManualRunDetailsDialog, props);
};
