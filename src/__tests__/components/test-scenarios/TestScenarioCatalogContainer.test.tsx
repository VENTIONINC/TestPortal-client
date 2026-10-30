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
import { usePatchApiV2TestScenariosBulkFolderMutation } from '@/redux/apis/extendedApi';

const navigate = vi.fn();
const contextMenu = vi.fn();

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
    usePatchApiV2TestScenariosBulkFolderMutation: mutation,
    usePostApiV2TestSuitesBySuiteIdMembersMutation: mutation,
    useDeleteApiV2TestSuitesBySuiteIdMembersMutation: mutation,
    usePutApiV2TestSuitesBySuiteIdMembersOrderMutation: mutation,
    usePostApiV2TestScenarioFoldersMutation: mutation,
    usePatchApiV2TestScenarioFoldersByFolderIdMutation: mutation,
    useDeleteApiV2TestScenarioFoldersByFolderIdMutation: mutation,
    usePostApiV2TestSuitesMutation: mutation,
    usePatchApiV2TestSuitesBySuiteIdMutation: mutation,
    useDeleteApiV2TestSuitesBySuiteIdMutation: mutation,
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
      scenarioKey: null,
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

  it('combines priority and author filters and resets pagination independently', () => {
    const { result } = renderHook(() => useTestScenarioCatalog('project-1'));
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
      createdById: 'user-1',
      sortField: 'updatedAt',
      sortDirection: 'desc',
    });
    act(() => result.current.onPriorityChange(''));
    expect(mockedScenarioQuery.mock.calls.at(-1)?.[0]).toMatchObject({ page: 1, createdById: 'user-1' });
    expect(mockedScenarioQuery.mock.calls.at(-1)?.[0]).not.toHaveProperty('priority');
    act(() => result.current.onPageSizeChange(50));
    expect(mockedScenarioQuery.mock.calls.at(-1)?.[0]).toMatchObject({ page: 1, limit: 50, createdById: 'user-1' });
  });

  it('loads project and No folder totals independently of the visible list filters', () => {
    mockedScenarioQuery.mockClear();
    renderHook(() => useTestScenarioCatalog('project-1'));
    expect(mockedScenarioQuery).toHaveBeenNthCalledWith(1, { projectId: 'project-1', page: 1, limit: 1 });
    expect(mockedScenarioQuery).toHaveBeenNthCalledWith(2, {
      projectId: 'project-1',
      page: 1,
      limit: 1,
      folderId: 'unfiled',
    });
  });

  it('keeps UUIDs across page and sort changes, then resolves every current matching UUID', async () => {
    const trigger = vi.fn((_args: GetApiV2TestScenariosSelectionApiArg) => {
      void _args;
      return {
        unwrap: async () => ({ scenarioIds: Array.from({ length: 237 }, (_, index) => `id-${index}`), total: 237 }),
      };
    });
    mockedSelectionQuery.mockReturnValue([trigger, { isLoading: false }] as never);
    const { result } = renderHook(() => useTestScenarioCatalog('project-1'));
    act(() => {
      result.current.toggleSelected('visible-id');
      result.current.onPageChange(2);
      result.current.onPageSizeChange(50);
      result.current.onSortChange('title');
    });
    expect(result.current.selectedIds).toEqual(['visible-id']);
    act(() => {
      result.current.onScopeChange({ kind: 'folder', id: 'folder-a' });
      result.current.onPriorityChange('high');
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
        priority: 'high',
        createdById: 'user-1',
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
    const { result } = renderHook(() => useTestScenarioCatalog('project-1'));
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
    const { result } = renderHook(() => useTestScenarioCatalog('project-1'));
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
    const { result } = renderHook(() => useTestScenarioCatalog('project-1'));
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
    const { result } = renderHook(() => useTestScenarioCatalog('project-1'));

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
    const { result } = renderHook(() => useTestScenarioCatalog('project-1'));
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

  it('locks selection and duplicate operations while a batch is pending', async () => {
    let finishRequest: (() => void) | undefined;
    const moveTrigger = vi.fn(() => ({
      unwrap: () =>
        new Promise<void>((resolve) => {
          finishRequest = resolve;
        }),
    }));
    mockedBulkMoveMutation.mockReturnValue([moveTrigger, { isLoading: false }] as never);
    const { result } = renderHook(() => useTestScenarioCatalog('project-1'));
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
          <TestScenarioCatalogContainer projectId="project-1" />
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

  it('requests the selected page for the same project and limit', async () => {
    const user = userEvent.setup();

    render(
      <ChakraProvider>
        <MemoryRouter>
          <TestScenarioCatalogContainer projectId="project-1" />
        </MemoryRouter>
      </ChakraProvider>,
    );

    await user.click(screen.getByRole('button', { name: /^2$/ }));

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
          <TestScenarioCatalogContainer projectId="project-1" />
        </MemoryRouter>
      </ChakraProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Create Test Scenario' }));

    expect(navigate).toHaveBeenCalledWith('/test-scenarios/new');
  });

  it('combines folder scope and search in server requests and resets pagination', async () => {
    const user = userEvent.setup();
    render(
      <ChakraProvider>
        <MemoryRouter>
          <TestScenarioCatalogContainer projectId="project-1" />
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
          <TestScenarioCatalogContainer projectId="project-1" />
        </MemoryRouter>
      </ChakraProvider>,
    );

    await user.selectOptions(screen.getByLabelText('Sort by'), 'title');
    await user.selectOptions(screen.getByLabelText('Sort direction'), 'asc');
    await user.selectOptions(screen.getByLabelText('Priority'), 'high');
    await user.selectOptions(screen.getByLabelText('Author'), 'user-1');

    await waitFor(() =>
      expect(mockedScenarioQuery.mock.calls.at(-1)?.[0]).toMatchObject({
        projectId: 'project-1',
        page: 1,
        limit: 25,
        sortField: 'title',
        sortDirection: 'asc',
        priority: 'high',
        createdById: 'user-1',
      }),
    );
  });

  it('uses the backend unfiled scope rather than filtering loaded rows', async () => {
    const user = userEvent.setup();
    render(
      <ChakraProvider>
        <MemoryRouter>
          <TestScenarioCatalogContainer projectId="project-1" />
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
          <TestScenarioCatalogContainer projectId="project-1" />
        </MemoryRouter>
      </ChakraProvider>,
    );

    await user.click(screen.getByRole('button', { name: /Regression 0/ }));
    expect(mockedScenarioQuery.mock.calls.at(-1)?.[0]).toMatchObject({
      projectId: 'project-1',
      page: 1,
      limit: 25,
      sortField: 'updatedAt',
      sortDirection: 'desc',
      suiteId: 'suite-a',
    });
  });
});
