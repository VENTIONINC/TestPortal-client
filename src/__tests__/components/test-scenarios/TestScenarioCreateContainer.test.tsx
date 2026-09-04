// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { TestScenarioCreateContainer } from '@/components/test-scenarios/containers/TestScenarioCreateContainer';
import { ChakraProvider, toaster } from '@/components/ui';
import { usePostApiV2TestScenariosMutation } from '@/redux/apis/generatedApi';

const navigate = vi.fn();
const createScenario = vi.fn();

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();

  return { ...actual, useNavigate: () => navigate };
});
vi.mock('@/redux/apis/generatedApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/redux/apis/generatedApi')>();

  return { ...actual, usePostApiV2TestScenariosMutation: vi.fn() };
});

const mockedCreateMutation = vi.mocked(usePostApiV2TestScenariosMutation);

const renderContainer = () =>
  render(
    <ChakraProvider>
      <TestScenarioCreateContainer projectId="project-1" />
    </ChakraProvider>,
  );

describe('TestScenarioCreateContainer', () => {
  beforeEach(() => {
    navigate.mockReset();
    createScenario.mockReset();
    vi.spyOn(toaster, 'create').mockClear();
    mockedCreateMutation.mockReturnValue([createScenario, { isLoading: false }] as never);
  });

  it('submits the selected project, normalized title, and exact Markdown then replaces the URL', async () => {
    const user = userEvent.setup();
    const contentMd = '  # Checkout  \n\n\tstep 1\n';
    createScenario.mockReturnValue({ unwrap: () => Promise.resolve({ id: 'scenario-1' }) });

    renderContainer();
    await user.type(screen.getByRole('textbox', { name: 'Title' }), '  Checkout flow  ');
    fireEvent.change(screen.getByRole('textbox', { name: 'Markdown' }), { target: { value: contentMd } });
    await user.click(screen.getByRole('button', { name: 'Create Test Scenario' }));

    await waitFor(() => expect(createScenario).toHaveBeenCalledTimes(1));
    expect(createScenario).toHaveBeenCalledWith({
      createTestScenarioRequest: {
        projectId: 'project-1',
        title: 'Checkout flow',
        contentMd,
      },
    });
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/test-scenarios/scenario-1', { replace: true }));
  });

  it('keeps input, shows API feedback, and permits an explicit retry', async () => {
    const user = userEvent.setup();
    const contentMd = '   \n';
    createScenario
      .mockReturnValueOnce({ unwrap: () => Promise.reject({ status: 422, data: { error: 'Title already exists' } }) })
      .mockReturnValueOnce({ unwrap: () => Promise.resolve({ id: 'scenario-2' }) });

    renderContainer();
    await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Retryable scenario');
    fireEvent.change(screen.getByRole('textbox', { name: 'Markdown' }), { target: { value: contentMd } });
    await user.click(screen.getByRole('button', { name: 'Create Test Scenario' }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Title already exists'));
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Retryable scenario');
    expect(screen.getByRole('textbox', { name: 'Markdown' })).toHaveValue(contentMd);

    await user.click(screen.getByRole('button', { name: 'Create Test Scenario' }));

    await waitFor(() => expect(createScenario).toHaveBeenCalledTimes(2));
    expect(navigate).toHaveBeenCalledWith('/test-scenarios/scenario-2', { replace: true });
  });

  it('prevents duplicate requests while the first create is pending', async () => {
    const user = userEvent.setup();
    let resolveRequest!: (value: { id: string }) => void;
    createScenario.mockReturnValue({ unwrap: () => new Promise((resolve) => (resolveRequest = resolve)) });

    renderContainer();
    await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Pending scenario');
    fireEvent.change(screen.getByRole('textbox', { name: 'Markdown' }), { target: { value: '#' } });
    await user.click(screen.getByRole('button', { name: 'Create Test Scenario' }));
    expect(screen.getByRole('button', { name: 'Create Test Scenario' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Create Test Scenario' }));
    expect(createScenario).toHaveBeenCalledTimes(1);

    resolveRequest({ id: 'scenario-3' });
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/test-scenarios/scenario-3', { replace: true }));
  });
});
