import { LuBug, LuCircleHelp, LuCode, LuCpu, LuServer } from 'react-icons/lu';

import { IssueCategory } from '@/types';

export const ISSUE_CATEGORY_LABELS: Record<IssueCategory, string> = {
  [IssueCategory.Bug]: 'Bug',
  [IssueCategory.Script]: 'Script',
  [IssueCategory.Infra]: 'Environment',
  [IssueCategory.Performance]: 'Performance',
};

export const getIssueCategoryStyle = (category: IssueCategory) => {
  const name = ISSUE_CATEGORY_LABELS[category] || category;

  switch (category) {
    case IssueCategory.Bug:
      return { Icon: LuBug, color: 'red.500', hoverBgColor: 'red.200', name };
    case IssueCategory.Script:
      return { Icon: LuCode, color: 'yellow.600', hoverBgColor: 'yellow.200', name };
    case IssueCategory.Infra:
      return { Icon: LuServer, color: 'blue.500', hoverBgColor: 'blue.200', name };
    case IssueCategory.Performance:
      return { Icon: LuCpu, color: 'orange.500', hoverBgColor: 'orange.200', name };
    default:
      return { Icon: LuCircleHelp, color: 'gray.500', hoverBgColor: 'gray.200', name };
  }
};
