// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useDialogActions } from '@/redux/slices/dialog';
import { BaseResult } from '@/types';

import { ResultAnalysisDialog } from './result-analysis-dialog';

export const useResultAnalysisDialog = () => {
  const { openDialog } = useDialogActions();

  return (result: BaseResult) => openDialog(ResultAnalysisDialog, { result });
};
