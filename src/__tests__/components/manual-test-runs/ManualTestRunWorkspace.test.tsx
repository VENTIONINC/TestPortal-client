// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ManualTestRunWorkspace } from '@/components/manual-test-runs/components/ManualTestRunWorkspace';
import { unlockRunRecovery } from '@/components/manual-test-runs/recoveryLock';
import { ChakraProvider } from '@/components/ui';

const { refetch, complete, bulk, run } = vi.hoisted(() => ({
  refetch: vi.fn(),
  complete: vi.fn(),
  bulk: vi.fn(),
  run: { id: 'r', projectId: 'p', title: 'Run', status: 'in_progress', scenarios: [] as Array<{ id: string; title: string; sourceScenarioKey: string; result: string; folderPath: string | null; assigneeId: string | null }>, environmentProperties: [] },
}));
vi.mock('react-router', () => ({ useNavigate: () => vi.fn(), Link: ({ children }: { children: React.ReactNode }) => <span>{children}</span> }));
vi.mock('@/redux/apis/extendedApi', () => ({
  useGetApiV2ManualTestRunsQuery: () => ({ currentData: { runs: [], total: 1 } }),
  useGetApiV2ManualTestRunsByRunIdQuery: () => ({ currentData: run, refetch }),
  useLazyGetApiV2UsersQuery: () => [vi.fn(), {}],
  useDeleteManualTestRunMutation: () => [vi.fn()],
  usePostApiV2ManualTestRunsByRunIdCompleteMutation: () => [complete],
  usePostApiV2ManualTestRunsByRunIdReopenMutation: () => [vi.fn()],
  usePostApiV2ManualTestRunsByRunIdScenariosBulkMutation: () => [bulk],
  usePatchApiV2ManualTestRunsByRunIdScenariosAndScenarioIdAssigneeMutation: () => [vi.fn()],
  usePutApiV2ManualTestRunsByRunIdScenariosAndScenarioIdResultMutation: () => [vi.fn()],
  usePutApiV2ManualTestRunsByRunIdScenariosOrderMutation: () => [vi.fn()],
}));
vi.mock('@/redux/apis/generatedApi', () => ({
  useGetApiV2TestScenariosQuery: () => ({ currentData: { total: 1 } }),
  usePutApiV2ManualTestRunsByRunIdDetailsMutation: () => [vi.fn()],
}));

describe('manual run recovery', () => {
  it('blocks changes until a failed authoritative refresh is retried successfully', async () => {
    complete.mockReturnValue({ unwrap: () => Promise.reject({ status: 'FETCH_ERROR' }) });
    refetch.mockResolvedValueOnce({ error: { status: 'FETCH_ERROR' } }).mockResolvedValueOnce({ data: run });
    render(<ChakraProvider><ManualTestRunWorkspace projectId="p" selectedRunId="r" onSelectRun={() => {}} /></ChakraProvider>);
    fireEvent.click(screen.getByRole('button', { name: /complete run/i }));
    const retry = await screen.findByRole('button', { name: /retry refresh/i });
    expect(screen.getByRole('button', { name: /complete run/i })).toBeDisabled();
    fireEvent.click(retry);
    await waitFor(() => expect(screen.getByRole('button', { name: /complete run/i })).toBeEnabled());
    expect(complete).toHaveBeenCalledTimes(1);
  });
  it('explains that a rejected change was not saved when another user completed the run', async () => {
    complete.mockReturnValue({ unwrap: () => Promise.reject({ status: 409 }) });
    refetch.mockResolvedValueOnce({ data: { ...run, status: 'completed', completedBy: { name: 'Alex' } } });
    render(<ChakraProvider><ManualTestRunWorkspace projectId="p" selectedRunId="r" onSelectRun={() => {}} /></ChakraProvider>);
    fireEvent.click(screen.getByRole('button', { name: /complete run/i }));
    expect(await screen.findByText(/not saved.*completed/i)).toBeInTheDocument();
  });

  it('retains the recovery lock after leaving and reopening the run workspace', async () => {
    complete.mockReturnValue({ unwrap: () => Promise.reject({ status: 'FETCH_ERROR' }) });
    refetch.mockResolvedValueOnce({ error: { status: 'FETCH_ERROR' } });
    const view = render(<ChakraProvider><ManualTestRunWorkspace projectId="p" selectedRunId="r" onSelectRun={() => {}} /></ChakraProvider>);
    fireEvent.click(screen.getByRole('button', { name: /complete run/i }));
    await screen.findByRole('button', { name: /retry refresh/i });
    view.unmount();
    render(<ChakraProvider><ManualTestRunWorkspace projectId="p" selectedRunId="r" onSelectRun={() => {}} /></ChakraProvider>);
    expect(screen.getByRole('button', { name: /complete run/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /retry refresh/i })).toBeInTheDocument();
  });

});

