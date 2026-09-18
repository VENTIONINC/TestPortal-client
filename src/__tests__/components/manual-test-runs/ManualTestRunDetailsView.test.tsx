// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ManualTestRunDetailsView } from '@/components/manual-test-runs';
import { ChakraProvider } from '@/components/ui';
import type { ManualTestRunRead } from '@/redux/apis/generatedApi';
import {
  usePatchApiV2ManualTestRunsByRunIdMutation,
  usePatchApiV2ManualTestRunsByRunIdStepsAndStepIdMutation,
  usePostApiV2ManualTestRunsByRunIdCompleteMutation,
} from '@/redux/apis/extendedApi';

const patchRun = vi.fn();
const patchStep = vi.fn();
const completeRun = vi.fn();

vi.mock('@/redux/apis/extendedApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/redux/apis/extendedApi')>();
  return {
    ...actual,
    usePatchApiV2ManualTestRunsByRunIdMutation: vi.fn(),
    usePatchApiV2ManualTestRunsByRunIdStepsAndStepIdMutation: vi.fn(),
    usePostApiV2ManualTestRunsByRunIdCompleteMutation: vi.fn(),
  };
});

const mockedPatchRun = vi.mocked(usePatchApiV2ManualTestRunsByRunIdMutation);
const mockedPatchStep = vi.mocked(usePatchApiV2ManualTestRunsByRunIdStepsAndStepIdMutation);
const mockedCompleteRun = vi.mocked(usePostApiV2ManualTestRunsByRunIdCompleteMutation);

const runFor = (overrides: Partial<ManualTestRunRead> = {}): ManualTestRunRead => ({
  id: 'run-1',
  projectId: 'project-1',
  sourceTestScenarioId: 'scenario-1',
  testScenarioId: null,
  executedById: null,
  executedBy: null,
  status: 'in_progress',
  startedAt: '2026-09-17T10:00:00.000Z',
  completedAt: null,
  updatedAt: '2026-09-17T10:00:00.000Z',
  title: 'Checkout snapshot',
  details: 'Snapshot details',
  objective: 'Complete checkout',
  preconditions: null,
  testData: 'Card 4242',
  expectedResult: 'Order is created',
  scenarioNotes: 'Author note',
  notes: null,
  steps: [
    {
      id: 'step-1',
      position: 0,
      action: 'Submit checkout',
      expectedResult: 'Order is created',
      status: 'not_started',
      notes: null,
      updatedAt: '2026-09-17T10:00:00.000Z',
    },
  ],
  ...overrides,
});

const renderView = (run = runFor(), setPersistedRun = vi.fn(), refetch = vi.fn().mockResolvedValue(run)) =>
  render(
    <ChakraProvider>
      <MemoryRouter>
        <ManualTestRunDetailsView
          projectId="project-1"
          runId="run-1"
          run={run}
          setPersistedRun={setPersistedRun}
          refetch={refetch}
          onBack={vi.fn()}
        />
      </MemoryRouter>
    </ChakraProvider>,
  );

