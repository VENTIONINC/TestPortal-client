// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ManualTestRunWorkspace } from '@/components/manual-test-runs/components/ManualTestRunWorkspace';
import { ChakraProvider } from '@/components/ui';

const { refetch, complete, run } = vi.hoisted(() => ({
  refetch: vi.fn(),
  complete: vi.fn(),
  run: { id: 'r', projectId: 'p', title: 'Run', status: 'in_progress', scenarios: [], environmentProperties: [] },
}));
vi.mock('react-router', () => ({ useNavigate: () => vi.fn(), Link: ({ children }: { children: React.ReactNode }) => <span>{children}</span> }));
vi.mock('@/redux/apis/extendedApi', () => ({
  useGetApiV2ManualTestRunsQuery: () => ({ currentData: { runs: [], total: 1 } }),
  useGetApiV2ManualTestRunsByRunIdQuery: () => ({ currentData: run, refetch }),
  useLazyGetApiV2UsersQuery: () => [vi.fn(), {}],
  useDeleteManualTestRunMutation: () => [vi.fn()],
  usePostApiV2ManualTestRunsByRunIdCompleteMutation: () => [complete],
  usePostApiV2ManualTestRunsByRunIdReopenMutation: () => [vi.fn()],
  usePostApiV2ManualTestRunsByRunIdScenariosBulkMutation: () => [vi.fn()],
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
