// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  trigger: vi.fn(),
  catalogRequest: vi.fn(),
  catalogQueryResult: { currentData: undefined as unknown, error: undefined as unknown, isError: false, isFetching: false, isLoading: false, refetch: vi.fn() },
  linkScenario: vi.fn(),
  unlinkScenario: vi.fn(),
  queryResult: undefined as unknown,
}));

vi.mock('@/redux/apis/resultDetailApi', () => ({
  useLazyGetResultDetailWithRelatedScenariosQuery: () => [mocks.trigger, mocks.queryResult],
}));

vi.mock('@/redux/apis/scenarioManagementApi', () => ({
  useGetApiV2TestScenariosForResultLinkManagementQuery: (arg: unknown, options: unknown) => {
    mocks.catalogRequest(arg, options);
    return mocks.catalogQueryResult;
  },
}));

vi.mock('@/redux/apis/extendedApi', () => ({
  usePostApiV2TestScenariosByScenarioIdSpecLinksMutation: () => [mocks.linkScenario],
  useDeleteApiV2TestScenariosByScenarioIdSpecLinksAndSpecIdMutation: () => [mocks.unlinkScenario],
}));

import { ChakraProvider } from '@/components/ui';
import { ResultRelatedScenarios } from '@/components/results/assign-issue-modal/ResultRelatedScenarios';

const firstScenario = {
  id: 'scenario-1',
  title: 'Checkout flow',
  scenarioKey: 'AUTH-1',
  details: 'Verify checkout totals.',
  contentMd: '# Checkout\n\n**Current steps**',
};

const secondScenario = {
  id: 'scenario-2',
  title: 'Refund flow',
  scenarioKey: null,
  details: null,
  contentMd: 'Refund content',
};

const makeQueryResult = (overrides: Record<string, unknown> = {}) => ({
  originalArgs: { resultId: 'result-1', projectId: 'project-1' },
  currentData: {
    id: 'result-1',
    spec: { id: 'spec-1' },
    relatedTestScenarios: [firstScenario, secondScenario],
  },
  data: undefined,
  error: undefined,
  isError: false,
  isFetching: false,
  isLoading: false,
  isUninitialized: false,
  ...overrides,
});

const renderScenarios = (props: Partial<Parameters<typeof ResultRelatedScenarios>[0]> = {}) =>
  render(
    <ChakraProvider>
      <ResultRelatedScenarios resultId="result-1" projectId="project-1" isActive {...props} />
    </ChakraProvider>,
  );

