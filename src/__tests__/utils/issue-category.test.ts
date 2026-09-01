// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { ResultCategory } from '@/types';
import { getIssueCategorySummaryPresentation } from '@/utils/issue-category';

const distribution = (values: Partial<Record<ResultCategory, number>> = {}) => ({
  bug: 0,
  infra: 0,
  performance: 0,
  script: 0,
  other: 0,
  ...values,
});

describe('getIssueCategorySummaryPresentation', () => {
  it.each([
    ['unanimous category', ResultCategory.Bug, false, 'Bug', false],
    ['dominant mixed category', ResultCategory.Infra, true, 'Environment', true],
    ['persisted category with tied results', ResultCategory.Performance, true, 'Performance', true],
    ['persisted category with no categorized results', ResultCategory.Other, false, 'Other', false],
    ['explicit other', ResultCategory.Other, false, 'Other', false],
  ] as const)('represents %s', (_case, displayCategory, isMixed, label, showMixed) => {
    expect(
      getIssueCategorySummaryPresentation({
        displayCategory,
        isMixed,
        distribution: distribution({ bug: 2, infra: 1 }),
        uncategorizedCount: 3,
      }),
    ).toMatchObject({ label, showMixed });
  });

  it('exposes the complete distribution and uncategorized count for details UI', () => {
    expect(
      getIssueCategorySummaryPresentation({
        displayCategory: ResultCategory.Bug,
        isMixed: true,
        distribution: distribution({ bug: 2, infra: 1, other: 1 }),
        uncategorizedCount: 4,
      }).details,
    ).toEqual([
      { label: 'Bug', count: 2 },
      { label: 'Environment', count: 1 },
      { label: 'Performance', count: 0 },
      { label: 'Script', count: 0 },
      { label: 'Other', count: 1 },
      { label: 'Uncategorized', count: 4 },
    ]);
  });
});
