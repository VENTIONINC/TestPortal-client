// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TestScenarioDetailContainer } from '@/components/test-scenarios/containers/TestScenarioDetailContainer';
import { ChakraProvider, toaster } from '@/components/ui';
import { useTestScenarioContextMenu } from '@/components/test-scenarios/hooks/useTestScenarioContextMenu';
import { useGetApiV2TestScenariosByScenarioIdQuery } from '@/redux/apis/generatedApi';
import {
  useDeleteApiV2TestSuitesBySuiteIdMembersMutation,
  useGetApiV2TestScenarioFoldersQuery,
  useGetApiV2TestSuitesQuery,
} from '@/redux/apis/extendedApi';

const navigate = vi.fn();
const refetchScenario = vi.fn();
const refetchSuites = vi.fn();
const contextMenu = vi.fn();
const removeMembers = vi.fn();

const persistedScenario = {
  id: 'scenario-1', projectId: 'project-1', folderId: 'nested-folder', createdById: 'user-1', revision: 1,
  createdBy: { id: 'user-1', name: 'Creator', email: 'creator@example.test' }, updatedBy: null,
  suites: [{ id: 'suite-1', name: 'Smoke' }], scenarioKey: 'AUTH-1', title: 'Checkout flow', contentMd: '# Checkout flow',
  details: 'Scenario details', priority: 'high', relatedIssueUrl: 'https://example.test/TP-20', preconditions: 'Signed in', testData: null,
  steps: [], contentMdHash: 'hash-1', contentMdFormatVersion: 1,
  createdAt: '2026-09-01T10:00:00.000Z', updatedAt: '2026-09-02T11:00:00.000Z',
};
const nestedFolders = [{ id: 'parent', projectId: 'project-1', parentId: null, name: 'Checkout', description: null,
  position: 0, createdAt: '', updatedAt: '', scenarioCount: 0, _count: { scenarios: 0 }, children: [
    { id: 'nested-folder', projectId: 'project-1', parentId: 'parent', name: 'Payments', description: null,
      position: 0, createdAt: '', updatedAt: '', scenarioCount: 0, _count: { scenarios: 0 }, children: [] },
  ] }];

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useNavigate: () => navigate };
});
vi.mock('@/components/test-scenarios/hooks/useTestScenarioContextMenu', () => ({ useTestScenarioContextMenu: vi.fn() }));
vi.mock('@/redux/apis/generatedApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/redux/apis/generatedApi')>();
  return { ...actual, useGetApiV2TestScenariosByScenarioIdQuery: vi.fn() };
});
vi.mock('@/redux/apis/extendedApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/redux/apis/extendedApi')>();
  return {
    ...actual,
    useGetApiV2TestScenarioFoldersQuery: vi.fn(),
    useGetApiV2TestSuitesQuery: vi.fn(),
    useDeleteApiV2TestSuitesBySuiteIdMembersMutation: vi.fn(),
  };
});
vi.mock('@/components/test-scenarios/components/SuitePicker', () => ({
  SuitePicker: ({ selectedIds, onComplete }: { selectedIds: string[]; onComplete: (report: unknown, ids: string[]) => void }) => (
    <button onClick={() => onComplete({ succeededIds: selectedIds, failedIds: [], uncertainIds: [], unattemptedIds: [] }, selectedIds)}>Add to suite</button>
  ),
}));

const mockedGetScenario = vi.mocked(useGetApiV2TestScenariosByScenarioIdQuery);
const mockedFolders = vi.mocked(useGetApiV2TestScenarioFoldersQuery);
const mockedSuites = vi.mocked(useGetApiV2TestSuitesQuery);
const mockedRemove = vi.mocked(useDeleteApiV2TestSuitesBySuiteIdMembersMutation);
const mockedContextMenu = vi.mocked(useTestScenarioContextMenu);
const renderContainer = (projectId = 'project-1', scenarioId = 'scenario-1', entry = '/') => render(
  <ChakraProvider><MemoryRouter initialEntries={[entry]}><TestScenarioDetailContainer projectId={projectId} scenarioId={scenarioId} /></MemoryRouter></ChakraProvider>,
);

