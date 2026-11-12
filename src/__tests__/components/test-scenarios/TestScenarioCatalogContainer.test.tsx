// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { ReactNode } from 'react';
import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChakraProvider } from '@/components/ui';
import { TestScenarioCatalogContainer } from '@/components/test-scenarios/containers/TestScenarioCatalogContainer';
import { useTestScenarioCatalog } from '@/components/test-scenarios/hooks/useTestScenarioCatalog';
import {
  useGetApiV2TestScenariosByScenarioIdQuery,
  useGetApiV2TestScenariosAuthorsQuery,
  useGetApiV2TestScenariosQuery,
  useLazyGetApiV2TestScenariosSelectionQuery,
  useDeleteApiV2TestScenariosByScenarioIdMutation,
  type GetApiV2TestScenariosApiArg,
  type GetApiV2TestScenariosSelectionApiArg,
  type TestScenarioSummary,
} from '@/redux/apis/generatedApi';
import { useTestScenarioContextMenu } from '@/components/test-scenarios/hooks/useTestScenarioContextMenu';
import { usePatchApiV2TestScenariosBulkFolderMutation, usePostApiV2TestScenarioFoldersMutation, useGetApiV2TestSuitesQuery } from '@/redux/apis/extendedApi';

const navigate = vi.fn();
const contextMenu = vi.fn();
const createRunMutation = vi.fn();


vi.mock('@/components/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components/ui')>();
  return {
    ...actual,
    Tooltip: ({ children }: { children: ReactNode }) => children,
  };
});

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();

  return { ...actual, useNavigate: () => navigate };
});
vi.mock('@/components/test-scenarios/hooks/useTestScenarioContextMenu', () => ({
  useTestScenarioContextMenu: vi.fn(),
}));

vi.mock('@/redux/apis/generatedApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/redux/apis/generatedApi')>();

  return {
    ...actual,
    useGetApiV2TestScenariosByScenarioIdQuery: vi.fn(),
    useGetApiV2TestScenariosQuery: vi.fn(),
    useGetApiV2TestScenariosAuthorsQuery: vi.fn(() => ({
      currentData: { authors: [] },
      isLoading: false,
      error: undefined,
    })),
    useGetApiV2TestScenariosPriorityCountsQuery: vi.fn(() => ({ currentData: undefined, isFetching: false, error: undefined })),
    useLazyGetApiV2TestScenariosSelectionQuery: vi.fn(() => [
      vi.fn(() => ({ unwrap: async () => ({ scenarioIds: [], total: 0 }) })),
      { isLoading: false },
    ]),
    useDeleteApiV2TestScenariosByScenarioIdMutation: vi.fn(() => [
      vi.fn(() => ({ unwrap: async () => {} })),
      { isLoading: false },
    ]),
  };
});
vi.mock('@/redux/apis/extendedApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/redux/apis/extendedApi')>();
  const foldersQuery = vi.fn(() => ({
    currentData: [
      {
        id: 'folder-a',
        projectId: 'project-1',
        parentId: null,
        name: 'Authentication',
        position: 0,
        createdAt: '',
        updatedAt: '',
        scenarioCount: 3,
        _count: { scenarios: 3 },
        children: [],
      },
    ],
    isLoading: false,
    error: undefined,
  }));
  const suitesQuery = vi.fn(() => ({
    currentData: [
      {
        id: 'suite-a',
        projectId: 'project-1',
        name: 'Regression',
        description: null,
        purpose: null,
        release: 'R1',
        createdAt: '',
        updatedAt: '',
        members: [],
      },
    ],
    isLoading: false,
    error: undefined,
  }));
  const mutation = vi.fn(() => [vi.fn(() => ({ unwrap: () => Promise.resolve({}) })), { isLoading: false }]);
  return {
    ...actual,
    useGetApiV2TestScenarioFoldersQuery: foldersQuery,
    useGetApiV2TestSuitesQuery: suitesQuery,
    useGetApiV2TestScenariosPriorityCountsQuery: vi.fn(() => ({ currentData: undefined, isFetching: false, error: undefined })),
    usePatchApiV2TestScenariosBulkFolderMutation: mutation,
    usePostApiV2TestSuitesBySuiteIdMembersMutation: mutation,
    useDeleteApiV2TestSuitesBySuiteIdMembersMutation: mutation,
    usePutApiV2TestSuitesBySuiteIdMembersOrderMutation: mutation,
    usePostApiV2TestSuitesBySuiteIdMembershipChangesMutation: mutation,
    usePostApiV2TestSuitesBySuiteIdMembershipRestorationMutation: mutation,
    usePostApiV2TestSuitesMovesMutation: mutation,
    usePostApiV2TestSuitesMoveRestorationMutation: mutation,
    usePostApiV2TestScenarioFoldersMutation: vi.fn(() => [vi.fn(() => ({ unwrap: () => Promise.resolve({}) })), { isLoading: false }]),
    usePatchApiV2TestScenarioFoldersByFolderIdMutation: mutation,
    useDeleteApiV2TestScenarioFoldersByFolderIdMutation: mutation,
    usePostApiV2TestScenarioFoldersRestorationMutation: mutation,
    usePostApiV2TestScenariosFolderRestorationMutation: mutation,
    usePostApiV2TestSuitesMutation: mutation,
    usePatchApiV2TestSuitesBySuiteIdMutation: mutation,
    useDeleteApiV2TestSuitesBySuiteIdMutation: mutation,
    usePostApiV2ManualTestRunsMutation: vi.fn(() => [createRunMutation, { isLoading: false }]),
  };
});

