// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';

import {
  useGetApiV2TestScenarioFoldersQuery,
  useGetApiV2TestSuitesQuery,
  usePostApiV2TestScenarioFoldersMutation,
  usePatchApiV2TestScenarioFoldersByFolderIdMutation,
  useDeleteApiV2TestScenarioFoldersByFolderIdMutation,
  usePostApiV2TestScenarioFoldersRestorationMutation,
  usePostApiV2TestScenariosFolderRestorationMutation,
  usePostApiV2TestSuitesMutation,
  usePatchApiV2TestSuitesBySuiteIdMutation,
  useDeleteApiV2TestSuitesBySuiteIdMutation,
  usePatchApiV2TestScenariosBulkFolderMutation,
  useDeleteApiV2TestSuitesBySuiteIdMembersMutation,
  usePutApiV2TestSuitesBySuiteIdMembersOrderMutation,
  useGetApiV2TestScenariosPriorityCountsQuery,
  usePostApiV2TestSuitesBySuiteIdMembershipChangesMutation,
  usePostApiV2TestSuitesBySuiteIdMembershipRestorationMutation,
  usePostApiV2TestSuitesMovesMutation,
  usePostApiV2TestSuitesMoveRestorationMutation,
} from '@/redux/apis/extendedApi';
import {
  useDeleteApiV2TestScenariosByScenarioIdMutation,
  useGetApiV2TestScenariosAuthorsQuery,
  useGetApiV2TestScenariosQuery,
  useLazyGetApiV2TestScenariosSelectionQuery,
  type GetApiV2TestScenariosAuthorsApiArg,
  type GetApiV2TestScenariosApiArg,
  type GetApiV2TestScenariosSelectionApiArg,
  type GetApiV2TestScenariosPriorityCountsApiArg,
  type PostApiV2TestScenarioFoldersRestorationApiArg,
} from '@/redux/apis/generatedApi';

import { TEST_SCENARIO_PAGE_LIMIT, TEST_SCENARIO_PAGE_SIZES, type TestScenarioPageSize } from '../constants';
import { executeScenarioOperation, flattenScenarioFolders, toggleScenarioSelection, type ScenarioOperationReport } from '../utils';

const SEARCH_DEBOUNCE_MS = 500;