describe('ResultRelatedScenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.trigger.mockImplementation(() => ({ unwrap: async () => ({ id: 'result-1', spec: { id: 'spec-1' }, relatedTestScenarios: [firstScenario, secondScenario] }) }));
    mocks.linkScenario.mockImplementation(() => ({ unwrap: async () => ({}) }));
    mocks.unlinkScenario.mockImplementation(() => ({ unwrap: async () => ({}) }));
    mocks.catalogRequest.mockImplementation(() => mocks.catalogQueryResult);
    mocks.catalogQueryResult = {
      currentData: { scenarios: [], total: 0, page: 1, limit: 10, totalPages: 0 },
      error: undefined,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(() => ({ unwrap: async () => ({}) })),
    };
    mocks.queryResult = makeQueryResult();
  });

  afterEach(() => cleanup());

  it('shows linked titles in backend order and opens read-only Markdown in the pane', async () => {
    const user = userEvent.setup();
    renderScenarios();

    expect(screen.getByRole('button', { name: 'AUTH-1 · Checkout flow' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'N/A · Refund flow' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Link Test Scenario' })).toBeInTheDocument();
    expect(screen.getByText(/Coverage applies to all past and future Results of this Spec/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'AUTH-1 · Checkout flow' }));
    expect(screen.getByRole('heading', { name: 'Checkout flow' })).toBeInTheDocument();
    expect(screen.getByText('Scenario key: AUTH-1')).toBeInTheDocument();
    expect(screen.getByText('Verify checkout totals.')).toBeInTheDocument();
    expect(screen.getByText('Current steps')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back to Test Scenarios' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Checkout flow' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Back to Test Scenarios' }));
    await user.click(screen.getByRole('button', { name: 'N/A · Refund flow' }));
    expect(screen.getByRole('heading', { name: 'Refund flow' })).toBeInTheDocument();
    expect(screen.getByText('Scenario key: N/A')).toBeInTheDocument();
    expect(screen.getByText('Refund content')).toBeInTheDocument();
    expect(screen.queryByText('No details')).not.toBeInTheDocument();
  });

  it('shows a successful no-links state only for an empty array', () => {
    mocks.queryResult = makeQueryResult({ currentData: { id: 'result-1', spec: { id: 'spec-1' }, relatedTestScenarios: [] } });

    renderScenarios();

    expect(screen.getByText('No Test Scenarios are linked to this Result’s Spec.')).toBeInTheDocument();
  });

  it('shows loading without stale data while the current scope is pending', () => {
    mocks.queryResult = makeQueryResult({
      originalArgs: { resultId: 'result-old', projectId: 'project-old' },
      currentData: undefined,
      data: { id: 'result-old', relatedTestScenarios: [firstScenario] },
      isFetching: true,
      isLoading: true,
    });

    renderScenarios();

    expect(screen.getByText('Loading related Test Scenarios…')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Link Test Scenario' })).not.toBeInTheDocument();
    expect(screen.queryByText('Checkout flow')).not.toBeInTheDocument();
  });

  it('keeps old Result and project responses out of the view after either scope changes', async () => {
    const oldResponse = { id: 'result-1', spec: { id: 'spec-1' }, relatedTestScenarios: [firstScenario] };
    const { rerender } = renderScenarios();

    mocks.queryResult = makeQueryResult({
      originalArgs: { resultId: 'result-1', projectId: 'project-1' },
      currentData: undefined,
      data: oldResponse,
      isFetching: true,
      isLoading: true,
    });
    rerender(
      <ChakraProvider>
        <ResultRelatedScenarios resultId="result-2" projectId="project-1" isActive />
      </ChakraProvider>,
    );
    expect(screen.queryByText('Checkout flow')).not.toBeInTheDocument();
    expect(screen.getByText('Loading related Test Scenarios…')).toBeInTheDocument();
    await waitFor(() => expect(mocks.trigger).toHaveBeenCalledWith({ resultId: 'result-2', projectId: 'project-1' }));

    mocks.queryResult = makeQueryResult({
      originalArgs: { resultId: 'result-2', projectId: 'project-1' },
      currentData: { id: 'result-2', spec: { id: 'spec-2' }, relatedTestScenarios: [{ ...secondScenario, title: 'Current Result scenario' }] },
      data: oldResponse,
    });
    rerender(
      <ChakraProvider>
        <ResultRelatedScenarios resultId="result-2" projectId="project-2" isActive />
      </ChakraProvider>,
    );
    expect(screen.queryByText('Current Result scenario')).not.toBeInTheDocument();
    expect(screen.queryByText('Checkout flow')).not.toBeInTheDocument();
    await waitFor(() =>
      expect(mocks.trigger).toHaveBeenLastCalledWith({ resultId: 'result-2', projectId: 'project-2' }),
    );

    mocks.queryResult = makeQueryResult({
      originalArgs: { resultId: 'result-2', projectId: 'project-2' },
      currentData: { id: 'result-2', spec: { id: 'spec-2' }, relatedTestScenarios: [{ ...secondScenario, title: 'Current Project scenario' }] },
      data: oldResponse,
    });
    rerender(
      <ChakraProvider>
        <ResultRelatedScenarios resultId="result-2" projectId="project-2" isActive />
      </ChakraProvider>,
    );
    expect(screen.getByRole('button', { name: 'N/A · Current Project scenario' })).toBeInTheDocument();
    expect(screen.queryByText('Checkout flow')).not.toBeInTheDocument();
  });

  it('shows request failures with retry instead of treating them as an empty link set', async () => {
    const user = userEvent.setup();
    mocks.queryResult = makeQueryResult({
      originalArgs: { resultId: 'result-2', projectId: 'project-2' },
      currentData: undefined,
      error: { status: 500 },
      isError: true,
    });

    renderScenarios({ resultId: 'result-2', projectId: 'project-2' });

    expect(screen.getByRole('alert')).toHaveTextContent('Couldn’t load related Test Scenarios.');
    expect(screen.queryByText(/No Test Scenarios are linked/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(mocks.trigger).toHaveBeenCalledTimes(2));
    expect(mocks.trigger).toHaveBeenLastCalledWith({ resultId: 'result-2', projectId: 'project-2' });
  });

  it('shows an unavailable Result state for a project-scoped 404', () => {
    mocks.queryResult = makeQueryResult({ currentData: undefined, error: { status: 404 }, isError: true });

    renderScenarios();

    expect(screen.getByText('This Result is unavailable in the selected project.')).toBeInTheDocument();
    expect(screen.queryByText('Checkout flow')).not.toBeInTheDocument();
  });

  it('searches the server catalog with trimmed title/key text and retains the query for pagination', async () => {
    const user = userEvent.setup();
    const candidate = { id: 'scenario-3', title: 'Payment retry', scenarioKey: null, details: 'A nullable key.' };
    mocks.catalogQueryResult = {
      currentData: { scenarios: [candidate], total: 12, page: 1, limit: 10, totalPages: 2 },
      error: undefined,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(() => ({ unwrap: async () => ({}) })),
    };
    renderScenarios();

    await user.click(screen.getByRole('button', { name: 'Link Test Scenario' }));
    expect(screen.getByText('N/A · Payment retry')).toBeInTheDocument();
    expect(mocks.catalogRequest).toHaveBeenLastCalledWith(
      { projectId: 'project-1', page: 1, limit: 10 },
      { skip: false },
    );
    await user.type(screen.getByRole('textbox', { name: 'Search title or scenario key' }), '  PAY-2  ');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(mocks.catalogRequest).toHaveBeenLastCalledWith(
      { projectId: 'project-1', page: 1, limit: 10, search: 'PAY-2' },
      { skip: false },
    );
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(mocks.catalogRequest).toHaveBeenLastCalledWith(
      { projectId: 'project-1', page: 2, limit: 10, search: 'PAY-2' },
      { skip: false },
    );
  });

  it('disables already-linked scenarios and submits a selected link with the Result Spec UUID', async () => {
    const user = userEvent.setup();
    const candidate = { id: 'scenario-3', title: 'Payment retry', scenarioKey: 'PAY-2', details: null };
    mocks.catalogQueryResult = {
      currentData: { scenarios: [{ id: 'scenario-1', title: 'Checkout flow', scenarioKey: 'AUTH-1', details: null }, candidate], total: 2, page: 1, limit: 10, totalPages: 1 },
      error: undefined,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(() => ({ unwrap: async () => ({}) })),
    };
    const linkedScenario = { id: 'scenario-3', title: 'Payment retry', scenarioKey: 'PAY-2', details: null, contentMd: '# Current steps' };
    mocks.trigger
      .mockImplementationOnce(() => ({ unwrap: async () => ({}) }))
      .mockImplementationOnce(() => {
        mocks.queryResult = makeQueryResult({ currentData: { id: 'result-1', spec: { id: 'spec-1' }, relatedTestScenarios: [firstScenario, secondScenario, linkedScenario] } });
        return { unwrap: async () => ({ relatedTestScenarios: [firstScenario, secondScenario, linkedScenario] }) };
      });
    renderScenarios();
    await user.click(screen.getByRole('button', { name: 'Link Test Scenario' }));
    expect(screen.getByRole('button', { name: /AUTH-1 · Checkout flow, Already linked/ })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /PAY-2 · Payment retry/ }));
    await user.click(screen.getByRole('button', { name: 'Link selected scenario' }));

    await waitFor(() => expect(mocks.linkScenario).toHaveBeenCalledWith({
      scenarioId: 'scenario-3',
      projectId: 'project-1',
      testScenarioSpecLinkBody: { specId: 'spec-1' },
    }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'PAY-2 · Payment retry' })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'PAY-2 · Payment retry' }));
    expect(screen.getByRole('heading', { name: 'Payment retry' })).toBeInTheDocument();
    expect(screen.getByText('Current steps')).toBeInTheDocument();
  });

  it('sends only one link write when submission is triggered twice while pending', async () => {
    const user = userEvent.setup();
    let resolveLink: (() => void) | undefined;
    mocks.catalogQueryResult = {
      currentData: { scenarios: [{ id: 'scenario-3', title: 'Payment retry', scenarioKey: 'PAY-2', details: null }], total: 1, page: 1, limit: 10, totalPages: 1 },
      error: undefined,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(() => ({ unwrap: async () => ({}) })),
    };
    mocks.linkScenario.mockImplementationOnce(() => ({ unwrap: () => new Promise<void>((resolve) => { resolveLink = resolve; }) }));
    renderScenarios();
    await user.click(screen.getByRole('button', { name: 'Link Test Scenario' }));
    await user.click(screen.getByRole('button', { name: /PAY-2 · Payment retry/ }));
    const submit = screen.getByRole('button', { name: 'Link selected scenario' });
    fireEvent.click(submit);
    fireEvent.click(submit);
    expect(mocks.linkScenario).toHaveBeenCalledTimes(1);
    resolveLink?.();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Link Test Scenario' })).toBeInTheDocument());
  });

  it('cancels unlink confirmation without writing and restores focus to the invoking action', async () => {
    const user = userEvent.setup();
    renderScenarios();
    const invokedUnlink = screen.getByRole('button', { name: 'Unlink N/A · Refund flow' });
    await user.click(invokedUnlink);
    expect(screen.getByText(/all past and future Results of this Spec/)).toBeInTheDocument();
    expect(screen.getByText(/scenario, Spec, execution history and issues will be preserved/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mocks.unlinkScenario).not.toHaveBeenCalled();
    await waitFor(() => expect(document.activeElement).toHaveAccessibleName('Unlink N/A · Refund flow'));
  });

  it('restores focus to Link Test Scenario when the picker is cancelled', async () => {
    const user = userEvent.setup();
    renderScenarios();
    await user.click(screen.getByRole('button', { name: 'Link Test Scenario' }));
    await user.click(screen.getByRole('button', { name: 'Back to Test Scenarios' }));
    await waitFor(() => expect(document.activeElement).toHaveAccessibleName('Link Test Scenario'));
  });

  it('distinguishes an empty project catalog from an empty search result', async () => {
    const user = userEvent.setup();
    mocks.catalogQueryResult = {
      currentData: { scenarios: [], total: 0, page: 1, limit: 10, totalPages: 0 },
      error: undefined,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(() => ({ unwrap: async () => ({}) })),
    };
    renderScenarios();
    await user.click(screen.getByRole('button', { name: 'Link Test Scenario' }));
    expect(screen.getByText('This project has no Test Scenarios yet.')).toBeInTheDocument();
    expect(screen.queryByText('No Test Scenarios match this search.')).not.toBeInTheDocument();
  });

  it('distinguishes catalog failures, empty search results and an empty later page', async () => {
    const user = userEvent.setup();
    mocks.catalogQueryResult = {
      currentData: undefined,
      error: { status: 503 },
      isError: true,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(() => ({ unwrap: async () => ({}) })),
    };
    const { rerender } = renderScenarios();
    await user.click(screen.getByRole('button', { name: 'Link Test Scenario' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Couldn’t load Test Scenarios.');
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(mocks.catalogQueryResult.refetch).toHaveBeenCalledTimes(1);

    mocks.catalogQueryResult = {
      currentData: { scenarios: [], total: 0, page: 1, limit: 10, totalPages: 0 },
      error: undefined,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(() => ({ unwrap: async () => ({}) })),
    };
    rerender(<ChakraProvider><ResultRelatedScenarios resultId="result-1" projectId="project-1" isActive /></ChakraProvider>);
    await user.type(screen.getByRole('textbox', { name: 'Search title or scenario key' }), 'missing');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(screen.getByText('No Test Scenarios match this search.')).toBeInTheDocument();

    mocks.catalogQueryResult = {
      currentData: { scenarios: [], total: 11, page: 2, limit: 10, totalPages: 2 },
      error: undefined,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(() => ({ unwrap: async () => ({}) })),
    };
    rerender(<ChakraProvider><ResultRelatedScenarios resultId="result-1" projectId="project-1" isActive /></ChakraProvider>);
    await waitFor(() => expect(screen.getByText('There are no Test Scenarios on this page.')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Return to page 1' }));
    expect(mocks.catalogRequest).toHaveBeenLastCalledWith(
      { projectId: 'project-1', page: 1, limit: 10, search: 'missing' },
      { skip: false },
    );
  });

  it('keeps picker context after a 409 and explains the existing link without success feedback', async () => {
    const user = userEvent.setup();
    const candidate = { id: 'scenario-3', title: 'Payment retry', scenarioKey: 'PAY-2', details: null };
    mocks.catalogQueryResult = {
      currentData: { scenarios: [candidate], total: 1, page: 1, limit: 10, totalPages: 1 },
      error: undefined,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(() => ({ unwrap: async () => ({}) })),
    };
    mocks.linkScenario.mockImplementationOnce(() => ({ unwrap: async () => { throw { status: 409 }; } }));
    mocks.trigger
      .mockImplementationOnce(() => ({ unwrap: async () => ({}) }))
      .mockImplementationOnce(() => {
        mocks.queryResult = makeQueryResult({ currentData: { id: 'result-1', spec: { id: 'spec-1' }, relatedTestScenarios: [firstScenario, secondScenario, candidate] } });
        return { unwrap: async () => ({}) };
      });
    renderScenarios();
    await user.click(screen.getByRole('button', { name: 'Link Test Scenario' }));
    await user.click(screen.getByRole('button', { name: /PAY-2 · Payment retry/ }));
    await user.click(screen.getByRole('button', { name: 'Link selected scenario' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('This scenario is already linked');
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /PAY-2 · Payment retry, Already linked/ })).toBeDisabled();
    expect(screen.queryByText(/was saved/)).not.toBeInTheDocument();
  });

  it('refreshes after an uncertain write before allowing an explicit retry', async () => {
    const user = userEvent.setup();
    mocks.catalogQueryResult = {
      currentData: { scenarios: [{ id: 'scenario-3', title: 'Payment retry', scenarioKey: 'PAY-2', details: null }], total: 1, page: 1, limit: 10, totalPages: 1 },
      error: undefined,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(() => ({ unwrap: async () => ({}) })),
    };
    mocks.linkScenario.mockImplementationOnce(() => ({ unwrap: async () => { throw { status: 'FETCH_ERROR' }; } }));
    renderScenarios();
    await user.click(screen.getByRole('button', { name: 'Link Test Scenario' }));
    await user.click(screen.getByRole('button', { name: /PAY-2 · Payment retry/ }));
    await user.click(screen.getByRole('button', { name: 'Link selected scenario' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Refresh coverage before retrying.');
    expect(screen.getByRole('button', { name: 'Link selected scenario' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Refresh coverage' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Coverage has been refreshed.');
    expect(screen.getByRole('button', { name: 'Link selected scenario' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Link selected scenario' }));
    await waitFor(() => expect(mocks.linkScenario).toHaveBeenCalledTimes(2));
  });

  it('reports saved-but-refresh-failed separately and disables resubmission', async () => {
    const user = userEvent.setup();
    mocks.catalogQueryResult = {
      currentData: { scenarios: [{ id: 'scenario-3', title: 'Payment retry', scenarioKey: 'PAY-2', details: null }], total: 1, page: 1, limit: 10, totalPages: 1 },
      error: undefined,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(() => ({ unwrap: async () => ({}) })),
    };
    mocks.trigger
      .mockImplementationOnce(() => ({ unwrap: async () => ({}) }))
      .mockImplementationOnce(() => ({ unwrap: async () => { throw { status: 503 }; } }));
    renderScenarios();
    await user.click(screen.getByRole('button', { name: 'Link Test Scenario' }));
    await user.click(screen.getByRole('button', { name: /PAY-2 · Payment retry/ }));
    await user.click(screen.getByRole('button', { name: 'Link selected scenario' }));

    expect(await screen.findByRole('status')).toHaveTextContent('The link was saved, but coverage could not be refreshed.');
    expect(screen.getByRole('button', { name: 'Link selected scenario' })).toBeDisabled();
    expect(mocks.linkScenario).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Refresh coverage' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Coverage has been refreshed.');
    expect(screen.getByRole('button', { name: 'Link selected scenario' })).toBeEnabled();
    expect(mocks.linkScenario).toHaveBeenCalledTimes(1);
  });

  it('handles a deleted scenario target without claiming a successful link', async () => {
    const user = userEvent.setup();
    mocks.catalogQueryResult = {
      currentData: { scenarios: [{ id: 'scenario-3', title: 'Payment retry', scenarioKey: 'PAY-2', details: null }], total: 1, page: 1, limit: 10, totalPages: 1 },
      error: undefined,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(() => ({ unwrap: async () => ({}) })),
    };
    mocks.linkScenario.mockImplementationOnce(() => ({ unwrap: async () => { throw { status: 404 }; } }));
    renderScenarios();
    await user.click(screen.getByRole('button', { name: 'Link Test Scenario' }));
    await user.click(screen.getByRole('button', { name: /PAY-2 · Payment retry/ }));
    await user.click(screen.getByRole('button', { name: 'Link selected scenario' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('The scenario or Spec is no longer available.');
    expect(screen.queryByText(/was saved/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('confirms unlink and returns to the refreshed coverage list', async () => {
    const user = userEvent.setup();
    renderScenarios();
    await user.click(screen.getByRole('button', { name: 'Unlink AUTH-1 · Checkout flow' }));
    mocks.queryResult = makeQueryResult({ currentData: { id: 'result-1', spec: { id: 'spec-1' }, relatedTestScenarios: [secondScenario] } });
    await user.click(screen.getByRole('button', { name: 'Unlink' }));

    await waitFor(() => expect(mocks.unlinkScenario).toHaveBeenCalledWith({ scenarioId: 'scenario-1', specId: 'spec-1', projectId: 'project-1' }));
    expect(screen.queryByRole('button', { name: 'AUTH-1 · Checkout flow' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'N/A · Refund flow' })).toBeInTheDocument();
  });

  it('refreshes coverage after an unlink target returns 404', async () => {
    const user = userEvent.setup();
    mocks.unlinkScenario.mockImplementationOnce(() => ({ unwrap: async () => { throw { status: 404 }; } }));
    renderScenarios();
    await user.click(screen.getByRole('button', { name: 'Unlink AUTH-1 · Checkout flow' }));
    await user.click(screen.getByRole('button', { name: 'Unlink' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('The scenario, Spec or link is no longer available.');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Unlink' })).toBeInTheDocument();
  });

  it('does not let a late link response change the new Result context', async () => {
    const user = userEvent.setup();
    let resolveLink: (() => void) | undefined;
    mocks.catalogQueryResult = {
      currentData: { scenarios: [{ id: 'scenario-3', title: 'Payment retry', scenarioKey: 'PAY-2', details: null }], total: 1, page: 1, limit: 10, totalPages: 1 },
      error: undefined,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(() => ({ unwrap: async () => ({}) })),
    };
    mocks.linkScenario.mockImplementationOnce(() => ({ unwrap: () => new Promise<void>((resolve) => { resolveLink = resolve; }) }));
    const { rerender } = renderScenarios();
    await user.click(screen.getByRole('button', { name: 'Link Test Scenario' }));
    await user.click(screen.getByRole('button', { name: /PAY-2 · Payment retry/ }));
    await user.click(screen.getByRole('button', { name: 'Link selected scenario' }));

    mocks.queryResult = makeQueryResult({
      originalArgs: { resultId: 'result-2', projectId: 'project-1' },
      currentData: { id: 'result-2', spec: { id: 'spec-2' }, relatedTestScenarios: [{ ...secondScenario, title: 'New Result coverage' }] },
    });
    rerender(<ChakraProvider><ResultRelatedScenarios resultId="result-2" projectId="project-1" isActive /></ChakraProvider>);
    resolveLink?.();

    expect(await screen.findByRole('button', { name: 'N/A · New Result coverage' })).toBeInTheDocument();
    expect(screen.queryByText(/saved/)).not.toBeInTheDocument();
    expect(screen.queryByText(/could not be refreshed/)).not.toBeInTheDocument();
  });
});
