// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

export type TestStatus = 'passed' | 'failed' | 'skipped' | 'timedOut' | 'runs';

export interface TestStat {
  label: string;
  value: number;
  status: TestStatus;
  icon: React.ElementType;
  color: string;
}

export interface TestDescriptionSummary {
  totalRuns: number;
  failures: number;
  passRate: number;
  passRateTrend?: number;
}

export interface TestDescriptionProps {
  summary?: TestDescriptionSummary;
  isGrid?: boolean;
}
