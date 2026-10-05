// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { act, fireEvent, renderHook, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useManualTestRunExecution } from '@/components/manual-test-runs/hooks/useManualTestRunExecution';
import { ManualTestRunDetailsView } from '@/components/manual-test-runs';
import { ChakraProvider } from '@/components/ui';
import type { ManualTestRunRead } from '@/redux/apis/generatedApi';
import {
  usePatchApiV2ManualTestRunsByRunIdMutation,
  usePatchApiV2ManualTestRunsByRunIdStepsAndStepIdMutation,
  usePostApiV2ManualTestRunsByRunIdCompleteMutation,
} from '@/redux/apis/extendedApi';

vi.mock('react-redux', async (importOriginal) => ({
  ...await importOriginal<typeof import('react-redux')>(),
  useSelector: (selector: (state: unknown) => unknown) => selector({ auth: { accessToken: `header.${btoa(JSON.stringify({ userId: 'user-1' }))}.signature` } }),
}));

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
  runKey: null,
  sourceScenarioKey: null,
  testScenarioId: null,
  executedById: 'user-1',
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

const renderView = (
  run = runFor(),
  setPersistedRun = vi.fn(),
  refetch = vi.fn().mockResolvedValue(run),
  options: { onRetest?: () => void; onViewSourceHistory?: () => void } = {},
) =>
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
          onRetest={options.onRetest}
          onViewSourceHistory={options.onViewSourceHistory}
        />
      </MemoryRouter>
    </ChakraProvider>,
  );

beforeEach(() => {
    patchRun.mockReset();
    patchStep.mockReset();
    completeRun.mockReset();
    mockedPatchRun.mockReturnValue([patchRun, { isLoading: false }] as never);
    mockedPatchStep.mockReturnValue([patchStep, { isLoading: false }] as never);
    mockedCompleteRun.mockReturnValue([completeRun, { isLoading: false }] as never);
  });

