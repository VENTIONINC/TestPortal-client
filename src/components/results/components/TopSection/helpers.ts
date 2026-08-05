// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { IssueCategorySummary } from '@/types';

export interface TopIssueListItem {
  id: string;
  title: string;
  count: number;
  categorySummary: IssueCategorySummary;
}

export const mapTopIssues = (issues: TopIssueListItem[]): TopIssueListItem[] =>
  issues.map(({ id, title, count, categorySummary }) => ({ id, title, count, categorySummary }));
