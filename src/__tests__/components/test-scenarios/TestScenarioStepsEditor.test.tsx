// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TestScenarioStepsEditor } from '@/components/test-scenarios/components/TestScenarioStepsEditor';
import { ChakraProvider } from '@/components/ui';
import {
  useDeleteApiV2TestScenariosByScenarioIdStepsAndStepIdMutation,
  usePatchApiV2TestScenariosByScenarioIdStepsAndStepIdMutation,
  usePostApiV2TestScenariosByScenarioIdStepsMutation,
  usePutApiV2TestScenariosByScenarioIdStepsOrderMutation,
  type TestScenario,
} from '@/redux/apis/generatedApi';

const appendStep = vi.fn();
const updateStep = vi.fn();
const deleteStep = vi.fn();
const reorderSteps = vi.fn();
const onScenarioUpdated = vi.fn();
const onRefresh = vi.fn();

vi.mock('@/redux/apis/generatedApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/redux/apis/generatedApi')>();

  return {
    ...actual,
    usePostApiV2TestScenariosByScenarioIdStepsMutation: vi.fn(),
    usePatchApiV2TestScenariosByScenarioIdStepsAndStepIdMutation: vi.fn(),
    useDeleteApiV2TestScenariosByScenarioIdStepsAndStepIdMutation: vi.fn(),
    usePutApiV2TestScenariosByScenarioIdStepsOrderMutation: vi.fn(),
  };
});

const mockedAppend = vi.mocked(usePostApiV2TestScenariosByScenarioIdStepsMutation);
const mockedUpdate = vi.mocked(usePatchApiV2TestScenariosByScenarioIdStepsAndStepIdMutation);
const mockedDelete = vi.mocked(useDeleteApiV2TestScenariosByScenarioIdStepsAndStepIdMutation);
const mockedReorder = vi.mocked(usePutApiV2TestScenariosByScenarioIdStepsOrderMutation);

const scenario: TestScenario = {
  id: 'scenario-1',
  projectId: 'project-1',
  createdById: 'user-1',
  title: 'Checkout flow',
  details: 'Details',
  objective: 'Objective',
  preconditions: null,
  testData: null,
  expectedResult: null,
  notes: null,
  steps: [
    { id: 'step-1', position: 1, action: 'Open checkout', expectedResult: 'Form is shown' },
    { id: 'step-2', position: 2, action: 'Submit order', expectedResult: null },
  ],
  contentMd: '# Checkout',
  contentMdHash: 'hash-1',
  contentMdFormatVersion: 1,
  createdAt: '2026-09-01T10:00:00.000Z',
  updatedAt: '2026-09-02T11:00:00.000Z',
};

const renderEditor = () =>
  render(
    <ChakraProvider>
      <TestScenarioStepsEditor
        scenario={scenario}
        projectId="project-1"
        scenarioId="scenario-1"
        onScenarioUpdated={onScenarioUpdated}
        onRefresh={onRefresh}
      />
    </ChakraProvider>,
  );

