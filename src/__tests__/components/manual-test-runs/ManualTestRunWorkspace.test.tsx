// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0
import { useState, type PropsWithChildren } from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ManualTestRunWorkspace } from '@/components/manual-test-runs/components/ManualTestRunWorkspace';
import { unlockRunRecovery } from '@/components/manual-test-runs/recoveryLock';
import { ChakraProvider, DialogPortal } from '@/components/ui';
import dialogReducer from '@/redux/slices/dialog';

const { refetch, detailState, complete, deleteRun, saveDetails, loadScenarios, bulk, run } = vi.hoisted(() => ({
  refetch: vi.fn(),
  detailState: { error: undefined as { status: number } | undefined },
  complete: vi.fn(),
  deleteRun: vi.fn(),
  saveDetails: vi.fn(),
  loadScenarios: vi.fn(),
  bulk: vi.fn(),
  run: {
    id: 'r',
    projectId: 'p',
    title: 'Run',
    status: 'in_progress',
    scenarios: [] as Array<{
      id: string;
      title: string;
      sourceScenarioId?: string;
      sourceScenarioKey: string;
      result: string;
      folderPath: string | null;
      assigneeId: string | null;
      tags?: { id: string; name: string; description: string }[];
    }>,
    environmentProperties: [],
  },
}));
vi.mock('react-router', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));
vi.mock('@/redux/apis/extendedApi', () => ({
  useGetApiV2ManualTestRunsQuery: () => ({ currentData: { runs: [], total: 1 } }),
  useGetApiV2ManualTestRunsByRunIdQuery: () => ({ currentData: run, refetch, error: detailState.error }),
  useLazyGetApiV2UsersQuery: () => [vi.fn(), {}],
  useDeleteManualTestRunMutation: () => [deleteRun],
  usePostApiV2ManualTestRunsByRunIdCompleteMutation: () => [complete],
  usePostApiV2ManualTestRunsByRunIdReopenMutation: () => [vi.fn()],
  usePostApiV2ManualTestRunsByRunIdScenariosBulkMutation: () => [bulk],
  usePatchApiV2ManualTestRunsByRunIdScenariosAndScenarioIdAssigneeMutation: () => [vi.fn()],
  usePutApiV2ManualTestRunsByRunIdScenariosAndScenarioIdResultMutation: () => [vi.fn()],
  usePutApiV2ManualTestRunsByRunIdScenariosOrderMutation: () => [vi.fn()],
}));
vi.mock('@/redux/apis/generatedApi', () => ({
  useGetApiV2ManualTestRunsQuery: () => ({ currentData: { runs: [] } }),
  useGetApiV2ProjectsByProjectIdScenarioTagsQuery: () => ({
    currentData: [
      { id: 'tag', name: 'M1', description: 'Release' },
      { id: 'other-tag', name: 'Smoke', description: '' },
    ],
  }),
  useGetApiV2TestScenariosQuery: () => ({
    currentData: {
      total: 1,
      totalPages: 1,
      scenarios: [{ id: 'b', title: 'New scenario', scenarioKey: 'S-2', priority: 'low' }],
    },
  }),
  useLazyGetApiV2TestScenariosQuery: () => [loadScenarios],
  useGetApiV2TestScenarioFoldersQuery: () => ({ currentData: [] }),
  useGetApiV2TestSuitesQuery: () => ({ currentData: [] }),
  usePutApiV2ManualTestRunsByRunIdDetailsMutation: () => [saveDetails],
}));

