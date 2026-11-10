// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChakraProvider } from '@/components/ui';
import { SuitePicker } from '@/components/test-scenarios/components/SuitePicker';
import type { ScenarioOperationReport } from '@/components/test-scenarios/utils';
import type { PostApiV2TestSuitesBySuiteIdMembershipChangesApiResponse } from '@/redux/apis/generatedApi';

const { createSuite, changeMembership, getSuites } = vi.hoisted(() => ({
  createSuite: vi.fn(),
  changeMembership: vi.fn(),
  getSuites: vi.fn(),
}));

vi.mock('@/redux/apis/extendedApi', () => ({
  useGetApiV2TestSuitesQuery: (...args: unknown[]) => getSuites(...args),
  usePostApiV2TestSuitesMutation: () => [createSuite, { isLoading: false }],
  usePostApiV2TestSuitesBySuiteIdMembershipChangesMutation: () => [changeMembership, { isLoading: false }],
}));

type AddUndo = PostApiV2TestSuitesBySuiteIdMembershipChangesApiResponse & { createdSuiteId?: string };
type Complete = (report: ScenarioOperationReport, selection: string[], undo?: AddUndo) => void;

const mount = (onComplete: Complete) => render(
  <ChakraProvider>
    <SuitePicker projectId="project-1" selectedIds={['scenario-1', 'scenario-2']} onComplete={onComplete} />
  </ChakraProvider>,
);

describe('SuitePicker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSuites.mockReturnValue({
      data: [{ id: 'suite-1', name: 'Existing', membershipRevision: 4, members: [{ testScenarioId: 'scenario-1' }] }],
      isLoading: false,
      isFetching: false,
      isError: false,
    });
    createSuite.mockImplementation(() => ({ unwrap: async () => ({ id: 'suite-new', name: 'Fresh' }) }));
    changeMembership.mockImplementation(() => ({ unwrap: async () => ({
      scenarioIds: ['scenario-1', 'scenario-2'],
      membershipRevision: 5,
      restoreData: { suiteId: 'suite-1', addedScenarioIds: ['scenario-2'], removedMembers: [] },
    }) }));
  });

  it('captures only newly added memberships for Undo in an existing suite', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn<Complete>();
    mount(onComplete);
    await user.click(screen.getByRole('button', { name: /Add to suite/ }));
    await user.click(await screen.findByRole('button', { name: /Existing/ }));
    await waitFor(() => expect(onComplete).toHaveBeenCalled());
    expect(changeMembership).toHaveBeenCalledWith({ suiteId: 'suite-1', body: {
      projectId: 'project-1',
      expectedMembershipRevision: 4,
      expectedScenarioIds: ['scenario-1'],
      addScenarioIds: ['scenario-2'],
      removeScenarioIds: [],
    } });
    expect(onComplete.mock.calls[0]?.[2]).toMatchObject({
      suiteName: 'Existing',
      membershipRevision: 5,
      scenarioIds: ['scenario-1', 'scenario-2'],
      restoreData: { addedScenarioIds: ['scenario-2'] },
    });
  });

  it('keeps the newly created suite ID in the Undo payload', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn<Complete>();
    mount(onComplete);
    await user.click(screen.getByRole('button', { name: /Add to suite/ }));
    await user.type(screen.getByRole('textbox', { name: 'Find or create a suite' }), 'Fresh');
    await user.click(await screen.findByRole('button', { name: /Create suite “Fresh” and add 2/ }));
    await waitFor(() => expect(onComplete).toHaveBeenCalled());
    expect(createSuite).toHaveBeenCalledWith({ body: { projectId: 'project-1', name: 'Fresh' } });
    expect(changeMembership).toHaveBeenCalledWith({ suiteId: 'suite-new', body: {
      projectId: 'project-1',
      expectedMembershipRevision: 0,
      expectedScenarioIds: [],
      addScenarioIds: ['scenario-1', 'scenario-2'],
      removeScenarioIds: [],
    } });
    expect(onComplete.mock.calls[0]?.[2]).toMatchObject({ createdSuiteId: 'suite-new', suiteName: 'Fresh' });
  });
  it('filters existing membership and adds the first match with Enter in the inline picker', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn<Complete>();
    getSuites.mockReturnValue({ data: [
      { id: 'suite-1', name: 'Selected', membershipRevision: 1, members: [{ testScenarioId: 'scenario-1' }] },
      { id: 'suite-2', name: 'Other', membershipRevision: 2, members: [] },
    ], isLoading: false, isFetching: false, isError: false });
    render(<ChakraProvider><SuitePicker compact projectId="project-1" selectedIds={['scenario-1']} onComplete={onComplete} /></ChakraProvider>);
    await user.click(screen.getByRole('button', { name: 'Add to suite' }));
    expect(screen.queryByRole('button', { name: /Selected/ })).not.toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: 'Find or create a suite' }), 'Oth{Enter}');
    await waitFor(() => expect(changeMembership).toHaveBeenCalledWith(expect.objectContaining({ suiteId: 'suite-2' })));
  });
  it('creates a non-duplicate suite with Enter and closes with Escape', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn<Complete>();
    render(<ChakraProvider><SuitePicker compact projectId="project-1" selectedIds={['scenario-1']} onComplete={onComplete} /></ChakraProvider>);
    await user.click(screen.getByRole('button', { name: 'Add to suite' }));
    await user.type(screen.getByRole('textbox', { name: 'Find or create a suite' }), 'Fresh{Enter}');
    await waitFor(() => expect(createSuite).toHaveBeenCalledWith({ body: { projectId: 'project-1', name: 'Fresh' } }));
    await waitFor(() => expect(onComplete).toHaveBeenCalled());
    await user.click(screen.getByRole('button', { name: 'Add to suite' }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('textbox', { name: 'Find or create a suite' })).not.toBeInTheDocument();
  });
  it('reports an uncertain membership change so the scenario can refresh', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn<Complete>();
    getSuites.mockReturnValue({ data: [{ id: 'suite-2', name: 'Other', membershipRevision: 2, members: [] }], isLoading: false, isFetching: false, isError: false });
    changeMembership.mockReturnValue({ unwrap: async () => { throw { status: 'FETCH_ERROR' }; } });
    render(<ChakraProvider><SuitePicker compact projectId="project-1" selectedIds={['scenario-1']} onComplete={onComplete} /></ChakraProvider>);
    await user.click(screen.getByRole('button', { name: 'Add to suite' }));
    await user.click(screen.getByRole('button', { name: /Other/ }));
    await waitFor(() => expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ uncertainIds: ['scenario-1'] }), ['scenario-1']));
    expect(screen.getByRole('alert')).toHaveTextContent(/membership.*unknown/i);
    expect(changeMembership).toHaveBeenCalledOnce();
  });

  it('ignores Enter when a failed refresh hides cached suites', async () => {
    const user = userEvent.setup();
    getSuites.mockReturnValue({
      data: [{ id: 'cached-suite', name: 'Cached', membershipRevision: 2, members: [] }],
      isLoading: false,
      isFetching: false,
      isError: true,
    });
    render(<ChakraProvider><SuitePicker compact projectId="project-1" selectedIds={['scenario-1']} onComplete={vi.fn<Complete>()} /></ChakraProvider>);
    await user.click(screen.getByRole('button', { name: 'Add to suite' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Suites could not be loaded');
    expect(screen.queryByRole('button', { name: /Cached/ })).not.toBeInTheDocument();
    await user.keyboard('{Enter}');
    expect(changeMembership).not.toHaveBeenCalled();
  });
});
