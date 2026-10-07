// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useMemo, useState } from 'react';

import {
  usePostApiV2TestSuitesBySuiteIdMembersMutation,
} from '@/redux/apis/extendedApi';
import { useGetApiV2TestScenariosQuery } from '@/redux/apis/generatedApi';
import { extractApiError } from '@/utils/apiErrors';

import { TEST_SCENARIO_PAGE_LIMIT } from '../constants';
import type { CatalogSuite } from '../components/TestScenarioCatalogView';
import {
  TestSuiteAddScenariosDialogView,
  type ScenarioFolderOption,
} from '../components/TestSuiteAddScenariosDialogView';

interface TestSuiteAddScenariosDialogContainerProps {
  projectId: string;
  suite: CatalogSuite;
  folderOptions: ScenarioFolderOption[];
  onClose: () => void;
}

const FOLDER_UNFILED_FILTER = '__unfiled__';
const MAX_SCENARIOS_PER_ADD = 100;

const getErrorMessage = (error: unknown) => {
  if (error && typeof error === 'object' && ('data' in error || 'status' in error)) {
    return extractApiError(error as Parameters<typeof extractApiError>[0]);
  }
  return error instanceof Error ? error.message : String(error);
};

export const TestSuiteAddScenariosDialogContainer = ({ projectId, suite, folderOptions, onClose }: TestSuiteAddScenariosDialogContainerProps) => {
  const [search, setSearch] = useState('');
  const [folderId, setFolderId] = useState('');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [addError, setAddError] = useState<string>();
  const [addMembers, { isLoading: isAdding }] = usePostApiV2TestSuitesBySuiteIdMembersMutation();
  const queryArgs = useMemo(() => ({
    projectId,
    page,
    limit: TEST_SCENARIO_PAGE_LIMIT,
    sort: 'title_asc' as const,
    ...(search.trim() ? { search: search.trim() } : {}),
    ...(folderId === FOLDER_UNFILED_FILTER
      ? { folderId: 'unfiled' as const }
      : folderId
        ? { folderId, includeDescendants: true }
        : {}),
  }), [folderId, page, projectId, search]);
  const { currentData, isLoading, isFetching, error } = useGetApiV2TestScenariosQuery(queryArgs);
  const existingIds = useMemo(() => new Set((suite.members ?? []).map((member) => member.testScenarioId)), [suite.members]);
  const matchingScenarios = currentData?.scenarios ?? [];
  const scenarios = matchingScenarios.filter((scenario) => !existingIds.has(scenario.id));
  const emptyState = matchingScenarios.length > 0 && scenarios.length === 0 ? 'already-added' : 'no-results';
  const allPageSelected = scenarios.length > 0 && scenarios.every((scenario) => selectedIds.includes(scenario.id));
  const somePageSelected = scenarios.some((scenario) => selectedIds.includes(scenario.id)) && !allPageSelected;
  const isInitialLoading = isLoading || (isFetching && !currentData);

  const toggleScenario = (id: string) => setSelectedIds((current) => (
    current.includes(id)
      ? current.filter((selectedId) => selectedId !== id)
      : current.length < MAX_SCENARIOS_PER_ADD ? [...current, id] : current
  ));
  const togglePage = () => setSelectedIds((current) => {
    const pageIds = scenarios.map((scenario) => scenario.id);
    const areAllSelected = pageIds.length > 0 && pageIds.every((id) => current.includes(id));
    return areAllSelected
      ? current.filter((id) => !pageIds.includes(id))
      : [...current, ...pageIds.filter((id) => !current.includes(id)).slice(0, MAX_SCENARIOS_PER_ADD - current.length)];
  });
  const handleSearchChange = (value: string) => { setSearch(value); setPage(1); };
  const handleFolderChange = (value: string) => { setFolderId(value); setPage(1); };
  const clearFilters = () => { setSearch(''); setFolderId(''); setPage(1); };
  const handleAdd = async () => {
    if (selectedIds.length === 0 || isAdding) return;
    setAddError(undefined);
    try {
      await addMembers({ suiteId: suite.id, body: { projectId, scenarioIds: selectedIds } }).unwrap();
      onClose();
    } catch (mutationError) {
      setAddError(getErrorMessage(mutationError));
    }
  };

  return (
    <TestSuiteAddScenariosDialogView
      suiteName={suite.name}
      folderOptions={folderOptions}
      search={search}
      onSearchChange={handleSearchChange}
      folderId={folderId}
      onFolderChange={handleFolderChange}
      scenarios={scenarios}
      selectedIds={selectedIds}
      emptyState={emptyState}
      onToggleScenario={toggleScenario}
      onTogglePage={togglePage}
      onClearSelection={() => setSelectedIds([])}
      onClearFilters={clearFilters}
      allPageSelected={allPageSelected}
      somePageSelected={somePageSelected}
      page={page}
      totalPages={currentData?.totalPages ?? 0}
      onPageChange={setPage}
      isLoading={isInitialLoading}
      error={error ? getErrorMessage(error) : addError}
      isAdding={isAdding}
      onAdd={() => void handleAdd()}
      onClose={onClose}
    />
  );
};
