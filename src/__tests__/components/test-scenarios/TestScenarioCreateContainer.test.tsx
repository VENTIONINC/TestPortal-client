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

const renderContainer = (projectId = 'project-1') =>
  render(
    <ChakraProvider>
      <TestScenarioCreateContainer projectId={projectId} />
    </ChakraProvider>,
  );

describe('TestScenarioCreateContainer', () => {
  beforeEach(() => {
    navigate.mockReset();
    createScenario.mockReset();
    vi.spyOn(toaster, 'create').mockClear();
    mockedCreateMutation.mockReturnValue([createScenario, { isLoading: false }] as never);
  });

  it('submits the selected project and structured fields without generated Markdown', async () => {
    const user = userEvent.setup();
    createScenario.mockReturnValue({ unwrap: () => Promise.resolve({ id: 'scenario-1' }) });

    renderContainer();
    await user.type(screen.getByRole('textbox', { name: 'Title' }), '  Checkout flow  ');
    fireEvent.change(screen.getByRole('textbox', { name: 'Details' }), { target: { value: '  Details\n  here  ' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Objective' }), { target: { value: '  Complete checkout  ' } });
    await user.click(screen.getByRole('button', { name: 'Create Test Scenario' }));

    await waitFor(() => expect(createScenario).toHaveBeenCalledTimes(1));
    expect(createScenario).toHaveBeenCalledWith({
      createTestScenarioRequest: {
        projectId: 'project-1',
        title: 'Checkout flow',
        details: 'Details\n  here',
        objective: 'Complete checkout',
      },
    });
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/test-scenarios/scenario-1', { replace: true }));
  });

  it('submits zero or multiple initial steps atomically without temporary IDs or positions', async () => {
    const user = userEvent.setup();
    createScenario.mockReturnValue({ unwrap: () => Promise.resolve({ id: 'scenario-with-steps' }) });

    renderContainer();
    await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Checkout flow');
    await user.click(screen.getByRole('button', { name: 'Add step' }));
    await user.type(screen.getByRole('textbox', { name: 'Step 1 action' }), 'Open checkout');
    await user.type(screen.getByRole('textbox', { name: 'Step 1 expected result' }), 'Form is shown');
    await user.click(screen.getByRole('button', { name: 'Create Test Scenario' }));

    await waitFor(() => expect(createScenario).toHaveBeenCalledTimes(1));
    expect(createScenario).toHaveBeenCalledWith({
      createTestScenarioRequest: {
        projectId: 'project-1',
        title: 'Checkout flow',
        steps: [{ action: 'Open checkout', expectedResult: 'Form is shown' }],
      },
    });
    expect(createScenario.mock.calls[0]?.[0].createTestScenarioRequest.steps?.[0]).not.toHaveProperty('id');
    expect(createScenario.mock.calls[0]?.[0].createTestScenarioRequest.steps?.[0]).not.toHaveProperty('position');
  });

  it('retains all drafts, shows API feedback and permits an explicit retry', async () => {
    const user = userEvent.setup();
    const details = 'Retry details';
    createScenario
      .mockReturnValueOnce({ unwrap: () => Promise.reject({ status: 422, data: { error: 'Title already exists' } }) })
      .mockReturnValueOnce({ unwrap: () => Promise.resolve({ id: 'scenario-2' }) });

    renderContainer();
    await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Retryable scenario');
    fireEvent.change(screen.getByRole('textbox', { name: 'Details' }), { target: { value: details } });
    await user.click(screen.getByRole('button', { name: 'Add step' }));
    await user.type(screen.getByRole('textbox', { name: 'Step 1 action' }), 'Retry action');
    await user.click(screen.getByRole('button', { name: 'Create Test Scenario' }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Title already exists'));
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Retryable scenario');
    expect(screen.getByRole('textbox', { name: 'Details' })).toHaveValue(details);
    expect(screen.getByRole('textbox', { name: 'Step 1 action' })).toHaveValue('Retry action');

    await user.click(screen.getByRole('button', { name: 'Create Test Scenario' }));
    await waitFor(() => expect(createScenario).toHaveBeenCalledTimes(2));
    expect(navigate).toHaveBeenCalledWith('/test-scenarios/scenario-2', { replace: true });
  });

  it('prevents duplicate requests while creation is pending', async () => {
    const user = userEvent.setup();
    let resolveRequest!: (value: { id: string }) => void;
    createScenario.mockReturnValue({ unwrap: () => new Promise((resolve) => (resolveRequest = resolve)) });

    renderContainer();
    await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Pending scenario');
    await user.click(screen.getByRole('button', { name: 'Create Test Scenario' }));
    expect(screen.getByRole('button', { name: 'Create Test Scenario' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Create Test Scenario' }));
    expect(createScenario).toHaveBeenCalledTimes(1);

    resolveRequest({ id: 'scenario-3' });
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/test-scenarios/scenario-3', { replace: true }));
  });

  it('does not navigate after a late response from an abandoned project scope', async () => {
    let resolveRequest!: (value: { id: string }) => void;
    createScenario.mockReturnValue({ unwrap: () => new Promise((resolve) => (resolveRequest = resolve)) });

    const { rerender } = renderContainer('project-1');
    fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), { target: { value: 'Scoped scenario' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Create Test Scenario' }).closest('form')!);
    await waitFor(() => expect(createScenario).toHaveBeenCalledTimes(1));

    rerender(
      <ChakraProvider>
        <TestScenarioCreateContainer projectId="project-2" />
      </ChakraProvider>,
    );
    resolveRequest({ id: 'old-scope-scenario' });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(navigate).not.toHaveBeenCalled();
  });
});
