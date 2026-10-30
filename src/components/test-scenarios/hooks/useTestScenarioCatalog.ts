// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  useGetApiV2TestScenarioFoldersQuery,
  useGetApiV2TestSuitesQuery,
  usePostApiV2TestScenarioFoldersMutation,
  usePatchApiV2TestScenarioFoldersByFolderIdMutation,
  useDeleteApiV2TestScenarioFoldersByFolderIdMutation,
  usePostApiV2TestSuitesMutation,
  usePatchApiV2TestSuitesBySuiteIdMutation,
  useDeleteApiV2TestSuitesBySuiteIdMutation,
  usePatchApiV2TestScenariosBulkFolderMutation,
  usePostApiV2TestSuitesBySuiteIdMembersMutation,
  useDeleteApiV2TestSuitesBySuiteIdMembersMutation,
  usePutApiV2TestSuitesBySuiteIdMembersOrderMutation,
} from '@/redux/apis/extendedApi';
import {
  useDeleteApiV2TestScenariosByScenarioIdMutation,
  useGetApiV2TestScenariosAuthorsQuery,
  useGetApiV2TestScenariosQuery,
  useLazyGetApiV2TestScenariosSelectionQuery,
  type GetApiV2TestScenariosApiArg,
  type GetApiV2TestScenariosSelectionApiArg,
} from '@/redux/apis/generatedApi';

import { TEST_SCENARIO_PAGE_LIMIT, TEST_SCENARIO_PAGE_SIZES, type TestScenarioPageSize } from '../constants';
import { executeScenarioOperation, toggleScenarioSelection, type ScenarioOperationReport } from '../utils';

const SEARCH_DEBOUNCE_MS = 500;

