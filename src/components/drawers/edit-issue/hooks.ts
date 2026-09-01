// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from 'react';

import { useDrawerActions } from '@/redux/slices/drawer';
import type { IssueCore } from '@/types';

import { EditIssueDrawer } from './edit-issue-drawer';

export function useEditIssueDrawer() {
  const { openDrawer } = useDrawerActions();
  return useCallback((issue: IssueCore) => openDrawer(EditIssueDrawer, { issue }), [openDrawer]);
}
