// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  context: {
    error: {
      id: 'error-1', type: 'AssertionError', message: 'Checkout failed', callLog: [], callStack: [], logs: [],
      sourceSnippet: null, generatedTestCase: null, location: 'checkout.spec.ts:1',
    },
    result: { id: 'result-1', attempt: 1, startTime: '2026-10-01T12:00:00Z', duration: 20 },
    assignments: { confirmed: null, suggestions: [] },
  },
  scenario: {
    id: 'scenario-1', title: 'Checkout scenario', scenarioKey: 'PAY-1', details: 'Check the payment flow.', contentMd: '# Checkout steps',
  },
  linkedScenario: {
    id: 'scenario-2', title: 'Payment retry scenario', scenarioKey: 'PAY-2', details: 'Retry a failed payment.', contentMd: '# Payment retry steps',
  },
  coverage: undefined as unknown,
  linkMutation: vi.fn(),
  unlinkMutation: vi.fn(),
  detailTrigger: vi.fn(() => ({ unwrap: async () => ({}) })),
}));

vi.mock('@/components/results/assign-issue-modal/useAssignIssueModal', async () => {
  const React = await import('react');
  return {
    useAssignIssueModal: () => {
      const [form, setForm] = React.useState({ name: 'Draft issue', description: 'Draft description', category: 'bug' as const });
      const noop = () => undefined;
      return {
        state: { status: 'unassigned', form, closed: false, requestId: 1 },
        context: mocks.context,
        contextQuery: { isError: false, refetch: vi.fn() },
        actions: {
          updateForm: (patch: Partial<typeof form>) => setForm((current) => ({ ...current, ...patch })),
          close: noop,
          selectExistingIssue: noop,
          retrySimilarity: noop,
          categorise: noop,
          createAndAssign: noop,
          rejectSuggestion: noop,
          confirmSuggestion: noop,
          editConfirmedIssue: noop,
          updateConfirmedIssue: noop,
          unassign: noop,
          polishField: noop,
          retryPolish: noop,
          undoPolish: noop,
        },
        polish: { name: { status: 'idle' }, description: { status: 'idle' } },
        similarityRequest: { isLoading: false },
        categorisationRequest: { isLoading: false },
        isMutating: false,
        operationError: null,
        canFindMatchingIssues: true,
      };
    },
  };
});

vi.mock('@/redux/apis/generatedApi', () => ({
  useGetApiV2IssuesQuery: () => ({ data: { issues: [] }, isLoading: false }),
}));

vi.mock('@/redux/apis/resultDetailApi', async () => {
  const React = await import('react');
  return {
    useLazyGetResultDetailWithRelatedScenariosQuery: () => {
    const [args, setArgs] = React.useState<{ resultId: string; projectId: string }>();
    const [currentData, setCurrentData] = React.useState(mocks.coverage);
    const trigger = React.useCallback((nextArgs: { resultId: string; projectId: string }) => {
      setArgs(nextArgs);
      return {
        unwrap: async () => {
          setCurrentData(mocks.coverage);
          return mocks.coverage;
        },
      };
    }, []);
    return [trigger, { originalArgs: args, currentData, isFetching: false, isLoading: false, isUninitialized: !args }];
    },
  };
});

vi.mock('@/redux/apis/scenarioManagementApi', () => ({
  useGetApiV2TestScenariosForResultLinkManagementQuery: () => ({ currentData: { scenarios: [mocks.linkedScenario], total: 1, page: 1, limit: 10, totalPages: 1 }, isFetching: false, isLoading: false, isError: false, refetch: () => ({ unwrap: async () => ({}) }) }),
}));

vi.mock('@/redux/apis/extendedApi', () => ({
  usePostApiV2TestScenariosByScenarioIdSpecLinksMutation: () => [mocks.linkMutation],
  useDeleteApiV2TestScenariosByScenarioIdSpecLinksAndSpecIdMutation: () => [mocks.unlinkMutation],
}));

import { AssignIssueModal } from '@/components/results/assign-issue-modal/AssignIssueModal';
import { ChakraProvider } from '@/components/ui';

describe('AssignIssueModal scenario management', () => {
  it('keeps the real issue draft and category through search, inspection, cancellation and evidence tabs', async () => {
    const user = userEvent.setup();
    mocks.coverage = { id: 'result-1', spec: { id: 'spec-1' }, relatedTestScenarios: [mocks.scenario] };
    mocks.linkMutation.mockImplementation(() => ({
      unwrap: async () => {
        mocks.coverage = { id: 'result-1', spec: { id: 'spec-1' }, relatedTestScenarios: [mocks.scenario, mocks.linkedScenario] };
        return {};
      },
    }));
    mocks.unlinkMutation.mockImplementation(() => ({
      unwrap: async () => {
        mocks.coverage = { id: 'result-1', spec: { id: 'spec-1' }, relatedTestScenarios: [mocks.scenario] };
        return {};
      },
    }));
    Object.defineProperty(HTMLElement.prototype, 'focus', {
      configurable: true,
      writable: true,
      value: HTMLElement.prototype.focus,
    });
    render(
      <ChakraProvider>
        <AssignIssueModal resultErrorId="error-1" projectId="project-1" mode="assign" closeDialog={vi.fn()} closeAllDialogs={vi.fn()} />
      </ChakraProvider>,
    );

    const issueName = screen.getByRole('textbox', { name: 'Issue name' });
    const description = screen.getByRole('textbox', { name: 'Description' });
    await user.clear(issueName);
    await user.type(issueName, 'Edited issue draft');
    await user.clear(description);
    await user.type(description, 'Edited description draft');
    fireEvent.click(screen.getByRole('radio', { name: 'Environment' }));

    await user.click(screen.getByRole('tab', { name: 'Test Scenarios' }));
    await user.click(await screen.findByRole('button', { name: 'Link Test Scenario' }));
    await user.type(screen.getByRole('textbox', { name: 'Search title or scenario key' }), 'PAY-1');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    await user.click(screen.getByRole('button', { name: 'Back to Test Scenarios' }));
    await user.click(screen.getByRole('button', { name: 'Link Test Scenario' }));
    await user.click(screen.getByRole('button', { name: /PAY-2 · Payment retry scenario/ }));
    await user.click(screen.getByRole('button', { name: 'Link selected scenario' }));
    expect(await screen.findByRole('button', { name: 'PAY-2 · Payment retry scenario' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Unlink PAY-2 · Payment retry scenario' }));
    await user.click(screen.getByRole('button', { name: 'Unlink' }));
    expect(await screen.findByRole('button', { name: 'PAY-1 · Checkout scenario' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'PAY-1 · Checkout scenario' }));
    expect(screen.getByRole('heading', { name: 'Checkout scenario' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Back to Test Scenarios' }));
    await user.click(screen.getByRole('button', { name: 'Unlink PAY-1 · Checkout scenario' }));
    await user.click(screen.getAllByRole('button', { name: 'Cancel' })[0]);
    await user.click(screen.getByRole('tab', { name: 'Error' }));

    expect(screen.getByRole('textbox', { name: 'Issue name' })).toHaveValue('Edited issue draft');
    expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue('Edited description draft');
    expect(screen.getByRole('radio', { name: 'Environment' })).toBeChecked();
  });
});