export const useTestScenarioCatalog = (projectId: string, organizationTab?: 'scenarios' | 'suites') => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<TestScenarioPageSize>(TEST_SCENARIO_PAGE_LIMIT as TestScenarioPageSize);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [sortField, setSortField] = useState<GetApiV2TestScenariosApiArg['sortField']>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [columnFilters, setColumnFilters] = useState({
    scenarioKey: '',
    title: '',
    details: '',
    folder: '',
    createdBy: '',
  });
  const [debouncedColumnFilters, setDebouncedColumnFilters] = useState(columnFilters);
  const [priority, setPriority] = useState<NonNullable<GetApiV2TestScenariosApiArg['priority']> | ''>('');
  const [authorId, setAuthorId] = useState('');
  const [scope, setScope] = useState<{ kind: 'all' | 'unfiled' | 'folder' | 'suite'; id?: string }>(() =>
    organizationTab === 'suites' ? { kind: 'suite' } : { kind: 'all' },
  );
  const [includeDescendants, setIncludeDescendants] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectionRevision = useRef(0);
  const [resolveSelectionRequest] = useLazyGetApiV2TestScenariosSelectionQuery();
  const [isResolvingSelection, setIsResolvingSelection] = useState(false);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [allMatchingSelected, setAllMatchingSelected] = useState(false);
  const operationLock = useRef(false);
  const [isExecutingOperation, setIsExecutingOperation] = useState(false);
  const [moveScenarios] = usePatchApiV2TestScenariosBulkFolderMutation();
  const [deleteScenario] = useDeleteApiV2TestScenariosByScenarioIdMutation();
  const [addSuiteMembers] = usePostApiV2TestSuitesBySuiteIdMembersMutation();
  const [removeSuiteMembers] = useDeleteApiV2TestSuitesBySuiteIdMembersMutation();
  const [reorderSuiteMembers] = usePutApiV2TestSuitesBySuiteIdMembersOrderMutation();
  const [createFolderRequest] = usePostApiV2TestScenarioFoldersMutation();
  const [updateFolderRequest] = usePatchApiV2TestScenarioFoldersByFolderIdMutation();
  const [deleteFolderRequest] = useDeleteApiV2TestScenarioFoldersByFolderIdMutation();
  const [createSuiteRequest] = usePostApiV2TestSuitesMutation();
  const [updateSuiteRequest] = usePatchApiV2TestSuitesBySuiteIdMutation();
  const [deleteSuiteRequest] = useDeleteApiV2TestSuitesBySuiteIdMutation();
  const foldersQuery = useGetApiV2TestScenarioFoldersQuery({ projectId });
  const suitesQuery = useGetApiV2TestSuitesQuery({ projectId });
  const authorsQuery = useGetApiV2TestScenariosAuthorsQuery({ projectId });
  const projectCountQuery = useGetApiV2TestScenariosQuery({ projectId, page: 1, limit: 1 });
  const unfiledCountQuery = useGetApiV2TestScenariosQuery({ projectId, page: 1, limit: 1, folderId: 'unfiled' });
  const queryArgs = useMemo(
    () => ({
      projectId,
      page,
      limit: pageSize,
      sortField: sortField ?? 'updatedAt',
      sortDirection,
      ...(priority ? { priority } : {}),
      ...(authorId ? { createdById: authorId } : {}),
      ...(debouncedColumnFilters.scenarioKey.trim() ? { scenarioKey: debouncedColumnFilters.scenarioKey.trim() } : {}),
      ...(debouncedColumnFilters.title.trim() ? { title: debouncedColumnFilters.title.trim() } : {}),
      ...(debouncedColumnFilters.details.trim() ? { details: debouncedColumnFilters.details.trim() } : {}),
      ...(debouncedColumnFilters.folder.trim() ? { folder: debouncedColumnFilters.folder.trim() } : {}),
      ...(debouncedColumnFilters.createdBy.trim() ? { createdBy: debouncedColumnFilters.createdBy.trim() } : {}),
      ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
      ...(scope.kind === 'unfiled' ? { folderId: 'unfiled' as const } : {}),
      ...(scope.kind === 'folder' && scope.id ? { folderId: scope.id, includeDescendants } : {}),
      ...(scope.kind === 'suite' && scope.id ? { suiteId: scope.id } : {}),
    }),
    [
      authorId,
      debouncedColumnFilters,
      debouncedSearch,
      includeDescendants,
      page,
      pageSize,
      priority,
      projectId,
      scope,
      sortDirection,
      sortField,
    ],
  );
  const selectionArgs = useMemo<GetApiV2TestScenariosSelectionApiArg>(
    () => ({
      projectId,
      ...(priority ? { priority } : {}),
      ...(authorId ? { createdById: authorId } : {}),
      ...(columnFilters.scenarioKey.trim() ? { scenarioKey: columnFilters.scenarioKey.trim() } : {}),
      ...(columnFilters.title.trim() ? { title: columnFilters.title.trim() } : {}),
      ...(columnFilters.details.trim() ? { details: columnFilters.details.trim() } : {}),
      ...(columnFilters.folder.trim() ? { folder: columnFilters.folder.trim() } : {}),
      ...(columnFilters.createdBy.trim() ? { createdBy: columnFilters.createdBy.trim() } : {}),
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(scope.kind === 'unfiled' ? { folderId: 'unfiled' as const } : {}),
      ...(scope.kind === 'folder' && scope.id ? { folderId: scope.id, includeDescendants } : {}),
      ...(scope.kind === 'suite' && scope.id ? { suiteId: scope.id } : {}),
    }),
    [authorId, columnFilters, includeDescendants, priority, projectId, scope, search],
  );
  const invalidateSelection = useCallback(() => {
    selectionRevision.current += 1;
    setSelectedIds([]);
    setAllMatchingSelected(false);
    setIsResolvingSelection(false);
    setSelectionError(null);
  }, []);
  useEffect(() => {
    invalidateSelection();
  }, [projectId, organizationTab, invalidateSelection]);
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search);
      setDebouncedColumnFilters(columnFilters);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timeout);
  }, [columnFilters, search]);
  const isAwaitingSuiteSelection = organizationTab === 'suites' && scope.kind === 'suite' && !scope.id;
  const {
    currentData,
    isLoading: isQueryLoading,
    isFetching,
    error,
  } = useGetApiV2TestScenariosQuery(queryArgs, { skip: isAwaitingSuiteSelection });

  const scenarios = currentData?.scenarios ?? [];
  const pagination = currentData
    ? {
        page: currentData.page,
        limit: currentData.limit,
        total: currentData.total,
        totalPages: currentData.totalPages,
      }
    : {
        page,
        limit: pageSize,
        total: 0,
        totalPages: 0,
      };
  useEffect(() => {
    if (!currentData) return;
    const lastAvailablePage = Math.max(1, currentData.totalPages);
    if (page > lastAvailablePage) setPage(lastAvailablePage);
  }, [currentData, page]);
  const isLoading = isQueryLoading || (isFetching && !currentData);
  const onPageChange = useCallback((nextPage: number) => setPage(nextPage), []);
  const onPageSizeChange = useCallback((value: number) => {
    if (!TEST_SCENARIO_PAGE_SIZES.some((size) => size === value)) return;
    setPageSize(value as TestScenarioPageSize);
    setPage(1);
  }, []);
  const onSearchChange = useCallback(
    (value: string) => {
      invalidateSelection();
      setSearch(value);
      setPage(1);
    },
    [invalidateSelection],
  );
  const onSortChange = useCallback(
    (field: NonNullable<GetApiV2TestScenariosApiArg['sortField']>) => {
      if (sortField === field) setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'));
      else if (!sortField && field === 'createdAt') {
        setSortField(field);
        setSortDirection('asc');
      } else {
        setSortField(field);
        setSortDirection('desc');
      }
      setPage(1);
    },
    [sortField],
  );
  const onSortDirectionChange = useCallback((direction: 'asc' | 'desc') => {
    setSortDirection(direction);
    setPage(1);
  }, []);
  const onColumnFilterChange = useCallback(
    (field: keyof typeof columnFilters, value: string) => {
      invalidateSelection();
      setColumnFilters((current) => ({ ...current, [field]: value }));
      setPage(1);
    },
    [invalidateSelection],
  );
  const onPriorityChange = useCallback(
    (value: NonNullable<GetApiV2TestScenariosApiArg['priority']> | '') => {
      invalidateSelection();
      setPriority(value);
      setPage(1);
    },
    [invalidateSelection],
  );
  const onAuthorChange = useCallback(
    (value: string) => {
      invalidateSelection();
      setAuthorId(value);
      setPage(1);
    },
    [invalidateSelection],
  );
  const onScopeChange = useCallback(
    (nextScope: typeof scope) => {
      invalidateSelection();
      setScope(nextScope);
      setPage(1);
    },
    [invalidateSelection],
  );
  const onIncludeDescendantsChange = useCallback(
    (value: boolean) => {
      invalidateSelection();
      setIncludeDescendants(value);
      setPage(1);
    },
    [invalidateSelection],
  );
  const toggleSelected = useCallback((id: string) => {
    if (operationLock.current) return;
    selectionRevision.current += 1;
    setIsResolvingSelection(false);
    setAllMatchingSelected(false);
    setSelectionError(null);
    setSelectedIds((current) => toggleScenarioSelection(current, id));
  }, []);
  const selectOnlyScenario = useCallback((id: string) => {
    if (operationLock.current) return;
    setAllMatchingSelected(false);
    setSelectionError(null);
    setSelectedIds([id]);
  }, []);
  const selectAllMatching = useCallback(async () => {
    if (operationLock.current) return;
    const revision = ++selectionRevision.current;
    setIsResolvingSelection(true);
    setSelectionError(null);
    setSelectedIds([]);
    setAllMatchingSelected(false);
    try {
      const response = await resolveSelectionRequest(selectionArgs).unwrap();
      if (revision !== selectionRevision.current) return;
      const uniqueIds = [...new Set(response.scenarioIds)];
      if (uniqueIds.length !== response.total)
        throw new Error('The selection response did not contain a complete unique UUID set.');
      setSelectedIds(uniqueIds);
      setAllMatchingSelected(true);
    } catch (error) {
      if (revision === selectionRevision.current)
        setSelectionError(error instanceof Error ? error.message : String(error));
    } finally {
      if (revision === selectionRevision.current) setIsResolvingSelection(false);
    }
  }, [resolveSelectionRequest, selectionArgs]);
  const reconcileOperation = useCallback((report: ScenarioOperationReport, revision: number) => {
    if (revision !== selectionRevision.current) return;
    if (report.succeededIds.length)
      setSelectedIds((current) => current.filter((id) => !report.succeededIds.includes(id)));
    setAllMatchingSelected(false);
  }, []);
  const runOperation = useCallback(async (operation: () => Promise<ScenarioOperationReport>) => {
    if (operationLock.current) return { succeededIds: [], failedIds: [], unattemptedIds: [], uncertainIds: [] };
    operationLock.current = true;
    setIsExecutingOperation(true);
    try {
      return await operation();
    } finally {
      operationLock.current = false;
      setIsExecutingOperation(false);
    }
  }, []);
  const moveScenarioIds = useCallback(
    async (idsToMove: string[], folderId: string | null): Promise<ScenarioOperationReport> => {
      return runOperation(async () => {
        const ids = [...new Set(idsToMove)];
        const revision = selectionRevision.current;
        const report = await executeScenarioOperation(ids, (scenarioIds) =>
          moveScenarios({ body: { projectId, scenarioIds, folderId } }).unwrap(),
        );
        reconcileOperation(report, revision);
        return report;
      });
    },
    [moveScenarios, projectId, reconcileOperation, runOperation],
  );
  const moveSelected = useCallback(
    (folderId: string | null) => moveScenarioIds(selectedIds, folderId),
    [moveScenarioIds, selectedIds],
  );
  const addSelectedToSuite = useCallback(
    async (suiteId: string): Promise<ScenarioOperationReport> => {
      return runOperation(async () => {
        const ids = [...selectedIds];
        const revision = selectionRevision.current;
        const report = await executeScenarioOperation(ids, (scenarioIds) =>
          addSuiteMembers({ suiteId, body: { projectId, scenarioIds } }).unwrap(),
        );
        reconcileOperation(report, revision);
        return report;
      });
    },
    [addSuiteMembers, projectId, reconcileOperation, runOperation, selectedIds],
  );
  const deleteSelected = useCallback(
    async (idsToDelete: string[]): Promise<ScenarioOperationReport> => {
      return runOperation(async () => {
        const ids = [...idsToDelete];
        const revision = selectionRevision.current;
        const report = await executeScenarioOperation(
          ids,
          async (batch) => {
            for (const scenarioId of batch) await deleteScenario({ scenarioId, projectId }).unwrap();
          },
          1,
        );
        reconcileOperation(report, revision);
        return report;
      });
    },
    [deleteScenario, projectId, reconcileOperation, runOperation],
  );
  const removeSelectedFromSuite = useCallback(async (): Promise<ScenarioOperationReport> => {
    if (scope.kind !== 'suite' || !scope.id || selectedIds.length === 0)
      return { succeededIds: [], failedIds: [], unattemptedIds: [], uncertainIds: [] };
    return runOperation(async () => {
      const ids = [...selectedIds];
      const revision = selectionRevision.current;
      const report = await executeScenarioOperation(ids, (scenarioIds) =>
        removeSuiteMembers({ suiteId: scope.id!, body: { projectId, scenarioIds } }).unwrap(),
      );
      reconcileOperation(report, revision);
      return report;
    });
  }, [projectId, reconcileOperation, removeSuiteMembers, runOperation, scope, selectedIds]);
  const reorderSuite = useCallback(
    async (suiteId: string, scenarioIds: string[]) => {
      await reorderSuiteMembers({ suiteId, body: { projectId, scenarioIds } }).unwrap();
    },
    [projectId, reorderSuiteMembers],
  );
  const createFolder = useCallback(
    async (name: string, parentId: string | null, description?: string | null) =>
      createFolderRequest({ body: { projectId, name, parentId, description } }).unwrap(),
    [createFolderRequest, projectId],
  );
  const updateFolder = useCallback(
    async (
      folderId: string,
      body: { name?: string; parentId?: string | null; position?: number; description?: string | null },
    ) => updateFolderRequest({ folderId, projectId, body }).unwrap(),
    [projectId, updateFolderRequest],
  );
  const deleteFolder = useCallback(
    async (folderId: string, disposition: 'parent' | 'unfiled') => {
      await deleteFolderRequest({ folderId, projectId, disposition }).unwrap();
      if (scope.id === folderId) onScopeChange({ kind: 'all' });
    },
    [deleteFolderRequest, onScopeChange, projectId, scope.id],
  );
  const createSuite = useCallback(
    async (body: { name: string; description?: string | null; purpose?: string | null; release?: string | null }) =>
      createSuiteRequest({ body: { projectId, ...body } }).unwrap(),
    [createSuiteRequest, projectId],
  );
  const updateSuite = useCallback(
    async (
      suiteId: string,
      body: { name?: string; description?: string | null; purpose?: string | null; release?: string | null },
    ) => updateSuiteRequest({ suiteId, projectId, body }).unwrap(),
    [projectId, updateSuiteRequest],
  );
  const deleteSuite = useCallback(
    async (suiteId: string) => {
      await deleteSuiteRequest({ suiteId, projectId }).unwrap();
      if (scope.id === suiteId) onScopeChange({ kind: 'all' });
    },
    [deleteSuiteRequest, onScopeChange, projectId, scope.id],
  );

  return {
    scenarios,
    pagination,
    pageSize,
    pageSizes: TEST_SCENARIO_PAGE_SIZES,
    onPageSizeChange,
    isLoading,
    error,
    onPageChange,
    search,
    onSearchChange,
    sort: sortField,
    sortDirection,
    onSortChange,
    onSortDirectionChange,
    columnFilters,
    onColumnFilterChange,
    priority,
    onPriorityChange,
    authorId,
    onAuthorChange,
    authors: authorsQuery.currentData?.authors ?? [],
    authorsLoading: authorsQuery.isLoading,
    authorsError: authorsQuery.error,
    projectScenarioCount: projectCountQuery.currentData?.total ?? 0,
    unfiledScenarioCount: unfiledCountQuery.currentData?.total ?? 0,
    scope,
    onScopeChange,
    includeDescendants,
    onIncludeDescendantsChange,
    folders: foldersQuery.currentData ?? [],
    suites: suitesQuery.currentData ?? [],
    organizationLoading: foldersQuery.isLoading || suitesQuery.isLoading,
    organizationError: foldersQuery.error ?? suitesQuery.error,
    selectedIds,
    selectAllMatching,
    isResolvingSelection,
    selectionError,
    allMatchingSelected,
    isExecutingOperation,
    toggleSelected,
    selectOnlyScenario,
    moveSelected,
    moveScenarioIds,
    deleteSelected,
    addSelectedToSuite,
    removeSelectedFromSuite,
    reorderSuite,
    createFolder,
    updateFolder,
    deleteFolder,
    createSuite,
    updateSuite,
    deleteSuite,
  };
};
