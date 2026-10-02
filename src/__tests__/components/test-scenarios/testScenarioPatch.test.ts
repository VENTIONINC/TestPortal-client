// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import {
  getTestScenarioCreatePayload,
  getTestScenarioPatchPayload,
  getTestScenarioStepAppendPayload,
  getTestScenarioStepPatchPayload,
  serializeInitialSteps,
} from '@/components/test-scenarios/utils';

const persisted = {
  title: 'Checkout',
  details: 'Existing details',
  objective: 'Complete checkout',
  preconditions: 'Signed in',
  testData: null,
  expectedResult: 'Order exists',
  notes: null,
};

describe('Test Scenario structured payload helpers', () => {
  it('returns only normalized changed structured fields', () => {
    expect(
      getTestScenarioPatchPayload(
        { ...persisted, title: '  Checkout v2  ', details: '  Updated\n  details  ', objective: 'Complete checkout' },
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

    expect(getTestScenarioCreatePayload('project-1', { ...persisted, details: '  ', notes: 'Keep note' }, steps)).toEqual({
      projectId: 'project-1',
      title: 'Checkout',
      objective: 'Complete checkout',
      preconditions: 'Signed in',
      expectedResult: 'Order exists',
      notes: 'Keep note',
      steps: [
        { action: 'Open checkout', expectedResult: 'Form is shown' },
        { action: 'Submit' },
      ],
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
      getTestScenarioStepPatchPayload({ action: 'Open', expectedResult: 'Ready' }, { action: 'Open', expectedResult: 'Ready' }),
    ).toBeNull();
  });
});
