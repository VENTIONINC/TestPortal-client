// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useMemo, useState } from 'react';

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
import { useGetApiV2TestScenariosQuery } from '@/redux/apis/generatedApi';

import { TEST_SCENARIO_PAGE_LIMIT } from '../constants';
import { toggleScenarioSelection } from '../utils';

export const useTestScenarioCatalog = (projectId: string) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'recently_created' | 'recently_updated' | 'title_asc'>('recently_created');
  const [scope, setScope] = useState<{ kind: 'all' | 'unfiled' | 'folder' | 'suite'; id?: string }>({ kind: 'all' });
  const [includeDescendants, setIncludeDescendants] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [moveScenarios] = usePatchApiV2TestScenariosBulkFolderMutation();
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
  const queryArgs = useMemo(() => ({
    projectId,
    page,
    limit: TEST_SCENARIO_PAGE_LIMIT,
    sort,
    ...(search.trim() ? { search: search.trim() } : {}),
    ...(scope.kind === 'unfiled' ? { folderId: 'unfiled' as const } : {}),
    ...(scope.kind === 'folder' && scope.id ? { folderId: scope.id, includeDescendants } : {}),
    ...(scope.kind === 'suite' && scope.id ? { suiteId: scope.id } : {}),
  }), [includeDescendants, page, projectId, scope, search, sort]);
  const { currentData, isLoading: isQueryLoading, isFetching, error } = useGetApiV2TestScenariosQuery(queryArgs);

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
        limit: TEST_SCENARIO_PAGE_LIMIT,
        total: 0,
        totalPages: 0,
      };
  const isLoading = isQueryLoading || (isFetching && !currentData);
  const onPageChange = useCallback((nextPage: number) => setPage(nextPage), []);
  const onSearchChange = useCallback((value: string) => { setSearch(value); setPage(1); }, []);
  const onSortChange = useCallback((value: 'recently_created' | 'recently_updated' | 'title_asc') => { setSort(value); setPage(1); }, []);
  const onScopeChange = useCallback((nextScope: typeof scope) => {
    setScope(nextScope);
    setPage(1);
    setSelectedIds([]);
  }, []);
  const onIncludeDescendantsChange = useCallback((value: boolean) => { setIncludeDescendants(value); setPage(1); }, []);
  const toggleSelected = useCallback((id: string) => setSelectedIds((current) => toggleScenarioSelection(current, id)), []);
  const moveSelected = useCallback(async (folderId: string | null) => {
    if (selectedIds.length === 0 || selectedIds.length > 100) return;
    await moveScenarios({ body: { projectId, scenarioIds: selectedIds, folderId } }).unwrap();
    setSelectedIds([]);
  }, [moveScenarios, projectId, selectedIds]);
  const addSelectedToSuite = useCallback(async (suiteId: string) => {
    if (selectedIds.length === 0 || selectedIds.length > 100) return;
    await addSuiteMembers({ suiteId, body: { projectId, scenarioIds: selectedIds } }).unwrap();
    setSelectedIds([]);
  }, [addSuiteMembers, projectId, selectedIds]);
  const removeSelectedFromSuite = useCallback(async () => {
    if (scope.kind !== 'suite' || !scope.id || selectedIds.length === 0 || selectedIds.length > 100) return;
    await removeSuiteMembers({ suiteId: scope.id, body: { projectId, scenarioIds: selectedIds } }).unwrap();
    setSelectedIds([]);
  }, [projectId, removeSuiteMembers, scope, selectedIds]);
  const reorderSuite = useCallback(async (suiteId: string, scenarioIds: string[]) => {
    await reorderSuiteMembers({ suiteId, body: { projectId, scenarioIds } }).unwrap();
  }, [projectId, reorderSuiteMembers]);
  const createFolder = useCallback(async (name: string, parentId: string | null) =>
    createFolderRequest({ body: { projectId, name, parentId } }).unwrap(), [createFolderRequest, projectId]);
  const updateFolder = useCallback(async (folderId: string, body: { name?: string; parentId?: string | null; position?: number }) =>
    updateFolderRequest({ folderId, projectId, body }).unwrap(), [projectId, updateFolderRequest]);
  const deleteFolder = useCallback(async (folderId: string, disposition: 'parent' | 'unfiled') => {
    await deleteFolderRequest({ folderId, projectId, disposition }).unwrap();
    if (scope.id === folderId) onScopeChange({ kind: 'all' });
  }, [deleteFolderRequest, onScopeChange, projectId, scope.id]);
  const createSuite = useCallback(async (body: { name: string; description?: string | null; purpose?: string | null; release?: string | null }) =>
    createSuiteRequest({ body: { projectId, ...body } }).unwrap(), [createSuiteRequest, projectId]);
  const updateSuite = useCallback(async (suiteId: string, body: { name?: string; description?: string | null; purpose?: string | null; release?: string | null }) =>
    updateSuiteRequest({ suiteId, projectId, body }).unwrap(), [projectId, updateSuiteRequest]);
  const deleteSuite = useCallback(async (suiteId: string) => {
    await deleteSuiteRequest({ suiteId, projectId }).unwrap();
    if (scope.id === suiteId) onScopeChange({ kind: 'all' });
  }, [deleteSuiteRequest, onScopeChange, projectId, scope.id]);

  return {
    scenarios,
    pagination,
    isLoading,
    error,
    onPageChange,
    search,
    onSearchChange,
    sort,
    onSortChange,
    scope,
    onScopeChange,
    includeDescendants,
    onIncludeDescendantsChange,
    folders: foldersQuery.currentData ?? [],
    suites: suitesQuery.currentData ?? [],
    organizationLoading: foldersQuery.isLoading || suitesQuery.isLoading,
    organizationError: foldersQuery.error ?? suitesQuery.error,
    selectedIds,
    toggleSelected,
    moveSelected,
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
