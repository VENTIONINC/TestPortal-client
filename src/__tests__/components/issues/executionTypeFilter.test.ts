// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { filterConfig } from '@/components/issues/configs/filter';
import { buildIssuesQueryParams } from '@/components/issues/list/issues-list';
import { initialFilters } from '@/redux/slices/issues';

describe('Issues execution type filter', () => {
  it('starts at All and uses an enabled select control', () => {
    const executionSection = filterConfig.find(({ title }) => title === 'Execution filters');
    const typeField = executionSection?.fields.find(({ name }) => name === 'type');

    expect(initialFilters.type).toBe('all');
    expect(typeField).toMatchObject({ type: 'select' });
    expect(typeField && 'disabled' in typeField ? typeField.disabled : undefined).not.toBe(true);
  });

  it('omits type for All and preserves an exact selected type', () => {
    const common = {
      projectId: 'project-1',
      page: '1',
      category: '',
      name: '',
      statFrom: '',
      statTo: '',
    };

    expect(buildIssuesQueryParams({ ...common, type: 'all' })).toMatchObject({ type: undefined });
    expect(buildIssuesQueryParams({ ...common, type: 'Custom Release' })).toMatchObject({
      type: 'Custom Release',
    });
  });

  it('offers persisted issue categories and serializes the exact lowercase selection', () => {
    const issueSection = filterConfig.find(({ title }) => title === 'Issue filters');
    const categoryField = issueSection?.fields.find(({ name }) => name === 'category');
    const common = {
      projectId: 'project-1',
      page: '1',
      name: '',
      type: 'all',
      statFrom: '',
      statTo: '',
    };

    expect(initialFilters.category).toBe('all');
    expect(categoryField).toMatchObject({
      type: 'select',
      options: expect.arrayContaining([
        { value: 'all', label: 'All' },
        { value: 'bug', label: 'Bug' },
        { value: 'infra', label: 'Environment' },
      ]),
    });
    expect(buildIssuesQueryParams({ ...common, category: 'all' })).toMatchObject({ category: undefined });
    expect(buildIssuesQueryParams({ ...common, category: 'performance' })).toMatchObject({ category: 'performance' });
    expect(buildIssuesQueryParams({ ...common, category: 'Bug' })).toMatchObject({ category: undefined });
  });
});