describe('TestScenarioStepsEditor', () => {
  beforeEach(() => {
    appendStep.mockReset();
    updateStep.mockReset();
    deleteStep.mockReset();
    reorderSteps.mockReset();
    onScenarioUpdated.mockReset();
    onRefresh.mockReset();
    mockedAppend.mockReturnValue([appendStep, { isLoading: false }] as never);
    mockedUpdate.mockReturnValue([updateStep, { isLoading: false }] as never);
    mockedDelete.mockReturnValue([deleteStep, { isLoading: false }] as never);
    mockedReorder.mockReturnValue([reorderSteps, { isLoading: false }] as never);
  });

  it('uses stable IDs and exact project-scoped payloads for append, edit, delete and reorder', async () => {
    const user = userEvent.setup();
    appendStep.mockReturnValue({ unwrap: () => Promise.resolve(scenario) });
    updateStep.mockReturnValue({ unwrap: () => Promise.resolve(scenario) });
    deleteStep.mockReturnValue({ unwrap: () => Promise.resolve(scenario) });
    reorderSteps.mockReturnValue({ unwrap: () => Promise.resolve(scenario) });

    renderEditor();
    await user.type(screen.getByRole('textbox', { name: 'New step action' }), '  Add item  ');
    await user.click(screen.getByRole('button', { name: 'Add step' }));
    expect(appendStep).toHaveBeenCalledWith({
      scenarioId: 'scenario-1',
      projectId: 'project-1',
      appendTestScenarioStepRequest: { action: 'Add item' },
    });

    fireEvent.change(screen.getByRole('textbox', { name: 'Step 1 expected result' }), { target: { value: '  ' } });
    await user.click(screen.getByRole('button', { name: 'Save step 1' }));
    expect(updateStep).toHaveBeenCalledWith({
      scenarioId: 'scenario-1',
      stepId: 'step-1',
      projectId: 'project-1',
      updateTestScenarioStepRequest: { expectedResult: null },
    });

    await user.click(screen.getByRole('button', { name: 'Delete step 2' }));
    expect(deleteStep).toHaveBeenCalledWith({ scenarioId: 'scenario-1', stepId: 'step-2', projectId: 'project-1' });

    await user.click(screen.getByRole('button', { name: 'Move step 2 up' }));
    expect(reorderSteps).toHaveBeenCalledWith({
      scenarioId: 'scenario-1',
      projectId: 'project-1',
      reorderTestScenarioStepsRequest: { stepIds: ['step-2', 'step-1'] },
    });
  });

  it('prevents duplicate or overlapping writes synchronously and retains a failed draft', async () => {
    const user = userEvent.setup();
    let rejectAppend!: (error: unknown) => void;
    appendStep.mockReturnValue({ unwrap: () => new Promise((_resolve, reject) => (rejectAppend = reject)) });

    renderEditor();
    await user.type(screen.getByRole('textbox', { name: 'New step action' }), 'Retry me');
    await user.click(screen.getByRole('button', { name: 'Add step' }));
    await user.click(screen.getByRole('button', { name: 'Add step' }));
    expect(appendStep).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('textbox', { name: 'New step action' })).toHaveValue('Retry me');

    rejectAppend({ status: 500, data: { error: 'Append failed' } });
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Append failed'));
    expect(screen.getByRole('textbox', { name: 'New step action' })).toHaveValue('Retry me');
    expect(onScenarioUpdated).not.toHaveBeenCalled();
  });

  it('refetches after stale reorder rejection and waits for explicit retry', async () => {
    const user = userEvent.setup();
    reorderSteps
      .mockReturnValueOnce({ unwrap: () => Promise.reject({ status: 400, data: { error: 'Stale membership' } }) })
      .mockReturnValueOnce({ unwrap: () => Promise.resolve(scenario) });
    onRefresh.mockResolvedValue({ data: scenario });

    renderEditor();
    await user.click(screen.getByRole('button', { name: 'Move step 2 up' }));

    await waitFor(() => expect(onRefresh).toHaveBeenCalledTimes(1));
    expect(reorderSteps).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('alert')).toHaveTextContent('membership changed');
    expect(screen.getByRole('button', { name: 'Retry reorder' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Retry reorder' }));
    await waitFor(() => expect(reorderSteps).toHaveBeenCalledTimes(2));
    expect(reorderSteps).toHaveBeenLastCalledWith({
      scenarioId: 'scenario-1',
      projectId: 'project-1',
      reorderTestScenarioStepsRequest: { stepIds: ['step-2', 'step-1'] },
    });
  });

  it('reports refresh failure without claiming that rejected ordering succeeded', async () => {
    const user = userEvent.setup();
    reorderSteps.mockReturnValue({ unwrap: () => Promise.reject({ status: 400 }) });
    onRefresh.mockRejectedValue(new Error('Refresh failed'));

    renderEditor();
    await user.click(screen.getByRole('button', { name: 'Move step 2 up' }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/Refreshing.*failed/));
    expect(screen.queryByRole('status', { name: /reordered successfully/i })).not.toBeInTheDocument();
    expect(onScenarioUpdated).not.toHaveBeenCalled();
  });
});
