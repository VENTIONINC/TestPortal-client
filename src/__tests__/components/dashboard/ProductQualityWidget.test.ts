// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createElement, type ReactNode } from 'react';

import {
  useGetApiV2IssuesWithStatsQuery,
  useGetApiV2ProjectsByProjectIdDashboardQuery,
} from '@/redux/apis/generatedApi';
import { ProductQualityWidget } from '@/components/dashboard/components/ProductQualityWidget';
import { calculateIWQS } from '@/components/dashboard/components/ProductQualityWidget';

vi.mock('@/redux/apis/generatedApi', () => ({
  useGetApiV2IssuesWithStatsQuery: vi.fn(),
  useGetApiV2ProjectsByProjectIdDashboardQuery: vi.fn(),
}));

vi.mock('@/hooks', () => ({
  useSelectedProject: vi.fn(() => ({ project: undefined, selectedProjectId: 'project-1' })),
}));

vi.mock('@chakra-ui/react', () => {
  const element = () => ({ children }: { children?: ReactNode }) => createElement('div', null, children);

  return {
    Box: element(),
    Circle: element(),
    Flex: element(),
    Icon: element(),
    Text: element(),
  };
});

vi.mock('@/components/ui', () => ({
  Badge: ({ children }: { children?: ReactNode }) => createElement('span', null, children),
}));
vi.mock('@/components/ui/progress', () => ({
  ProgressBar: ({ children }: { children?: ReactNode }) => createElement('div', null, children),
  ProgressRoot: ({ children }: { children?: ReactNode }) => createElement('div', null, children),
}));
vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ children }: { children?: ReactNode }) => createElement('div', null, children),
}));
vi.mock('react-icons/fi', () => ({ FiAlertTriangle: 'svg', FiMinusSquare: 'svg' }));

const mockedIssuesQuery = vi.mocked(useGetApiV2IssuesWithStatsQuery);
const mockedDashboardQuery = vi.mocked(useGetApiV2ProjectsByProjectIdDashboardQuery);

const issue = (
  distribution: Record<'bug' | 'infra' | 'performance' | 'script' | 'other', number>,
  uncategorizedCount: number,
  impactedTestsCount = 10,
  occurrenceCount = 10,
) =>
  ({
    id: 'issue-1',
    name: 'Checkout failure',
    category: 'bug',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
    categorySummary: { displayCategory: 'bug', isMixed: true, distribution, uncategorizedCount },
    statistics: {
      impactedTestsCount,
      occurrenceCount,
      firstOccurrence: null,
      lastOccurrence: null,
      timeDistribution: [],
    },
  }) as NonNullable<Parameters<typeof calculateIWQS>[0]>[number];

describe('ProductQualityWidget', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-07T12:00:00Z'));

    mockedIssuesQuery
      .mockReturnValueOnce({ data: { issues: [] }, isLoading: false } as never)
      .mockReturnValueOnce({
        data: { issues: [issue({ bug: 1, infra: 0, performance: 0, script: 0, other: 0 }, 0, 1, 1)] },
        isLoading: false,
      } as never);
    mockedDashboardQuery.mockReturnValue({
      data: {
        history: [
          { date: '2026-08-04', metrics: { total: 1, passed: 0, failed: 2 } },
          { date: '2026-08-05', metrics: { total: 0, passed: 0, failed: 0 } },
          { date: '2026-08-06', metrics: { total: 1, passed: 1, failed: 0 } },
          { date: '2026-08-07', metrics: { total: 0, passed: 0, failed: 0 } },
        ],
      },
      isLoading: false,
    } as never);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('shows the comparison when the previous period has runs even below the current linking threshold', () => {
    render(createElement(ProductQualityWidget, { period: '2' }));

    expect(screen.getByText('vs prev. period')).toBeInTheDocument();
  });
});

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
