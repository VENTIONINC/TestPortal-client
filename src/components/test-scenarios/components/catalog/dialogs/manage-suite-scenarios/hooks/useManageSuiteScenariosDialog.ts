// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useDialogActions } from '@/redux/slices/dialog';
import type { DefaultDialogProps } from '@/types';

import { TestSuiteAddScenariosDialog, type TestSuiteAddScenariosDialogProps } from '../TestSuiteAddScenariosDialog';

export const useManageSuiteScenariosDialog = (scopeKey: string) => {
  const { openDialog } = useDialogActions(scopeKey);

  return (options: Omit<TestSuiteAddScenariosDialogProps, keyof DefaultDialogProps>) =>
    openDialog(TestSuiteAddScenariosDialog, options);
};
