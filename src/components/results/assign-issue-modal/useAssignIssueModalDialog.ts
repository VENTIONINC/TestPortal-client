// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from 'react';

import { useDialogActions } from '@/redux/slices/dialog';
import type { ResultError } from '@/types';

import { AssignIssueModal } from './AssignIssueModal';

export function useAssignIssueModalDialog(projectId: string) {
  const { openDialog } = useDialogActions();

  return useCallback(
    (resultError: ResultError, mode: 'assign' | 'confirmed' | 'context' = 'assign') =>
      openDialog(AssignIssueModal, { resultErrorId: resultError.id, projectId, mode }),
    [openDialog, projectId],
  );
}
