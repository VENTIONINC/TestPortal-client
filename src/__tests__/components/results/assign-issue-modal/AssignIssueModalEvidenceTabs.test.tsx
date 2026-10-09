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
    currentData: { id: 'result-1', spec: { id: 'spec-1' }, relatedTestScenarios: [] },
    error: undefined,
    isError: false,
    isFetching: false,
    isLoading: false,
    isUninitialized: false,
    refetch: vi.fn(),
  },
}));

vi.mock('@/redux/apis/resultDetailApi', () => ({
  useLazyGetResultDetailWithRelatedScenariosQuery: () => [mocks.trigger, mocks.queryResult],
}));

vi.mock('@/redux/apis/scenarioManagementApi', () => ({
  useGetApiV2TestScenariosForResultLinkManagementQuery: () => ({ currentData: { scenarios: [], total: 0, totalPages: 0, page: 1 }, isLoading: false, isFetching: false, isError: false, refetch: vi.fn() }),
}));

vi.mock('@/redux/apis/extendedApi', () => ({
  usePostApiV2TestScenariosByScenarioIdSpecLinksMutation: () => [vi.fn()],
  useDeleteApiV2TestScenariosByScenarioIdSpecLinksAndSpecIdMutation: () => [vi.fn()],
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
  const [description, setDescription] = useState('Draft description');
  const [category, setCategory] = useState('bug');

  return (
    <ChakraProvider>
      <input
        aria-label="Unsaved issue name"
        value={issueName}
        onChange={(event) => setIssueName(event.target.value)}
      />
      <textarea aria-label="Unsaved issue description" value={description} onChange={(event) => setDescription(event.target.value)} />
      <select aria-label="Unsaved issue category" value={category} onChange={(event) => setCategory(event.target.value)}>
        <option value="bug">Bug</option>
        <option value="infra">Environment</option>
      </select>
      <ContextTabs context={context as never} projectId="project-1" />
    </ChakraProvider>
  );
};

describe('AssignIssueModal evidence tabs', () => {
  it('preserves issue name, description and category across picker entry, search, cancellation and evidence-tab changes', async () => {
    const user = userEvent.setup();
    render(<ModalEvidenceHarness />);

    const issueName = screen.getByRole('textbox', { name: 'Unsaved issue name' });
    await user.clear(issueName);
    await user.type(issueName, 'Unsaved issue draft');
    const description = screen.getByRole('textbox', { name: 'Unsaved issue description' });
    await user.clear(description);
    await user.type(description, 'Unsaved description draft');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Unsaved issue category' }), 'infra');

    expect(screen.getByRole('tab', { name: 'Test Scenarios' })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Logs' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Test Scenarios' }));
    expect(await screen.findByText('No Test Scenarios are linked to this Result’s Spec.')).toBeInTheDocument();
    await waitFor(() => expect(mocks.trigger).toHaveBeenCalledTimes(1));
    expect(mocks.trigger).toHaveBeenLastCalledWith({ resultId: 'result-1', projectId: 'project-1' });

    await user.click(screen.getByRole('button', { name: 'Link Test Scenario' }));
    await user.type(screen.getByRole('textbox', { name: 'Search title or scenario key' }), 'checkout');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    await user.click(screen.getByRole('button', { name: 'Back to Test Scenarios' }));

    await user.click(screen.getByRole('tab', { name: 'Error' }));
    expect(screen.getByText('Failure message')).toBeInTheDocument();
    expect(issueName).toHaveValue('Unsaved issue draft');
    expect(description).toHaveValue('Unsaved description draft');
    expect(screen.getByRole('combobox', { name: 'Unsaved issue category' })).toHaveValue('infra');

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
