// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { mapTopIssues } from '@/components/results/components/TopSection/helpers';
import { ResultCategory } from '@/types';

describe('mapTopIssues', () => {
  it('preserves issue id and category summary for identity and mixed-state rendering', () => {
    const summary = {
      displayCategory: ResultCategory.Bug,
      isMixed: true,
      distribution: { bug: 2, infra: 1, performance: 0, script: 0, other: 0 },
      uncategorizedCount: 1,
    };

    expect(mapTopIssues([{ id: 'issue-7', title: 'Duplicate title', count: 4, category: ResultCategory.Bug, categorySummary: summary }])).toEqual([
      { id: 'issue-7', title: 'Duplicate title', count: 4, category: ResultCategory.Bug, categorySummary: summary },
    ]);
  });

  it('keeps mixed and uncategorized distribution details without replacing the persisted category', () => {
    const mixed = {
      displayCategory: ResultCategory.Performance,
      isMixed: true,
      distribution: { bug: 1, infra: 1, performance: 0, script: 0, other: 0 },
      uncategorizedCount: 0,
    };
    const uncategorized = {
      displayCategory: ResultCategory.Other,
      isMixed: false,
      distribution: { bug: 0, infra: 0, performance: 0, script: 0, other: 0 },
      uncategorizedCount: 3,
    };

    expect(
      mapTopIssues([
        { id: 'tie', title: 'Tie', count: 2, category: ResultCategory.Performance, categorySummary: mixed },
        { id: 'none', title: 'None', count: 3, category: ResultCategory.Other, categorySummary: uncategorized },
      ]).map(({ id, category, categorySummary }) => ({ id, category, categorySummary })),
    ).toEqual([
      { id: 'tie', category: ResultCategory.Performance, categorySummary: mixed },
      { id: 'none', category: ResultCategory.Other, categorySummary: uncategorized },
    ]);
  });
});
