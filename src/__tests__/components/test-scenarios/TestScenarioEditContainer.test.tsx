// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TestScenarioEditContainer } from '@/components/test-scenarios/containers/TestScenarioEditContainer';
import { ChakraProvider, toaster } from '@/components/ui';
import {
  useDeleteApiV2TestScenariosByScenarioIdStepsAndStepIdMutation,
  useGetApiV2TestScenariosByScenarioIdQuery,
  usePatchApiV2TestScenariosByScenarioIdMutation,
  usePatchApiV2TestScenariosByScenarioIdStepsAndStepIdMutation,
  usePostApiV2TestScenariosByScenarioIdStepsMutation,
  usePutApiV2TestScenariosByScenarioIdStepsOrderMutation,
} from '@/redux/apis/generatedApi';

const navigate = vi.fn();
const updateScenario = vi.fn();
const getScenario = vi.fn();
const appendStep = vi.fn();
const updateStep = vi.fn();
const deleteStep = vi.fn();
const reorderSteps = vi.fn();
const refetch = vi.fn();

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
    usePostApiV2TestScenariosByScenarioIdStepsMutation: vi.fn(),
    usePatchApiV2TestScenariosByScenarioIdStepsAndStepIdMutation: vi.fn(),
    useDeleteApiV2TestScenariosByScenarioIdStepsAndStepIdMutation: vi.fn(),
    usePutApiV2TestScenariosByScenarioIdStepsOrderMutation: vi.fn(),
  };
});

const mockedGetScenario = vi.mocked(useGetApiV2TestScenariosByScenarioIdQuery);
const mockedUpdateMutation = vi.mocked(usePatchApiV2TestScenariosByScenarioIdMutation);
const mockedAppendMutation = vi.mocked(usePostApiV2TestScenariosByScenarioIdStepsMutation);
const mockedStepUpdateMutation = vi.mocked(usePatchApiV2TestScenariosByScenarioIdStepsAndStepIdMutation);
const mockedDeleteMutation = vi.mocked(useDeleteApiV2TestScenariosByScenarioIdStepsAndStepIdMutation);
const mockedReorderMutation = vi.mocked(usePutApiV2TestScenariosByScenarioIdStepsOrderMutation);

