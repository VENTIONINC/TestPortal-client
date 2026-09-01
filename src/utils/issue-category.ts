// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { LuBug, LuCircleHelp, LuCode, LuCpu, LuServer } from 'react-icons/lu';

import { IssueCategorySummary, ResultCategory } from '@/types';

export const ISSUE_CATEGORY_LABELS: Record<ResultCategory, string> = {
  [ResultCategory.Bug]: 'Bug',
  [ResultCategory.Script]: 'Script',
  [ResultCategory.Infra]: 'Environment',
  [ResultCategory.Performance]: 'Performance',
  [ResultCategory.Other]: 'Other',
};

export const getIssueCategoryStyle = (category?: ResultCategory | null) => {
  const resolvedCategory = category ?? ResultCategory.Other;
  const name = ISSUE_CATEGORY_LABELS[resolvedCategory];

  switch (resolvedCategory) {
    case ResultCategory.Bug:
      return {
        Icon: LuBug,
        color: 'category.bug.color',
        hoverBgColor: 'category.bug.color',
        hoverColor: 'category.bug.hover.color',
        name,
      };
    case ResultCategory.Script:
      return {
        Icon: LuCode,
        color: 'category.script.color',
        hoverBgColor: 'category.script.color',
        hoverColor: 'category.script.hover.color',
        name,
      };
    case ResultCategory.Infra:
      return {
        Icon: LuServer,
        color: 'category.environment.color',
        hoverBgColor: 'category.environment.color',
        hoverColor: 'category.environment.hover.color',
        name,
      };
    case ResultCategory.Performance:
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

const SUMMARY_CATEGORY_ORDER = [
  ResultCategory.Bug,
  ResultCategory.Infra,
  ResultCategory.Performance,
  ResultCategory.Script,
  ResultCategory.Other,
] as const;

export const getIssueCategorySummaryPresentation = (summary: IssueCategorySummary) => {
  return {
    category: summary.displayCategory,
    label: ISSUE_CATEGORY_LABELS[summary.displayCategory],
    showMixed: summary.isMixed,
    details: [
      ...SUMMARY_CATEGORY_ORDER.map((category) => ({
        label: ISSUE_CATEGORY_LABELS[category],
        count: summary.distribution[category] ?? 0,
      })),
      { label: 'Uncategorized', count: summary.uncategorizedCount },
    ],
  };
};
