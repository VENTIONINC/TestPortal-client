// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ManualTestRunRead } from '@/redux/apis/generatedApi';
import { useManualTestRunExecution } from '@/components/manual-test-runs/hooks/useManualTestRunExecution';
const { patchStep, patchRun, completeRun } = vi.hoisted(() => ({ patchStep: vi.fn(), patchRun: vi.fn(), completeRun: vi.fn() }));
vi.mock('react-redux', () => ({ useSelector: (select: (value: unknown) => unknown) => select({ auth: { accessToken: `x.${btoa(JSON.stringify({ userId: 'user-1' }))}.x` } }) }));
vi.mock('@/redux/apis/extendedApi', () => ({
 usePatchApiV2ManualTestRunsByRunIdMutation: () => [patchRun],
 usePatchApiV2ManualTestRunsByRunIdStepsAndStepIdMutation: () => [patchStep],
 usePostApiV2ManualTestRunsByRunIdCompleteMutation: () => [completeRun],
}));
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
  preconditions: null,
  testData: 'Card 4242',
  notes: null,
  browser: null,
  operatingSystem: null,
  device: null,
  apiEnvironment: null,
  build: null,
  deployment: null,
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


const deferred = () => {
 let resolve!: (run: ManualTestRunRead) => void;
 let reject!: (error: unknown) => void;
 const promise = new Promise<ManualTestRunRead>((yes, no) => { resolve = yes; reject = no; });
 return { promise, resolve, reject };
};
const settle = async () => { await act(async () => { await Promise.resolve(); }); };
const advance = async (ms: number) => { await act(async () => { await vi.advanceTimersByTimeAsync(ms); }); };
const setup = (run = runFor(), refetch = vi.fn().mockResolvedValue(run)) => {
 const setPersistedRun = vi.fn();
 const props = { projectId: run.projectId, runId: run.id, run, refetch, setPersistedRun };
 return { ...renderHook((next) => useManualTestRunExecution(next), { initialProps: props }), props, refetch, setPersistedRun };
};
beforeEach(() => { vi.useFakeTimers(); vi.clearAllMocks(); });
afterEach(() => vi.useRealTimers());

