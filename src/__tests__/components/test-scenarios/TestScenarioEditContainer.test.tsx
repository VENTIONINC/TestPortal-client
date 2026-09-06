// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TestScenarioEditContainer } from '@/components/test-scenarios/containers/TestScenarioEditContainer';
import { ChakraProvider, toaster } from '@/components/ui';
import {
  useGetApiV2TestScenariosByScenarioIdQuery,
  usePatchApiV2TestScenariosByScenarioIdMutation,
} from '@/redux/apis/generatedApi';

const navigate = vi.fn();
const updateScenario = vi.fn();
const getScenario = vi.fn();
const refetch = vi.fn();

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
vi.mock('@/redux/apis/generatedApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/redux/apis/generatedApi')>();

  return {
    ...actual,
    useGetApiV2TestScenariosByScenarioIdQuery: vi.fn(),
    usePatchApiV2TestScenariosByScenarioIdMutation: vi.fn(),
  };
});

const mockedGetScenario = vi.mocked(useGetApiV2TestScenariosByScenarioIdQuery);
const mockedUpdateMutation = vi.mocked(usePatchApiV2TestScenariosByScenarioIdMutation);

const renderContainer = () =>
  render(
    <ChakraProvider>
      <TestScenarioEditContainer projectId="project-1" scenarioId="scenario-1" />
    </ChakraProvider>,
  );

describe('TestScenarioEditContainer', () => {
  beforeEach(() => {
    navigate.mockReset();
    getScenario.mockReset();
    updateScenario.mockReset();
    refetch.mockReset();
    vi.spyOn(toaster, 'create').mockClear();
    mockedGetScenario.mockReturnValue({
      data: persistedScenario,
      currentData: persistedScenario,
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch,
    } as never);
    mockedUpdateMutation.mockReturnValue([updateScenario, { isLoading: false }] as never);
  });

  it('requests both identities and initializes the editable form from persisted data', () => {
    renderContainer();

    expect(mockedGetScenario).toHaveBeenCalledWith({ scenarioId: 'scenario-1', projectId: 'project-1' });
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Checkout flow');
    expect(screen.getByRole('textbox', { name: 'Details' })).toHaveValue(persistedScenario.details);
    expect(screen.getByRole('textbox', { name: 'Markdown' })).toHaveValue(persistedScenario.contentMd);
  });

  it('returns to the catalog from the heading control', async () => {
    const user = userEvent.setup();

    renderContainer();
    await user.click(screen.getByRole('button', { name: 'Return to Test Scenarios' }));

    expect(navigate).toHaveBeenCalledWith('/test-scenarios');
  });

  it.each([
    {
      name: 'title only',
      change: () =>
        fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), { target: { value: 'Updated title' } }),
      expected: { title: 'Updated title' },
    },
    {
      name: 'Markdown only',
      change: () =>
        fireEvent.change(screen.getByRole('textbox', { name: 'Markdown' }), { target: { value: '  changed  \n' } }),
      expected: { contentMd: '  changed  \n' },
    },
    {
      name: 'both fields',
      change: () => {
        fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), { target: { value: 'Updated title' } });
        fireEvent.change(screen.getByRole('textbox', { name: 'Markdown' }), { target: { value: 'Updated source' } });
      },
      expected: { title: 'Updated title', contentMd: 'Updated source' },
    },
    {
      name: 'details only',
      change: () =>
        fireEvent.change(screen.getByRole('textbox', { name: 'Details' }), {
          target: { value: '  Updated details  ' },
        }),
      expected: { details: 'Updated details' },
    },
    {
      name: 'all authored fields',
      change: () => {
        fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), { target: { value: 'Updated title' } });
        fireEvent.change(screen.getByRole('textbox', { name: 'Details' }), {
          target: { value: '  Updated details  ' },
        });
        fireEvent.change(screen.getByRole('textbox', { name: 'Markdown' }), {
          target: { value: '  Updated source  \n' },
        });
      },
      expected: { title: 'Updated title', details: 'Updated details', contentMd: '  Updated source  \n' },
    },
    {
      name: 'cleared details',
      change: () => fireEvent.change(screen.getByRole('textbox', { name: 'Details' }), { target: { value: ' \n\t ' } }),
      expected: { details: null },
    },
  ])('sends the exact $name PATCH payload', async ({ change, expected }) => {
    const user = userEvent.setup();
    updateScenario.mockReturnValue({ unwrap: () => Promise.resolve({ ...persistedScenario, ...expected }) });

    renderContainer();
    change();
    await user.click(screen.getByRole('button', { name: 'Save Test Scenario' }));

    await waitFor(() => expect(updateScenario).toHaveBeenCalledTimes(1));
    expect(updateScenario).toHaveBeenCalledWith({
      scenarioId: 'scenario-1',
      projectId: 'project-1',
      updateTestScenarioRequest: expected,
    });
  });

  it('does not call PATCH for a no-op save', async () => {
    const user = userEvent.setup();

    renderContainer();
    await user.click(screen.getByRole('button', { name: 'Save Test Scenario' }));

    expect(updateScenario).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('No changes to save.');
  });

  it('initializes null details as blank and treats blank input as an unchanged value', async () => {
    const user = userEvent.setup();
    const nullDetailsScenario = { ...persistedScenario, details: null };
    mockedGetScenario.mockReturnValue({
      data: nullDetailsScenario,
      currentData: nullDetailsScenario,
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch,
    } as never);

    renderContainer();

    expect(screen.getByRole('textbox', { name: 'Details' })).toHaveValue('');
    await user.click(screen.getByRole('button', { name: 'Save Test Scenario' }));

    expect(updateScenario).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('No changes to save.');
  });

  it('resets the form baseline from the successful persisted response', async () => {
    const user = userEvent.setup();
    const response = { ...persistedScenario, title: 'Normalized title', details: 'Persisted response details' };
    updateScenario.mockReturnValue({ unwrap: () => Promise.resolve(response) });

    renderContainer();
    fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), { target: { value: '  Normalized title  ' } });
    await user.click(screen.getByRole('button', { name: 'Save Test Scenario' }));

    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Normalized title'));
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Details' })).toHaveValue('Persisted response details'),
    );
    await user.click(screen.getByRole('button', { name: 'Save Test Scenario' }));

    expect(updateScenario).toHaveBeenCalledTimes(1);
  });

  it('retains unsaved values and exposes a retryable API error', async () => {
    const user = userEvent.setup();
    updateScenario.mockReturnValue({ unwrap: () => Promise.reject({ status: 500, data: { error: 'Save failed' } }) });

    renderContainer();
    const contentMd = '  unsaved source  \n';
    fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), { target: { value: 'Unsaved title' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Details' }), { target: { value: 'Unsaved details' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Markdown' }), { target: { value: contentMd } });
    await user.click(screen.getByRole('button', { name: 'Save Test Scenario' }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Save failed'));
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Unsaved title');
    expect(screen.getByRole('textbox', { name: 'Details' })).toHaveValue('Unsaved details');
    expect(screen.getByRole('textbox', { name: 'Markdown' })).toHaveValue(contentMd);
  });
});