const createStore = () =>
  configureStore({
    reducer: { dialog: dialogReducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
  });

const WorkspaceProvider = ({ children, store }: PropsWithChildren<{ store?: ReturnType<typeof createStore> }>) => {
  const [workspaceStore] = useState(() => store ?? createStore());
  return (
    <Provider store={workspaceStore}>
      <ChakraProvider>
        {children}
        <DialogPortal />
      </ChakraProvider>
    </Provider>
  );
};

const setUntestedScenario = () => {
  run.scenarios = [
    {
      id: 'scenario',
      title: 'Scenario',
      sourceScenarioId: 'a',
      sourceScenarioKey: 'S-1',
      result: 'untested',
      folderPath: null,
      assigneeId: null,
    },
  ];
};

beforeEach(() => {
  unlockRunRecovery('p', 'r');
  run.status = 'in_progress';
  run.scenarios = [];
  refetch.mockReset();
  detailState.error = undefined;
  complete.mockReset();
  deleteRun.mockReset();
  saveDetails.mockReset();
  loadScenarios.mockReturnValue({ unwrap: () => Promise.resolve({ totalPages: 1, scenarios: [] }) });
});

describe('manual run recovery', () => {
  it('blocks changes until a failed authoritative refresh is retried successfully', async () => {
    complete.mockReturnValue({ unwrap: () => Promise.reject({ status: 'FETCH_ERROR' }) });
    refetch.mockResolvedValueOnce({ error: { status: 'FETCH_ERROR' } }).mockResolvedValueOnce({ data: run });
    render(
      <WorkspaceProvider>
        <ManualTestRunWorkspace projectId="p" selectedRunId="r" onSelectRun={() => {}} />
      </WorkspaceProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: /complete run/i }));
    const retry = await screen.findByRole('button', { name: /retry refresh/i });
    expect(screen.getByRole('button', { name: /complete run/i })).toBeDisabled();
    fireEvent.click(retry);
    await waitFor(() => expect(screen.getByRole('button', { name: /complete run/i })).toBeEnabled());
    expect(complete).toHaveBeenCalledTimes(1);
  });
  it('explains that a rejected change was not saved when another user completed the run', async () => {
    setUntestedScenario();
    complete.mockReturnValue({ unwrap: () => Promise.reject({ status: 409 }) });
    refetch.mockResolvedValueOnce({ data: { ...run, status: 'completed', completedBy: { name: 'Alex' } } });
    render(
      <WorkspaceProvider>
        <ManualTestRunWorkspace projectId="p" selectedRunId="r" onSelectRun={() => {}} />
      </WorkspaceProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: /complete run/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Complete and skip 1' }));
    expect(await screen.findByText(/not saved.*completed/i)).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(complete).toHaveBeenCalledWith({ projectId: 'p', runId: 'r', body: {} });
  });

  it('retains the recovery lock after leaving and reopening the run workspace', async () => {
    complete.mockReturnValue({ unwrap: () => Promise.reject({ status: 'FETCH_ERROR' }) });
    refetch.mockResolvedValueOnce({ error: { status: 'FETCH_ERROR' } });
    const view = render(
      <WorkspaceProvider>
        <ManualTestRunWorkspace projectId="p" selectedRunId="r" onSelectRun={() => {}} />
      </WorkspaceProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: /complete run/i }));
    await screen.findByRole('button', { name: /retry refresh/i });
    view.unmount();
    render(
      <WorkspaceProvider>
        <ManualTestRunWorkspace projectId="p" selectedRunId="r" onSelectRun={() => {}} />
      </WorkspaceProvider>,
    );
    expect(screen.getByRole('button', { name: /complete run/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /retry refresh/i })).toBeInTheDocument();
  });
});

