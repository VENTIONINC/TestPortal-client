// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ManualTestRunDetailContainer } from '@/components/manual-test-runs/containers/ManualTestRunDetailContainer';
import { ChakraProvider } from '@/components/ui';
import type { ManualTestRunRead } from '@/redux/apis/generatedApi';
import {
  useLazyGetApiV2UsersQuery,
  usePatchApiV2ManualTestRunsByRunIdExecutorMutation,
  usePostApiV2TestScenariosByScenarioIdManualRunsMutation,
} from '@/redux/apis/extendedApi';

const navigate = vi.fn();
const startManualRun = vi.fn();
const reassignExecutor = vi.fn();
const loadActiveUsers = vi.fn();
const refetch = vi.fn().mockResolvedValue(undefined);
const setPersistedRun = vi.fn();
const run: ManualTestRunRead = {
  id: 'run-1',
  projectId: 'project-1',
  sourceTestScenarioId: 'scenario-source',
  runKey: null,
  sourceScenarioKey: null,
  testScenarioId: 'scenario-live',
  executedById: null,
  executedBy: null,
  status: 'passed',
  startedAt: '2026-09-17T10:00:00.000Z',
  completedAt: '2026-09-17T11:00:00.000Z',
  updatedAt: '2026-09-17T11:00:00.000Z',
  title: 'Snapshot',
  details: null,
  objective: null,
  preconditions: null,
  testData: null,
  expectedResult: null,
  scenarioNotes: null,
  notes: null,
  steps: [],
};

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useNavigate: () => navigate };
});
vi.mock('@/components/manual-test-runs/hooks/useManualTestRunDetail', () => ({
  useManualTestRunDetail: () => ({ run, isLoading: false, isUnavailable: false, isError: false, refetch, setPersistedRun }),
}));
vi.mock('@/redux/apis/extendedApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/redux/apis/extendedApi')>();
  return {
    ...actual,
    useLazyGetApiV2UsersQuery: vi.fn(),
    usePatchApiV2ManualTestRunsByRunIdExecutorMutation: vi.fn(),
    usePostApiV2TestScenariosByScenarioIdManualRunsMutation: vi.fn(),
  };
});
vi.mock('@/components/manual-test-runs/hooks/useManualTestRunExecution', () => ({
  useManualTestRunExecution: ({ run: persistedRun }: { run: ManualTestRunRead }) => ({
    savedRun: persistedRun,
    runNotesDraft: '',
    stepDrafts: {},
    pendingWrite: undefined,
    feedback: undefined,
    recoveryBlocked: false,
    isReadOnly: true,
    isDirty: false,
    isRunNotesDirty: false,
    runKeyDraft: persistedRun.runKey ?? '',
    runKeyError: undefined,
    isRunKeyDirty: false,
    dirtyStepIds: [],
    setRunNotesDraft: vi.fn(),
    setRunKeyDraft: vi.fn(),
    setStepStatus: vi.fn(),
    setStepNotes: vi.fn(),
    saveRunNotes: vi.fn(),
    saveRunKey: vi.fn(),
    saveStep: vi.fn(),
    discardRunNotes: vi.fn(),
    discardRunKey: vi.fn(),
    discardStep: vi.fn(),
    requestCompletion: vi.fn(),
    isCompletionOpen: false,
    closeCompletion: vi.fn(),
    confirmCompletion: vi.fn(),
    retryAuthoritativeRecovery: vi.fn(),
    canEditRunKey: false,
    canStartRetest: () => true,
  }),
}));

const mockedStartMutation = vi.mocked(usePostApiV2TestScenariosByScenarioIdManualRunsMutation);
const mockedUsersQuery = vi.mocked(useLazyGetApiV2UsersQuery);
const mockedExecutorMutation = vi.mocked(usePatchApiV2ManualTestRunsByRunIdExecutorMutation);

