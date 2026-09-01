// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { IssueCategorySummary, ResultCategory } from '@/types';

export interface TopIssueListItem {
  id: string;
  title: string;
  count: number;
  category: ResultCategory;
  categorySummary: IssueCategorySummary;
}

export const mapTopIssues = (issues: TopIssueListItem[]): TopIssueListItem[] =>
  issues.map(({ id, title, count, category, categorySummary }) => ({ id, title, count, category, categorySummary }));
