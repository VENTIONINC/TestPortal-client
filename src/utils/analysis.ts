// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { LuCircleHelp } from 'react-icons/lu';

import { AnalysisCategory, ResultCategory } from '@/types';

import { getIssueCategoryStyle, ISSUE_CATEGORY_LABELS } from './issue-category';

export const ANALYSIS_CATEGORY_LABELS: Record<AnalysisCategory, string> = {
  [AnalysisCategory.Bug]: ISSUE_CATEGORY_LABELS[AnalysisCategory.Bug],
  [AnalysisCategory.Script]: ISSUE_CATEGORY_LABELS[AnalysisCategory.Script],
  [AnalysisCategory.Infra]: ISSUE_CATEGORY_LABELS[AnalysisCategory.Infra],
  [AnalysisCategory.Performance]: ISSUE_CATEGORY_LABELS[AnalysisCategory.Performance],
  [AnalysisCategory.Other]: 'Other',
};

const LEGACY_CATEGORY_ALIASES: Record<string, ResultCategory> = {
  environment: ResultCategory.Infra,
};

export const normalizeResultCategory = (value: unknown): ResultCategory | undefined => {
  if (typeof value !== 'string') return undefined;

  const normalized = value.trim().toLowerCase();
  const aliased = LEGACY_CATEGORY_ALIASES[normalized] ?? normalized;

  return Object.values(ResultCategory).includes(aliased as ResultCategory) ? (aliased as ResultCategory) : undefined;
};

export const getEffectiveResultCategory = (
  analysisCategory: unknown,
  analysisFeedbackCategory: unknown,
): ResultCategory | undefined =>
  normalizeResultCategory(analysisFeedbackCategory != null ? analysisFeedbackCategory : analysisCategory);

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

  const style = getIssueCategoryStyle(category);

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