const scenario = (overrides: Record<string, unknown> = {}) => ({
  id: 'scenario-1',
  projectId: 'project-1',
  createdById: 'user-1',
  title: 'Checkout flow',
  details: 'Scenario details',
  objective: 'Complete checkout',
  preconditions: 'Signed in',
  testData: 'Account 1',
  expectedResult: 'Order exists',
  notes: 'Use a fresh cart',
  steps: [
    { id: 'step-1', position: 1, action: 'Open checkout', expectedResult: 'Form is shown' },
  ],
  contentMd: '# Checkout flow\n\nGenerated preview',
  contentMdHash: 'hash-1',
  contentMdFormatVersion: 1,
  createdAt: '2026-09-01T10:00:00.000Z',
  updatedAt: '2026-09-02T11:00:00.000Z',
  ...overrides,
});

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
    appendStep.mockReset();
    updateStep.mockReset();
    deleteStep.mockReset();
    reorderSteps.mockReset();
    refetch.mockReset();
    vi.spyOn(toaster, 'create').mockClear();
    const persisted = scenario();
    mockedGetScenario.mockReturnValue({
      data: persisted,
      currentData: persisted,
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch,
    } as never);
    mockedUpdateMutation.mockReturnValue([updateScenario, { isLoading: false }] as never);
    mockedAppendMutation.mockReturnValue([appendStep, { isLoading: false }] as never);
    mockedStepUpdateMutation.mockReturnValue([updateStep, { isLoading: false }] as never);
    mockedDeleteMutation.mockReturnValue([deleteStep, { isLoading: false }] as never);
    mockedReorderMutation.mockReturnValue([reorderSteps, { isLoading: false }] as never);
  });

  it('requests both identities, initializes all structured fields and does not display Markdown', () => {
    renderContainer();

    expect(mockedGetScenario).toHaveBeenCalledWith({ scenarioId: 'scenario-1', projectId: 'project-1' });
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Checkout flow');
    expect(screen.getByRole('textbox', { name: 'Objective' })).toHaveValue('Complete checkout');
    expect(screen.getByRole('textbox', { name: 'Step 1 action' })).toHaveValue('Open checkout');
    expect(screen.queryByTestId('markdown-preview')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Markdown' })).not.toBeInTheDocument();
  });

  it.each([
    ['title', () => fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), { target: { value: 'Updated title' } }), { title: 'Updated title' }],
    ['details', () => fireEvent.change(screen.getByRole('textbox', { name: 'Details' }), { target: { value: '  Updated details  ' } }), { details: 'Updated details' }],
    ['objective', () => fireEvent.change(screen.getByRole('textbox', { name: 'Objective' }), { target: { value: '  Updated objective  ' } }), { objective: 'Updated objective' }],
    ['cleared details', () => fireEvent.change(screen.getByRole('textbox', { name: 'Details' }), { target: { value: ' \n\t ' } }), { details: null }],
  ])('sends only the normalized %s PATCH field', async (_name, change, expected) => {
    const user = userEvent.setup();
    updateScenario.mockReturnValue({ unwrap: () => Promise.resolve({ ...scenario(), ...expected }) });

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

  it('adopts normalized returned field values as the saved baseline', async () => {
    const user = userEvent.setup();
    const response = scenario({ title: 'Normalized title', contentMd: '# Normalized title' });
    updateScenario.mockReturnValue({ unwrap: () => Promise.resolve(response) });

    renderContainer();
    fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), { target: { value: '  Normalized title  ' } });
    await user.click(screen.getByRole('button', { name: 'Save Test Scenario' }));

    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Normalized title'));
    await user.click(screen.getByRole('button', { name: 'Save Test Scenario' }));

    expect(updateScenario).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('markdown-preview')).not.toBeInTheDocument();
  });

  it('does not call PATCH for an unchanged save', async () => {
    const user = userEvent.setup();
    renderContainer();

    await user.click(screen.getByRole('button', { name: 'Save Test Scenario' }));

    expect(updateScenario).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('No changes to save.');
  });

  it('retains unrelated dirty fields after a successful step save', async () => {
    const user = userEvent.setup();
    appendStep.mockReturnValue({
      unwrap: () => Promise.resolve(scenario({ contentMd: '# Step-generated preview' })),
    });

    renderContainer();
    fireEvent.change(screen.getByRole('textbox', { name: 'Notes' }), { target: { value: 'Unsaved note' } });
    await user.type(screen.getByRole('textbox', { name: 'New step action' }), 'Append this step');
    await user.click(screen.getByRole('button', { name: 'Add step' }));

    await waitFor(() => expect(appendStep).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('textbox', { name: 'Notes' })).toHaveValue('Unsaved note');
    expect(screen.queryByTestId('markdown-preview')).not.toBeInTheDocument();
  });

  it('retains field drafts after a failed save', async () => {
    const user = userEvent.setup();
    updateScenario.mockReturnValue({ unwrap: () => Promise.reject({ status: 500, data: { error: 'Save failed' } }) });

    renderContainer();
    fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), { target: { value: 'Unsaved title' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Notes' }), { target: { value: 'Unsaved note' } });
    await user.click(screen.getByRole('button', { name: 'Save Test Scenario' }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Save failed'));
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Unsaved title');
    expect(screen.getByRole('textbox', { name: 'Notes' })).toHaveValue('Unsaved note');
  });

  it('appends a step with only structured step fields and adopts the returned scenario', async () => {
    const user = userEvent.setup();
    const response = scenario({
      steps: [
        { id: 'step-1', position: 1, action: 'Open checkout', expectedResult: 'Form is shown' },
        { id: 'step-2', position: 2, action: 'Submit order', expectedResult: null },
      ],
      contentMd: '# Updated preview',
    });
    appendStep.mockReturnValue({ unwrap: () => Promise.resolve(response) });

    renderContainer();
    await user.type(screen.getByRole('textbox', { name: 'New step action' }), '  Submit order  ');
    await user.click(screen.getByRole('button', { name: 'Add step' }));

    await waitFor(() => expect(appendStep).toHaveBeenCalledWith({
      scenarioId: 'scenario-1',
      projectId: 'project-1',
      appendTestScenarioStepRequest: { action: 'Submit order' },
    }));
    expect(screen.queryByTestId('markdown-preview')).not.toBeInTheDocument();
  });

  it('patches only changed step fields and supports null clearing', async () => {
    const user = userEvent.setup();
    updateStep.mockReturnValue({ unwrap: () => Promise.resolve(scenario({ steps: [{ id: 'step-1', position: 1, action: 'Open checkout', expectedResult: null }] })) });

    renderContainer();
    fireEvent.change(screen.getByRole('textbox', { name: 'Step 1 expected result' }), { target: { value: '  ' } });
    await user.click(screen.getByRole('button', { name: 'Save step 1' }));

    await waitFor(() => expect(updateStep).toHaveBeenCalledWith({
      scenarioId: 'scenario-1',
      stepId: 'step-1',
      projectId: 'project-1',
      updateTestScenarioStepRequest: { expectedResult: null },
    }));
  });

  it('does not call a step PATCH when the draft is unchanged', async () => {
    const user = userEvent.setup();
    renderContainer();

    await user.click(screen.getByRole('button', { name: 'Save step 1' }));

    expect(updateStep).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('No changes to save for step 1.');
  });

  it('deletes a persisted step without a request body', async () => {
    const user = userEvent.setup();
    deleteStep.mockReturnValue({ unwrap: () => Promise.resolve(scenario({ steps: [] })) });

    renderContainer();
    await user.click(screen.getByRole('button', { name: 'Delete step 1' }));

    await waitFor(() => expect(deleteStep).toHaveBeenCalledWith({
      scenarioId: 'scenario-1',
      stepId: 'step-1',
      projectId: 'project-1',
    }));
    await waitFor(() => expect(screen.getByText('No saved steps yet.')).toBeInTheDocument());
  });

  it('reorders every backend step ID and adopts returned order', async () => {
    const user = userEvent.setup();
    const response = scenario({
      steps: [
        { id: 'step-2', position: 1, action: 'Submit order', expectedResult: null },
        { id: 'step-1', position: 2, action: 'Open checkout', expectedResult: 'Form is shown' },
      ],
    });
    reorderSteps.mockReturnValue({ unwrap: () => Promise.resolve(response) });

    const twoStepScenario = scenario({
      steps: [
        { id: 'step-1', position: 1, action: 'Open checkout', expectedResult: 'Form is shown' },
        { id: 'step-2', position: 2, action: 'Submit order', expectedResult: null },
      ],
    });
    mockedGetScenario.mockReturnValue({
      data: twoStepScenario,
      currentData: twoStepScenario,
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch,
    } as never);
    renderContainer();

    expect(screen.getByRole('button', { name: 'Move step 1 up' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move step 2 down' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Move step 2 up' }));
    await waitFor(() => expect(reorderSteps).toHaveBeenCalledWith({
      scenarioId: 'scenario-1',
      projectId: 'project-1',
      reorderTestScenarioStepsRequest: { stepIds: ['step-2', 'step-1'] },
    }));
    expect(screen.getByRole('textbox', { name: 'Step 1 action' })).toHaveValue('Submit order');
  });
});
