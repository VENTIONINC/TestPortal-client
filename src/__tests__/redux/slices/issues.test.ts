// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import issuesReducer, { issuesSlice } from '@/redux/slices/issues';

describe('issues filters', () => {
  it('ignores a legacy persisted category filter while applying supported filters', () => {
    const state = issuesReducer(
      undefined,
      issuesSlice.actions.setFilters({ name: 'timeout', category: 'Bug' } as never),
    );

    expect(state.filters.name).toBe('timeout');
    expect(state.filters).not.toHaveProperty('category');
  });
});
