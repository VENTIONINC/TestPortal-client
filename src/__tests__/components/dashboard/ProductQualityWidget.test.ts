// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { calculateIWQS } from '@/components/dashboard/components/ProductQualityWidget';

const issue = (
  distribution: Record<'bug' | 'infra' | 'performance' | 'script' | 'other', number>,
  uncategorizedCount: number,
  impactedTestsCount = 10,
  occurrenceCount = 10,
) =>
  ({
    categorySummary: { displayCategory: null, isMixed: true, distribution, uncategorizedCount },
    statistics: { impactedTestsCount, occurrenceCount },
  }) as NonNullable<Parameters<typeof calculateIWQS>[0]>[number];

describe('calculateIWQS', () => {
  it('weights a mixed category distribution instead of its display category', () => {
    const result = calculateIWQS(
      [issue({ bug: 1, infra: 1, performance: 0, script: 0, other: 0 }, 0)],
      undefined,
    );

    expect(result).toEqual({ weightedSum: 9, totalLinkedFailures: 10, score: 10 });
  });

  it('uses the configured infra weight', () => {
    const result = calculateIWQS(
      [issue({ bug: 0, infra: 2, performance: 0, script: 0, other: 0 }, 0)],
      { bug: 150, infra: 40, performance: 100, script: 20, other: 10 },
    );

    expect(result.weightedSum).toBe(4);
  });

  it('does not assign the other weight to uncategorized results', () => {
    const result = calculateIWQS(
      [issue({ bug: 1, infra: 0, performance: 0, script: 0, other: 0 }, 1)],
      { bug: 100, infra: 30, performance: 100, script: 20, other: 100 },
    );

    expect(result.weightedSum).toBe(5);
  });

  it('keeps explicit other categorized results weighted', () => {
    const result = calculateIWQS(
      [issue({ bug: 0, infra: 0, performance: 0, script: 0, other: 2 }, 0)],
      { bug: 150, infra: 30, performance: 100, script: 20, other: 25 },
    );

    expect(result.weightedSum).toBe(2.5);
  });
});
