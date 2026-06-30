// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from 'react';

import { useDrawerActions } from '@/redux/slices/drawer';
import { Issue, ResultError } from '@/types';

import { ManageIssueDrawer } from './manage-issue-drawer';

export const useManageIssueDrawer = ({ resultError }: { resultError?: ResultError } = {}) => {
  const { openDrawer } = useDrawerActions();

  return useCallback(
    ({ issue }: { issue?: Issue } = {}) => openDrawer(ManageIssueDrawer, { resultError, issue }),
    [openDrawer, resultError],
  );
};

export { useManageIssue } from './useManageIssue';
