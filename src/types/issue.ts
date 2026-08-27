// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { ResultCategory } from './result';

export interface IssueCore {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  category: ResultCategory;
  description?: string | null;
  portal?: string | null;
  service?: string | null;
  ticket?: string | null;
  projectId?: string;
  createdById?: string | null;
  updatedById?: string | null;
}

export interface IssueCategorySummary {
  displayCategory: ResultCategory;
  isMixed: boolean;
  distribution: Record<ResultCategory, number>;
  uncategorizedCount: number;
}

export interface IssueRead extends IssueCore {
  categorySummary: IssueCategorySummary;
}

export interface IssueTimeDistribution {
  date: string;
  count: number;
}

export interface IssueWithStats extends IssueRead {
  statistics: {
    occurrenceCount: number;
    firstOccurrence: string | null;
    lastOccurrence: string | null;
    impactedTestsCount: number;
    timeDistribution: IssueTimeDistribution[];
  };
}

export interface IssueFilters {
  projectId: string;
  tag: string;
  specId: string;
  specFile: string;
  specName: string;
  environment: string;
  type: string;
  category: string;
  name: string;
  statFrom: string;
  statTo: string;
  page: number;
}