const mockedScenarioQuery = vi.mocked(useGetApiV2TestScenariosQuery);
const mockedSelectionQuery = vi.mocked(useLazyGetApiV2TestScenariosSelectionQuery);
const mockedBulkMoveMutation = vi.mocked(usePatchApiV2TestScenariosBulkFolderMutation);
const mockedDeleteMutation = vi.mocked(useDeleteApiV2TestScenariosByScenarioIdMutation);
const mockedDetailQuery = vi.mocked(useGetApiV2TestScenariosByScenarioIdQuery);
const mockedContextMenu = vi.mocked(useTestScenarioContextMenu);

const createResponse = (page: number) => ({
  scenarios: [
    {
      id: `scenario-${page}`,
      projectId: 'project-1',
      folderId: null,
      folderName: null,
      createdById: 'user-1',
      scenarioKey: 'TMS-1',
      title: `Scenario page ${page}`,
      details: `Details page ${page}`,
      priority: null,
      createdBy: { id: 'user-1', name: 'Ada Lovelace', email: 'ada@example.com' },
      createdAt: '2026-09-01T10:00:00.000Z',
      updatedAt: '2026-09-02T11:00:00.000Z',
    } satisfies TestScenarioSummary,
  ],
  total: 11,
  page,
  limit: 25,
  totalPages: 2,
});

