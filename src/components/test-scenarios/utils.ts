// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type {
  CreateTestScenarioRequest,
  CreateTestScenarioStep,
  TestScenario,
  UpdateTestScenarioRequest,
  UpdateTestScenarioStepRequest,
} from '@/redux/apis/generatedApi';

import {
  TEST_SCENARIO_EDITABLE_FIELDS,
  type TestScenarioEditableValues,
  type TestScenarioInitialStepDraft,
  type TestScenarioStep,
} from './types';

export type {
  TestScenarioEditableField,
  TestScenarioEditableValues,
  TestScenarioInitialStepDraft,
  TestScenarioStep,
} from './types';

export const normalizeScenarioText = (value: string | null | undefined) => value?.trim() ?? '';

export const normalizeOptionalScenarioText = (value: string | null | undefined) => {
  const normalized = normalizeScenarioText(value);
  return normalized || null;
};

interface FolderOptionNode {
  id?: string;
  name?: string;
  children?: FolderOptionNode[];
}

export const flattenScenarioFolders = (folders: FolderOptionNode[]) => {
  const flattened: Array<{ id: string; name: string; depth: number }> = [];
  const visit = (folder: FolderOptionNode, depth: number) => {
    if (!folder.id || !folder.name) return;
    flattened.push({ id: folder.id, name: folder.name, depth });
    folder.children?.forEach((child) => visit(child, depth + 1));
  };
  folders.forEach((folder) => visit(folder, 0));
  return flattened;
};

export const toggleScenarioSelection = (selectedIds: string[], scenarioId: string): string[] => {
  if (selectedIds.includes(scenarioId)) return selectedIds.filter((selectedId) => selectedId !== scenarioId);
  return selectedIds.length < 100 ? [...selectedIds, scenarioId] : selectedIds;
};

export const getTestScenarioCreatePayload = (
  projectId: string,
  values: TestScenarioEditableValues,
  steps: TestScenarioInitialStepDraft[] = [],
  folderId?: string | null,
): CreateTestScenarioRequest => {
  const payload: CreateTestScenarioRequest = {
    projectId,
    title: normalizeScenarioText(values.title),
    ...(folderId !== undefined ? { folderId } : {}),
  };

  for (const field of TEST_SCENARIO_EDITABLE_FIELDS) {
    if (field === 'title') continue;
    const value = normalizeScenarioText(values[field]);
    if (value) payload[field] = value;
  }

  const serializedSteps = serializeInitialSteps(steps);
  if (serializedSteps.length > 0) payload.steps = serializedSteps;

  return payload;
};

/** Builds the smallest valid structured PATCH and never includes generated or immutable fields. */
export const getTestScenarioPatchPayload = (
  values: TestScenarioEditableValues,
  persisted: TestScenarioEditableValues,
): UpdateTestScenarioRequest | null => {
  const payload: UpdateTestScenarioRequest = {};

  for (const field of TEST_SCENARIO_EDITABLE_FIELDS) {
    const value = normalizeScenarioText(values[field]);
    const savedValue = normalizeScenarioText(persisted[field]);

    if (value === savedValue) continue;
    if (field === 'title') {
      payload.title = value;
    } else {
      payload[field] = value || null;
    }
  }

  return Object.keys(payload).length > 0 ? payload : null;
};

export const serializeInitialSteps = (steps: TestScenarioInitialStepDraft[]): CreateTestScenarioStep[] =>
  steps.map(({ action, expectedResult }) => ({
    action: normalizeScenarioText(action),
    ...(normalizeScenarioText(expectedResult) ? { expectedResult: normalizeScenarioText(expectedResult) } : {}),
  }));

export const getTestScenarioStepPatchPayload = (
  values: Pick<TestScenarioStep, 'action' | 'expectedResult'>,
  persisted: Pick<TestScenarioStep, 'action' | 'expectedResult'>,
): UpdateTestScenarioStepRequest | null => {
  const payload: UpdateTestScenarioStepRequest = {};
  const action = normalizeScenarioText(values.action);
  const persistedAction = normalizeScenarioText(persisted.action);
  const expectedResult = normalizeScenarioText(values.expectedResult);
  const persistedExpectedResult = normalizeScenarioText(persisted.expectedResult);

  if (action !== persistedAction) payload.action = action;
  if (expectedResult !== persistedExpectedResult) payload.expectedResult = expectedResult || null;

  return Object.keys(payload).length > 0 ? payload : null;
};

export const getTestScenarioStepAppendPayload = (values: Pick<TestScenarioStep, 'action' | 'expectedResult'>) => ({
  action: normalizeScenarioText(values.action),
  ...(normalizeScenarioText(values.expectedResult)
    ? { expectedResult: normalizeScenarioText(values.expectedResult) }
    : {}),
});

export const getTestScenarioEditableValues = (scenario: TestScenario): TestScenarioEditableValues =>
  TEST_SCENARIO_EDITABLE_FIELDS.reduce(
    (values, field) => ({ ...values, [field]: scenario[field] }),
    {} as TestScenarioEditableValues,
  );

export const getTestScenarioUpdatePayload = getTestScenarioPatchPayload;