describe('manual run bulk selection', () => {
  it('selects all matching scenarios and retains selection across pages', () => {
    unlockRunRecovery('p', 'r');
    run.scenarios = Array.from({ length: 29 }, (_, index) => ({
      id: String(index), title: `Scenario ${index}`, sourceScenarioKey: `S-${index}`,
      result: 'untested', folderPath: null, assigneeId: null,
    }));
    const view = render(<ChakraProvider><ManualTestRunWorkspace projectId="p" selectedRunId="r" onSelectRun={() => {}} /></ChakraProvider>);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select visible scenarios' }));
    expect(screen.getByText('25 selected')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Select all 29' }));
    expect(screen.getByText('29 selected')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Select all 29' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(screen.getByText('29 selected')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Select Scenario 25' })).toBeChecked();
    view.unmount();
    run.scenarios = [];
  });
});

describe('manual run selection behavior', () => {
  const setup = () => {
    unlockRunRecovery('p', 'r');
    run.status = 'in_progress';
    run.scenarios = Array.from({ length: 30 }, (_, index) => ({
      id: String(index), title: index < 29 ? `Match ${index}` : 'Other',
      sourceScenarioKey: `S-${index}`, result: index === 0 ? 'failed' : 'passed',
      folderPath: null, assigneeId: null,
    }));
    bulk.mockReset();
    bulk.mockReturnValue({ unwrap: () => Promise.resolve(run) });
    return render(<ChakraProvider><ManualTestRunWorkspace projectId="p" selectedRunId="r" onSelectRun={() => {}} /></ChakraProvider>);
  };

  it('locks selection in completed runs', () => {
    const view = setup();
    run.status = 'completed';
    view.rerender(<ChakraProvider><ManualTestRunWorkspace projectId="p" selectedRunId="r" onSelectRun={() => {}} /></ChakraProvider>);
    expect(screen.getByRole('checkbox', { name: 'Select visible scenarios' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: /Select all 30/ })).not.toBeInTheDocument();
    view.unmount();
    run.status = 'in_progress';
  });

  it('preserves selection across page size and page changes, and clears it on scope changes', async () => {
    const view = setup();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select visible scenarios' }));
    fireEvent.click(screen.getByRole('button', { name: 'Select all 30' }));
    fireEvent.change(screen.getByLabelText('Rows per page'), { target: { value: '10' } });
    expect(screen.getByText('30 selected')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select visible scenarios' }));
    expect(screen.getByText('20 selected')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(screen.getByRole('checkbox', { name: 'Select Match 10' })).toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(screen.queryByRole('toolbar', { name: 'Bulk scenario actions' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select visible scenarios' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Search scenarios' }), { target: { value: 'Match' } });
    expect(screen.queryByRole('toolbar', { name: 'Bulk scenario actions' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select visible scenarios' }));
    fireEvent.click(screen.getByRole('button', { name: 'Status' }));
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Passed' }));
    expect(screen.queryByRole('toolbar', { name: 'Bulk scenario actions' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Status: 1' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select visible scenarios' }));
    view.rerender(<ChakraProvider><ManualTestRunWorkspace projectId="p" selectedRunId="other" onSelectRun={() => {}} /></ChakraProvider>);
    expect(screen.queryByRole('toolbar', { name: 'Bulk scenario actions' })).not.toBeInTheDocument();
    view.rerender(<ChakraProvider><ManualTestRunWorkspace projectId="p" selectedRunId="r" onSelectRun={() => {}} /></ChakraProvider>);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select visible scenarios' }));
    view.rerender(<ChakraProvider><ManualTestRunWorkspace projectId="p2" selectedRunId="r" onSelectRun={() => {}} /></ChakraProvider>);
    expect(screen.queryByRole('toolbar', { name: 'Bulk scenario actions' })).not.toBeInTheDocument();
    view.unmount();
  });

  it('submits filtered off-page IDs for bulk result and assignment', async () => {
    const view = setup();
    fireEvent.change(screen.getByRole('textbox', { name: 'Search scenarios' }), { target: { value: 'Match' } });
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select visible scenarios' }));
    fireEvent.click(screen.getByRole('button', { name: 'Select all 29' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mark selected Passed' }));
    const ids = Array.from({ length: 29 }, (_, index) => String(index));
    expect(bulk).toHaveBeenCalledWith(expect.objectContaining({
      manualTestRunScenarioBulkRequest: { scenarioIds: ids, result: 'passed' },
    }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Bulk assign' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Bulk assign' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Unassigned' }));
    expect(bulk).toHaveBeenLastCalledWith(expect.objectContaining({
      manualTestRunScenarioBulkRequest: { scenarioIds: ids, assigneeId: null },
    }));
    view.unmount();
  });

  it('resets the selected result only when all selected scenarios already have it', () => {
    const view = setup();
    run.scenarios = run.scenarios.map((scenario) => ({ ...scenario, result: 'passed' }));
    view.rerender(<ChakraProvider><ManualTestRunWorkspace projectId="p" selectedRunId="r" onSelectRun={() => {}} /></ChakraProvider>);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select visible scenarios' }));
    fireEvent.click(screen.getByRole('button', { name: 'Select all 30' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reset selected scenarios to Untested' }));
    expect(bulk).toHaveBeenCalledWith(expect.objectContaining({
      manualTestRunScenarioBulkRequest: {
        scenarioIds: Array.from({ length: 30 }, (_, index) => String(index)),
        result: 'untested',
      },
    }));
    view.unmount();
  });
});