describe('automatic manual-run step writes', () => {
 it('saves an outcome immediately and preserves persisted progress until acknowledgement', async () => {
  const request = deferred(); patchStep.mockReturnValue({ unwrap: () => request.promise });
  const { result } = setup();
  act(() => result.current.setStepStatus('step-1', 'passed')); await settle();
  expect(patchStep).toHaveBeenCalledWith(expect.objectContaining({ manualTestRunStepUpdateRequest: { status: 'passed' } }));
  expect(result.current.savedRun.steps[0].status).toBe('not_started');
  expect(result.current.pendingWrite).toEqual({ kind: 'step', stepId: 'step-1' });
  await act(async () => request.resolve(runFor({ steps: [{ ...runFor().steps[0], status: 'passed' }] })));
  expect(result.current.savedRun.steps[0].status).toBe('passed'); expect(result.current.isDirty).toBe(false);
 });
 it('debounces notes for exactly 500ms, preserves line breaks, and blocks completion during debounce', async () => {
  patchStep.mockReturnValue({ unwrap: () => Promise.resolve(runFor({ steps: [{ ...runFor().steps[0], notes: 'one\ntwo' }] })) });
  const { result } = setup();
  act(() => result.current.setStepNotes('step-1', ' one\ntwo '));
  act(() => result.current.requestCompletion()); expect(result.current.isCompletionOpen).toBe(false);
  await advance(499); expect(patchStep).not.toHaveBeenCalled();
  await advance(1); expect(patchStep).toHaveBeenCalledWith(expect.objectContaining({ manualTestRunStepUpdateRequest: { notes: 'one\ntwo' } }));
  expect(result.current.stepSaveStates['step-1']).toBe('saved_notes');
 });
 it('flushes notes on blur, clears with null, and skips unchanged normalized values', async () => {
  const original = runFor({ steps: [{ ...runFor().steps[0], notes: 'saved' }] });
  patchStep.mockReturnValue({ unwrap: () => Promise.resolve(runFor()) });
  const { result } = setup(original);
  act(() => { result.current.setStepNotes('step-1', ' saved '); result.current.flushStepNotes('step-1'); }); await settle();
  expect(patchStep).not.toHaveBeenCalled();
  act(() => { result.current.setStepNotes('step-1', '  '); result.current.flushStepNotes('step-1'); }); await settle();
  expect(patchStep).toHaveBeenCalledWith(expect.objectContaining({ manualTestRunStepUpdateRequest: { notes: null } }));
 });
 it('serializes and coalesces newer revisions while retaining unrelated run and step drafts', async () => {
  const original = runFor({ steps: [...runFor().steps, { ...runFor().steps[0], id: 'step-2', position: 1 }] });
  const first = deferred(); const second = deferred();
  patchStep.mockReturnValueOnce({ unwrap: () => first.promise }).mockReturnValueOnce({ unwrap: () => second.promise });
  const { result } = setup(original);
  act(() => { result.current.setRunNotesDraft('run draft'); result.current.setStepStatus('step-1', 'passed'); }); await settle();
  act(() => { result.current.setStepStatus('step-1', 'failed'); result.current.setStepStatus('step-1', 'blocked'); result.current.setStepNotes('step-2', 'other draft'); });
  expect(patchStep).toHaveBeenCalledTimes(1);
  await act(async () => first.resolve({ ...original, steps: [{ ...original.steps[0], status: 'passed' }, original.steps[1]] }));
  expect(result.current.stepDrafts['step-1'].status).toBe('blocked');
  expect(result.current.runNotesDraft).toBe('run draft'); expect(result.current.stepDrafts['step-2'].notes).toBe('other draft');
  expect(patchStep).toHaveBeenCalledTimes(2);
  expect(patchStep.mock.calls[1][0].manualTestRunStepUpdateRequest).toEqual({ status: 'blocked' });
  await act(async () => second.resolve({ ...original, steps: [{ ...original.steps[0], status: 'blocked' }, original.steps[1]] }));
  expect(result.current.stepDrafts['step-1'].status).toBe('blocked');
 });
 it('pauses failures without replaying edited drafts, supports explicit retry, and blocks completion', async () => {
  patchStep.mockReturnValue({ unwrap: () => Promise.reject({ status: 'FETCH_ERROR' }) });
  const { result } = setup();
  act(() => result.current.setStepStatus('step-1', 'failed')); await settle();
  act(() => result.current.setStepNotes('step-1', 'keep this')); await advance(1000);
  expect(patchStep).toHaveBeenCalledTimes(1); expect(result.current.stepSaveStates['step-1']).toBe('not_saved');
  act(() => result.current.requestCompletion()); expect(result.current.isCompletionOpen).toBe(false);
  patchStep.mockReturnValue({ unwrap: () => Promise.resolve(runFor({ steps: [{ ...runFor().steps[0], status: 'failed', notes: 'keep this' }] })) });
  await act(async () => result.current.saveStep('step-1'));
  expect(patchStep).toHaveBeenCalledTimes(2); expect(result.current.isDirty).toBe(false);
 });
 it('discards a failed draft to latest persisted values and cancels its timer', async () => {
  patchStep.mockReturnValue({ unwrap: () => Promise.reject({ status: 500 }) });
  const { result } = setup(); act(() => result.current.setStepStatus('step-1', 'failed')); await settle();
  act(() => { result.current.setStepNotes('step-1', 'unsaved'); result.current.discardStep('step-1'); }); await advance(1000);
  expect(result.current.stepDrafts['step-1']).toEqual({ status: 'not_started', notes: '' });
  expect(result.current.isDirty).toBe(false); expect(patchStep).toHaveBeenCalledTimes(1);
 });
 it.each(['in_progress', 'failed'] as const)('recovers authoritative 409 %s state while retaining rejected text without replay', async (status) => {
  patchStep.mockReturnValue({ unwrap: () => Promise.reject({ status: 409 }) });
  const authoritative = runFor({ status }); const refresh = vi.fn().mockResolvedValue(authoritative);
  const { result } = setup(runFor(), refresh);
  act(() => { result.current.setStepNotes('step-1', 'rejected'); result.current.setStepStatus('step-1', 'passed'); }); await settle(); await advance(1000);
  expect(refresh).toHaveBeenCalledOnce(); expect(patchStep).toHaveBeenCalledOnce();
  expect(result.current.stepDrafts['step-1'].notes).toBe('rejected'); expect(result.current.savedRun.status).toBe(status);
  expect(result.current.isReadOnly).toBe(status !== 'in_progress');
 });
 it('blocks retries until failed authoritative recovery is explicitly repaired', async () => {
  patchStep.mockReturnValue({ unwrap: () => Promise.reject({ status: 409 }) });
  const refresh = vi.fn().mockRejectedValue(new Error('offline'));
  const { result } = setup(runFor(), refresh);
  act(() => result.current.setStepStatus('step-1', 'failed')); await settle();
  expect(result.current.recoveryBlocked).toBe(true);
  await act(async () => result.current.saveStep('step-1')); expect(patchStep).toHaveBeenCalledOnce();
  refresh.mockResolvedValue(runFor()); await act(async () => result.current.retryAuthoritativeRecovery());
  expect(result.current.recoveryBlocked).toBe(false); expect(patchStep).toHaveBeenCalledOnce();
 });
 it.each(['scope', 'read-only', 'unmount'])('cancels unsent writes on %s and isolates late acknowledgements', async (change) => {
  const first = deferred(); patchStep.mockReturnValue({ unwrap: () => first.promise });
  const hook = setup();
  act(() => hook.result.current.setStepStatus('step-1', 'passed')); await settle();
  act(() => hook.result.current.setStepNotes('step-1', 'newer draft'));
  if (change === 'unmount') hook.unmount();
  else if (change === 'scope') hook.rerender({ ...hook.props, runId: 'run-2', run: runFor({ id: 'run-2' }) });
  else hook.rerender({ ...hook.props, run: runFor({ executedById: 'other' }) });
  await act(async () => first.resolve(runFor({ steps: [{ ...runFor().steps[0], status: 'passed' }] })));
  await advance(1000); expect(patchStep).toHaveBeenCalledOnce();
  expect(hook.setPersistedRun).not.toHaveBeenCalled();
 });
 it('shares its write lock with explicit notes, key, and executor writes', async () => {
  const first = deferred(); patchStep.mockReturnValue({ unwrap: () => first.promise });
  const { result } = setup();
  act(() => { result.current.setRunNotesDraft('run draft'); result.current.setRunKeyDraft('label'); result.current.setStepStatus('step-1', 'passed'); }); await settle();
  const external = vi.fn();
  await act(async () => { await result.current.saveRunNotes(); await result.current.saveRunKey(); await result.current.coordinateExternalWrite(external); });
  expect(patchRun).not.toHaveBeenCalled(); expect(external).not.toHaveBeenCalled();
  await act(async () => first.resolve(runFor({ steps: [{ ...runFor().steps[0], status: 'passed' }] })));
  expect(result.current.runNotesDraft).toBe('run draft'); expect(result.current.runKeyDraft).toBe('label');
 });
 it('protects page unload while drafts or requests remain', async () => {
  const { result } = setup(); act(() => result.current.setStepNotes('step-1', 'draft'));
  const event = new Event('beforeunload', { cancelable: true }); window.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(true);
 });
 it('queues multiple due steps behind one request and sends the latest normalized drafts', async () => {
  const original = runFor({ steps: [...runFor().steps, { ...runFor().steps[0], id: 'step-2', position: 1 }] });
  const first = deferred(); const second = deferred();
  patchStep.mockReturnValueOnce({ unwrap: () => first.promise }).mockReturnValueOnce({ unwrap: () => second.promise });
  const { result } = setup(original);
  act(() => result.current.setStepStatus('step-1', 'passed')); await settle();
  act(() => result.current.setStepNotes('step-2', 'first')); await advance(300);
  act(() => result.current.setStepNotes('step-2', 'latest')); await advance(500);
  expect(patchStep).toHaveBeenCalledOnce();
  await act(async () => first.resolve({ ...original, steps: [{ ...original.steps[0], status: 'passed' }, original.steps[1]] }));
  expect(patchStep).toHaveBeenCalledTimes(2);
  expect(patchStep.mock.calls[1][0]).toEqual(expect.objectContaining({ stepId: 'step-2', manualTestRunStepUpdateRequest: { notes: 'latest' } }));
  await act(async () => second.resolve({ ...original, steps: [{ ...original.steps[0], status: 'passed' }, { ...original.steps[1], notes: 'latest' }] }));
  expect(result.current.isDirty).toBe(false);
 });
 it('isolates an old request even after navigating away and back to the same run', async () => {
  const request = deferred(); patchStep.mockReturnValue({ unwrap: () => request.promise });
  const hook = setup();
  act(() => hook.result.current.setStepStatus('step-1', 'passed')); await settle();
  hook.rerender({ ...hook.props, runId: 'run-2', run: runFor({ id: 'run-2' }) });
  hook.rerender(hook.props);
  await act(async () => request.resolve(runFor({ steps: [{ ...runFor().steps[0], status: 'passed' }] })));
  expect(hook.setPersistedRun).not.toHaveBeenCalled(); expect(hook.result.current.savedRun.steps[0].status).toBe('not_started');
 });

 it('retains other queued drafts after failure until explicit discard resumes the queue', async () => {
  const original = runFor({ steps: [...runFor().steps, { ...runFor().steps[0], id: 'step-2', position: 1 }] });
  const first = deferred();
  patchStep.mockReturnValueOnce({ unwrap: () => first.promise }).mockReturnValue({ unwrap: () => Promise.resolve({ ...original, steps: [original.steps[0], { ...original.steps[1], status: 'passed' }] }) });
  const { result } = setup(original);
  act(() => result.current.setStepStatus('step-1', 'failed')); await settle();
  act(() => result.current.setStepStatus('step-2', 'passed')); await settle();
  await act(async () => first.reject({ status: 500 })); await advance(1000);
  expect(patchStep).toHaveBeenCalledOnce(); expect(result.current.stepDrafts['step-2'].status).toBe('passed');
  act(() => result.current.discardStep('step-1')); await settle();
  expect(patchStep).toHaveBeenCalledTimes(2); expect(patchStep.mock.calls[1][0].stepId).toBe('step-2');
 });
 it('cancels queued step edits before an Executor response releases the shared write lock', async () => {
  const { result } = setup(); const external = deferred();
  let pending!: Promise<ManualTestRunRead | undefined>;
  act(() => { pending = result.current.coordinateExternalWrite(() => external.promise); });
  act(() => result.current.setStepStatus('step-1', 'passed')); await settle();
  await act(async () => { external.resolve(runFor({ executedById: 'other' })); await pending; });
  expect(result.current.isReadOnly).toBe(true); expect(result.current.stepDrafts['step-1'].status).toBe('passed');
  expect(result.current.savedRun.steps[0].status).toBe('not_started'); expect(patchStep).not.toHaveBeenCalled();
 });

 it('ignores late responses after execution editability was lost and regained', async () => {
  const request = deferred(); patchStep.mockReturnValue({ unwrap: () => request.promise });
  const hook = setup(); act(() => hook.result.current.setStepStatus('step-1', 'passed')); await settle();
  hook.rerender({ ...hook.props, run: runFor({ executedById: 'other' }) });
  hook.rerender(hook.props);
  await act(async () => request.resolve(runFor({ steps: [{ ...runFor().steps[0], status: 'passed' }] })));
  expect(hook.setPersistedRun).not.toHaveBeenCalled(); expect(hook.result.current.isDirty).toBe(true);
 });

 it.each(['status', 'notes'] as const)('preserves a newer %s correction that returns exactly to the pre-request baseline', async (field) => {
  const original = runFor({ steps: [{ ...runFor().steps[0], notes: 'original' }] });
  const acknowledged = { ...original, steps: [{ ...original.steps[0], ...(field === 'status' ? { status: 'passed' as const } : { notes: 'changed' }) }] };
  const first = deferred(); const second = deferred();
  patchStep.mockReturnValueOnce({ unwrap: () => first.promise }).mockReturnValueOnce({ unwrap: () => second.promise });
  const hook = setup(original);
  act(() => {
    if (field === 'status') hook.result.current.setStepStatus('step-1', 'passed');
    else { hook.result.current.setStepNotes('step-1', 'changed'); hook.result.current.flushStepNotes('step-1'); }
  }); await settle();
  act(() => {
    if (field === 'status') hook.result.current.setStepStatus('step-1', 'not_started');
    else { hook.result.current.setStepNotes('step-1', 'original'); hook.result.current.flushStepNotes('step-1'); }
  });
  await act(async () => first.resolve(acknowledged));
  hook.rerender({ ...hook.props, run: acknowledged });
  expect(hook.result.current.stepDrafts['step-1'][field]).toBe(field === 'status' ? 'not_started' : 'original');
  expect(patchStep).toHaveBeenCalledTimes(2);
  expect(patchStep.mock.calls[1][0].manualTestRunStepUpdateRequest).toEqual(field === 'status' ? { status: 'not_started' } : { notes: 'original' });
  await act(async () => second.resolve(original));
  expect(hook.result.current.isDirty).toBe(false);
 });
 it('resumes another queued step when explicit Retry finds no changes on the failed step', async () => {
  const original = runFor({ steps: [...runFor().steps, { ...runFor().steps[0], id: 'step-2', position: 1 }] });
  const first = deferred();
  patchStep.mockReturnValueOnce({ unwrap: () => first.promise }).mockReturnValue({ unwrap: () => Promise.resolve({ ...original, steps: [original.steps[0], { ...original.steps[1], status: 'passed' }] }) });
  const { result } = setup(original);
  act(() => result.current.setStepStatus('step-1', 'failed')); await settle();
  act(() => result.current.setStepStatus('step-2', 'passed')); await settle();
  await act(async () => first.reject({ status: 500 }));
  act(() => result.current.setStepStatus('step-1', 'not_started')); await settle();
  expect(patchStep).toHaveBeenCalledOnce();
  await act(async () => result.current.saveStep('step-1')); await settle();
  expect(patchStep).toHaveBeenCalledTimes(2); expect(patchStep.mock.calls[1][0].stepId).toBe('step-2');
  expect(result.current.isDirty).toBe(false);
 });

});
