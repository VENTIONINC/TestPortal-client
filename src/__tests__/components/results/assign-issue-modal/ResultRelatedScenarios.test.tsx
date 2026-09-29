// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  trigger: vi.fn(),
  queryResult: undefined as unknown,
}));

vi.mock('@/redux/apis/generatedResultDetailApi', () => ({
  useLazyGetResultDetailWithRelatedScenariosQuery: () => [mocks.trigger, mocks.queryResult],
}));

import { ChakraProvider } from '@/components/ui';
import { ResultRelatedScenarios } from '@/components/results/assign-issue-modal/ResultRelatedScenarios';

const firstScenario = {
  id: 'scenario-1',
  title: 'Checkout flow',
  details: 'Verify checkout totals.',
  contentMd: '# Checkout\n\n**Current steps**',
};

const secondScenario = {
  id: 'scenario-2',
  title: 'Refund flow',
  details: null,
  contentMd: 'Refund content',
};

const makeQueryResult = (overrides: Record<string, unknown> = {}) => ({
  originalArgs: { resultId: 'result-1', projectId: 'project-1' },
  currentData: {
    id: 'result-1',
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
    mocks.queryResult = makeQueryResult();
  });

  afterEach(() => cleanup());

  it('shows linked titles in backend order and opens read-only Markdown in the pane', async () => {
    const user = userEvent.setup();
    renderScenarios();

    const titles = screen.getAllByRole('button').map((button) => button.textContent);
    expect(titles).toEqual(['Checkout flow', 'Refund flow']);

    await user.click(screen.getByRole('button', { name: 'Checkout flow' }));
    expect(screen.getByRole('heading', { name: 'Checkout flow' })).toBeInTheDocument();
    expect(screen.getByText('Verify checkout totals.')).toBeInTheDocument();
    expect(screen.getByText('Current steps')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back to Test Scenarios' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Checkout flow' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Back to Test Scenarios' }));
    await user.click(screen.getByRole('button', { name: 'Refund flow' }));
    expect(screen.getByRole('heading', { name: 'Refund flow' })).toBeInTheDocument();
    expect(screen.getByText('Refund content')).toBeInTheDocument();
    expect(screen.queryByText('No details')).not.toBeInTheDocument();
  });

  it('shows a successful no-links state only for an empty array', () => {
    mocks.queryResult = makeQueryResult({ currentData: { id: 'result-1', relatedTestScenarios: [] } });

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
    expect(screen.queryByText('Checkout flow')).not.toBeInTheDocument();
  });

  it('keeps old Result and project responses out of the view after either scope changes', async () => {
    const oldResponse = { id: 'result-1', relatedTestScenarios: [firstScenario] };
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
      currentData: { id: 'result-2', relatedTestScenarios: [{ ...secondScenario, title: 'Current Result scenario' }] },
      data: oldResponse,
    });
    rerender(
      <ChakraProvider>
        <ResultRelatedScenarios resultId="result-2" projectId="project-2" isActive />
      </ChakraProvider>,
    );
    expect(screen.queryByText('Current Result scenario')).not.toBeInTheDocument();
    expect(screen.queryByText('Checkout flow')).not.toBeInTheDocument();
    await waitFor(() => expect(mocks.trigger).toHaveBeenLastCalledWith({ resultId: 'result-2', projectId: 'project-2' }));

    mocks.queryResult = makeQueryResult({
      originalArgs: { resultId: 'result-2', projectId: 'project-2' },
      currentData: { id: 'result-2', relatedTestScenarios: [{ ...secondScenario, title: 'Current Project scenario' }] },
      data: oldResponse,
    });
    rerender(
      <ChakraProvider>
        <ResultRelatedScenarios resultId="result-2" projectId="project-2" isActive />
      </ChakraProvider>,
    );
    expect(screen.getByRole('button', { name: 'Current Project scenario' })).toBeInTheDocument();
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
});
