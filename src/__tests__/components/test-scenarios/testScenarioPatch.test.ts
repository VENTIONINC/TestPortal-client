// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import {
  getTestScenarioCreatePayload,
  getTestScenarioPatchPayload,
  getTestScenarioStepAppendPayload,
  getTestScenarioStepPatchPayload,
  executeScenarioOperation,
  serializeInitialSteps,
  toggleScenarioSelection,
} from '@/components/test-scenarios/utils';

const persisted = {
  title: 'Checkout',
  details: 'Existing details',
  preconditions: 'Signed in',
  testData: null,
};

describe('Test Scenario structured payload helpers', () => {
  it('allows selecting more than one bounded mutation batch', () => {
    const selected = Array.from({ length: 100 }, (_value, index) => `scenario-${index}`);

    expect(toggleScenarioSelection(selected, 'scenario-over-limit')).toHaveLength(101);
    expect(toggleScenarioSelection(selected, 'scenario-0')).toHaveLength(99);
  });

  it('executes 237 unique IDs sequentially as 100/100/37 batches', async () => {
    const ids = [...Array.from({ length: 237 }, (_value, index) => `id-${index}`), 'id-0'];
    const operation = vi.fn(async (_batch: string[]) => { void _batch; });
    const report = await executeScenarioOperation(ids, operation);
    expect(operation.mock.calls.map(([batch]) => batch.length)).toEqual([100, 100, 37]);
    expect(operation.mock.calls.map(([batch]) => batch[0])).toEqual(['id-0', 'id-100', 'id-200']);
    expect(report).toEqual({ succeededIds: ids.slice(0, 237), failedIds: [], unattemptedIds: [], uncertainIds: [] });
  });

  it('stops after a rejected batch and separates failed, uncertain and unattempted IDs', async () => {
    const ids = Array.from({ length: 237 }, (_value, index) => `id-${index}`);
    const knownFailure = vi.fn(async (_batch: string[]) => { void _batch; });
    knownFailure.mockRejectedValueOnce({ status: 409, message: 'Conflict' });
    const failedReport = await executeScenarioOperation(ids, knownFailure);
    expect(failedReport.succeededIds).toEqual([]);
    expect(failedReport.failedIds).toHaveLength(100);
    expect(failedReport.uncertainIds).toEqual([]);
    expect(failedReport.unattemptedIds).toHaveLength(137);
    expect(failedReport.errorMessage).toBe('Conflict');
    const uncertain = vi.fn(async (_batch: string[]) => { void _batch; });
    uncertain.mockRejectedValueOnce({ status: 503, message: 'Unavailable' });
    const uncertainReport = await executeScenarioOperation(ids, uncertain);
    expect(uncertainReport.uncertainIds).toHaveLength(100);
    expect(uncertainReport.failedIds).toEqual([]);
  });
  it('returns only normalized changed structured fields', () => {
    expect(
      getTestScenarioPatchPayload(
        { ...persisted, title: '  Checkout v2  ', details: '  Updated\n  details  ' },
        persisted,
      ),
    ).toEqual({ title: 'Checkout v2', details: 'Updated\n  details' });
  });

  it('sends null when persisted optional text is explicitly cleared', () => {
    expect(getTestScenarioPatchPayload({ ...persisted, details: ' \n\t ' }, persisted)).toEqual({ details: null });
  });

  it('trims a Scenario key on creation and omits a blank key', () => {
    expect(getTestScenarioCreatePayload('project-1', { title: 'Checkout', scenarioKey: '  AUTH Login  ' })).toEqual({
      projectId: 'project-1',
      title: 'Checkout',
      scenarioKey: 'AUTH Login',
    });
    expect(getTestScenarioCreatePayload('project-1', { title: 'Checkout', scenarioKey: ' \t ' })).toEqual({
      projectId: 'project-1',
      title: 'Checkout',
    });
  });

  it('clears a persisted Scenario key to null and omits unchanged keys', () => {
    const persistedWithKey = { ...persisted, scenarioKey: 'AUTH-1' };

    expect(getTestScenarioPatchPayload({ ...persistedWithKey, scenarioKey: '  \t ' }, persistedWithKey)).toEqual({
      scenarioKey: null,
    });
    expect(getTestScenarioPatchPayload({ ...persistedWithKey, scenarioKey: ' AUTH-1 ' }, persistedWithKey)).toBeNull();
  });

  it('treats blank input as a no-op when the saved optional value is already null', () => {
    expect(getTestScenarioPatchPayload({ ...persisted, testData: '  ' }, persisted)).toBeNull();
  });

  it('does not include generated Markdown, hash, version, steps or immutable metadata', () => {
    const payload = getTestScenarioPatchPayload({ ...persisted, title: 'Updated', scenarioKey: 'R1' }, persisted);

    expect(payload).toEqual({ title: 'Updated', scenarioKey: 'R1' });
    expect(payload).not.toHaveProperty('contentMd');
    expect(payload).not.toHaveProperty('steps');
    expect(payload).not.toHaveProperty('id');
  });

  it('omits blank create fields and serializes ordered initial steps without UI keys or positions', () => {
    const steps = [
      { key: 'draft-a', action: '  Open checkout  ', expectedResult: '  Form is shown  ' },
      { key: 'draft-b', action: 'Submit', expectedResult: '  ' },
    ];

    expect(getTestScenarioCreatePayload('project-1', { ...persisted, details: '  ' }, steps)).toEqual({
      projectId: 'project-1',
      title: 'Checkout',
      preconditions: 'Signed in',

      steps: [{ action: 'Open checkout', expectedResult: 'Form is shown' }, { action: 'Submit' }],
    });
    expect(getTestScenarioCreatePayload('project-1', { title: 'Checkout' })).toEqual({
      projectId: 'project-1',
      title: 'Checkout',
    });
    expect(serializeInitialSteps(steps)).toEqual([
      { action: 'Open checkout', expectedResult: 'Form is shown' },
      { action: 'Submit' },
    ]);
  });

  it('creates exact append and partial step PATCH bodies', () => {
    expect(getTestScenarioStepAppendPayload({ action: '  Open  ', expectedResult: '  Ready  ' })).toEqual({
      action: 'Open',
      expectedResult: 'Ready',
    });
    expect(
      getTestScenarioStepPatchPayload(
        { action: '  Open checkout  ', expectedResult: '  ' },
        { action: 'Open', expectedResult: 'Ready' },
      ),
    ).toEqual({ action: 'Open checkout', expectedResult: null });
    expect(
      getTestScenarioStepPatchPayload(
        { action: 'Open', expectedResult: 'Ready' },
        { action: 'Open', expectedResult: 'Ready' },
      ),
    ).toBeNull();
  });
  it('creates trimmed metadata, omits empty metadata and never serializes obsolete fields', () => {
    const values = {
      title: 'Checkout',
      priority: 'high' as const,
      relatedIssueUrl: ' https://example.test/TP-20 ',
      objective: 'obsolete',
      notes: 'obsolete',
      expectedResult: 'obsolete',
    };
    expect(getTestScenarioCreatePayload('project-1', values)).toEqual({
      projectId: 'project-1',
      title: 'Checkout',
      priority: 'high',
      relatedIssueUrl: 'https://example.test/TP-20',
    });
    expect(
      getTestScenarioCreatePayload('project-1', { title: 'Checkout', priority: '', relatedIssueUrl: ' ' }),
    ).toEqual({ projectId: 'project-1', title: 'Checkout' });
  });

  it('preserves omitted metadata, clears explicitly empty metadata and skips unchanged values', () => {
    const saved = { title: 'Checkout', priority: 'high' as const, relatedIssueUrl: 'https://example.test/TP-20' };
    expect(getTestScenarioPatchPayload({ title: 'Checkout' }, saved)).toBeNull();
    expect(getTestScenarioPatchPayload({ ...saved, priority: '', relatedIssueUrl: '' }, saved)).toEqual({
      priority: null,
      relatedIssueUrl: null,
    });
    expect(
      getTestScenarioPatchPayload({ ...saved, relatedIssueUrl: ' https://example.test/TP-20 ' }, saved),
    ).toBeNull();
  });

  it('rejects invalid metadata before constructing requests', () => {
    for (const relatedIssueUrl of [
      '/relative',
      'https:example.test/TP-20',
      'https:/example.test/TP-20',
      'http:example.test/TP-20',
      'http:/example.test/TP-20',
      'javascript:alert(1)',
      'ftp://example.test',
    ]) {
      expect(() => getTestScenarioCreatePayload('project-1', { title: 'Scenario', relatedIssueUrl })).toThrow();
      expect(() =>
        getTestScenarioPatchPayload({ title: 'Scenario', relatedIssueUrl }, { title: 'Scenario' }),
      ).toThrow();
    }
  });
});
