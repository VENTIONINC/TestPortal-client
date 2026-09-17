// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import issuesReducer, { issuesSlice } from '@/redux/slices/issues';

describe('issues filters', () => {
  it('preserves a lowercase persisted category filter with other supported filters', () => {
    const state = issuesReducer(
      undefined,
      issuesSlice.actions.setFilters({ name: 'timeout', category: 'bug' }),
    );

    expect(state.filters.name).toBe('timeout');
    expect(state.filters.category).toBe('bug');
  });
});
