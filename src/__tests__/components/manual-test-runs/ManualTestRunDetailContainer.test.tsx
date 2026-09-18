// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ManualTestRunDetailContainer } from '@/components/manual-test-runs/containers/ManualTestRunDetailContainer';
import { ChakraProvider } from '@/components/ui';
import type { ManualTestRunRead } from '@/redux/apis/generatedApi';
import { usePostApiV2TestScenariosByScenarioIdManualRunsMutation } from '@/redux/apis/extendedApi';

const navigate = vi.fn();
const startManualRun = vi.fn();
const refetch = vi.fn().mockResolvedValue(undefined);
const run: ManualTestRunRead = {
  id: 'run-1',
  projectId: 'project-1',
  sourceTestScenarioId: 'scenario-source',
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
  useManualTestRunDetail: () => ({ run, isLoading: false, isUnavailable: false, isError: false, refetch, setPersistedRun: vi.fn() }),
}));
vi.mock('@/redux/apis/extendedApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/redux/apis/extendedApi')>();
  return { ...actual, usePostApiV2TestScenariosByScenarioIdManualRunsMutation: vi.fn() };
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
    dirtyStepIds: [],
    setRunNotesDraft: vi.fn(),
    setStepStatus: vi.fn(),
    setStepNotes: vi.fn(),
    saveRunNotes: vi.fn(),
    saveStep: vi.fn(),
    discardRunNotes: vi.fn(),
    discardStep: vi.fn(),
    requestCompletion: vi.fn(),
    isCompletionOpen: false,
    closeCompletion: vi.fn(),
    confirmCompletion: vi.fn(),
    retryAuthoritativeRecovery: vi.fn(),
  }),
}));

const mockedStartMutation = vi.mocked(usePostApiV2TestScenariosByScenarioIdManualRunsMutation);

describe('ManualTestRunDetailContainer', () => {
  beforeEach(() => {
    navigate.mockReset();
    startManualRun.mockReset();
    refetch.mockClear();
    mockedStartMutation.mockReturnValue([startManualRun, { isLoading: false }] as never);
  });

  it('starts a fresh empty-body run from the live source only after success', async () => {
    const user = userEvent.setup();
    startManualRun.mockReturnValue({ unwrap: () => Promise.resolve({ id: 'run-2' }) });

    render(<ChakraProvider><MemoryRouter><ManualTestRunDetailContainer projectId="project-1" runId="run-1" /></MemoryRouter></ChakraProvider>);
    await user.click(screen.getByRole('button', { name: 'Retest' }));

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

    expect(screen.getByRole('alert')).toHaveTextContent('Inspect history before trying again');
    expect(startManualRun).toHaveBeenCalledTimes(1);
    expect(navigate).not.toHaveBeenCalled();
  });
});
