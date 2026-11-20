// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0
import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const createRun = vi.fn();
const navigate = vi.fn();
const loadRuns = vi.fn();
let projectId = 'project-1';
vi.mock('react-router', () => ({ useLocation: () => ({ state: { scenarioIds: ['scenario-1'] } }), useNavigate: () => navigate }));
vi.mock('@/redux/slices/projects', () => ({ useSelectedProjectId: () => projectId }));
vi.mock('@/redux/apis/extendedApi', () => ({
  useGetApiV2ManualTestRunsQuery: () => ({ currentData: { runs: [] } }),
  useLazyGetApiV2ManualTestRunsQuery: () => [loadRuns],
  useGetApiV2TestSuitesQuery: () => ({ currentData: [] }),
  usePostApiV2ManualTestRunsMutation: () => [createRun, { isLoading: false }],
}));
vi.mock('@/pages/TestScenarios/TestScenariosPage', () => ({ TestScenariosPage: () => null }));
vi.mock('@/components/manual-test-runs/components/ManualRunDetailsDialog', () => ({
  normalizeEnvironment: (items: unknown) => items,
  ManualRunDetailsDialog: ({ onSubmit, error, sourceRunTitle, environment }: { onSubmit: () => void; error: string; sourceRunTitle?: string; environment: { name: string; value: string }[] }) => <><button onClick={onSubmit}>Start</button><div role="alert">{error}</div><div>{sourceRunTitle}</div><div>{environment.map((item) => `${item.name}: ${item.value}`).join(', ')}</div></>,
}));
import { NewManualTestRunPage } from '@/pages/ManualTestRuns/NewManualTestRunPage';

describe('manual run creation', () => {
  beforeEach(() => { createRun.mockReset(); navigate.mockReset(); loadRuns.mockReset().mockReturnValue({ unwrap: () => Promise.resolve({ runs: [], totalPages: 1 }) }); projectId = 'project-1'; });
  it('prefills from the most recently created run even when it is on a later history page', async () => {
    loadRuns.mockImplementation(({ page }: { page: number }) => ({ unwrap: () => Promise.resolve(page === 1
      ? { totalPages: 2, runs: [{ title: 'Older edited run', startedAt: '2026-01-01T00:00:00Z', environmentProperties: [{ name: 'Browser', value: 'Old' }] }] }
      : { totalPages: 2, runs: [{ title: 'Newest run', startedAt: '2026-02-01T00:00:00Z', environmentProperties: [{ name: 'Browser', value: 'New' }] }] }) }));
    render(<NewManualTestRunPage />);
    expect(await screen.findByText('Newest run')).toBeInTheDocument();
    expect(screen.getByText('Browser: New')).toBeInTheDocument();
  });
  it('warns that a run may have been created after a lost response', async () => {
    createRun.mockReturnValue({ unwrap: () => Promise.reject({ status: 'FETCH_ERROR' }) });
    render(<NewManualTestRunPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    expect(await screen.findByText(/A run may have been created/)).toBeInTheDocument();
    expect(createRun).toHaveBeenCalledTimes(1);
  });
  it('does not navigate when the project changes before creation completes', async () => {
    let resolve!: (value: { id: string }) => void;
    createRun.mockReturnValue({ unwrap: () => new Promise((done) => { resolve = done; }) });
    const view = render(<NewManualTestRunPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    projectId = 'project-2';
    view.rerender(<NewManualTestRunPage />);
    projectId = 'project-1';
    view.rerender(<NewManualTestRunPage />);
    await act(async () => resolve({ id: 'run-1' }));
    expect(navigate).not.toHaveBeenCalledWith(expect.stringContaining('run-1'), expect.anything());
  });
  it('closes the project-scoped draft when the selected project changes', () => {
    const view = render(<NewManualTestRunPage />);
    projectId = 'project-2';
    view.rerender(<NewManualTestRunPage />);
    expect(screen.queryByRole('button', { name: 'Start' })).not.toBeInTheDocument();
    expect(navigate).toHaveBeenCalledWith('/manual-test-runs', { replace: true });
    expect(createRun).not.toHaveBeenCalled();
  });
  it('does not navigate when the form has been closed before creation completes', async () => {
    let resolve!: (value: { id: string }) => void;
    createRun.mockReturnValue({ unwrap: () => new Promise((done) => { resolve = done; }) });
    const view = render(<NewManualTestRunPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    view.unmount();
    await act(async () => resolve({ id: 'run-1' }));
    expect(navigate).not.toHaveBeenCalled();
  });
  it('opens the run after a successful response in the original scope', async () => {
    createRun.mockReturnValue({ unwrap: () => Promise.resolve({ id: 'run-1' }) });
    render(<NewManualTestRunPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    await act(async () => {});
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate.mock.calls[0][0]).toContain('run-1');
  });
  it('does not submit twice while the first creation is pending', () => {
    createRun.mockReturnValue({ unwrap: () => new Promise(() => {}) });
    render(<NewManualTestRunPage />);
    const start = screen.getByRole('button', { name: 'Start' });
    fireEvent.click(start);
    fireEvent.click(start);
    expect(createRun).toHaveBeenCalledTimes(1);
  });

});