describe('TestScenarioDetailContainer', () => {
  beforeEach(() => {
    navigate.mockReset(); refetchScenario.mockReset(); refetchSuites.mockReset(); contextMenu.mockReset(); removeMembers.mockReset();
    mockedContextMenu.mockReturnValue(contextMenu);
    mockedGetScenario.mockReturnValue({ data: persistedScenario, currentData: persistedScenario, isLoading: false, isFetching: false, error: undefined, refetch: refetchScenario } as never);
    mockedFolders.mockReturnValue({ currentData: nestedFolders, isLoading: false, isFetching: false, isError: false } as never);
    mockedSuites.mockReturnValue({ currentData: [], isLoading: false, isFetching: false, isError: false, refetch: refetchSuites } as never);
    mockedRemove.mockReturnValue([removeMembers, { isLoading: false }] as never);
    vi.spyOn(toaster, 'create').mockClear();
  });

  it('preserves suite origin when opening the editor', async () => {
    renderContainer('project-1', 'scenario-1', '/?originProject=project-1&originKind=suite&originId=suite-1');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Edit' }));
    expect(navigate).toHaveBeenCalledWith('/test-scenarios/scenario-1/edit?originProject=project-1&originKind=suite&originId=suite-1');
  });

  it('returns to the current scenario folder after it changes', () => {
    renderContainer('project-1', 'scenario-1', '/?originProject=project-1&originKind=folder&originId=parent');
    expect(screen.getByRole('link', { name: 'Back to Payments' })).toHaveAttribute('href', '/test-management?projectId=project-1&folderId=nested-folder');
    expect(screen.getByRole('link', { name: 'Scenarios' })).toHaveAttribute('href', '/test-management?projectId=project-1');
  });
  it('uses the saved folder when the originating folder has been removed', () => {
    renderContainer('project-1', 'scenario-1', '/?originProject=project-1&originKind=folder&originId=removed');
    expect(screen.getByRole('link', { name: 'Back to Payments' })).toHaveAttribute('href', '/test-management?projectId=project-1&folderId=nested-folder');
  });
  it('does not show a save confirmation for old saved links', () => {
    renderContainer('project-1', 'scenario-1', '/?saved=1');
    expect(screen.queryByText('Changes saved.')).not.toBeInTheDocument();
  });
  it('returns to the originating suite', () => {
    mockedSuites.mockReturnValue({ currentData: [{ id: 'suite-1', name: 'Smoke' }], isLoading: false, isFetching: false, isError: false, refetch: refetchSuites } as never);
    renderContainer('project-1', 'scenario-1', '/?originProject=project-1&originKind=suite&originId=suite-1');
    expect(screen.getByRole('link', { name: 'Back to Smoke' })).toHaveAttribute('href', '/test-management?projectId=project-1&tab=suites&suiteId=suite-1');
  });
  it('uses the saved folder for an all-scenarios origin', () => {
    renderContainer('project-1', 'scenario-1', '/?originProject=project-1&originKind=all');
    expect(screen.getByRole('link', { name: 'Back to Payments' })).toHaveAttribute('href', '/test-management?projectId=project-1&folderId=nested-folder');
  });
  it('uses the saved folder for an unfiled origin', () => {
    renderContainer('project-1', 'scenario-1', '/?originProject=project-1&originKind=unfiled');
    expect(screen.getByRole('link', { name: 'Back to Payments' })).toHaveAttribute('href', '/test-management?projectId=project-1&folderId=nested-folder');
  });
  it('uses the saved folder for a cross-project origin', () => {
    renderContainer('project-1', 'scenario-1', '/?originProject=other&originKind=folder&originId=parent');
    expect(screen.getByRole('link', { name: 'Back to Payments' })).toHaveAttribute('href', '/test-management?projectId=project-1&folderId=nested-folder');
  });
  it('uses the saved folder for a direct link', () => {
    renderContainer();
    expect(screen.getByRole('link', { name: 'Back to Payments' })).toHaveAttribute('href', '/test-management?projectId=project-1&folderId=nested-folder');
  });

  it('resolves nested folder labels and return paths within the selected project', () => {
    renderContainer('project-1', 'scenario-1', '/?originProject=project-1&originKind=folder&originId=nested-folder');
    expect(mockedGetScenario).toHaveBeenCalledWith({ scenarioId: 'scenario-1', projectId: 'project-1' });
    expect(mockedFolders).toHaveBeenCalledWith({ projectId: 'project-1' });
    expect(screen.getByRole('link', { name: 'Back to Payments' })).toHaveAttribute('href', '/test-management?projectId=project-1&folderId=nested-folder');
    expect(screen.getByTestId('scenario-detail-sidebar')).toHaveTextContent('Payments');
  });

  it('returns unfiled scenarios to the No folder scope', () => {
    mockedGetScenario.mockReturnValue({ data: { ...persistedScenario, folderId: null }, currentData: { ...persistedScenario, folderId: null }, isLoading: false, isFetching: false, error: undefined, refetch: refetchScenario } as never);
    renderContainer('project-1', 'scenario-1', '/?originProject=project-1&originKind=unfiled');
    expect(screen.getByRole('link', { name: 'Back to No folder' })).toHaveAttribute('href', '/test-management?projectId=project-1&folderId=unfiled');
  });

  it('falls back to all scenarios when a saved folder no longer exists', () => {
    mockedFolders.mockReturnValue({ currentData: [], isLoading: false, isFetching: false, isError: false } as never);
    renderContainer('project-1', 'scenario-1', '/?originProject=project-1&originKind=folder&originId=nested-folder');
    expect(screen.getByRole('link', { name: 'Back to All scenarios' })).toHaveAttribute('href', '/test-management?projectId=project-1');
  });

  it('opens the existing editor and keeps run actions off the detail page', async () => {
    const user = userEvent.setup();
    renderContainer();
    expect(screen.queryByRole('button', { name: 'Start manual run' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Run history' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    expect(navigate).toHaveBeenCalledWith('/test-scenarios/scenario-1/edit');
    await user.click(screen.getByRole('button', { name: 'Actions for Checkout flow' }));
    expect(mockedContextMenu).toHaveBeenCalledWith('project-1', undefined, false, expect.any(Function), expect.any(Function));
    expect(contextMenu).toHaveBeenCalledWith(expect.anything(), persistedScenario);
  });

  it('opens a clone draft with its source and origin', () => {
    renderContainer('project-1', 'scenario-1', '/?originProject=project-1&originKind=suite&originId=suite-1');
    const clone = mockedContextMenu.mock.calls.at(-1)?.[3];
    clone?.({ id: 'scenario-1', title: 'Checkout flow' });
    expect(navigate).toHaveBeenCalledWith('/test-scenarios/new?clone=scenario-1&originProject=project-1&originKind=suite&originId=suite-1');
  });
  it('returns to Scenarios after deleting from a suite', () => {
    mockedSuites.mockReturnValue({ currentData: [{ id: 'suite-1', name: 'Smoke' }], isLoading: false, isFetching: false, isError: false, refetch: refetchSuites } as never);
    renderContainer('project-1', 'scenario-1', '/?originProject=project-1&originKind=suite&originId=suite-1');
    mockedContextMenu.mock.calls.at(-1)?.[4]?.('scenario-1');
    expect(navigate).toHaveBeenCalledWith('/test-management?projectId=project-1');
  });

  it('shows confirmed suite membership and refreshes it after a successful add', async () => {
    const user = userEvent.setup();
    renderContainer();
    expect(screen.getByText('Smoke')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add to suite' }));
    await waitFor(() => expect(refetchScenario).toHaveBeenCalled());
    expect(refetchSuites).toHaveBeenCalled();
  });

  it('preserves membership on failed removal and reports the failure', async () => {
    const user = userEvent.setup();
    removeMembers.mockReturnValue({ unwrap: () => Promise.reject({ status: 400, data: { message: 'Service unavailable' } }) });
    renderContainer();
    await user.click(screen.getByRole('button', { name: 'Remove Smoke suite' }));
    await waitFor(() => expect(screen.getByText(/Service unavailable/)).toBeInTheDocument());
    expect(screen.getByText('Smoke')).toBeInTheDocument();
    expect(removeMembers).toHaveBeenCalledWith({ suiteId: 'suite-1', body: { projectId: 'project-1', scenarioIds: ['scenario-1'] } });
  });
  it('refreshes membership when a server error leaves removal uncertain', async () => {
    removeMembers.mockReturnValue({ unwrap: () => Promise.reject({ status: 500 }) });
    renderContainer();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Remove Smoke suite' }));
    expect(await screen.findByText(/removal outcome is unknown/i)).toBeInTheDocument();
    expect(refetchScenario).toHaveBeenCalled();
    expect(refetchSuites).toHaveBeenCalled();
  });

  it('updates membership after a successful removal', async () => {
    const user = userEvent.setup();
    removeMembers.mockReturnValue({ unwrap: () => Promise.resolve([]) });
    renderContainer();
    await user.click(screen.getByRole('button', { name: 'Remove Smoke suite' }));
    await waitFor(() => expect(refetchScenario).toHaveBeenCalled());
    expect(toaster.create).toHaveBeenCalledWith({ title: 'Removed from suite.', type: 'success' });
  });

  it('uses the new project scope after a project switch', () => {
    renderContainer('project-2', 'scenario-2');
    expect(mockedGetScenario).toHaveBeenCalledWith({ scenarioId: 'scenario-2', projectId: 'project-2' });
    expect(mockedFolders).toHaveBeenCalledWith({ projectId: 'project-2' });
  });
});
