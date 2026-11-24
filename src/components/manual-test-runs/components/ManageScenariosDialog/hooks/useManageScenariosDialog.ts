// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useDialogActions } from '@/redux/slices/dialog';

import { ManageScenariosDialog, type ManageScenariosDialogProps } from '../ManageScenariosDialog';

export const useManageScenariosDialog = (projectId: string, runId?: string) => {
  const { openDialog } = useDialogActions(JSON.stringify([projectId, runId]));

  return (props: ManageScenariosDialogProps) => openDialog(ManageScenariosDialog, props);
};
