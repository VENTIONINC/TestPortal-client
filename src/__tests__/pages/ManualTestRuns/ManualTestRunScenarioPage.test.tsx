// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { lockRunRecovery, unlockRunRecovery } from '@/components/manual-test-runs/recoveryLock';
import { ChakraProvider } from '@/components/ui';
import { ManualTestRunScenarioPage } from '@/pages/ManualTestRuns/ManualTestRunScenarioPage';

const { refetch, saveEvidence, state } = vi.hoisted(() => ({ refetch: vi.fn(), saveEvidence: vi.fn(), state: { run: null as unknown, source: {} as unknown } }));
vi.mock('react-router', () => ({ useNavigate: () => vi.fn(), useParams: () => ({ runId: 'r', scenarioId: 's' }), Link: ({ children }: { children: React.ReactNode }) => <span>{children}</span> }));
vi.mock('@/pages/TestScenarios/TestManagementTabs', () => ({ TestManagementTabList: () => null }));
vi.mock('@/components/manual-test-runs/components/AssigneePicker', () => ({ AssigneePicker: () => null, shortName: () => '' }));
vi.mock('@/redux/apis/extendedApi', () => ({}));
vi.mock('@/redux/slices/projects', () => ({ useSelectedProjectId: () => 'p' }));
vi.mock('@/components/ui/components/Templates/MainTemplate', () => ({ MainTemplate: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock('@/redux/apis/generatedApi', () => ({
  useGetApiV2ManualTestRunsByRunIdQuery: () => ({ currentData: state.run, refetch }),
  useGetApiV2TestScenariosByScenarioIdQuery: () => state.source,
  useGetApiV2UsersQuery: () => ({}),
  usePatchApiV2ManualTestRunsByRunIdScenariosAndScenarioIdAssigneeMutation: () => [vi.fn()],
  usePatchApiV2ManualTestRunsByRunIdScenariosAndScenarioIdEvidenceMutation: () => [saveEvidence],
  usePostApiV2ManualTestRunsByRunIdCompleteMutation: () => [vi.fn(), {}],
  usePutApiV2ManualTestRunsByRunIdScenariosAndScenarioIdResultMutation: () => [vi.fn()],
}));

beforeEach(() => {
  state.run = { id: 'r', projectId: 'p', status: 'in_progress', scenarios: [] };
  state.source = {};
  saveEvidence.mockReset().mockReturnValue({ unwrap: () => Promise.resolve() });
});

describe.each(['failed', 'blocked'] as const)('%s step flags without notes', (result) => {
  const flagName = result === 'failed' ? /mark this step as the one that failed/i : /mark this step as the one that got blocked/i;
  const flagKey = result === 'failed' ? 'failedFlag' : 'blockedFlag';

  const setScenario = (flagged: boolean) => {
    state.run = {
      id: 'r', projectId: 'p', title: 'Run', status: 'in_progress',
      scenarios: [{
        id: 's', position: 1, sourceScenarioId: 'source', sourceScenarioKey: 'SC-1', title: 'Scenario', result,
        executionComment: null, defectReference: null, requirementContext: [], resultHistory: [],
        steps: [{ id: 'step', position: 1, action: 'Do something', expectedResult: 'It works', comment: null,
          failedFlag: result === 'failed' && flagged, failedComment: null,
          blockedFlag: result === 'blocked' && flagged, blockedComment: null }],
      }],
    };
  };

  it('saves the flag when no note is entered', async () => {
    setScenario(false);
    render(<ChakraProvider><ManualTestRunScenarioPage /></ChakraProvider>);
    fireEvent.click(screen.getByRole('button', { name: flagName }));
    await waitFor(() => expect(saveEvidence).toHaveBeenCalledWith(expect.objectContaining({
      manualTestRunScenarioEvidenceRequest: expect.objectContaining({
        steps: [expect.objectContaining({ [flagKey]: true, [`${result}Comment`]: null })],
      }),
    })), { timeout: 2000 });
  });

  it('restores a saved flag without overwriting it on opening', async () => {
    setScenario(true);
    render(<ChakraProvider><ManualTestRunScenarioPage /></ChakraProvider>);
    expect(screen.getByRole('button', { name: flagName })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.change(screen.getByRole('textbox', { name: /comment on the scenario/i }), { target: { value: 'Updated' } });
    await waitFor(() => expect(saveEvidence).toHaveBeenCalledWith(expect.objectContaining({
      manualTestRunScenarioEvidenceRequest: expect.objectContaining({
        executionComment: 'Updated', steps: [expect.objectContaining({ [flagKey]: true })],
      }),
    })), { timeout: 2000 });
  });

  it('moves the flag to another step while preserving the other result flag', async () => {
    setScenario(true);
    const run = state.run as { scenarios: { steps: Record<string, unknown>[] }[] };
    run.scenarios[0].steps[0][`${result}Comment`] = 'Previous note';
    run.scenarios[0].steps.push({
      id: 'step-2', position: 2, action: 'Next step', expectedResult: 'It works', comment: null,
      failedFlag: result === 'blocked', failedComment: result === 'blocked' ? 'Failed note' : null,
      blockedFlag: result === 'failed', blockedComment: result === 'failed' ? 'Blocked note' : null,
    });
    render(<ChakraProvider><ManualTestRunScenarioPage /></ChakraProvider>);
    const buttons = screen.getAllByRole('button', { name: flagName });
    fireEvent.click(buttons[1]);
    expect(buttons[0]).toHaveAttribute('aria-pressed', 'false');
    expect(buttons[1]).toHaveAttribute('aria-pressed', 'true');
    const otherFlag = result === 'failed' ? 'blockedFlag' : 'failedFlag';
    const otherComment = result === 'failed' ? 'blockedComment' : 'failedComment';
    await waitFor(() => expect(saveEvidence).toHaveBeenCalledWith(expect.objectContaining({
      manualTestRunScenarioEvidenceRequest: expect.objectContaining({
        steps: [
          expect.objectContaining({ id: 'step', [flagKey]: false, [`${result}Comment`]: null }),
          expect.objectContaining({ id: 'step-2', [flagKey]: true, [otherFlag]: true, [otherComment]: result === 'failed' ? 'Blocked note' : 'Failed note' }),
        ],
      }),
    })), { timeout: 2000 });
  });
});

describe('scenario source availability', () => {
  beforeEach(() => {
    state.run = { id: 'r', projectId: 'p', title: 'Run', status: 'in_progress', scenarios: [{
      id: 's', position: 1, sourceScenarioId: 'source', sourceScenarioKey: 'SC-1', title: 'Saved scenario', result: 'untested',
      executionComment: null, defectReference: null, requirementContext: [], resultHistory: [], steps: [],
    }] };
  });
  it('explains that a missing source is unavailable while retaining the snapshot', () => {
    state.source = { isError: true, error: { status: 404 } };
    render(<ChakraProvider><ManualTestRunScenarioPage /></ChakraProvider>);
    expect(screen.getByText('Saved scenario')).toBeInTheDocument();
    expect(screen.getByText(/source scenario is no longer available/i)).toBeInTheDocument();
    expect(screen.queryByText('Open in Scenarios')).not.toBeInTheDocument();
  });
  it('distinguishes a temporary source lookup error from a missing source', () => {
    state.source = { isError: true, error: { status: 'FETCH_ERROR' } };
    render(<ChakraProvider><ManualTestRunScenarioPage /></ChakraProvider>);
    expect(screen.getByText(/could not check the source scenario/i)).toBeInTheDocument();
    expect(screen.queryByText(/source scenario is no longer available/i)).not.toBeInTheDocument();
  });
});

describe('scenario page recovery', () => {
  it('requires a successful refresh after navigating from a run with failed recovery', async () => {
    lockRunRecovery('p', 'r');
    refetch.mockResolvedValueOnce({ error: { status: 'FETCH_ERROR' } }).mockResolvedValueOnce({ data: { id: 'r', projectId: 'p', scenarios: [] } });
    render(<ChakraProvider><ManualTestRunScenarioPage /></ChakraProvider>);
    fireEvent.click(screen.getByRole('button', { name: /retry refresh/i }));
    expect(await screen.findByText(/could not refresh/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry refresh/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /retry refresh/i }));
    expect(await screen.findByText(/scenario is not available/i)).toBeInTheDocument();
    unlockRunRecovery('p', 'r');
  });
});
