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
      scenarioKey: '  AUTH LOGIN  ',
      title: '  Scenario  ',
      details: '  First line\n  Second line  ',
      priority: 'high',
      relatedIssueUrl: ' https://example.test/TP-20 ',
      preconditions: '  User is signed in\n  Cart has an item  ',
      testData: '  Account: qa@example.com  ',

    });

    expect(result).toEqual({
      scenarioKey: 'AUTH LOGIN',
      title: 'Scenario',
      details: 'First line\n  Second line',
      priority: 'high',
      relatedIssueUrl: 'https://example.test/TP-20',
      preconditions: 'User is signed in\n  Cart has an item',
      testData: 'Account: qa@example.com',

    });
  });

  it.each(['', ' \n\t '])('accepts blank optional fields for normalization by the payload layer: %j', (value) => {
    const result = testScenarioAuthoringSchema.parse({ title: 'Scenario', details: value, testData: value });

    expect(result.details).toBe(value.trim());
    expect(result.testData).toBe(value.trim());
  });

  it('accepts duplicate keys and keys at the normalized 100-character boundary', () => {
    const key = `  ${'K'.repeat(100)}  `;

    expect(testScenarioAuthoringSchema.parse({ title: 'Scenario', scenarioKey: key }).scenarioKey).toBe('K'.repeat(100));
    expect(testScenarioAuthoringSchema.safeParse({ title: 'Scenario', scenarioKey: 'AUTH-1' }).success).toBe(true);
    expect(testScenarioAuthoringSchema.safeParse({ title: 'Another scenario', scenarioKey: 'AUTH-1' }).success).toBe(true);
    expect(testScenarioAuthoringSchema.safeParse({ title: 'Scenario', scenarioKey: 'K'.repeat(101) }).success).toBe(false);
  });

  it('rejects line breaks in Scenario keys', () => {
    const result = testScenarioAuthoringSchema.safeParse({ title: 'Scenario', scenarioKey: 'AUTH\nLOGIN' });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.flatten().fieldErrors.scenarioKey).toContain('Scenario key must be a single line');
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
  it('accepts optional priority and trimmed HTTP(S) issue URLs', () => {
    expect(testScenarioAuthoringSchema.parse({ title: 'Scenario', priority: 'low', relatedIssueUrl: ' https://example.test/TP-20 ' })).toMatchObject({ priority: 'low', relatedIssueUrl: 'https://example.test/TP-20' });
    expect(testScenarioAuthoringSchema.safeParse({ title: 'Scenario', priority: '', relatedIssueUrl: '' }).success).toBe(true);
  });
  it.each(['/relative', 'https:example.test/TP-20', 'https:/example.test/TP-20', 'http:example.test/TP-20', 'http:/example.test/TP-20', 'javascript:alert(1)', 'ftp://example.test', 'not a url'])('rejects invalid Related issue URL %s', (relatedIssueUrl) => {
    const result = testScenarioAuthoringSchema.safeParse({ title: 'Scenario', relatedIssueUrl });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.flatten().fieldErrors.relatedIssueUrl).toBeDefined();
  });
  it('rejects unsupported priority', () => {
    expect(testScenarioAuthoringSchema.safeParse({ title: 'Scenario', priority: 'urgent' }).success).toBe(false);
  });

});
