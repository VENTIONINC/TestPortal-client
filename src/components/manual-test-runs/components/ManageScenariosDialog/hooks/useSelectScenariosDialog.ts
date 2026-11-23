// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useDialogActions } from '@/redux/slices/dialog';

import { SelectScenariosDialog, type SelectScenariosDialogProps } from '../SelectScenariosDialog';

export const useSelectScenariosDialog = (projectId: string, routeKey?: string) => {
  const { openDialog } = useDialogActions(JSON.stringify([projectId, routeKey]));

  return (props: Omit<SelectScenariosDialogProps, 'projectId'>) =>
    openDialog(SelectScenariosDialog, { ...props, projectId });
};