describe('ManualTestRunDetailContainer', () => {
  beforeEach(() => {
    navigate.mockReset();
    startManualRun.mockReset();
    reassignExecutor.mockReset();
    loadActiveUsers.mockReset();
    setPersistedRun.mockReset();
    refetch.mockClear();
    mockedStartMutation.mockReturnValue([startManualRun, { isLoading: false }] as never);
    mockedUsersQuery.mockReturnValue([
      loadActiveUsers,
      {
        data: [
          { id: 'user-1', name: 'Current User', email: 'current@example.com' },
          { id: 'user-2', name: 'Next User', email: 'next@example.com' },
        ],
        isLoading: false,
        isError: false,
      },
    ] as never);
    mockedExecutorMutation.mockReturnValue([reassignExecutor, { isLoading: false }] as never);
  });

  it('saves Executor changes through the project-scoped endpoint and stores its authoritative response', async () => {
    const user = userEvent.setup();
    const reassignedRun = { ...run, executedById: 'user-2', executedBy: { id: 'user-2', name: 'Next User', email: 'next@example.com' } };
    reassignExecutor.mockReturnValue({ unwrap: () => Promise.resolve(reassignedRun) });

    render(<ChakraProvider><MemoryRouter><ManualTestRunDetailContainer projectId="project-1" runId="run-1" /></MemoryRouter></ChakraProvider>);
    await user.click(screen.getByRole('button', { name: 'Change Executor' }));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Executor' }), 'user-2');
    await user.click(screen.getByRole('button', { name: 'Save Executor' }));

    expect(reassignExecutor).toHaveBeenCalledWith({
      projectId: 'project-1',
      runId: 'run-1',
      manualTestRunExecutorReassignmentRequest: { executedById: 'user-2' },
    });
    await vi.waitFor(() => expect(setPersistedRun).toHaveBeenCalledWith(reassignedRun));
  });

  it('refreshes active-user options after the backend rejects an inactive target', async () => {
    const user = userEvent.setup();
    reassignExecutor.mockReturnValue({ unwrap: () => Promise.reject({ status: 400, data: { error: 'Executor must be an active user' } }) });

    render(<ChakraProvider><MemoryRouter><ManualTestRunDetailContainer projectId="project-1" runId="run-1" /></MemoryRouter></ChakraProvider>);
    await user.click(screen.getByRole('button', { name: 'Change Executor' }));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Executor' }), 'user-2');
    await user.click(screen.getByRole('button', { name: 'Save Executor' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Executor must be an active user');
    expect(loadActiveUsers).toHaveBeenCalledTimes(2);
    expect(screen.getByRole('combobox', { name: 'Executor' })).toHaveValue('user-2');
  });

  it('does not apply an Executor response after the run detail unmounts', async () => {
    const user = userEvent.setup();
    let resolveResponse!: (value: ManualTestRunRead) => void;
    reassignExecutor.mockReturnValue({
      unwrap: () => new Promise<ManualTestRunRead>((resolve) => {
        resolveResponse = resolve;
      }),
    });

    const view = render(<ChakraProvider><MemoryRouter><ManualTestRunDetailContainer projectId="project-1" runId="run-1" /></MemoryRouter></ChakraProvider>);
    await user.click(screen.getByRole('button', { name: 'Change Executor' }));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Executor' }), 'user-2');
    await user.click(screen.getByRole('button', { name: 'Save Executor' }));
    await vi.waitFor(() => expect(reassignExecutor).toHaveBeenCalledOnce());
    view.unmount();
    resolveResponse({ ...run, executedById: 'user-2' });

    await Promise.resolve();
    expect(setPersistedRun).not.toHaveBeenCalled();
  });

  it('starts a fresh empty-body run from the live source only after success', async () => {
    const user = userEvent.setup();
    startManualRun.mockReturnValue({ unwrap: () => Promise.resolve({ id: 'run-2' }) });

    render(<ChakraProvider><MemoryRouter><ManualTestRunDetailContainer projectId="project-1" runId="run-1" /></MemoryRouter></ChakraProvider>);
    await user.click(screen.getByRole('button', { name: 'Retest' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('current saved scenario content and steps');
    await user.click(screen.getByRole('button', { name: 'Start run' }));

    expect(startManualRun).toHaveBeenCalledWith({
      scenarioId: 'scenario-live',
      projectId: 'project-1',
      manualTestRunStartRequest: {},
    });
    expect(navigate).toHaveBeenCalledWith('/manual-test-runs/run-2', { state: { from: 'manual-test-run-history' } });
  });

  it('keeps the historical detail and does not replay an uncertain start', async () => {
    const user = userEvent.setup();
    startManualRun.mockReturnValue({ unwrap: () => Promise.reject({ status: 'FETCH_ERROR' }) });

    render(<ChakraProvider><MemoryRouter><ManualTestRunDetailContainer projectId="project-1" runId="run-1" /></MemoryRouter></ChakraProvider>);
    await user.click(screen.getByRole('button', { name: 'Retest' }));
    await user.click(screen.getByRole('button', { name: 'Start run' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Inspect history before trying again');
    expect(startManualRun).toHaveBeenCalledTimes(1);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('submits a fresh Run key without copying a historical label', async () => {
    const user = userEvent.setup();
    startManualRun.mockReturnValue({ unwrap: () => Promise.resolve({ id: 'run-3' }) });

    render(<ChakraProvider><MemoryRouter><ManualTestRunDetailContainer projectId="project-1" runId="run-1" /></MemoryRouter></ChakraProvider>);
    await user.click(screen.getByRole('button', { name: 'Retest' }));
    expect(screen.getByRole('textbox', { name: 'Run key (optional)' })).toHaveValue('');
    await user.type(screen.getByRole('textbox', { name: 'Run key (optional)' }), 'RUN-3');
    await user.click(screen.getByRole('button', { name: 'Start run' }));

    expect(startManualRun).toHaveBeenCalledWith({
      scenarioId: 'scenario-live',
      projectId: 'project-1',
      manualTestRunStartRequest: { runKey: 'RUN-3' },
    });
    expect(navigate).toHaveBeenCalledWith('/manual-test-runs/run-3', { state: { from: 'manual-test-run-history' } });
  });
});
