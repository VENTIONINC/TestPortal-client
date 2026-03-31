import { LuBug, LuCircleHelp, LuCode, LuCpu, LuServer } from 'react-icons/lu';

import { IssueCategory } from '@/types';

export const ISSUE_CATEGORY_LABELS: Record<IssueCategory, string> = {
  [IssueCategory.Bug]: 'Bug',
  [IssueCategory.Script]: 'Script',
  [IssueCategory.Infra]: 'Environment',
  [IssueCategory.Performance]: 'Performance',
  [IssueCategory.Other]: '',
};

export const getIssueCategoryStyle = (category: IssueCategory) => {
  const name = ISSUE_CATEGORY_LABELS[category] || category;

  switch (category) {
    case IssueCategory.Bug:
      return {
        Icon: LuBug,
        color: 'category.bug.color',
        hoverBgColor: 'category.bug.color',
        hoverColor: 'category.bug.hover.color',
        name,
      };
    case IssueCategory.Script:
      return {
        Icon: LuCode,
        color: 'category.script.color',
        hoverBgColor: 'category.script.color',
        hoverColor: 'category.script.hover.color',
        name,
      };
    case IssueCategory.Infra:
      return {
        Icon: LuServer,
        color: 'category.environment.color',
        hoverBgColor: 'category.environment.color',
        hoverColor: 'category.environment.hover.color',
        name,
      };
    case IssueCategory.Performance:
      return {
        Icon: LuCpu,
        color: 'category.performance.color',
        hoverBgColor: 'category.performance.color',
        hoverColor: 'category.performance.hover.color',
        name,
      };
    default:
      return {
        Icon: LuCircleHelp,
        color: 'category.default.color',
        hoverBgColor: 'category.default.color',
        hoverColor: 'category.default.hover.color',
        name,
      };
  }
};