describe('ManualTestRunDetailsView', () => {
  beforeEach(() => {
    patchRun.mockReset();
    patchStep.mockReset();
    completeRun.mockReset();
    mockedPatchRun.mockReturnValue([patchRun, { isLoading: false }] as never);
    mockedPatchStep.mockReturnValue([patchStep, { isLoading: false }] as never);
    mockedCompleteRun.mockReturnValue([completeRun, { isLoading: false }] as never);
  });

  it('renders the persisted snapshot and distinguishes scenario notes from execution notes', () => {
    renderView();

    expect(screen.getByText('Snapshot details')).toBeInTheDocument();
    expect(screen.getByText('Complete checkout')).toBeInTheDocument();
    expect(screen.getByText('Author note')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Execution notes' })).toBeInTheDocument();
    expect(screen.getByText('Submit checkout')).toBeInTheDocument();
    expect(screen.getByText('Executor unavailable')).toBeInTheDocument();
    expect(screen.getByLabelText('Not started outcome')).toBeInTheDocument();
  });

  it('saves only changed execution fields and keeps the run-note endpoint separate from step saves', async () => {
    const user = userEvent.setup();
    const savedRun = runFor({ notes: 'run note' });
    const savedStepRun = runFor({ notes: 'run note', steps: [{ ...runFor().steps[0], status: 'passed', notes: 'Saved step note' }] });
    patchRun.mockReturnValue({ unwrap: () => Promise.resolve(savedRun) });
    patchStep.mockReturnValue({ unwrap: () => Promise.resolve(savedStepRun) });

    renderView(runFor());
    await user.type(screen.getByRole('textbox', { name: 'Execution notes' }), 'run note');
    await user.click(screen.getByRole('button', { name: 'Save execution notes' }));

    expect(patchRun).toHaveBeenCalledWith({
      projectId: 'project-1',
      runId: 'run-1',
      manualTestRunUpdateRequest: { notes: 'run note' },
    });

    await user.selectOptions(screen.getByRole('combobox', { name: 'Outcome' }), 'passed');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(patchStep).toHaveBeenCalledWith({
      projectId: 'project-1',
      runId: 'run-1',
      stepId: 'step-1',
      manualTestRunStepUpdateRequest: { status: 'passed' },
    });
  });

  it('requires saved drafts before opening completion and allows zero-step passed completion', async () => {
    const user = userEvent.setup();
    const zeroStepRun = runFor({ steps: [] });
    completeRun.mockReturnValue({ unwrap: () => Promise.resolve({ ...zeroStepRun, status: 'passed', completedAt: '2026-09-17T11:00:00.000Z' }) });

    renderView(zeroStepRun);
    await user.type(screen.getByRole('textbox', { name: 'Execution notes' }), 'draft');
    await user.click(screen.getByRole('button', { name: 'Complete run' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.getByText('Save or discard drafts before completing.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Discard' }));
    await user.click(screen.getByRole('button', { name: 'Complete run' }));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    await user.selectOptions(screen.getByRole('combobox', { name: 'Final outcome' }), 'passed');
    await user.click(screen.getByRole('button', { name: 'Complete run' }));

    expect(completeRun).toHaveBeenCalledWith({
      projectId: 'project-1',
      runId: 'run-1',
      manualTestRunCompleteRequest: { status: 'passed' },
    });
    expect(patchRun).not.toHaveBeenCalled();
  });

  it('blocks passed completion for an all-skipped run while leaving other outcomes available', async () => {
    const user = userEvent.setup();
    const skippedRun = runFor({ steps: [{ ...runFor().steps[0], status: 'skipped' }] });
    renderView(skippedRun);

    await user.click(screen.getByRole('button', { name: 'Complete run' }));
    const dialog = screen.getByRole('alertdialog');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Final outcome' }), 'passed');
    expect(screen.getByText('Passed completion is not eligible')).toBeInTheDocument();
    expect(dialog.querySelector('button[disabled]')).not.toBeNull();

    await user.selectOptions(screen.getByRole('combobox', { name: 'Final outcome' }), 'failed');
    expect(dialog.querySelector('button:not([disabled])')).not.toBeNull();
  });

  it.each(['failed', 'blocked', 'skipped'] as const)('uses the dedicated completion request for %s', async (outcome) => {
    const user = userEvent.setup();
    const completedRun = runFor({ status: outcome, completedAt: '2026-09-17T11:00:00.000Z' });
    completeRun.mockReturnValue({ unwrap: () => Promise.resolve(completedRun) });

    renderView(runFor());
    await user.click(screen.getByRole('button', { name: 'Complete run' }));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Final outcome' }), outcome);
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Complete run' }));

    expect(completeRun).toHaveBeenCalledWith({
      projectId: 'project-1',
      runId: 'run-1',
      manualTestRunCompleteRequest: { status: outcome },
    });
    expect(patchRun).not.toHaveBeenCalled();
  });

  it('cancels completion without a request and restores focus to the trigger', async () => {
    const user = userEvent.setup();
    renderView(runFor({ steps: [] }));

    const trigger = screen.getByRole('button', { name: 'Complete run' });
    await user.click(trigger);
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancel' }));

    expect(completeRun).not.toHaveBeenCalled();
    expect(trigger).toHaveFocus();
  });

  it('renders completed results read-only with no save controls', () => {
    renderView(runFor({ status: 'passed', completedAt: '2026-09-17T11:00:00.000Z' }));

    expect(screen.queryByRole('button', { name: 'Complete run' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save execution notes' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Submit' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Submit changes' })).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Execution notes' })).toHaveAttribute('readonly');
  });

  it('refetches after an active 409, keeps the dirty draft, and does not replay the write', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn().mockResolvedValue(runFor({ updatedAt: '2026-09-17T11:00:00.000Z' }));
    patchStep.mockReturnValue({ unwrap: () => Promise.reject({ status: 409, data: { error: 'invalid transition' } }) });

    renderView(runFor(), vi.fn(), refetch);
    await user.selectOptions(screen.getByRole('combobox', { name: 'Outcome' }), 'passed');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(refetch).toHaveBeenCalledTimes(1);
    expect(patchStep).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('combobox', { name: 'Outcome' })).toHaveValue('passed');
    expect(screen.getByText('Step result was not saved.')).toBeInTheDocument();
  });

  it('keeps unchanged steps disabled and reports submitted progress from saved values', async () => {
    const user = userEvent.setup();
    const savedRun = runFor({ steps: [{ ...runFor().steps[0], status: 'passed', notes: 'Saved step note' }] });
    patchStep.mockReturnValue({ unwrap: () => Promise.resolve(savedRun) });

    renderView();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Discard changes' })).not.toBeInTheDocument();

    await user.selectOptions(screen.getByRole('combobox', { name: 'Outcome' }), 'passed');
    expect(screen.getByRole('button', { name: 'Step 1 · Not started · Unsaved changes' })).toHaveAttribute(
      'title',
      'Step 1 · Not started · Unsaved changes',
    );
    expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByText('Submitted: Passed')).toBeInTheDocument();
    expect(screen.getByText('1 of 1 steps submitted')).toBeInTheDocument();
    expect(screen.getByText('Passed: 1')).toBeInTheDocument();
  });

  it('uses Saved notes for a note-only submission and does not advance progress', async () => {
    const user = userEvent.setup();
    const savedRun = runFor({ steps: [{ ...runFor().steps[0], notes: 'Saved note' }] });
    patchStep.mockReturnValue({ unwrap: () => Promise.resolve(savedRun) });

    renderView();
    await user.type(screen.getByRole('textbox', { name: 'Notes for step 1' }), 'Saved note');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByText('Saved notes')).toBeInTheDocument();
    expect(screen.queryByText(/Submitted:/)).not.toBeInTheDocument();
    expect(screen.getByText('0 of 1 steps submitted')).toBeInTheDocument();
  });

  it('shows local Saving feedback while a step submission is pending', async () => {
    const user = userEvent.setup();
    let resolveResponse!: (value: ManualTestRunRead) => void;
    const response = new Promise<ManualTestRunRead>((resolve) => {
      resolveResponse = resolve;
    });
    const savedRun = runFor({ steps: [{ ...runFor().steps[0], status: 'passed' }] });
    patchStep.mockReturnValue({ unwrap: () => response });

    renderView();
    await user.selectOptions(screen.getByRole('combobox', { name: 'Outcome' }), 'passed');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(screen.getByText('Saving')).toBeInTheDocument();
    resolveResponse(savedRun);
    await waitFor(() => expect(screen.getByText('Submitted: Passed')).toBeInTheDocument());
  });

  it('restores a submitted result with Discard changes without changing persisted progress', async () => {
    const user = userEvent.setup();
    const submittedRun = runFor({ steps: [{ ...runFor().steps[0], status: 'passed', notes: 'Saved note' }] });

    renderView(submittedRun);
    expect(screen.getByRole('button', { name: 'Submit changes' })).toBeDisabled();
    await user.selectOptions(screen.getByRole('combobox', { name: 'Outcome' }), 'failed');

    expect(screen.getByRole('button', { name: 'Submit changes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Discard changes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Step 1 · Passed · Unsaved changes' })).toBeInTheDocument();
    expect(screen.getByText('Passed: 1')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Discard changes' }));

    expect(screen.getByRole('combobox', { name: 'Outcome' })).toHaveValue('passed');
    expect(screen.queryByRole('button', { name: 'Discard changes' })).not.toBeInTheDocument();
    expect(screen.getByText('Passed: 1')).toBeInTheDocument();
  });

  it('retains a failed draft and saved progress when submission fails', async () => {
    const user = userEvent.setup();
    patchStep.mockReturnValue({ unwrap: () => Promise.reject(new Error('network')) });

    renderView();
    await user.selectOptions(screen.getByRole('combobox', { name: 'Outcome' }), 'failed');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByText('Not saved')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Outcome' })).toHaveValue('failed');
    expect(screen.getByText('0 of 1 steps submitted')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Step 1 · Not started · Unsaved changes' })).toBeInTheDocument();
  });

  it('focuses the step heading when a progress dot is activated', async () => {
    const user = userEvent.setup();
    const twoStepRun = runFor({
      steps: [
        ...runFor().steps,
        { ...runFor().steps[0], id: 'step-2', position: 1, action: 'Confirm order' },
      ],
    });

    renderView(twoStepRun);
    const progressDot = screen.getByRole('button', { name: 'Step 2 · Not started' });
    expect(progressDot).toHaveAttribute('title', 'Step 2 · Not started');
    await user.click(progressDot);

    expect(screen.getByRole('heading', { name: 'Step 2' })).toHaveFocus();
  });

  it('shows authoritative completed state after a 409 while retaining rejected note text for review', async () => {
    const user = userEvent.setup();
    const completedRun = runFor({ status: 'passed', notes: 'authoritative note', completedAt: '2026-09-17T11:00:00.000Z' });
    const refetch = vi.fn().mockResolvedValue(completedRun);
    patchRun.mockReturnValue({ unwrap: () => Promise.reject({ status: 409, data: { error: 'run completed' } }) });

    renderView(runFor(), vi.fn(), refetch);
    await user.type(screen.getByRole('textbox', { name: 'Execution notes' }), ' rejected local note');
    await user.click(screen.getByRole('button', { name: 'Save execution notes' }));

    expect(refetch).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('textbox', { name: 'Execution notes' })).toHaveValue(' rejected local note');
    expect(screen.queryByRole('button', { name: 'Save execution notes' })).not.toBeInTheDocument();
    expect(screen.getByText('Run is now read-only')).toBeInTheDocument();
  });

  it('blocks writes when authoritative recovery fails and exposes an explicit retry', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn().mockResolvedValue(undefined);
    patchRun.mockReturnValue({ unwrap: () => Promise.reject({ status: 409 }) });

    renderView(runFor(), vi.fn(), refetch);
    await user.type(screen.getByRole('textbox', { name: 'Execution notes' }), 'local note');
    await user.click(screen.getByRole('button', { name: 'Save execution notes' }));

    expect(screen.getByText('Could not refresh the saved run')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry refresh' })).toBeInTheDocument();
  });
});
