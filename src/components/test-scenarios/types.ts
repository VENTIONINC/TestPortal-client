// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { TestScenario, TestScenarioListResponse } from '@/redux/apis/generatedApi';
export type { TestScenarioSummary } from '@/redux/apis/generatedApi';

export const TEST_SCENARIO_EDITABLE_FIELDS = [
  'title',
  'details',
  'priority',
  'relatedIssueUrl',
  'preconditions',
  'testData',
] as const;

export type TestScenarioEditableField = (typeof TEST_SCENARIO_EDITABLE_FIELDS)[number];

export type TestScenarioEditableValues = Pick<TestScenario, 'title'> &
  Partial<Record<Exclude<TestScenarioEditableField, 'title' | 'priority'>, string | null>> & { scenarioKey?: string | null } & {
    priority?: TestScenario['priority'] | '' | null;
  };

export interface TestScenarioInitialStepDraft {
  key: string;
  id?: string;
  action: string;
  expectedResult: string;
}

export type TestScenarioStep = TestScenario['steps'][number];

export interface TestScenarioPagination {
  page: TestScenarioListResponse['page'];
  limit: TestScenarioListResponse['limit'];
  total: TestScenarioListResponse['total'];
  totalPages: TestScenarioListResponse['totalPages'];
}
