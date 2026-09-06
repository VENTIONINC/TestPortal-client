// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { TestScenario, UpdateTestScenarioRequest } from '@/redux/apis/generatedApi';

export type TestScenarioEditableValues = Pick<TestScenario, 'title' | 'contentMd'> & {
  details?: string | null;
};

/**
 * Builds the smallest valid PATCH body from editable values and the last persisted response.
 * Markdown is compared and returned byte-for-byte; details are compared after outer whitespace normalization.
 */
export const getTestScenarioPatchPayload = (
  values: TestScenarioEditableValues,
  persisted: TestScenarioEditableValues,
): UpdateTestScenarioRequest | null => {
  const payload: { title?: string; contentMd?: string; details?: string | null } = {};

  if (values.title !== persisted.title) {
    payload.title = values.title;
  }

  if (values.contentMd !== persisted.contentMd) {
    payload.contentMd = values.contentMd;
  }

  const details = values.details?.trim() ?? '';
  const persistedDetails = persisted.details?.trim() ?? '';

  if (details !== persistedDetails) {
    payload.details = details || null;
  }

  return Object.keys(payload).length > 0 ? (payload as UpdateTestScenarioRequest) : null;
};

export const getTestScenarioUpdatePayload = getTestScenarioPatchPayload;
