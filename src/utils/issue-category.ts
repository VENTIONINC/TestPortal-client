import { LuBug, LuCircleHelp, LuCode, LuCpu, LuServer } from 'react-icons/lu';

import { IssueCategory } from '@/types';

export const getIssueCategoryStyle = (category: IssueCategory) => {
  switch (category) {
    case IssueCategory.Bug:
      return { Icon: LuBug, color: 'red.500', hoverBgColor: 'red.200' };
    case IssueCategory.Script:
      return { Icon: LuCode, color: 'green.500', hoverBgColor: 'green.200' };
    case IssueCategory.Infra:
      return { Icon: LuServer, color: 'blue.500', hoverBgColor: 'blue.200' };
    case IssueCategory.Performance:
      return { Icon: LuCpu, color: 'orange.500', hoverBgColor: 'orange.200' };
    default:
      return { Icon: LuCircleHelp, color: 'gray.500', hoverBgColor: 'gray.200' };
  }
};
