// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type {
  CreateTestScenarioRequest,
  CreateTestScenarioStep,
  TestScenario,
  UpdateTestScenarioRequest,
  UpdateTestScenarioStepRequest,
} from '@/redux/apis/generatedApi';
import { testScenarioAuthoringSchema } from '@/schemas';

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
  return [...selectedIds, scenarioId];
};

export interface ScenarioOperationReport {
  succeededIds: string[];
  failedIds: string[];
  unattemptedIds: string[];
  uncertainIds: string[];
  errorMessage?: string;
}

const getScenarioOperationErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object') {
    if ('message' in error && typeof error.message === 'string') return error.message;
    if (
      'data' in error &&
      error.data &&
      typeof error.data === 'object' &&
      'message' in error.data &&
      typeof error.data.message === 'string'
    )
      return error.data.message;
    if ('status' in error) return `Request failed (${String(error.status)}).`;
  }
  return String(error);
};

const uniqueChunks = (ids: string[], size: number) => {
  const uniqueIds = [...new Set(ids)];
  const chunks: string[][] = [];
  for (let index = 0; index < uniqueIds.length; index += size) chunks.push(uniqueIds.slice(index, index + size));
  return chunks;
};

export const executeScenarioOperation = async (
  ids: string[],
  operation: (ids: string[]) => Promise<unknown>,
  chunkSize = 100,
): Promise<ScenarioOperationReport> => {
  if (!Number.isInteger(chunkSize) || chunkSize < 1 || chunkSize > 100)
    throw new Error('Scenario operation chunk size must be between 1 and 100.');
  const chunks = uniqueChunks(ids, chunkSize);
  const report: ScenarioOperationReport = { succeededIds: [], failedIds: [], unattemptedIds: [], uncertainIds: [] };
  for (const [index, chunk] of chunks.entries()) {
    try {
      await operation(chunk);
      report.succeededIds.push(...chunk);
    } catch (error) {
      const status = error && typeof error === 'object' && 'status' in error ? Number(error.status) : NaN;
      if (status >= 400 && status < 500) report.failedIds.push(...chunk);
      else report.uncertainIds.push(...chunk);
      report.unattemptedIds.push(...chunks.slice(index + 1).flat());
      report.errorMessage = getScenarioOperationErrorMessage(error);
      break;
    }
  }
  return report;
};

const metadataSchema = testScenarioAuthoringSchema.pick({ priority: true, relatedIssueUrl: true });
const validateMetadata = (values: TestScenarioEditableValues) =>
  metadataSchema.parse({
    priority: values.priority ?? '',
    relatedIssueUrl: values.relatedIssueUrl ?? '',
  });

export const getTestScenarioCreatePayload = (
  projectId: string,
  values: TestScenarioEditableValues,
  steps: TestScenarioInitialStepDraft[] = [],
  folderId?: string | null,
): CreateTestScenarioRequest => {
  validateMetadata(values);
  const payload: CreateTestScenarioRequest = {
    projectId,
    title: normalizeScenarioText(values.title),
    ...(folderId !== undefined ? { folderId } : {}),
  };

  for (const field of TEST_SCENARIO_EDITABLE_FIELDS) {
    if (field === 'title') continue;
    const value = normalizeScenarioText(values[field]);
    if (field === 'priority') {
      if (values.priority) payload.priority = values.priority;
    } else if (value) payload[field] = value;
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
  validateMetadata(values);
  const payload: UpdateTestScenarioRequest = {};

  for (const field of TEST_SCENARIO_EDITABLE_FIELDS) {
    if (values[field] === undefined) continue;
    const value = normalizeScenarioText(values[field]);
    const savedValue = normalizeScenarioText(persisted[field]);

    if (value === savedValue) continue;
    if (field === 'title') {
      payload.title = value;
    } else if (field === 'priority') {
      payload.priority = values.priority || null;
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
