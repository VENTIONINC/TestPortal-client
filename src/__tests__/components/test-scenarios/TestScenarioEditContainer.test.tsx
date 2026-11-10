import userEvent from '@testing-library/user-event';
// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TestScenarioEditContainer } from '@/components/test-scenarios/containers/TestScenarioEditContainer';
import { ChakraProvider } from '@/components/ui';
import type { TestScenario } from '@/redux/apis/generatedApi';
const { navigate, updateScenario, refetch, state } = vi.hoisted(() => ({
  navigate: vi.fn(),
  updateScenario: vi.fn(),
  refetch: vi.fn(),
  state: { scenario: undefined as unknown, search: '' },
}));
vi.mock('react-router', async (original) => ({
  ...(await original<typeof import('react-router')>()),
  useNavigate: () => navigate,
  useLocation: () => ({ search: state.search }),
}));
vi.mock('@/components/test-scenarios/hooks/useTestScenarioDetail', () => ({
  useTestScenarioDetail: () => ({
    scenario: state.scenario,
    refetch,
    setPersistedScenario: vi.fn(),
    isLoading: false,
    isUnavailable: false,
    isError: false,
  }),
}));
vi.mock('@/redux/apis/extendedApi', async (original) => ({
  ...(await original<typeof import('@/redux/apis/extendedApi')>()),
  usePatchApiV2TestScenariosByScenarioIdMutation: () => [updateScenario, { isLoading: false }],
  useGetApiV2TestScenarioFoldersQuery: () => ({ currentData: [{ id: 'folder-1', name: 'Authentication' }] }),
  useGetApiV2TestSuitesQuery: () => ({ currentData: [{ id: 'suite-1', name: 'Regression', members: [] }] }),
}));
const scenario = (): TestScenario => ({
  id: 'scenario-1',
  projectId: 'project-1',
  folderId: null,
  createdById: 'user-1',
  revision: 3,
  createdBy: { id: 'user-1', name: 'Creator', email: 'creator@example.test' },
  updatedBy: null,
  suites: [{ id: 'suite-1', name: 'Regression' }],
  scenarioKey: 'TMS-1',
  title: 'Saved',
  details: 'Details',
  preconditions: null,
  testData: null,
  relatedIssueUrl: 'https://example.test/TP-1',
  priority: 'medium',
  steps: [
    { id: 'step-1', position: 0, action: 'Open', expectedResult: 'Ready' },
    { id: 'step-2', position: 1, action: 'Submit', expectedResult: null },
  ],
  contentMd: '',
  contentMdHash: '',
  contentMdFormatVersion: 1,
  createdAt: '2026-10-01T10:00:00Z',
  updatedAt: '2026-10-02T10:00:00Z',
});
const setup = () =>
  render(
    <ChakraProvider>
      <TestScenarioEditContainer projectId="project-1" scenarioId="scenario-1" />
    </ChakraProvider>,
  );
const change = (name: string, value: string) =>
  fireEvent.change(screen.getByRole('textbox', { name }), { target: { value } });
