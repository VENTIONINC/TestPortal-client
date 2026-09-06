// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { testScenarioAuthoringSchema } from '@/schemas';

describe('Test Scenario authoring schema', () => {
  it.each([
    ['', '# Scenario'],
    ['   ', '# Scenario'],
    ['\n\t', '# Scenario'],
  ])('rejects a blank title: %j', (title, contentMd) => {
    const result = testScenarioAuthoringSchema.safeParse({ title, contentMd });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.flatten().fieldErrors.title).toContain('Title is required');
  });

  it('rejects an empty Markdown string', () => {
    const result = testScenarioAuthoringSchema.safeParse({ title: 'Scenario', contentMd: '' });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.flatten().fieldErrors.contentMd).toContain('Markdown content is required');
  });

  it('accepts whitespace-only Markdown without transforming it', () => {
    const contentMd = ' \n\t  \n';
    const result = testScenarioAuthoringSchema.safeParse({ title: '  Scenario  ', contentMd });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Scenario');
      expect(result.data.contentMd).toBe(contentMd);
    }
  });

  it('accepts optional details, trims only its outer whitespace, and preserves internal whitespace', () => {
    const details = '  First line\n  Second line  ';
    const result = testScenarioAuthoringSchema.parse({ title: 'Scenario', details, contentMd: '# Scenario' });

    expect(result.details).toBe('First line\n  Second line');
  });

  it.each(['', ' \n\t '])('accepts blank optional details as an empty value: %j', (details) => {
    const result = testScenarioAuthoringSchema.parse({ title: 'Scenario', details, contentMd: '# Scenario' });

    expect(result.details).toBe('');
  });

  it('preserves Unicode, indentation, and trailing line breaks', () => {
    const contentMd = '# Проверка ✓\n\n```ts\n  const value = "  exact  ";\n```\n\n';
    const result = testScenarioAuthoringSchema.parse({ title: '  Unicode сценарий  ', contentMd });

    expect(result).toEqual({ title: 'Unicode сценарий', contentMd });
  });
});