describe('manual run confirmation dialogs', () => {
  it('opens completion through the dialog portal and restores focus after cancel', async () => {
    setUntestedScenario();
    const store = createStore();
    render(
      <WorkspaceProvider store={store}>
        <ManualTestRunWorkspace projectId="p" selectedRunId="r" onSelectRun={vi.fn()} />
      </WorkspaceProvider>,
    );
    const trigger = screen.getByRole('button', { name: /complete run/i });
    trigger.focus();
    fireEvent.click(trigger);
    expect(store.getState().dialog.dialogs).toHaveLength(1);
    const dialog = screen.getByRole('alertdialog', { name: /complete the run with 1 untested/i });
    const cancel = within(dialog).getByRole('button', { name: 'Keep testing' });
    // Chakra's focus trap checks for a visible layout box, which jsdom does not calculate.
    vi.spyOn(cancel, 'offsetWidth', 'get').mockReturnValue(100);
    await waitFor(() => expect(cancel).toHaveFocus());
    fireEvent.click(cancel);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('clears the selected run after a confirmed deletion', async () => {
    const onSelectRun = vi.fn();
    deleteRun.mockReturnValueOnce({ unwrap: () => Promise.resolve() });
    render(
      <WorkspaceProvider>
        <ManualTestRunWorkspace projectId="p" selectedRunId="r" onSelectRun={onSelectRun} />
      </WorkspaceProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Run actions' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Delete run' }));
    const dialog = screen.getByRole('alertdialog', { name: /delete “run”/i });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete run' }));

    await waitFor(() => expect(onSelectRun).toHaveBeenCalledWith(''));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it.each(['before', 'after'])('hides the deleted run when returning %s deletion succeeds', async (returnTiming) => {
    const store = createStore();
    const onSelectRun = vi.fn();
    const deletion = Promise.withResolvers<void>();
    deleteRun.mockReturnValueOnce({ unwrap: () => deletion.promise });
    const view = render(
      <WorkspaceProvider store={store}>
        <ManualTestRunWorkspace projectId="p" selectedRunId="r" onSelectRun={onSelectRun} />
      </WorkspaceProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Run actions' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Delete run' }));
    expect(store.getState().dialog.dialogs).toHaveLength(1);
    const dialog = screen.getByRole('alertdialog', { name: /delete “run”/i });
    const confirm = within(dialog).getByRole('button', { name: 'Delete run' });
    fireEvent.click(confirm);
    expect(confirm).toBeDisabled();
    expect(deleteRun).toHaveBeenCalledWith({ projectId: 'p', runId: 'r' });
    view.rerender(
      <WorkspaceProvider store={store}>
        <ManualTestRunWorkspace projectId="p" selectedRunId="other" onSelectRun={onSelectRun} />
      </WorkspaceProvider>,
    );
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();

    if (returnTiming === 'before') {
      view.rerender(
        <WorkspaceProvider store={store}>
          <ManualTestRunWorkspace projectId="p" selectedRunId="r" onSelectRun={onSelectRun} />
        </WorkspaceProvider>,
      );
      expect(screen.getByRole('button', { name: 'Complete run' })).toBeDisabled();
    }

    await act(async () => deletion.resolve());
    if (returnTiming === 'before') {
      expect(onSelectRun).toHaveBeenCalledWith('');
    } else {
      expect(onSelectRun).not.toHaveBeenCalled();
      view.rerender(
        <WorkspaceProvider store={store}>
          <ManualTestRunWorkspace projectId="p" selectedRunId="r" onSelectRun={onSelectRun} />
        </WorkspaceProvider>,
      );
    }
    expect(screen.getByRole('alert')).toHaveTextContent('This run is unavailable');
    expect(screen.queryByRole('button', { name: 'Run actions' })).not.toBeInTheDocument();
  });
});

describe('manual run editing dialogs', () => {
  it('returns the nested picker selection to the edit draft and restores the Change button focus', async () => {
    const store = createStore();
    const { container } = render(
      <WorkspaceProvider store={store}>
        <ManualTestRunWorkspace projectId="p" selectedRunId="r" onSelectRun={vi.fn()} />
      </WorkspaceProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Run actions' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Edit run details' }));
    const detailsDialog = screen.getByRole('dialog', { name: 'Edit run details' });
    const change = within(detailsDialog).getByRole('button', { name: 'Change' });
    expect(store.getState().dialog.dialogs).toHaveLength(1);
    await waitFor(() => expect(container).toHaveAttribute('aria-hidden', 'true'));
    change.focus();
    fireEvent.click(change);
    const picker = screen.getByRole('dialog', { name: 'Select scenarios' });
    expect(store.getState().dialog.dialogs).toHaveLength(2);
    await waitFor(() => expect(picker.contains(document.activeElement)).toBe(true));
    fireEvent.click(within(picker).getByRole('checkbox', { name: 'Select New scenario' }));
    fireEvent.click(within(picker).getByRole('button', { name: 'Done' }));

    expect(within(detailsDialog).getByText('1 unique scenario')).toBeInTheDocument();
    expect(store.getState().dialog.dialogs).toHaveLength(1);
    expect(saveDetails).not.toHaveBeenCalled();
    await waitFor(() => expect(change).toHaveFocus());
  });

  it('preserves an unsaved edit when recovery cannot refresh the run', async () => {
    setUntestedScenario();
    saveDetails.mockReturnValueOnce({ unwrap: () => Promise.reject({ status: 'FETCH_ERROR' }) });
    refetch.mockResolvedValueOnce({ error: { status: 'FETCH_ERROR' } });
    render(
      <WorkspaceProvider>
        <ManualTestRunWorkspace projectId="p" selectedRunId="r" onSelectRun={vi.fn()} />
      </WorkspaceProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Run actions' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Edit run details' }));
    const dialog = screen.getByRole('dialog', { name: 'Edit run details' });
    const name = within(dialog).getByRole('textbox', { name: 'Run name' });
    fireEvent.change(name, { target: { value: 'Draft title' } });
    const save = within(dialog).getByRole('button', { name: 'Save changes' });
    fireEvent.click(save);

    expect(await within(dialog).findByRole('alert')).toHaveTextContent('retry the run refresh');
    expect(name).toHaveValue('Draft title');
    expect(save).toBeDisabled();
    expect(saveDetails).toHaveBeenCalledWith({
      projectId: 'p',
      runId: 'r',
      manualTestRunDetailsRequest: { title: 'Draft title', scenarioIds: ['a'], environmentProperties: [] },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(await screen.findByRole('button', { name: 'Retry refresh' })).toBeEnabled();
  });
});