const save = () => fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
beforeEach(() => {
  state.scenario = scenario();
  state.search = '';
  updateScenario.mockReset();
  navigate.mockReset();
  refetch.mockReset();
});
describe('TestScenarioEditContainer', () => {
  it('returns to the scenario with its suite origin when cancelling', async () => {
    state.search = '?originProject=project-1&originKind=suite&originId=suite-1';
    setup();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Cancel' }));
    expect(navigate).toHaveBeenCalledWith('/test-scenarios/scenario-1?originProject=project-1&originKind=suite&originId=suite-1');
  });
  it('does not save a staged new suite when cancelling', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole('button', { name: 'Select suites' }));
    await user.type(screen.getByRole('textbox', { name: 'Find or create a suite' }), 'Pending');
    await user.click(screen.getByRole('button', { name: 'Create suite “Pending”' }));
    expect(screen.getByText('Pending')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(updateScenario).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/test-scenarios/scenario-1');
  });
  it('keeps steps local, then saves one revision-checked aggregate and adopts IDs and clean baseline', async () => {
    const returned = {
      ...scenario(),
      title: 'Changed',
      revision: 4,
      steps: [scenario().steps[1], { ...scenario().steps[0], expectedResult: null }],
    };
    updateScenario.mockReturnValue({ unwrap: () => Promise.resolve(returned) });
    setup();
    change('Title', ' Changed ');
    change('Step 1 expected result', '');
    const handle = screen.getByRole('button', { name: 'Reorder step 2' });
    fireEvent.keyDown(handle, { key: ' ' });
    fireEvent.keyDown(handle, { key: 'ArrowUp' });
    expect(updateScenario).not.toHaveBeenCalled();
    save();
    await waitFor(() => expect(updateScenario).toHaveBeenCalledOnce());
    expect(updateScenario).toHaveBeenCalledWith({
      projectId: 'project-1',
      scenarioId: 'scenario-1',
      updateTestScenarioRequest: {
        title: 'Changed',
        expectedRevision: 3,
        suiteIds: ['suite-1'],
        newSuites: [],
        steps: [
          { id: 'step-2', action: 'Submit', expectedResult: null },
          { id: 'step-1', action: 'Open', expectedResult: null },
        ],
      },
    });
    await screen.findByText('Test Scenario saved successfully.');
    save();
    await screen.findByText('No changes to save.');
    expect(updateScenario).toHaveBeenCalledOnce();
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/test-scenarios/scenario-1'));
  });
  it('returns to the scenario in context after a successful edit', async () => {
    state.search = '?originProject=project-1&originKind=suite&originId=suite-1';
    updateScenario.mockReturnValue({ unwrap: async () => ({ ...scenario(), title: 'Changed', revision: 4 }) });
    setup();
    change('Title', 'Changed');
    save();
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/test-scenarios/scenario-1?originProject=project-1&originKind=suite&originId=suite-1'));
  });
  it('does not write when unchanged', async () => {
    setup();
    expect(screen.getByText('TMS-1')).toBeInTheDocument();
    save();
    await screen.findByText('No changes to save.');
    expect(updateScenario).not.toHaveBeenCalled();
  });
  it('rejects clearing a retained action rather than filtering it away', async () => {
    setup();
    change('Step 1 action', '');
    change('Step 1 expected result', '');
    save();
    await screen.findByText('Step action is required');
    expect(updateScenario).not.toHaveBeenCalled();
  });
  it('preserves dirty fields, removed steps and pending suites on 409 and failed reload', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    updateScenario.mockReturnValue({ unwrap: () => Promise.reject({ status: 409 }) });
    refetch.mockResolvedValue({ error: { status: 500 } });
    setup();
    change('Title', 'Local draft');
    fireEvent.click(screen.getByRole('button', { name: 'Remove step 2' }));
    await userEvent.click(screen.getByRole('button', { name: 'Select suites' }));
    change('Find or create a suite', 'Pending');
    await userEvent.click(screen.getByRole('button', { name: 'Create suite “Pending”' }));
    save();
    await screen.findByText(/The saved scenario or suite membership changed/);
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(within(screen.getByRole('list', { name: 'Scenario steps' })).getAllByRole('listitem')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Reload saved scenario' }));
    await screen.findByText('Reload failed. Your draft is preserved. Please try again.');
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Local draft');
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(updateScenario).toHaveBeenCalledOnce();
  });
  it('reloads only after confirmation and preserves input when discard is declined', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    updateScenario.mockReturnValue({ unwrap: () => Promise.reject({ status: 409 }) });
    refetch.mockResolvedValue({ data: { ...scenario(), title: 'Remote', revision: 4 } });
    setup();
    change('Title', 'Local');
    save();
    await screen.findByText(/The saved scenario or suite membership changed/);
    fireEvent.click(screen.getByRole('button', { name: 'Reload saved scenario' }));
    expect(refetch).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Local');
    confirm.mockReturnValue(true);
    fireEvent.click(screen.getByRole('button', { name: 'Reload saved scenario' }));
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Remote'));
  });
  it('ignores background refreshes while retaining baseline revision for conflict detection', async () => {
    updateScenario.mockReturnValue({ unwrap: () => Promise.resolve({ ...scenario(), title: 'Local', revision: 4 }) });
    const view = setup();
    change('Title', 'Local');
    state.scenario = { ...scenario(), title: 'Remote', revision: 9 };
    view.rerender(
      <ChakraProvider>
        <TestScenarioEditContainer projectId="project-1" scenarioId="scenario-1" />
      </ChakraProvider>,
    );
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Local');
    save();
    await waitFor(() => expect(updateScenario).toHaveBeenCalledOnce());
    expect(updateScenario.mock.calls[0][0].updateTestScenarioRequest.expectedRevision).toBe(3);
  });
});
