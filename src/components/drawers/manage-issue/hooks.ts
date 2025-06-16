import { useDrawerActions } from '@/redux/slices/drawer';
import { Issue, ResultError } from '@/types';

import { ManageIssueDrawer } from './manage-issue-drawer';

export const useManageIssueDrawer = ({ resultError }: { resultError?: ResultError } = {}) => {
  const { openDrawer } = useDrawerActions();

  return ({ issue }: { issue?: Issue } = {}) => openDrawer(ManageIssueDrawer, { resultError, issue });
};
