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

    expect(mapTopIssues([{ id: 'issue-7', title: 'Duplicate title', count: 4, categorySummary: summary }])).toEqual([
      { id: 'issue-7', title: 'Duplicate title', count: 4, categorySummary: summary },
    ]);
  });

  it('keeps tied and uncategorized summaries instead of coercing them to other', () => {
    const tied = {
      displayCategory: null,
      isMixed: true,
      distribution: { bug: 1, infra: 1, performance: 0, script: 0, other: 0 },
      uncategorizedCount: 0,
    };
    const uncategorized = {
      displayCategory: null,
      isMixed: false,
      distribution: { bug: 0, infra: 0, performance: 0, script: 0, other: 0 },
      uncategorizedCount: 3,
    };

    expect(
      mapTopIssues([
        { id: 'tie', title: 'Tie', count: 2, categorySummary: tied },
        { id: 'none', title: 'None', count: 3, categorySummary: uncategorized },
      ]).map(({ id, categorySummary }) => ({ id, categorySummary })),
    ).toEqual([
      { id: 'tie', categorySummary: tied },
      { id: 'none', categorySummary: uncategorized },
    ]);
  });
});
