// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useDialogActions } from '@/redux/slices/dialog';
import type { DefaultDialogProps } from '@/types';

import { RemoveScenariosFromSuiteDialog, type RemoveScenariosFromSuiteDialogProps } from '../RemoveScenariosFromSuiteDialog';

export const useRemoveScenariosFromSuiteDialog = (scopeKey: string) => {
  const { openDialog } = useDialogActions(scopeKey);

  return (props: Omit<RemoveScenariosFromSuiteDialogProps, keyof DefaultDialogProps>) =>
    openDialog(RemoveScenariosFromSuiteDialog, { ...props, scenarioIds: [...props.scenarioIds] });
};