describe('manual run bulk selection', () => {
  it('selects all matching scenarios and retains selection across pages', () => {
    unlockRunRecovery('p', 'r');
    run.scenarios = Array.from({ length: 29 }, (_, index) => ({
      id: String(index),
      title: `Scenario ${index}`,
      sourceScenarioKey: `S-${index}`,
      result: 'untested',
      folderPath: null,
      assigneeId: null,
    }));
    const view = render(
      <WorkspaceProvider>
        <ManualTestRunWorkspace projectId="p" selectedRunId="r" onSelectRun={() => {}} />
      </WorkspaceProvider>,
    );
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
      id: String(index),
      title: index < 29 ? `Match ${index}` : 'Other',
      sourceScenarioKey: `S-${index}`,
      result: index === 0 ? 'failed' : 'passed',
      folderPath: null,
      assigneeId: null,
    }));
    bulk.mockReset();
    bulk.mockReturnValue({ unwrap: () => Promise.resolve(run) });
    return render(
      <WorkspaceProvider>
        <ManualTestRunWorkspace projectId="p" selectedRunId="r" onSelectRun={() => {}} />
      </WorkspaceProvider>,
    );
  };

  it('counts and selects tag matches across pages without altering whole-run progress', async () => {
    const view = setup();
    run.scenarios = run.scenarios.map((scenario, index) => ({
      ...scenario,
      tags: index < 27 ? [{ id: 'tag', name: 'M1', description: 'Release' }] : [],
    }));
    view.rerender(
      <WorkspaceProvider>
        <ManualTestRunWorkspace projectId="p" selectedRunId="r" onSelectRun={() => {}} />
      </WorkspaceProvider>,
    );
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select visible scenarios' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    fireEvent.click(screen.getByRole('button', { name: 'Tags' }));
    const option = await screen.findByRole('checkbox', { name: 'M1' });
    expect(option.closest('label')).toHaveTextContent('27');
    fireEvent.click(option);
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.queryByRole('toolbar', { name: 'Bulk scenario actions' })).not.toBeInTheDocument();
    expect(screen.getByText('1–25 of 27')).toBeInTheDocument();
    expect(screen.getByLabelText('Run progress: 30 of 30 marked')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select visible scenarios' }));
    fireEvent.click(screen.getByRole('button', { name: 'Select all 27' }));
    expect(screen.getByText('27 selected')).toBeInTheDocument();
    view.rerender(
      <WorkspaceProvider>
        <ManualTestRunWorkspace projectId="p" selectedRunId="other" onSelectRun={() => {}} />
      </WorkspaceProvider>,
    );
    view.rerender(
      <WorkspaceProvider>
        <ManualTestRunWorkspace projectId="p" selectedRunId="r" onSelectRun={() => {}} />
      </WorkspaceProvider>,
    );
    expect(screen.getByText('1–25 of 30')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tags' })).toBeInTheDocument();
  });

  it('combines any selected tag with other filters and uses their matches for tag counts', async () => {
    const view = setup();
    const m1 = { id: 'tag', name: 'M1', description: 'Release' };
    const smoke = { id: 'other-tag', name: 'Smoke', description: '' };
    run.scenarios = run.scenarios.map((scenario, index) => ({
      ...scenario,
      tags: index === 1 ? [m1] : index === 2 ? [m1, smoke] : index === 3 ? [] : [smoke],
    }));
    view.rerender(
      <WorkspaceProvider>
        <ManualTestRunWorkspace projectId="p" selectedRunId="r" onSelectRun={() => {}} />
      </WorkspaceProvider>,
    );
    fireEvent.change(screen.getByRole('textbox', { name: 'Search scenarios' }), { target: { value: 'Match' } });
    fireEvent.click(screen.getByRole('button', { name: 'Status' }));
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Passed' }));
    fireEvent.click(screen.getByRole('button', { name: 'Status: 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'Tags' }));
    const m1Row = await screen.findByRole('checkbox', { name: 'M1' });
    const smokeRow = screen.getByRole('checkbox', { name: 'Smoke' });
    expect(m1Row.closest('label')).toHaveTextContent('2');
    expect(smokeRow.closest('label')).toHaveTextContent('26');
    fireEvent.click(m1Row);
    expect(screen.getByText('1–2 of 2')).toBeInTheDocument();
    expect(smokeRow.closest('label')).toHaveTextContent('26');
    await waitFor(() => expect(smokeRow).toBeEnabled());
    fireEvent.click(smokeRow);
    expect(screen.getByText('1–25 of 27')).toBeInTheDocument();
  });

  it('locks selection in completed runs', () => {
    const view = setup();
    run.status = 'completed';
    view.rerender(
      <WorkspaceProvider>
        <ManualTestRunWorkspace projectId="p" selectedRunId="r" onSelectRun={() => {}} />
      </WorkspaceProvider>,
    );
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
    view.rerender(
      <WorkspaceProvider>
        <ManualTestRunWorkspace projectId="p" selectedRunId="other" onSelectRun={() => {}} />
      </WorkspaceProvider>,
    );
    expect(screen.queryByRole('toolbar', { name: 'Bulk scenario actions' })).not.toBeInTheDocument();
    view.rerender(
      <WorkspaceProvider>
        <ManualTestRunWorkspace projectId="p" selectedRunId="r" onSelectRun={() => {}} />
      </WorkspaceProvider>,
    );
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select visible scenarios' }));
    view.rerender(
      <WorkspaceProvider>
        <ManualTestRunWorkspace projectId="p2" selectedRunId="r" onSelectRun={() => {}} />
      </WorkspaceProvider>,
    );
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
    expect(bulk).toHaveBeenCalledWith(
      expect.objectContaining({
        manualTestRunScenarioBulkRequest: { scenarioIds: ids, result: 'passed' },
      }),
    );
    await waitFor(() => expect(screen.getByRole('button', { name: 'Bulk assign' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Bulk assign' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Unassigned' }));
    expect(bulk).toHaveBeenLastCalledWith(
      expect.objectContaining({
        manualTestRunScenarioBulkRequest: { scenarioIds: ids, assigneeId: null },
      }),
    );
    view.unmount();
  });

  it('resets the selected result only when all selected scenarios already have it', () => {
    const view = setup();
    run.scenarios = run.scenarios.map((scenario) => ({ ...scenario, result: 'passed' }));
    view.rerender(
      <WorkspaceProvider>
        <ManualTestRunWorkspace projectId="p" selectedRunId="r" onSelectRun={() => {}} />
      </WorkspaceProvider>,
    );
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select visible scenarios' }));
    fireEvent.click(screen.getByRole('button', { name: 'Select all 30' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reset selected scenarios to Untested' }));
    expect(bulk).toHaveBeenCalledWith(
      expect.objectContaining({
        manualTestRunScenarioBulkRequest: {
          scenarioIds: Array.from({ length: 30 }, (_, index) => String(index)),
          result: 'untested',
        },
      }),
    );
    view.unmount();
  });
});
