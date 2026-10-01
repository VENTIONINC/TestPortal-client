// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useState, type ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  trigger: vi.fn(),
  queryResult: {
    originalArgs: { resultId: 'result-1', projectId: 'project-1' },
    currentData: { id: 'result-1', relatedTestScenarios: [] },
    error: undefined,
    isError: false,
    isFetching: false,
    isLoading: false,
    isUninitialized: false,
    refetch: vi.fn(),
  },
}));

vi.mock('@/redux/apis/generatedResultDetailApi', () => ({
  useLazyGetResultDetailWithRelatedScenariosQuery: () => [mocks.trigger, mocks.queryResult],
}));

vi.mock('@/components/ui', async (importOriginal) => {
  const ui = await importOriginal<typeof import('@/components/ui')>();
  return {
    ...ui,
    Tooltip: ({ children }: { children: ReactNode }) => children,
  };
});

import { ContextTabs } from '@/components/results/assign-issue-modal/AssignIssueModal';
import { ChakraProvider } from '@/components/ui';

const context = {
  error: {
    id: 'error-1',
    type: 'Error',
    message: 'Failure message',
    callLog: [],
    callStack: [],
    logs: [],
    sourceSnippet: null,
    generatedTestCase: null,
    location: 'checkout.spec.ts:1',
  },
  result: { id: 'result-1' },
  assignments: { confirmed: null, suggestions: [] },
};

const ModalEvidenceHarness = () => {
  const [issueName, setIssueName] = useState('Draft issue');

  return (
    <ChakraProvider>
      <input
        aria-label="Unsaved issue name"
        value={issueName}
        onChange={(event) => setIssueName(event.target.value)}
      />
      <ContextTabs context={context as never} projectId="project-1" />
    </ChakraProvider>
  );
};

describe('AssignIssueModal evidence tabs', () => {
  it('keeps Test Scenarios available without optional evidence and preserves issue edits while switching tabs', async () => {
    const user = userEvent.setup();
    render(<ModalEvidenceHarness />);

    const issueName = screen.getByRole('textbox', { name: 'Unsaved issue name' });
    await user.clear(issueName);
    await user.type(issueName, 'Unsaved issue draft');

    expect(screen.getByRole('tab', { name: 'Test Scenarios' })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Logs' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Test Scenarios' }));
    expect(await screen.findByText('No Test Scenarios are linked to this Result’s Spec.')).toBeInTheDocument();
    await waitFor(() => expect(mocks.trigger).toHaveBeenCalledTimes(1));
    expect(mocks.trigger).toHaveBeenLastCalledWith({ resultId: 'result-1', projectId: 'project-1' });

    await user.click(screen.getByRole('tab', { name: 'Error' }));
    expect(screen.getByText('Failure message')).toBeInTheDocument();
    expect(issueName).toHaveValue('Unsaved issue draft');

    await user.click(screen.getByRole('tab', { name: 'Test Scenarios' }));
    await waitFor(() => expect(mocks.trigger).toHaveBeenCalledTimes(2));
  });

  it('places Test Scenarios immediately below Logs in the evidence rail', () => {
    const contextWithEvidence = {
      ...context,
    error: {
      ...context.error,
        logs: ['log line'],
    },
    };

    render(
      <ChakraProvider>
        <ContextTabs context={contextWithEvidence as never} projectId="project-1" />
      </ChakraProvider>,
    );

    expect(screen.getAllByRole('tab').map((tab) => tab.getAttribute('aria-label'))).toEqual([
      'Error',
      'Logs',
      'Test Scenarios',
    ]);
  });
});
