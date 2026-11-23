// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useDialogActions } from '@/redux/slices/dialog';
import type { DefaultDialogProps } from '@/types';

import {
  DeleteSelectedScenariosDialog,
  type DeleteSelectedScenariosDialogProps,
} from '../DeleteSelectedScenariosDialog';

export const useDeleteSelectedScenariosDialog = (scopeKey: string) => {
  const { openDialog } = useDialogActions(scopeKey);

  return (props: Omit<DeleteSelectedScenariosDialogProps, keyof DefaultDialogProps>) =>
    openDialog(DeleteSelectedScenariosDialog, { ...props, scenarioIds: [...props.scenarioIds] });
};
