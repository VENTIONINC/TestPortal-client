import { useDrawerActions } from '@/redux/slices/drawer';
import { ResultError } from '@/types';

import { AssignIssueDrawer } from './assign-issue-drawer';

export const useAssignIssueDrawer = ({ resultError }: { resultError: ResultError }) => {
  const { openDrawer } = useDrawerActions();

  return () => openDrawer(AssignIssueDrawer, { resultError });
};
