// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

export interface Issue {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  category: IssueCategory;
  description: string;
  portal: string;
  service: string;
  ticket: string;
}

export interface IssueTimeDistribution {
  date: string;
  count: number;
}

export interface IssueWithStats extends Issue {
  statistics: {
    occurrenceCount: number;
    firstOccurrence: string | null;
    lastOccurrence: string | null;
    impactedTestsCount: number;
    timeDistribution: IssueTimeDistribution[];
  };
}

export enum IssueCategory {
  Bug = 'Bug',
  Script = 'Script',
  Infra = 'Infra',
  Performance = 'Performance',
  Other = 'Other',
}

export interface IssueFilters {
  projectId: string;
  tag: string;
  specId: string;
  specFile: string;
  specName: string;
  environment: string;
  type: string;
  category: IssueCategory;
  name: string;
  statFrom: string;
  statTo: string;
  page: number;
}
