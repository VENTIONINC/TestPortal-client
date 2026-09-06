// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TestScenarioDetailContainer } from '@/components/test-scenarios/containers/TestScenarioDetailContainer';
import { ChakraProvider } from '@/components/ui';
import { useTestScenarioContextMenu } from '@/components/test-scenarios/hooks/useTestScenarioContextMenu';
import { useGetApiV2TestScenariosByScenarioIdQuery } from '@/redux/apis/generatedApi';

const navigate = vi.fn();
const refetch = vi.fn();
const contextMenu = vi.fn();

const persistedScenario = {
  id: 'scenario-1',
  projectId: 'project-1',
  createdById: 'user-1',
  title: 'Checkout flow',
  contentMd: '# Checkout flow\n\nExact source\n',
  details: 'Scenario details',
  createdAt: '2026-09-01T10:00:00.000Z',
  updatedAt: '2026-09-02T11:00:00.000Z',
};

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();

  return { ...actual, useNavigate: () => navigate };
});
vi.mock('@/components/test-scenarios/hooks/useTestScenarioContextMenu', () => ({
  useTestScenarioContextMenu: vi.fn(),
}));
vi.mock('@/redux/apis/generatedApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/redux/apis/generatedApi')>();

  return {
    ...actual,
    useGetApiV2TestScenariosByScenarioIdQuery: vi.fn(),
  };
});

const mockedGetScenario = vi.mocked(useGetApiV2TestScenariosByScenarioIdQuery);
const mockedContextMenu = vi.mocked(useTestScenarioContextMenu);

const renderContainer = () =>
  render(
    <ChakraProvider>
      <MemoryRouter>
        <TestScenarioDetailContainer projectId="project-1" scenarioId="scenario-1" />
      </MemoryRouter>
    </ChakraProvider>,
  );

describe('TestScenarioDetailContainer', () => {
  beforeEach(() => {
    navigate.mockReset();
    refetch.mockReset();
    contextMenu.mockReset();
    mockedContextMenu.mockReturnValue(contextMenu);
    mockedGetScenario.mockReturnValue({
      data: persistedScenario,
      currentData: persistedScenario,
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch,
    } as never);
  });

  it('requests both identities and renders persisted Markdown details', () => {
    renderContainer();

    expect(mockedGetScenario).toHaveBeenCalledWith({ scenarioId: 'scenario-1', projectId: 'project-1' });
    expect(screen.getAllByRole('heading', { name: 'Checkout flow' })).not.toHaveLength(0);
    expect(screen.getByTestId('markdown-preview')).toHaveTextContent('Exact source');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save Test Scenario' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit Scenario' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete Scenario' })).not.toBeInTheDocument();
    expect(screen.queryByText('Read-only Test Scenario details')).not.toBeInTheDocument();
    expect(screen.queryByText('Markdown Preview')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Return to Test Scenarios' })).toHaveAttribute('href', '/test-scenarios');
  });

  it('uses the shared scenario context menu without making the details content editable', async () => {
    const user = userEvent.setup();

    renderContainer();
    await user.click(screen.getByRole('button', { name: 'Actions for Checkout flow' }));

    expect(mockedContextMenu).toHaveBeenCalledWith('project-1');
    expect(contextMenu).toHaveBeenCalledWith(expect.anything(), persistedScenario);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save Test Scenario' })).not.toBeInTheDocument();
  });

  it('renders a loading state before current-scope data arrives', () => {
    mockedGetScenario.mockReturnValue({
      data: undefined,
      currentData: undefined,
      isLoading: true,
      isFetching: true,
      error: undefined,
      refetch,
    } as never);

    renderContainer();

    expect(screen.getByText('Loading Test Scenario...')).toBeInTheDocument();
    expect(screen.queryByTestId('markdown-preview')).not.toBeInTheDocument();
  });

  it('renders the unavailable state and returns to the catalog for a 404', async () => {
    const user = userEvent.setup();
    mockedGetScenario.mockReturnValue({
      data: undefined,
      currentData: undefined,
      isLoading: false,
      isFetching: false,
      error: { status: 404 },
      refetch,
    } as never);

    renderContainer();

    expect(screen.getByText('Test Scenario unavailable')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Return to Test Scenarios' }));
    expect(navigate).toHaveBeenCalledWith('/test-scenarios');
  });

  it('renders a retryable error state for other request failures', async () => {
    const user = userEvent.setup();
    mockedGetScenario.mockReturnValue({
      data: undefined,
      currentData: undefined,
      isLoading: false,
      isFetching: false,
      error: { status: 503 },
      refetch,
    } as never);

    renderContainer();

    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load Test Scenario');
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
