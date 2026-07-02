// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { LuCircleHelp } from 'react-icons/lu';

import { AnalysisCategory, IssueCategory } from '@/types';

import { getIssueCategoryStyle, ISSUE_CATEGORY_LABELS } from './issue-category';

export const ANALYSIS_CATEGORY_LABELS: Record<AnalysisCategory, string> = {
  [AnalysisCategory.Bug]: ISSUE_CATEGORY_LABELS[IssueCategory.Bug],
  [AnalysisCategory.Script]: ISSUE_CATEGORY_LABELS[IssueCategory.Script],
  [AnalysisCategory.Infra]: ISSUE_CATEGORY_LABELS[IssueCategory.Infra],
  [AnalysisCategory.Performance]: ISSUE_CATEGORY_LABELS[IssueCategory.Performance],
  [AnalysisCategory.Other]: 'Other',
};

const ANALYSIS_TO_ISSUE_CATEGORY_MAP: Record<Exclude<AnalysisCategory, AnalysisCategory.Other>, IssueCategory> = {
  [AnalysisCategory.Bug]: IssueCategory.Bug,
  [AnalysisCategory.Script]: IssueCategory.Script,
  [AnalysisCategory.Infra]: IssueCategory.Infra,
  [AnalysisCategory.Performance]: IssueCategory.Performance,
};

export const serializeAnalysisCategoryToIssueCategory = (category?: string): IssueCategory | undefined => {
  if (!category) return undefined;

  const normalizedCategory = category.trim().toLowerCase();

  if (normalizedCategory === 'environment') {
    return IssueCategory.Infra;
  }

  if (normalizedCategory === AnalysisCategory.Other) {
    return undefined;
  }

  if (!Object.values(AnalysisCategory).includes(normalizedCategory as AnalysisCategory)) {
    return undefined;
  }

  return ANALYSIS_TO_ISSUE_CATEGORY_MAP[normalizedCategory as Exclude<AnalysisCategory, AnalysisCategory.Other>];
};

export const getAnalysisCategoryStyle = (category?: AnalysisCategory) => {
  if (!category || category === AnalysisCategory.Other) {
    return {
      Icon: LuCircleHelp,
      color: 'gray.500',
      hoverBgColor: 'gray.100',
      hoverColor: 'gray.600',
      name: category ? ANALYSIS_CATEGORY_LABELS[category] : 'Unknown',
    };
  }

  const issueCategory = ANALYSIS_TO_ISSUE_CATEGORY_MAP[category];
  const style = getIssueCategoryStyle(issueCategory);

  return {
    ...style,
    hoverBgColor: style.hoverBgColor.replace('200', '100'),
  };
};

export const getConfidenceLabel = (confidence?: number): string => {
  if (!confidence) return '';

  switch (confidence) {
    case 1:
      return 'Not Confident';
    case 2:
      return 'Somewhat';
    case 3:
      return 'Moderate';
    case 4:
      return 'Confident';
    case 5:
      return 'Very Confident';
    default:
      return String(confidence);
  }
};

export const getErrorQualityLabel = (quality?: number): string => {
  if (!quality) return 'N/A';

  switch (quality) {
    case 1:
      return 'Very Poor';
    case 2:
      return 'Poor';
    case 3:
      return 'Fair';
    case 4:
      return 'Good';
    case 5:
      return 'Excellent';
    default:
      return String(quality);
  }
};
