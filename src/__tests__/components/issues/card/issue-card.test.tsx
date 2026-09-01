// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ChakraProvider } from '@/components/ui';
import { IssueCard } from '@/components/issues/card/issue-card';
import type { IssueWithStats } from '@/types';

vi.mock('@/components/drawers', () => ({
  useEditIssueDrawer: () => vi.fn(),
}));

vi.mock('@/contexts/FilterContext', () => ({
  useFilterContext: () => ({ isTransitioning: false }),
}));

vi.mock('usehooks-ts', () => ({
  useIntersectionObserver: () => ({ isIntersecting: false, ref: vi.fn() }),
}));

const issue = {
  id: 'issue-1',
  name: 'Checkout failure',
  category: 'bug',
  description: 'The persisted issue is a bug.',
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
  categorySummary: {
    displayCategory: 'infra',
    isMixed: true,
    distribution: { bug: 1, infra: 2, performance: 0, script: 0, other: 0 },
    uncategorizedCount: 1,
  },
  statistics: {
    occurrenceCount: 3,
    firstOccurrence: '2026-08-01T00:00:00.000Z',
    lastOccurrence: '2026-08-02T00:00:00.000Z',
    impactedTestsCount: 2,
    timeDistribution: [],
  },
} as IssueWithStats;

describe('IssueCard', () => {
  it('uses the persisted Issue category as primary and adds Mixed from the linked-result summary', () => {
    render(
      <ChakraProvider>
        <IssueCard issue={issue} />
      </ChakraProvider>,
    );

    expect(screen.getByText('Bug')).toBeInTheDocument();
    expect(screen.getByText('Mixed')).toBeInTheDocument();
    expect(screen.getByLabelText('Category summary: Bug, Mixed')).toBeInTheDocument();
  });
});