describe('TestScenarioCatalogContainer', () => {
  beforeEach(() => {
    navigate.mockReset();
    createRunMutation.mockReset();
    createRunMutation.mockReturnValue({ unwrap: () => Promise.resolve({ id: 'run-1', projectId: 'project-1' }) });
    contextMenu.mockReset();
    mockedDetailQuery.mockReset();
    mockedSelectionQuery.mockReturnValue([
      vi.fn(() => ({ unwrap: async () => ({ scenarioIds: [], total: 0 }) })),
      { isLoading: false },
    ] as never);
    mockedBulkMoveMutation.mockReturnValue([
      vi.fn(() => ({ unwrap: async () => ({}) })),
      { isLoading: false },
    ] as never);
    mockedDeleteMutation.mockReturnValue([vi.fn(() => ({ unwrap: async () => ({}) })), { isLoading: false }] as never);
    mockedContextMenu.mockReturnValue(contextMenu);
    mockedScenarioQuery.mockImplementation((args) => {
      const queryArgs = args as GetApiV2TestScenariosApiArg;

      return {
        currentData: createResponse(queryArgs.page ?? 1),
        isLoading: false,
        isFetching: false,
        error: undefined,
      } as never;
    });
  });

  it('restores the requested suite for the active project', () => {
    const mocked = vi.mocked(useGetApiV2TestSuitesQuery);
    const previous = mocked.getMockImplementation();
    mocked.mockReturnValue({ currentData: [{ id: 'suite-a' }, { id: 'suite-b' }], isFetching: false } as never);
    const wrapper = ({ children }: { children: ReactNode }) => <MemoryRouter initialEntries={['/test-management?projectId=project-1&tab=suites&suiteId=suite-b']}>{children}</MemoryRouter>;
    const { result } = renderHook(() => useTestScenarioCatalog('project-1', 'suites'), { wrapper });
    if (previous) mocked.mockImplementation(previous);
    expect(result.current.scope).toEqual({ kind: 'suite', id: 'suite-b' });
  });

  it('preserves the originating folder when starting creation', async () => {
    render(<ChakraProvider><MemoryRouter initialEntries={['/test-management?projectId=project-1&folderId=folder-a']}><TestScenarioCatalogContainer projectId="project-1" organizationTab="scenarios" /></MemoryRouter></ChakraProvider>);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Create Test Scenario' }));
    expect(navigate).toHaveBeenCalledWith('/test-scenarios/new?folderId=folder-a&originProject=project-1&originKind=folder&originId=folder-a');
  });

  it('creates one project run from selected scenarios and navigates only after confirmation', async () => {
    const user = userEvent.setup();
    render(<ChakraProvider><MemoryRouter><TestScenarioCatalogContainer projectId="project-1" organizationTab="scenarios" /></MemoryRouter></ChakraProvider>);
    await user.click(screen.getByRole('checkbox', { name: 'Select Scenario page 1' }));
    await user.click(screen.getByRole('button', { name: 'Run selected' }));
    await waitFor(() => expect(createRunMutation).toHaveBeenCalledWith({ projectId: 'project-1', manualTestRunCreateRequest: { scenarioIds: ['scenario-1'] } }));
    expect(navigate).toHaveBeenCalledWith('/manual-test-runs/run-1', { state: { from: 'manual-test-run-history' } });
  });

  it('clears the selection when a selected row is deleted through its action menu', async () => {
    const user = userEvent.setup();
    render(<ChakraProvider><MemoryRouter><TestScenarioCatalogContainer projectId="project-1" organizationTab="scenarios" /></MemoryRouter></ChakraProvider>);
    const rowCheckbox = screen.getByRole('checkbox', { name: 'Select Scenario page 1' });
    await user.click(rowCheckbox);
    expect(rowCheckbox).toBeChecked();

    const onDeleted = mockedContextMenu.mock.lastCall?.[4];
    act(() => onDeleted?.('scenario-1'));

    expect(rowCheckbox).not.toBeChecked();
    expect(screen.queryByText('1 selected')).not.toBeInTheDocument();
  });

  it('combines priority and author filters and resets pagination independently', () => {
    const { result } = renderHook(() => useTestScenarioCatalog('project-1'), { wrapper: MemoryRouter });
    expect(mockedScenarioQuery.mock.calls.at(-1)?.[0]).toMatchObject({
      projectId: 'project-1',
      page: 1,
      limit: 25,
      sortField: 'updatedAt',
      sortDirection: 'desc',
    });
    act(() => {
      result.current.onPageChange(3);
      result.current.onPriorityChange('high');
      result.current.onAuthorChange('user-1');
    });
    expect(mockedScenarioQuery.mock.calls.at(-1)?.[0]).toMatchObject({
      page: 1,
      priority: 'high',
      createdByIds: 'user-1',
      sortField: 'updatedAt',
      sortDirection: 'desc',
    });
    act(() => result.current.onPriorityChange(''));
    expect(mockedScenarioQuery.mock.calls.at(-1)?.[0]).toMatchObject({ page: 1, createdByIds: 'user-1' });
    expect(mockedScenarioQuery.mock.calls.at(-1)?.[0]).not.toHaveProperty('priority');
    act(() => result.current.onPageSizeChange(50));
    expect(mockedScenarioQuery.mock.calls.at(-1)?.[0]).toMatchObject({ page: 1, limit: 50, createdByIds: 'user-1' });
  });

  it('keeps a newly created folder selected while the folder list is stale', async () => {
    const createFolderMutation = vi.mocked(usePostApiV2TestScenarioFoldersMutation);
    createFolderMutation.mockReturnValue([
      vi.fn(() => ({ unwrap: async () => ({ id: 'new-folder' }) })),
      { isLoading: false },
    ] as never);
    const { result } = renderHook(() => useTestScenarioCatalog('project-1'), { wrapper: MemoryRouter });
    await act(async () => {
      const folder = await result.current.createFolder('New folder', null);
      result.current.onScopeChange({ kind: 'folder', id: folder.id });
    });
    expect(result.current.scope).toEqual({ kind: 'folder', id: 'new-folder' });
    expect(mockedScenarioQuery.mock.calls.at(-1)?.[0]).toMatchObject({ folderId: 'new-folder' });
    createFolderMutation.mockReset();
    createFolderMutation.mockImplementation(() => [vi.fn(() => ({ unwrap: async () => ({}) })), { isLoading: false }] as never);
  });

  it('loads project and No folder totals independently of the visible list filters', () => {
    mockedScenarioQuery.mockClear();
    renderHook(() => useTestScenarioCatalog('project-1'), { wrapper: MemoryRouter });
    expect(mockedScenarioQuery).toHaveBeenNthCalledWith(1, { projectId: 'project-1', page: 1, limit: 1 });
    expect(mockedScenarioQuery).toHaveBeenNthCalledWith(2, {
      projectId: 'project-1',
      page: 1,
      limit: 1,
      folderId: 'unfiled',
    });
  });

  it('clears selection on page changes, then resolves every current matching UUID', async () => {
    const trigger = vi.fn((_args: GetApiV2TestScenariosSelectionApiArg) => {
      void _args;
      return {
        unwrap: async () => ({ scenarioIds: Array.from({ length: 237 }, (_, index) => `id-${index}`), total: 237 }),
      };
    });
    mockedSelectionQuery.mockReturnValue([trigger, { isLoading: false }] as never);
    const { result } = renderHook(() => useTestScenarioCatalog('project-1'), { wrapper: MemoryRouter });
    act(() => {
      result.current.toggleSelected('visible-id');
      result.current.onPageChange(2);
      result.current.onPageSizeChange(50);
      result.current.onSortChange('title');
    });
    expect(result.current.selectedIds).toEqual([]);
    act(() => {
      result.current.onScopeChange({ kind: 'folder', id: 'folder-a' });
      result.current.onPriorityChange('high,medium');
      result.current.onAuthorChange('user-1');
      result.current.onSearchChange('login');
    });
    expect(result.current.selectedIds).toEqual([]);
    await act(async () => {
      await result.current.selectAllMatching();
    });
    expect(trigger).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 'project-1',
        folderId: 'folder-a',
        includeDescendants: true,
        priority: 'high,medium',
        createdByIds: 'user-1',
        search: 'login',
      }),
    );
    expect(trigger.mock.calls[0]?.[0]).not.toHaveProperty('page');
    expect(trigger.mock.calls[0]?.[0]).not.toHaveProperty('sortField');
    expect(result.current.selectedIds).toHaveLength(237);
    expect(result.current.allMatchingSelected).toBe(true);
  });

  it('does not install a stale selection resolution after criteria changes', async () => {
    let resolveRequest: ((value: { scenarioIds: string[]; total: number }) => void) | undefined;
    const trigger = vi.fn(() => ({
      unwrap: () =>
        new Promise<{ scenarioIds: string[]; total: number }>((resolve) => {
          resolveRequest = resolve;
        }),
    }));
    mockedSelectionQuery.mockReturnValue([trigger, { isLoading: false }] as never);
    const { result } = renderHook(() => useTestScenarioCatalog('project-1'), { wrapper: MemoryRouter });
    let resolution: Promise<void> | undefined;
    act(() => {
      resolution = result.current.selectAllMatching();
    });
    act(() => result.current.onPriorityChange('high'));
    await act(async () => {
      resolveRequest?.({ scenarioIds: ['stale'], total: 1 });
      await resolution;
    });
    expect(result.current.selectedIds).toEqual([]);
    expect(result.current.allMatchingSelected).toBe(false);
  });

  it('clears page selection and exposes an error when all-results resolution fails', async () => {
    const trigger = vi.fn(() => ({
      unwrap: async () => {
        throw new Error('selection unavailable');
      },
    }));
    mockedSelectionQuery.mockReturnValue([trigger, { isLoading: false }] as never);
    const { result } = renderHook(() => useTestScenarioCatalog('project-1'), { wrapper: MemoryRouter });
    act(() => result.current.toggleSelected('visible-id'));
    await act(async () => {
      await result.current.selectAllMatching();
    });
    expect(result.current.selectedIds).toEqual([]);
    expect(result.current.selectionError).toBe('selection unavailable');
    expect(result.current.isResolvingSelection).toBe(false);
  });

  it('moves a full resolved selection in bounded batches and retains unresolved IDs on failure', async () => {
    const ids = Array.from({ length: 237 }, (_, index) => `id-${index}`);
    const selectionTrigger = vi.fn((_args: GetApiV2TestScenariosSelectionApiArg) => {
      void _args;
      return { unwrap: async () => ({ scenarioIds: ids, total: ids.length }) };
    });
    mockedSelectionQuery.mockReturnValue([selectionTrigger, { isLoading: false }] as never);
    const moveTrigger = vi.fn((_arg: { body: { scenarioIds: string[] } }) => {
      void _arg;
      const call = moveTrigger.mock.calls.length;
      return {
        unwrap: () => (call === 2 ? Promise.reject({ status: 409, message: 'conflict' }) : Promise.resolve({})),
      };
    });
    mockedBulkMoveMutation.mockReturnValue([moveTrigger, { isLoading: false }] as never);
    const { result } = renderHook(() => useTestScenarioCatalog('project-1'), { wrapper: MemoryRouter });
    await act(async () => {
      await result.current.selectAllMatching();
    });
    let operationResult;
    await act(async () => {
      operationResult = await result.current.moveSelected('folder-a');
    });
    expect(moveTrigger.mock.calls.map(([arg]) => arg.body.scenarioIds.length)).toEqual([100, 100]);
    expect(operationResult).toMatchObject({
      succeededIds: ids.slice(0, 100),
      failedIds: ids.slice(100, 200),
      unattemptedIds: ids.slice(200),
      uncertainIds: [],
    });
    expect(result.current.selectedIds).toEqual(ids.slice(100));
    expect(result.current.isExecutingOperation).toBe(false);
  });

  it('sends all 237 selected IDs in sequential 100/100/37 batches', async () => {
    const ids = Array.from({ length: 237 }, (_, index) => `id-${index}`);
    const moveTrigger = vi.fn((_arg: { body: { scenarioIds: string[] } }) => {
      void _arg;
      return { unwrap: async () => ({}) };
    });
    mockedBulkMoveMutation.mockReturnValue([moveTrigger, { isLoading: false }] as never);
    const { result } = renderHook(() => useTestScenarioCatalog('project-1'), { wrapper: MemoryRouter });

    let report;
    await act(async () => {
      report = await result.current.moveScenarioIds(ids, 'folder-a');
    });

    expect(moveTrigger.mock.calls.map(([arg]) => arg.body.scenarioIds.length)).toEqual([100, 100, 37]);
    expect(report).toMatchObject({ succeededIds: ids, failedIds: [], unattemptedIds: [], uncertainIds: [] });
  });

  it('clamps the current page after confirmed last-page deletions', async () => {
    let totalPages = 3;
    mockedScenarioQuery.mockImplementation((args) => {
      const queryArgs = args as GetApiV2TestScenariosApiArg;
      return {
        currentData: { ...createResponse(queryArgs.page ?? 1), total: 55, totalPages },
        isLoading: false,
        isFetching: false,
        error: undefined,
      } as never;
    });
    const deleteTrigger = vi.fn(() => ({
      unwrap: async () => {
        totalPages = 2;
        return {};
      },
    }));
    mockedDeleteMutation.mockReturnValue([deleteTrigger, { isLoading: false }] as never);
    const { result } = renderHook(() => useTestScenarioCatalog('project-1'), { wrapper: MemoryRouter });
    act(() => result.current.onPageChange(3));
    expect(result.current.pagination.page).toBe(3);
    let report;
    await act(async () => {
      report = await result.current.deleteSelected(['scenario-3']);
    });
    expect(report).toMatchObject({ succeededIds: ['scenario-3'], failedIds: [], uncertainIds: [] });
    await waitFor(() => expect(result.current.pagination.page).toBe(2));
    expect(mockedScenarioQuery.mock.calls.at(-1)?.[0]).toMatchObject({ page: 2 });
  });

  it('does not reconcile a suite operation into a changed selection', () => {
    const { result } = renderHook(() => useTestScenarioCatalog('project-1'), { wrapper: MemoryRouter });
    act(() => result.current.toggleSelected('scenario-1'));
    act(() => result.current.startSuiteOperation());
    act(() => result.current.toggleSelected('scenario-2'));
    act(() => result.current.reconcileSuiteOperation({ succeededIds: ['scenario-1'], failedIds: [], unattemptedIds: [], uncertainIds: [] }, ['scenario-1']));
    expect(result.current.selectedIds).toEqual(['scenario-1', 'scenario-2']);
  });

  it('locks selection and duplicate operations while a batch is pending', async () => {
    let finishRequest: (() => void) | undefined;
    const moveTrigger = vi.fn(() => ({
      unwrap: () =>
        new Promise<void>((resolve) => {
          finishRequest = resolve;
        }),
    }));
    mockedBulkMoveMutation.mockReturnValue([moveTrigger, { isLoading: false }] as never);
    const { result } = renderHook(() => useTestScenarioCatalog('project-1'), { wrapper: MemoryRouter });
    act(() => result.current.toggleSelected('scenario-1'));
    let firstOperation: Promise<unknown> | undefined;
    act(() => {
      firstOperation = result.current.moveSelected('folder-a');
    });
    expect(result.current.isExecutingOperation).toBe(true);
    act(() => result.current.toggleSelected('scenario-2'));
    expect(result.current.selectedIds).toEqual(['scenario-1']);
    await act(async () => {
      await result.current.moveSelected('folder-b');
    });
    expect(moveTrigger).toHaveBeenCalledTimes(1);
    await act(async () => {
      finishRequest?.();
      await firstOperation;
    });
    expect(result.current.isExecutingOperation).toBe(false);
    expect(result.current.selectedIds).toEqual([]);
  });

  it('does not reconcile a completed operation into a newly selected project', async () => {
    let finishRequest: (() => void) | undefined;
    const moveTrigger = vi.fn((args: { body: { projectId: string } }) => ({
      unwrap: () =>
        new Promise<void>((resolve) => {
          expect(args.body.projectId).toBe('project-1');
          finishRequest = resolve;
        }),
    }));
    mockedBulkMoveMutation.mockReturnValue([moveTrigger, { isLoading: false }] as never);
    const { result, rerender } = renderHook(({ projectId }) => useTestScenarioCatalog(projectId), {
      initialProps: { projectId: 'project-1' },
      wrapper: MemoryRouter,
    });
    act(() => result.current.toggleSelected('scenario-1'));
    let operation: Promise<unknown> | undefined;
    act(() => {
      operation = result.current.moveSelected('folder-a');
    });
    rerender({ projectId: 'project-2' });
    await waitFor(() => expect(result.current.selectedIds).toEqual([]));
    await act(async () => {
      finishRequest?.();
      await operation;
    });
    expect(result.current.selectedIds).toEqual([]);
    expect(moveTrigger).toHaveBeenCalledTimes(1);
  });

  it('requests the selected project first with page 1 and limit 10', () => {
    render(
      <ChakraProvider>
        <MemoryRouter>
          <TestScenarioCatalogContainer projectId="project-1" organizationTab="scenarios" />
        </MemoryRouter>
      </ChakraProvider>,
    );

    expect(mockedScenarioQuery).toHaveBeenCalledWith(
      { projectId: 'project-1', page: 1, limit: 25, sortField: 'updatedAt', sortDirection: 'desc' },
      { skip: false },
    );
    expect(mockedDetailQuery).not.toHaveBeenCalled();
    expect(screen.getByText('Scenario page 1')).toBeInTheDocument();
  });

  it.each([
    ['unfiled', { folderId: 'unfiled' }],
    ['folder-a', { folderId: 'folder-a', includeDescendants: true }],
    ['removed-folder', {}],
  ])('restores catalog folder scope %s from a direct-entry URL', async (folderId, expected) => {
    render(
      <ChakraProvider>
        <MemoryRouter initialEntries={[`/test-scenarios?projectId=project-1&folderId=${folderId}`]}>
          <TestScenarioCatalogContainer projectId="project-1" organizationTab="scenarios" />
        </MemoryRouter>
      </ChakraProvider>,
    );
    await waitFor(() =>
      expect(mockedScenarioQuery).toHaveBeenLastCalledWith(
        { projectId: 'project-1', page: 1, limit: 25, sortField: 'updatedAt', sortDirection: 'desc', ...expected },
        { skip: false },
      ),
    );
  });

  it('requests the selected page for the same project and limit', async () => {
    const user = userEvent.setup();

    render(
      <ChakraProvider>
        <MemoryRouter>
          <TestScenarioCatalogContainer projectId="project-1" organizationTab="scenarios" />
        </MemoryRouter>
      </ChakraProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Next Page' }));

    expect(mockedScenarioQuery).toHaveBeenLastCalledWith(
      { projectId: 'project-1', page: 2, limit: 25, sortField: 'updatedAt', sortDirection: 'desc' },
      { skip: false },
    );
    expect(screen.getByText('Scenario page 2')).toBeInTheDocument();
    expect(screen.queryByText('# Scenario page 2')).not.toBeInTheDocument();
  });

  it('navigates to the create route from the catalog action', async () => {
    const user = userEvent.setup();

    render(
      <ChakraProvider>
        <MemoryRouter>
          <TestScenarioCatalogContainer projectId="project-1" organizationTab="scenarios" />
        </MemoryRouter>
      </ChakraProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Create Test Scenario' }));

    expect(navigate).toHaveBeenCalledWith('/test-scenarios/new?originProject=project-1&originKind=all');
  });

  it('combines folder scope and search in server requests and resets pagination', async () => {
    const user = userEvent.setup();
    render(
      <ChakraProvider>
        <MemoryRouter>
          <TestScenarioCatalogContainer projectId="project-1" organizationTab="scenarios" />
        </MemoryRouter>
      </ChakraProvider>,
    );

    await user.click(screen.getByRole('button', { name: /Authentication 3/ }));
    expect(mockedScenarioQuery.mock.calls.at(-1)?.[0]).toMatchObject({
      projectId: 'project-1',
      page: 1,
      limit: 25,
      sortField: 'updatedAt',
      sortDirection: 'desc',
      folderId: 'folder-a',
      includeDescendants: true,
    });

    await user.type(screen.getByRole('textbox', { name: 'Search scenarios' }), 'login');
    await waitFor(() =>
      expect(mockedScenarioQuery.mock.calls.at(-1)?.[0]).toMatchObject({
        projectId: 'project-1',
        page: 1,
        limit: 25,
        sortField: 'updatedAt',
        sortDirection: 'desc',
        folderId: 'folder-a',
        includeDescendants: true,
        search: 'login',
      }),
    );
  });

  it('keeps a selected sort while applying separate priority and author filters', async () => {
    const user = userEvent.setup();
    vi.mocked(useGetApiV2TestScenariosAuthorsQuery).mockReturnValue({
      currentData: { authors: [{ id: 'user-1', name: 'Ada Lovelace', email: 'ada@example.com' }] },
      isLoading: false,
      error: undefined,
    } as never);
    render(
      <ChakraProvider>
        <MemoryRouter>
          <TestScenarioCatalogContainer projectId="project-1" organizationTab="scenarios" />
        </MemoryRouter>
      </ChakraProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Sort: Updated' }));
    await user.click(screen.getByRole('button', { name: /^Title$/ }));
    await user.click(screen.getByRole('button', { name: 'Sort descending' }));
    await user.click(screen.getByRole('button', { name: 'Priority' }));
    await user.click(screen.getByRole('checkbox', { name: 'High' }));
    await user.click(screen.getByRole('button', { name: 'Done' }));
    await user.click(screen.getByRole('button', { name: 'Author' }));
    await user.click(screen.getByRole('checkbox', { name: 'Ada Lovelace' }));
    await user.click(screen.getByRole('button', { name: 'Done' }));

    await waitFor(() =>
      expect(mockedScenarioQuery.mock.calls.at(-1)?.[0]).toMatchObject({
        projectId: 'project-1',
        page: 1,
        limit: 25,
        sortField: 'title',
        sortDirection: 'asc',
        priority: 'high',
        createdByIds: 'user-1',
      }),
    );
  });

  it('uses the backend unfiled scope rather than filtering loaded rows', async () => {
    const user = userEvent.setup();
    render(
      <ChakraProvider>
        <MemoryRouter>
          <TestScenarioCatalogContainer projectId="project-1" organizationTab="scenarios" />
        </MemoryRouter>
      </ChakraProvider>,
    );

    await user.click(screen.getByRole('button', { name: /No folder/ }));
    expect(mockedScenarioQuery.mock.calls.at(-1)?.[0]).toMatchObject({
      projectId: 'project-1',
      page: 1,
      limit: 25,
      sortField: 'updatedAt',
      sortDirection: 'desc',
      folderId: 'unfiled',
    });
  });

  it('filters suites on the server using the selected suite UUID', async () => {
    const user = userEvent.setup();
    render(
      <ChakraProvider>
        <MemoryRouter>
          <TestScenarioCatalogContainer projectId="project-1" organizationTab="suites" />
        </MemoryRouter>
      </ChakraProvider>,
    );

    await user.click(screen.getByRole('button', { name: /Regression 0/ }));
    expect(mockedScenarioQuery.mock.calls.at(-1)?.[0]).toMatchObject({
      projectId: 'project-1',
      page: 1,
      limit: 25,
      suiteId: 'suite-a',
    });
  });
});
