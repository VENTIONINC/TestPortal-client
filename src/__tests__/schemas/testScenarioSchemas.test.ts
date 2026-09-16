// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { testScenarioAuthoringSchema, testScenarioStepSchema } from '@/schemas';

describe('Test Scenario authoring schema', () => {
  it.each(['', '   ', '\n\t'])('rejects a blank title: %j', (title) => {
    const result = testScenarioAuthoringSchema.safeParse({ title });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.flatten().fieldErrors.title).toContain('Title is required');
  });

  it('accepts all structured fields, trims their outer whitespace and preserves interior line breaks', () => {
    const result = testScenarioAuthoringSchema.parse({
      title: '  Scenario  ',
      details: '  First line\n  Second line  ',
      objective: '  Make checkout reliable  ',
      preconditions: '  User is signed in\n  Cart has an item  ',
      testData: '  Account: qa@example.com  ',
      expectedResult: '  Order is created  ',
      notes: '  Keep this note  ',
    });

    expect(result).toEqual({
      title: 'Scenario',
      details: 'First line\n  Second line',
      objective: 'Make checkout reliable',
      preconditions: 'User is signed in\n  Cart has an item',
      testData: 'Account: qa@example.com',
      expectedResult: 'Order is created',
      notes: 'Keep this note',
    });
  });

  it.each(['', ' \n\t '])('accepts blank optional fields for normalization by the payload layer: %j', (value) => {
    const result = testScenarioAuthoringSchema.parse({ title: 'Scenario', details: value, objective: value });

    expect(result.details).toBe(value.trim());
    expect(result.objective).toBe(value.trim());
  });

  it('rejects blank step actions and accepts optional multiline expected results', () => {
    const invalid = testScenarioStepSchema.safeParse({ action: ' \n\t ' });
    expect(invalid.success).toBe(false);
    if (!invalid.success) expect(invalid.error.flatten().fieldErrors.action).toContain('Step action is required');

    expect(testScenarioStepSchema.parse({ action: '  Open checkout  ', expectedResult: '  Ready\n  to pay  ' })).toEqual({
      action: 'Open checkout',
      expectedResult: 'Ready\n  to pay',
    });
  });
});
