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
});
