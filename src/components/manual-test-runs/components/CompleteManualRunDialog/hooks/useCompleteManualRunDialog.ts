// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useDialogActions } from '@/redux/slices/dialog';

import { CompleteManualRunDialog, type CompleteManualRunDialogProps } from '../CompleteManualRunDialog';

export const useCompleteManualRunDialog = (projectId: string, runId?: string) => {
  const { openDialog } = useDialogActions(JSON.stringify([projectId, runId]));

  return (props: CompleteManualRunDialogProps) => openDialog(CompleteManualRunDialog, props);
};