describe('ManualTestRunDetailsView', () => {
  it('renders the persisted snapshot and distinguishes scenario notes from execution notes', () => {
    renderView();

    expect(screen.getByText('Snapshot details')).toBeInTheDocument();
    expect(screen.getByText('Complete checkout')).toBeInTheDocument();
    expect(screen.getByText('Author note')).toBeInTheDocument();
    expect(screen.getByText('Run key: N/A')).toBeInTheDocument();
    expect(within(screen.getByText('Source scenario key at start').parentElement!).getByText('N/A')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Execution notes' })).toBeInTheDocument();
    expect(screen.getByText('Submit checkout')).toBeInTheDocument();
    expect(screen.getByText('Executor unavailable')).toBeInTheDocument();
    expect(screen.getByLabelText('Not started outcome')).toBeInTheDocument();
  });

  it('renders persisted run labels from the historical response after the source is deleted', () => {
    renderView(runFor({ runKey: 'RUN-7', sourceScenarioKey: 'R1', testScenarioId: null }));

    expect(screen.getByText('Run key: RUN-7')).toBeInTheDocument();
    expect(screen.getByText('Source scenario key at start')).toBeInTheDocument();
    expect(screen.getByText('R1')).toBeInTheDocument();
    expect(screen.getByText('Source deleted')).toBeInTheDocument();
  });

  it('saves only the Run key for the authenticated executor', async () => {
    const user = userEvent.setup();
    patchRun.mockReturnValue({ unwrap: () => Promise.resolve(runFor({ runKey: 'RUN-2' })) });

    renderView(runFor({ runKey: 'RUN-1' }));
    await user.type(screen.getByRole('textbox', { name: 'Execution notes' }), 'unsaved execution draft');
    const input = screen.getByRole('textbox', { name: 'Edit Run key' });
    expect(input).toHaveValue('RUN-1');
    expect(screen.queryByRole('button', { name: 'Discard Run key' })).not.toBeInTheDocument();
    fireEvent.change(input, { target: { value: '  RUN-2  ' } });
    expect(screen.getByRole('button', { name: 'Discard Run key' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save Run key' }));

    await waitFor(() => expect(patchRun).toHaveBeenCalledWith({
      projectId: 'project-1',
      runId: 'run-1',
      manualTestRunUpdateRequest: { runKey: 'RUN-2' },
    }));
    expect(screen.getByText('Run key: RUN-2')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Execution notes' })).toHaveValue('unsaved execution draft');
  });

  it('allows completed-run key edits while execution controls stay frozen', async () => {
    const user = userEvent.setup();
    patchRun.mockReturnValue({ unwrap: () => Promise.resolve(runFor({
      runKey: 'RUN-COMPLETE-2',
      status: 'passed',
      completedAt: '2026-09-17T11:00:00.000Z',
    })) });

    renderView(runFor({
      runKey: 'RUN-COMPLETE-1',
      status: 'passed',
      completedAt: '2026-09-17T11:00:00.000Z',
    }));
    expect(screen.getByRole('textbox', { name: 'Execution notes' })).toHaveAttribute('readonly');
    expect(screen.queryByRole('button', { name: 'Complete run' })).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Edit Run key' })).not.toHaveAttribute('readonly');

    fireEvent.change(screen.getByRole('textbox', { name: 'Edit Run key' }), { target: { value: 'RUN-COMPLETE-2' } });
    await user.click(screen.getByRole('button', { name: 'Save Run key' }));

    await waitFor(() => expect(patchRun).toHaveBeenCalledWith({
      projectId: 'project-1',
      runId: 'run-1',
      manualTestRunUpdateRequest: { runKey: 'RUN-COMPLETE-2' },
    }));
  });

  it('retains a failed Run key draft and preserves independent execution drafts on label save', async () => {
    const user = userEvent.setup();
    const onRetest = vi.fn();
    patchRun.mockReturnValue({ unwrap: () => Promise.reject({ status: 503, data: { message: 'Unavailable' } }) });
    renderView(runFor({ runKey: 'RUN-1', status: 'passed', completedAt: '2026-09-17T11:00:00.000Z', testScenarioId: 'scenario-live' }), vi.fn(), vi.fn().mockResolvedValue(runFor({ runKey: 'RUN-1' })), { onRetest });

    fireEvent.change(screen.getByRole('textbox', { name: 'Edit Run key' }), { target: { value: 'RUN-2' } });
    await user.click(screen.getByRole('button', { name: 'Save Run key' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Run key was not saved.'));
    expect(screen.getByRole('textbox', { name: 'Edit Run key' })).toHaveValue('RUN-2');

    await user.click(screen.getByRole('button', { name: 'Discard Run key' }));
    await user.click(screen.getByRole('button', { name: 'Retest' }));
    expect(onRetest).toHaveBeenCalledOnce();
  });

  it('recovers a Run key conflict from authoritative state without replaying or losing rejected input', async () => {
    const user = userEvent.setup();
    const authoritative = runFor({ runKey: 'RUN-AUTHORITATIVE', status: 'passed', completedAt: '2026-09-17T11:00:00.000Z' });
    const refetch = vi.fn().mockResolvedValue(authoritative);
    patchRun.mockReturnValue({ unwrap: () => Promise.reject({ status: 409, data: { error: 'run key changed' } }) });
    renderView(runFor({ runKey: 'RUN-OLD', status: 'passed', completedAt: '2026-09-17T11:00:00.000Z' }), vi.fn(), refetch);

    fireEvent.change(screen.getByRole('textbox', { name: 'Edit Run key' }), { target: { value: 'RUN-REJECTED' } });
    await user.click(screen.getByRole('button', { name: 'Save Run key' }));

    expect(refetch).toHaveBeenCalledOnce();
    expect(patchRun).toHaveBeenCalledOnce();
    expect(screen.getByText('Run key: RUN-AUTHORITATIVE')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Edit Run key' })).toHaveValue('RUN-REJECTED');
    expect(screen.getByRole('alert')).toHaveTextContent('Run key was not saved.');
  });

  it('requires explicitly saving or discarding a dirty Run key before completion or Retest', async () => {
    const user = userEvent.setup();
    const onRetest = vi.fn();
    const activeView = renderView(runFor({ steps: [] }), vi.fn(), undefined, { onRetest });

    fireEvent.change(screen.getByRole('textbox', { name: 'Edit Run key' }), { target: { value: 'RUN-DRAFT' } });
    await user.click(screen.getByRole('button', { name: 'Complete run' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.getByText('Save or discard drafts before completing.')).toBeInTheDocument();
    expect(completeRun).not.toHaveBeenCalled();
    activeView.unmount();

    const completedView = renderView(runFor({ status: 'passed', completedAt: '2026-09-17T11:00:00.000Z', testScenarioId: 'scenario-live' }), vi.fn(), undefined, { onRetest });
    fireEvent.change(screen.getByRole('textbox', { name: 'Edit Run key' }), { target: { value: 'RUN-DRAFT' } });
    await user.click(screen.getByRole('button', { name: 'Retest' }));
    expect(onRetest).not.toHaveBeenCalled();
    expect(screen.getByText('Save or discard Run key changes before Retest.')).toBeInTheDocument();
    completedView.unmount();
  });

  it('clears a Run key with null and does not PATCH an unchanged key', async () => {
    const user = userEvent.setup();
    patchRun.mockReturnValue({ unwrap: () => Promise.resolve(runFor({ runKey: null })) });

    renderView(runFor({ runKey: 'RUN-CLEAR' }));
    expect(screen.getByRole('button', { name: 'Save Run key' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Save Run key' }));
    expect(patchRun).not.toHaveBeenCalled();

    fireEvent.change(screen.getByRole('textbox', { name: 'Edit Run key' }), { target: { value: '' } });
    await user.click(screen.getByRole('button', { name: 'Save Run key' }));
    await waitFor(() => expect(patchRun).toHaveBeenCalledWith({
      projectId: 'project-1',
      runId: 'run-1',
      manualTestRunUpdateRequest: { runKey: null },
    }));
  });

  it.each(['user-2', null])('keeps the Run key view-only when the executor is %s', (executedById) => {
    renderView(runFor({ runKey: 'RUN-FOREIGN', executedById }));

    expect(screen.getByText('Run key: RUN-FOREIGN')).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Edit Run key' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save Run key' })).not.toBeInTheDocument();
  });

  it('saves only changed execution fields and keeps the run-note endpoint separate from step saves', async () => {
    const user = userEvent.setup();
    const savedRun = runFor({ notes: 'run note' });
    const savedStepRun = runFor({ notes: 'run note', steps: [{ ...runFor().steps[0], status: 'passed', notes: 'Saved step note' }] });
    patchRun.mockReturnValue({ unwrap: () => Promise.resolve(savedRun) });
    patchStep.mockReturnValue({ unwrap: () => Promise.resolve(savedStepRun) });

    renderView(runFor());
    expect(screen.getByRole('button', { name: 'Save execution notes' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
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

  it('offers a fresh retest only for completed runs with a live source', async () => {
    const onRetest = vi.fn();
    const onViewSourceHistory = vi.fn();
    const user = userEvent.setup();

    const { unmount } = renderView(runFor({ status: 'passed', completedAt: '2026-09-17T11:00:00.000Z', testScenarioId: 'scenario-live' }), vi.fn(), undefined, { onRetest, onViewSourceHistory });
    expect(screen.getByRole('link', { name: 'View current scenario' })).toHaveAttribute('href', '/test-scenarios/scenario-live');
    expect(screen.getByText('Retest uses the current scenario')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retest' }));
    await user.click(screen.getByRole('button', { name: 'View source history' }));
    expect(onRetest).toHaveBeenCalledTimes(1);
    expect(onViewSourceHistory).toHaveBeenCalledTimes(1);

    unmount();
    renderView(runFor({ status: 'failed', completedAt: '2026-09-17T11:00:00.000Z', testScenarioId: null }), vi.fn(), undefined, { onRetest });
    expect(screen.getAllByText('Source deleted')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Retest' })).toBeDisabled();
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
    expect(screen.getByText('Execution is read-only')).toBeInTheDocument();
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


describe('run executor access', () => {
  it.each(['other-user', null])('renders an active run owned by %s as view-only', (executedById) => {
    renderView(runFor({ executedById }), vi.fn(), vi.fn(), { onRetest: vi.fn() });
    expect(screen.getByText('View-only run')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Complete run' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retest' })).not.toBeInTheDocument();
    for (const textbox of screen.getAllByRole('textbox')) expect(textbox).toHaveAttribute('readonly');
    expect(screen.queryByRole('button', { name: /Save/i })).not.toBeInTheDocument();
  });
});


it('blocks execution callbacks for a foreign run', async () => {
  const run = runFor({ executedById: 'other-user' });
  const { result } = renderHook(() => useManualTestRunExecution({ projectId: run.projectId, runId: run.id, run, setPersistedRun: vi.fn(), refetch: vi.fn() }));
  act(() => {
    result.current.setRunNotesDraft('Changed notes');
    result.current.setStepStatus('step-1', 'passed');
    result.current.setStepNotes('step-1', 'Changed step');
    result.current.requestCompletion();
  });
  await act(async () => {
    await result.current.saveRunNotes();
    await result.current.saveStep('step-1');
    await result.current.confirmCompletion('failed');
  });
  expect(result.current.isCompletionOpen).toBe(false);
  expect(result.current.isDirty).toBe(false);
  expect(patchRun).not.toHaveBeenCalled();
  expect(patchStep).not.toHaveBeenCalled();
  expect(completeRun).not.toHaveBeenCalled();
});
