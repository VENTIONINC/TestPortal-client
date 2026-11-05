// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';

import { usePostApiV2TestSuitesBySuiteIdMembershipChangesMutation } from '@/redux/apis/extendedApi';
import { useGetApiV2TestScenariosQuery } from '@/redux/apis/generatedApi';
import { extractApiError } from '@/utils/apiErrors';
import type { PostApiV2TestSuitesBySuiteIdMembershipChangesApiResponse } from '@/redux/apis/generatedApi';
import type { CatalogSuite } from '@/components/test-scenarios';

import {
  TestSuiteAddScenariosDialogView,
  type ScenarioFolderOption,
} from '../components/TestSuiteAddScenariosDialogView';

interface TestSuiteAddScenariosDialogContainerProps {
  projectId: string;
  suite: CatalogSuite;
  folderOptions: ScenarioFolderOption[];
  unfiledScenarioCount?: number;
  totalScenarioCount?: number;
  onClose: () => void;
  onSaved?: (undo: {
    restoreData: PostApiV2TestSuitesBySuiteIdMembershipChangesApiResponse['restoreData'];
    expectedMembershipRevision: number;
    expectedScenarioIds: string[];
  }) => void;
}

const FOLDER_UNFILED_FILTER = '__unfiled__';
const FETCH_LIMIT = 100;

const getErrorMessage = (error: unknown) => {
  if (error && typeof error === 'object' && ('data' in error || 'status' in error)) {
    return extractApiError(error as Parameters<typeof extractApiError>[0]);
  }
  return error instanceof Error ? error.message : String(error);
};

export const TestSuiteAddScenariosDialogContainer = ({ projectId, suite, folderOptions, unfiledScenarioCount, totalScenarioCount, onClose, onSaved }: TestSuiteAddScenariosDialogContainerProps) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search.trim(), 500);
  const [folderId, setFolderId] = useState('');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>(() => (suite.members ?? []).map((member) => member.testScenarioId));
  const [addError, setAddError] = useState<string>();
  const [saveMembership, { isLoading: isAdding }] = usePostApiV2TestSuitesBySuiteIdMembershipChangesMutation();
  const queryArgs = useMemo(() => ({
    projectId,
    page,
    limit: FETCH_LIMIT,
    sort: 'title_asc' as const,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(folderId === FOLDER_UNFILED_FILTER
      ? { folderId: 'unfiled' as const }
      : folderId
        ? { folderId, includeDescendants: true }
        : {}),
  }), [folderId, page, projectId, debouncedSearch]);
  const { data, currentData, isLoading, isFetching, error } = useGetApiV2TestScenariosQuery(queryArgs);
  const displayedData = currentData ?? data;
  const matchingScenarios = displayedData?.scenarios ?? [];
  const originalIds = (suite.members ?? []).map((member) => member.testScenarioId);
  const hasChanges = selectedIds.length !== originalIds.length || originalIds.some((id) => !selectedIds.includes(id));
  const totalPages = Math.max(1, displayedData?.totalPages ?? 1);
  const scenarios = matchingScenarios;
  const emptyState = 'no-results' as const;
  const selectablePageScenarios = scenarios.filter((scenario) => !originalIds.includes(scenario.id));
  const allPageSelected = selectablePageScenarios.length > 0 && selectablePageScenarios.every((scenario) => selectedIds.includes(scenario.id));
  const somePageSelected = selectablePageScenarios.some((scenario) => selectedIds.includes(scenario.id)) && !allPageSelected;
  const isInitialLoading = (isLoading || isFetching) && !displayedData;

  const toggleScenario = (id: string) => setSelectedIds((current) => (
    current.includes(id)
      ? current.filter((selectedId) => selectedId !== id)
      : [...current, id]
  ));
  const togglePage = () => setSelectedIds((current) => {
    const pageIds = selectablePageScenarios.map((scenario) => scenario.id);
    const areAllSelected = pageIds.length > 0 && pageIds.every((id) => current.includes(id));
    return areAllSelected
      ? current.filter((id) => !pageIds.includes(id))
      : [...current, ...pageIds.filter((id) => !current.includes(id))];
  });
  const handleSearchChange = (value: string) => { setSearch(value); setPage(1); };
  const handleFolderChange = (value: string) => { setFolderId(value); setPage(1); };
  const clearFilters = () => { setSearch(''); setFolderId(''); setPage(1); };
  const handleAdd = async () => {
    if (!hasChanges || isAdding) return;
    setAddError(undefined);
    const addScenarioIds = selectedIds.filter((id) => !originalIds.includes(id));
    const removeScenarioIds = originalIds.filter((id) => !selectedIds.includes(id));
    try {
      const response = await saveMembership({
        suiteId: suite.id,
        body: {
          projectId,
          expectedMembershipRevision: suite.membershipRevision,
          expectedScenarioIds: originalIds,
          addScenarioIds,
          removeScenarioIds,
        },
      }).unwrap();
      onSaved?.({
        restoreData: response.restoreData,
        expectedMembershipRevision: response.membershipRevision,
        expectedScenarioIds: response.scenarioIds,
      });
      onClose();
    } catch (mutationError) {
      setAddError(getErrorMessage(mutationError));
    }
  };

  return (
    <TestSuiteAddScenariosDialogView
      suiteName={suite.name}
      folderOptions={folderOptions}
      unfiledScenarioCount={unfiledScenarioCount ?? 0}
      totalScenarioCount={totalScenarioCount ?? 0}
      currentTotal={scenarios.length}
      search={search}
      onSearchChange={handleSearchChange}
      folderId={folderId}
      onFolderChange={handleFolderChange}
      scenarios={scenarios}
      selectedIds={selectedIds}
      existingIds={originalIds}
      emptyState={emptyState}
      onToggleScenario={toggleScenario}
      onTogglePage={togglePage}
      onClearFilters={clearFilters}
      allPageSelected={allPageSelected}
      somePageSelected={somePageSelected}
      page={page}
      totalPages={totalPages}
      onPageChange={setPage}
      isLoading={isInitialLoading}
      isUpdating={search.trim() !== debouncedSearch || (isFetching && !currentData && Boolean(displayedData))}
      error={error ? getErrorMessage(error) : addError}
      isAdding={isAdding}
      onAdd={() => void handleAdd()}
      hasChanges={hasChanges}
      onClose={onClose}
    />
  );
};