export const useTestScenarioCatalog = (projectId: string, organizationTab?: 'scenarios' | 'suites') => {
  const [searchParams] = useSearchParams();
  const requestedFolder = searchParams.get('projectId') && searchParams.get('projectId') !== projectId ? null : searchParams.get('folderId');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<TestScenarioPageSize>(TEST_SCENARIO_PAGE_LIMIT as TestScenarioPageSize);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [sortField, setSortField] = useState<GetApiV2TestScenariosApiArg['sortField']>(organizationTab === 'suites' ? undefined : 'updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  useEffect(() => setSortField(organizationTab === 'suites' ? undefined : 'updatedAt'), [organizationTab]);
  const [columnFilters, setColumnFilters] = useState({
    scenarioKey: '',
    title: '',
    details: '',
    folder: '',
    createdBy: '',
  });
  const [debouncedColumnFilters, setDebouncedColumnFilters] = useState(columnFilters);
  const [priority, setPriority] = useState<NonNullable<GetApiV2TestScenariosApiArg['priority']> | ''>('');
  const [authorIds, setAuthorIds] = useState<string[]>([]);
  const [scope, setScope] = useState<{ kind: 'all' | 'unfiled' | 'folder' | 'suite'; id?: string }>(() =>
    organizationTab === 'suites' ? { kind: 'suite' } : requestedFolder === 'unfiled' ? { kind: 'unfiled' } : requestedFolder ? { kind: 'folder', id: requestedFolder } : { kind: 'all' },
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectionRevision = useRef(0);
  const suiteSelectionRevision = useRef<number | null>(null);
  const [resolveSelectionRequest] = useLazyGetApiV2TestScenariosSelectionQuery();
  const [isResolvingSelection, setIsResolvingSelection] = useState(false);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [allMatchingSelected, setAllMatchingSelected] = useState(false);
  const operationLock = useRef(false);
  const [isExecutingOperation, setIsExecutingOperation] = useState(false);
  const [moveScenarios] = usePatchApiV2TestScenariosBulkFolderMutation();
  const [deleteScenario] = useDeleteApiV2TestScenariosByScenarioIdMutation();
  const [removeSuiteMembers] = useDeleteApiV2TestSuitesBySuiteIdMembersMutation();
  const [reorderSuiteMembers] = usePutApiV2TestSuitesBySuiteIdMembersOrderMutation();
  const [changeMembership] = usePostApiV2TestSuitesBySuiteIdMembershipChangesMutation();
  const [restoreMembership] = usePostApiV2TestSuitesBySuiteIdMembershipRestorationMutation();
  const [moveSuiteMembersRequest] = usePostApiV2TestSuitesMovesMutation();
  const [restoreSuiteMoveRequest] = usePostApiV2TestSuitesMoveRestorationMutation();
  const [createFolderRequest] = usePostApiV2TestScenarioFoldersMutation();
  const [updateFolderRequest] = usePatchApiV2TestScenarioFoldersByFolderIdMutation();
  const [deleteFolderRequest] = useDeleteApiV2TestScenarioFoldersByFolderIdMutation();
  const [restoreFolderDeletionRequest] = usePostApiV2TestScenarioFoldersRestorationMutation();
  const [restoreScenarioFoldersRequest] = usePostApiV2TestScenariosFolderRestorationMutation();
  const [createSuiteRequest] = usePostApiV2TestSuitesMutation();
  const [updateSuiteRequest] = usePatchApiV2TestSuitesBySuiteIdMutation();
  const [deleteSuiteRequest] = useDeleteApiV2TestSuitesBySuiteIdMutation();
  const foldersQuery = useGetApiV2TestScenarioFoldersQuery({ projectId });
  const suitesQuery = useGetApiV2TestSuitesQuery({ projectId });
  const newlyCreatedFolderId = useRef<string | null>(null);
  const currentProjectId = useRef(projectId);
  currentProjectId.current = projectId;
  useEffect(() => {
    if (scope.kind !== 'folder' || !foldersQuery.currentData) return;
    const exists = flattenScenarioFolders(foldersQuery.currentData).some((folder) => folder.id === scope.id);
    if (exists && newlyCreatedFolderId.current === scope.id) newlyCreatedFolderId.current = null;
    if (!exists && newlyCreatedFolderId.current !== scope.id && !foldersQuery.isFetching) setScope({ kind: 'all' });
  }, [foldersQuery.currentData, foldersQuery.isFetching, scope]);
  useEffect(() => {
    if (organizationTab !== 'suites' || scope.kind !== 'suite' || !suitesQuery.currentData || suitesQuery.isFetching) return;
    const available = suitesQuery.currentData;
    if (!scope.id && available.length === 0) return;
    if (scope.id && available.some((suite) => suite.id === scope.id)) return;
    setScope({ kind: 'suite', ...(available[0] ? { id: available[0].id } : {}) });
    setPage(1);
  }, [organizationTab, scope, suitesQuery.currentData, suitesQuery.isFetching]);
  const projectCountQuery = useGetApiV2TestScenariosQuery({ projectId, page: 1, limit: 1 });
  const unfiledCountQuery = useGetApiV2TestScenariosQuery({ projectId, page: 1, limit: 1, folderId: 'unfiled' });
  const queryArgs = useMemo(
    () => ({
      projectId,
      page,
      limit: pageSize,
      ...(scope.kind === 'suite' && !sortField ? {} : { sortField: sortField ?? 'updatedAt', sortDirection }),
      ...(priority ? { priority } : {}),
      ...(authorIds.length ? { createdByIds: authorIds.join(',') } : {}),
      ...(debouncedColumnFilters.scenarioKey.trim() ? { scenarioKey: debouncedColumnFilters.scenarioKey.trim() } : {}),
      ...(debouncedColumnFilters.title.trim() ? { title: debouncedColumnFilters.title.trim() } : {}),
      ...(debouncedColumnFilters.details.trim() ? { details: debouncedColumnFilters.details.trim() } : {}),
      ...(debouncedColumnFilters.folder.trim() ? { folder: debouncedColumnFilters.folder.trim() } : {}),
      ...(debouncedColumnFilters.createdBy.trim() ? { createdBy: debouncedColumnFilters.createdBy.trim() } : {}),
      ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
      ...(scope.kind === 'unfiled' ? { folderId: 'unfiled' as const } : {}),
      ...(scope.kind === 'folder' && scope.id ? { folderId: scope.id, includeDescendants: true } : {}),
      ...(scope.kind === 'suite' && scope.id ? { suiteId: scope.id } : {}),
    }),
    [
      authorIds,
      debouncedColumnFilters,
      debouncedSearch,
      page,
      pageSize,
      priority,
      projectId,
      scope,
      sortDirection,
      sortField,
    ],
  );
  const authorCountArgs = useMemo<GetApiV2TestScenariosAuthorsApiArg>(
    () => ({
      projectId,
      ...(priority ? { priority } : {}),
      ...(debouncedColumnFilters.scenarioKey.trim() ? { scenarioKey: debouncedColumnFilters.scenarioKey.trim() } : {}),
      ...(debouncedColumnFilters.title.trim() ? { title: debouncedColumnFilters.title.trim() } : {}),
      ...(debouncedColumnFilters.details.trim() ? { details: debouncedColumnFilters.details.trim() } : {}),
      ...(debouncedColumnFilters.folder.trim() ? { folder: debouncedColumnFilters.folder.trim() } : {}),
      ...(debouncedColumnFilters.createdBy.trim() ? { createdBy: debouncedColumnFilters.createdBy.trim() } : {}),
      ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
      ...(scope.kind === 'unfiled' ? { folderId: 'unfiled' as const } : {}),
      ...(scope.kind === 'folder' && scope.id ? { folderId: scope.id, includeDescendants: true } : {}),
      ...(scope.kind === 'suite' && scope.id ? { suiteId: scope.id } : {}),
    }),
    [debouncedColumnFilters, debouncedSearch, priority, projectId, scope],
  );
  const authorsQuery = useGetApiV2TestScenariosAuthorsQuery(authorCountArgs);
  const authorIdentityCache = useRef<{
    projectId: string;
    authors: Array<{ id: string; name: string; email: string }>;
  } | null>(null);
  useEffect(() => {
    const currentAuthors = authorsQuery.currentData?.authors;
    if (!currentAuthors) return;
    authorIdentityCache.current = {
      projectId,
      authors: currentAuthors.map(({ id, name, email }) => ({ id, name, email })),
    };
  }, [authorsQuery.currentData, projectId]);
  const selectionArgs = useMemo<GetApiV2TestScenariosSelectionApiArg>(
    () => ({
      projectId,
      ...(priority ? { priority } : {}),
      ...(authorIds.length ? { createdByIds: authorIds.join(',') } : {}),
      ...(columnFilters.scenarioKey.trim() ? { scenarioKey: columnFilters.scenarioKey.trim() } : {}),
      ...(columnFilters.title.trim() ? { title: columnFilters.title.trim() } : {}),
      ...(columnFilters.details.trim() ? { details: columnFilters.details.trim() } : {}),
      ...(columnFilters.folder.trim() ? { folder: columnFilters.folder.trim() } : {}),
      ...(columnFilters.createdBy.trim() ? { createdBy: columnFilters.createdBy.trim() } : {}),
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(scope.kind === 'unfiled' ? { folderId: 'unfiled' as const } : {}),
      ...(scope.kind === 'folder' && scope.id ? { folderId: scope.id, includeDescendants: true } : {}),
      ...(scope.kind === 'suite' && scope.id ? { suiteId: scope.id } : {}),
    }),
    [authorIds, columnFilters, priority, projectId, scope, search],
  );
  const invalidateSelection = useCallback(() => {
    selectionRevision.current += 1;
    setSelectedIds([]);
    setAllMatchingSelected(false);
    setIsResolvingSelection(false);
    setSelectionError(null);
  }, []);
  useEffect(() => {
    if (organizationTab === 'suites' && scope.kind !== 'suite') {
      invalidateSelection();
      setScope({ kind: 'suite', ...(suitesQuery.currentData?.[0] ? { id: suitesQuery.currentData[0].id } : {}) });
      setPage(1);
    } else if (organizationTab !== 'suites' && scope.kind === 'suite') {
      invalidateSelection();
      setScope({ kind: 'all' });
      setPage(1);
    }
  }, [invalidateSelection, organizationTab, scope.kind, suitesQuery.currentData]);
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
  const priorityCountArgs = useMemo<GetApiV2TestScenariosPriorityCountsApiArg>(
    () => ({
      projectId,
      ...(authorIds.length ? { createdByIds: authorIds.join(',') } : {}),
      ...(debouncedColumnFilters.scenarioKey.trim() ? { scenarioKey: debouncedColumnFilters.scenarioKey.trim() } : {}),
      ...(debouncedColumnFilters.title.trim() ? { title: debouncedColumnFilters.title.trim() } : {}),
      ...(debouncedColumnFilters.details.trim() ? { details: debouncedColumnFilters.details.trim() } : {}),
      ...(debouncedColumnFilters.folder.trim() ? { folder: debouncedColumnFilters.folder.trim() } : {}),
      ...(debouncedColumnFilters.createdBy.trim() ? { createdBy: debouncedColumnFilters.createdBy.trim() } : {}),
      ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
      ...(scope.kind === 'unfiled' ? { folderId: 'unfiled' as const } : {}),
      ...(scope.kind === 'folder' && scope.id ? { folderId: scope.id, includeDescendants: true } : {}),
      ...(scope.kind === 'suite' && scope.id ? { suiteId: scope.id } : {}),
    }),
    [authorIds, debouncedColumnFilters, debouncedSearch, projectId, scope],
  );
  const priorityCountQuery = useGetApiV2TestScenariosPriorityCountsQuery(priorityCountArgs, {
    skip: isAwaitingSuiteSelection,
  });
  const priorityCounts = {
    high: priorityCountQuery.currentData?.high,
    medium: priorityCountQuery.currentData?.medium,
    low: priorityCountQuery.currentData?.low,
  };
  const {
    currentData,
    isLoading: isQueryLoading,
    isFetching,
    error,
    refetch: refetchScenarios,
  } = useGetApiV2TestScenariosQuery(queryArgs, { skip: isAwaitingSuiteSelection });
  const refreshSuiteData = useCallback(async () => {
    await Promise.all([suitesQuery.refetch(), foldersQuery.refetch(), refetchScenarios()]);
  }, [foldersQuery, refetchScenarios, suitesQuery]);

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
  const onPageChange = useCallback((nextPage: number) => {
    invalidateSelection();
    setPage(nextPage);
  }, [invalidateSelection]);
  const onPageSizeChange = useCallback((value: number) => {
    if (!TEST_SCENARIO_PAGE_SIZES.some((size) => size === value)) return;
    invalidateSelection();
    setPageSize(value as TestScenarioPageSize);
    setPage(1);
  }, [invalidateSelection]);
  const onSearchChange = useCallback(
    (value: string) => {
      invalidateSelection();
      setSearch(value);
      setPage(1);
    },
    [invalidateSelection],
  );
  const onSortChange = useCallback(
    (field: GetApiV2TestScenariosApiArg['sortField']) => {
      if (!field) setSortField(undefined);
      else if (sortField === field) setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'));
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
    (value: string[] | string) => {
      invalidateSelection();
      const nextAuthorIds = typeof value === 'string' ? (value ? [value] : []) : value;
      setAuthorIds([...new Set(nextAuthorIds)]);
      setPage(1);
    },
    [invalidateSelection],
  );
  const onScopeChange = useCallback(
    (nextScope: typeof scope) => {
      if (nextScope.kind !== 'folder' || nextScope.id !== newlyCreatedFolderId.current) newlyCreatedFolderId.current = null;
      invalidateSelection();
      setScope(nextScope);
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
        const folderRestoreData: NonNullable<ScenarioOperationReport['folderRestoreData']> = [];
        const report = await executeScenarioOperation(ids, async (scenarioIds) => {
          const result = await moveScenarios({ body: { projectId, scenarioIds, folderId } }).unwrap();
          folderRestoreData.push(...(result?.restoreData ?? []));
          return result;
        });
        report.folderRestoreData = folderRestoreData;
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
  const startSuiteOperation = useCallback(() => {
    suiteSelectionRevision.current = selectionRevision.current;
  }, []);
  const reconcileSuiteOperation = useCallback((report: ScenarioOperationReport, selection: string[]) => {
    if (suiteSelectionRevision.current !== selectionRevision.current) return;
    setSelectedIds((current) => {
      if (current.length !== selection.length || current.some((id, index) => id !== selection[index])) return current;
      return current.filter((id) => !report.succeededIds.includes(id));
    });
    setAllMatchingSelected(false);
  }, []);
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
  const removeSuiteMembership = useCallback(async (suiteId: string, scenarioIds: string[]) => {
    const suite = suitesQuery.currentData?.find((item) => item.id === suiteId);
    if (!suite) throw new Error('The suite is no longer available. Refresh and try again.');
    const expectedScenarioIds = (suite.members ?? []).map((member) => member.testScenarioId);
    const response = await changeMembership({
      suiteId,
      body: {
        projectId,
        expectedMembershipRevision: suite.membershipRevision,
        expectedScenarioIds,
        addScenarioIds: [],
        removeScenarioIds: scenarioIds,
      },
    }).unwrap();
    return {
      restoreData: response.restoreData,
      expectedMembershipRevision: response.membershipRevision,
      expectedScenarioIds: response.scenarioIds,
    };
  }, [changeMembership, projectId, suitesQuery.currentData]);
  const restoreSuiteMembership = useCallback(async (undo: {
    restoreData: NonNullable<Awaited<ReturnType<typeof removeSuiteMembership>>['restoreData']>;
    expectedMembershipRevision: number;
    expectedScenarioIds: string[];
  }) => {
    const suiteId = undo.restoreData.suiteId;
    await restoreMembership({
      suiteId,
      body: {
        projectId,
        expectedMembershipRevision: undo.expectedMembershipRevision,
        expectedScenarioIds: undo.expectedScenarioIds,
        restoreData: undo.restoreData,
      },
    }).unwrap();
  }, [projectId, restoreMembership]);
  const moveSuiteMembership = useCallback(async (sourceSuiteId: string, destinationSuiteId: string, scenarioIds: string[]) => {
    const suitesNow = suitesQuery.currentData ?? [];
    const source = suitesNow.find((item) => item.id === sourceSuiteId);
    const destination = suitesNow.find((item) => item.id === destinationSuiteId);
    if (!source || !destination) throw new Error('A suite is no longer available. Refresh and try again.');
    const expectedSourceScenarioIds = (source.members ?? []).map((member) => member.testScenarioId);
    const expectedDestinationScenarioIds = (destination.members ?? []).map((member) => member.testScenarioId);
    const response = await moveSuiteMembersRequest({
      body: {
        projectId,
        sourceSuiteId,
        destinationSuiteId,
        expectedSourceMembershipRevision: source.membershipRevision,
        expectedDestinationMembershipRevision: destination.membershipRevision,
        scenarioIds,
        expectedSourceScenarioIds,
        expectedDestinationScenarioIds,
      },
    }).unwrap();
    return {
      restoreData: response.restoreData,
      expectedSourceMembershipRevision: response.sourceMembershipRevision,
      expectedDestinationMembershipRevision: response.destinationMembershipRevision,
      expectedSourceScenarioIds: response.sourceScenarioIds,
      expectedDestinationScenarioIds: response.destinationScenarioIds,
      alreadyInDestination: response.alreadyInDestination,
    };
  }, [moveSuiteMembersRequest, projectId, suitesQuery.currentData]);
  const restoreSuiteMove = useCallback(async (undo: Awaited<ReturnType<typeof moveSuiteMembership>>) => {
    await restoreSuiteMoveRequest({
      body: {
        projectId,
        expectedSourceMembershipRevision: undo.expectedSourceMembershipRevision,
        expectedDestinationMembershipRevision: undo.expectedDestinationMembershipRevision,
        expectedSourceScenarioIds: undo.expectedSourceScenarioIds,
        expectedDestinationScenarioIds: undo.expectedDestinationScenarioIds,
        restoreData: undo.restoreData,
      },
    }).unwrap();
  }, [projectId, restoreSuiteMoveRequest]);
  const reorderSuite = useCallback(
    async (suiteId: string, scenarioIds: string[]) => {
      const submitOrder = async (suite: NonNullable<typeof suitesQuery.currentData>[number]) => {
        const expectedScenarioIds = (suite.members ?? []).map((member) => member.testScenarioId);
        if (
          expectedScenarioIds.length !== scenarioIds.length ||
          expectedScenarioIds.some((id) => !scenarioIds.includes(id))
        )
          throw new Error('Suite membership changed. The latest suite was loaded; drag the row again to reorder.');
        await reorderSuiteMembers({
          suiteId,
          body: {
            projectId,
            expectedMembershipRevision: suite.membershipRevision,
            expectedScenarioIds,
            scenarioIds,
          },
        }).unwrap();
      };

      const suite = suitesQuery.currentData?.find((item) => item.id === suiteId);
      if (!suite) throw new Error('The suite is no longer available. Refresh and try again.');
      try {
        await submitOrder(suite);
      } catch (error) {
        if (typeof error !== 'object' || error === null || !('status' in error) || error.status !== 409) throw error;
        const latestSuites = await suitesQuery.refetch().unwrap();
        const latestSuite = latestSuites.find((item) => item.id === suiteId);
        if (!latestSuite) throw new Error('The suite is no longer available. Refresh and try again.');
        await submitOrder(latestSuite);
      }
    },
    [projectId, reorderSuiteMembers, suitesQuery],
  );
  const createFolder = useCallback(
    async (name: string, parentId: string | null, description?: string | null) => {
      const created = await createFolderRequest({ body: { projectId, name, parentId, description } }).unwrap();
      newlyCreatedFolderId.current = created.id;
      return created;
    },
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
    async (folderId: string) => {
      const result = await deleteFolderRequest({ folderId, projectId }).unwrap();
      if (currentProjectId.current === projectId) onScopeChange({ kind: 'unfiled' });
      return result;
    },
    [deleteFolderRequest, onScopeChange, projectId],
  );
  const restoreFolderDeletion = useCallback(async (restoreData: PostApiV2TestScenarioFoldersRestorationApiArg['body']['restoreData']) => {
    await restoreFolderDeletionRequest({ body: { projectId, restoreData } }).unwrap();
  }, [projectId, restoreFolderDeletionRequest]);
  const restoreScenarioFolders = useCallback(async (restoreData: NonNullable<ScenarioOperationReport['folderRestoreData']>) => {
    await restoreScenarioFoldersRequest({ body: { projectId, restoreData } }).unwrap();
  }, [projectId, restoreScenarioFoldersRequest]);
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
      if (scope.id === suiteId) {
        const available = suitesQuery.currentData ?? [];
        const index = available.findIndex((suite) => suite.id === suiteId);
        const neighbor = available[index + 1] ?? available[index - 1];
        onScopeChange(organizationTab === 'suites' ? { kind: 'suite', ...(neighbor ? { id: neighbor.id } : {}) } : { kind: 'all' });
      }
    },
    [deleteSuiteRequest, onScopeChange, organizationTab, projectId, scope.id, suitesQuery.currentData],
  );
  const currentAuthors = authorsQuery.currentData?.authors;
  const cachedAuthorIdentities = authorIdentityCache.current?.projectId === projectId ? authorIdentityCache.current.authors : [];
  const authorsForFilter = currentAuthors
    ? currentAuthors.map((author) => ({
        ...author,
        scenarioCount: !authorsQuery.isFetching && !authorsQuery.error ? author.scenarioCount : undefined,
      }))
    : cachedAuthorIdentities.map((author) => ({ ...author, scenarioCount: undefined }));

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
    priorityCounts,
    onPriorityChange,
    authorIds,
    onAuthorChange,
    authors: authorsForFilter,
    authorsLoading: authorsQuery.isFetching,
    authorsError: authorsQuery.error,
    projectScenarioCount: projectCountQuery.currentData?.total ?? 0,
    unfiledScenarioCount: unfiledCountQuery.currentData?.total ?? 0,
    scope,
    onScopeChange,
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
    startSuiteOperation,
    reconcileSuiteOperation,
    removeSelectedFromSuite,
    removeSuiteMembership,
    restoreSuiteMembership,
    moveSuiteMembership,
    restoreSuiteMove,
    refreshSuiteData,
    reorderSuite,
    createFolder,
    updateFolder,
    deleteFolder,
    restoreFolderDeletion,
    restoreScenarioFolders,
    createSuite,
    updateSuite,
    deleteSuite,
  };
};
