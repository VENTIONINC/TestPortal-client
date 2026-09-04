// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { TestScenario, UpdateTestScenarioRequest } from '@/redux/apis/generatedApi';

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

export type TestScenarioEditableValues = Pick<TestScenario, 'title' | 'contentMd'>;

/**
 * Builds the smallest valid PATCH body from editable values and the last persisted response.
 * Markdown is compared and returned byte-for-byte; no normalization belongs at this boundary.
 */
export const getTestScenarioPatchPayload = (
  values: TestScenarioEditableValues,
  persisted: TestScenarioEditableValues,
): UpdateTestScenarioRequest | null => {
  const payload: { title?: string; contentMd?: string } = {};

  if (values.title !== persisted.title) {
    payload.title = values.title;
  }

  if (values.contentMd !== persisted.contentMd) {
    payload.contentMd = values.contentMd;
  }

  return Object.keys(payload).length > 0 ? (payload as UpdateTestScenarioRequest) : null;
};

export const getTestScenarioUpdatePayload = getTestScenarioPatchPayload;
