// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { TestScenario } from '@/redux/apis/generatedApi';

import type { TestScenarioSummary } from './types';

export const mapTestScenarioToSummary = (
  scenario: Pick<TestScenario, 'id' | 'title' | 'createdAt' | 'updatedAt'>,
): TestScenarioSummary => {
  const { id, title, createdAt, updatedAt } = scenario;

  return { id, title, createdAt, updatedAt };
};

export const mapTestScenariosToSummaries = (
  scenarios: Pick<TestScenario, 'id' | 'title' | 'createdAt' | 'updatedAt'>[],
): TestScenarioSummary[] => scenarios.map(mapTestScenarioToSummary);

