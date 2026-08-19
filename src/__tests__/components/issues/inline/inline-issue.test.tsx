// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChakraProvider } from '@/components/ui';
import { InlineIssue } from '@/components/issues/inline/inline-issue';
import { ResultCategory, ResultError } from '@/types';

const openAssignIssueModal = vi.fn();

vi.mock('@/components/results/assign-issue-modal', () => ({
  useAssignIssueModalDialog: () => openAssignIssueModal,
}));

vi.mock('@/redux/apis/extendedApi', () => ({
  useConfirmAssumptionMutation: () => [vi.fn()],
}));

const resultError: ResultError = {
  id: 'error-1',
  createdAt: '2026-08-05T00:00:00.000Z',
  updatedAt: '2026-08-05T00:00:00.000Z',
  type: 'Error',
  message: 'Expected true to be false',
  callLog: [],
  callStack: [],
  testAssertion: '',
  expectedPattern: '',
  receivedString: '',
  location: 'test.spec.ts:1',
  resultId: 'result-1',
  assumptions: [
    {
      id: 'assumption-1',
      createdAt: '2026-08-05T00:00:00.000Z',
      updatedAt: '2026-08-05T00:00:00.000Z',
      isConfirmed: true,
      score: 1,
      madeBy: 'user',
      issueId: 'issue-1',
      resultErrorId: 'error-1',
      issue: {
        id: 'issue-1',
        createdAt: '2026-08-05T00:00:00.000Z',
        updatedAt: '2026-08-05T00:00:00.000Z',
        name: 'Login regression',
        description: 'Login request fails',
        portal: null,
        service: null,
        ticket: null,
      },
    },
  ],
};

describe('InlineIssue', () => {
  beforeEach(() => vi.clearAllMocks());

  it('presents a linked issue with the containing result category', () => {
    render(
      <ChakraProvider>
        <InlineIssue resultError={resultError} projectId="project-1" category={ResultCategory.Bug} />
      </ChakraProvider>,
    );

    expect(screen.getByLabelText('Category: Bug')).toBeInTheDocument();
  });

  it('does not present a default category when the result is uncategorized', () => {
    render(
      <ChakraProvider>
        <InlineIssue resultError={resultError} projectId="project-1" />
      </ChakraProvider>,
    );

    expect(screen.getByText('[Confirmed]: Login regression')).toBeInTheDocument();
    expect(screen.queryByLabelText(/^Category:/)).not.toBeInTheDocument();
  });

  it('opens confirmed pills in edit mode', async () => {
    const user = userEvent.setup();
    render(
      <ChakraProvider>
        <InlineIssue resultError={resultError} projectId="project-1" />
      </ChakraProvider>,
    );

    await user.click(screen.getByText('[Confirmed]: Login regression'));
    expect(openAssignIssueModal).toHaveBeenCalledWith(resultError, 'confirmed');
  });

  it('opens the add control in assignment mode', async () => {
    const user = userEvent.setup();
    render(
      <ChakraProvider>
        <InlineIssue resultError={{ ...resultError, assumptions: [] }} projectId="project-1" />
      </ChakraProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Assign issue' }));
    expect(openAssignIssueModal).toHaveBeenCalledWith({ ...resultError, assumptions: [] }, 'assign');
  });
});
