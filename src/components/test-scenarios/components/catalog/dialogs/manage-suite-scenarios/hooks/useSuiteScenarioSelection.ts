// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';

import { useGetApiV2TestScenariosQuery } from '@/redux/apis/generatedApi';

const FOLDER_UNFILED_FILTER = '__unfiled__';
const FETCH_LIMIT = 100;

export const useSuiteScenarioSelection = (projectId: string, originalIds: string[]) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search.trim(), 500);
  const [folderId, setFolderId] = useState('');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(originalIds);
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
  const hasChanges = selectedIds.length !== originalIds.length || originalIds.some((id) => !selectedIds.includes(id));
  const totalPages = Math.max(1, displayedData?.totalPages ?? 1);
  const selectablePageScenarios = matchingScenarios.filter((scenario) => !originalIds.includes(scenario.id));
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
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };
  const handleFolderChange = (value: string) => {
    setFolderId(value);
    setPage(1);
  };

  return {
    search,
    onSearchChange: handleSearchChange,
    folderId,
    onFolderChange: handleFolderChange,
    scenarios: matchingScenarios,
    currentTotal: matchingScenarios.length,
    selectedIds,
    onToggleScenario: toggleScenario,
    onTogglePage: togglePage,
    allPageSelected,
    somePageSelected,
    page,
    totalPages,
    onPageChange: setPage,
    isLoading: isInitialLoading,
    isUpdating: search.trim() !== debouncedSearch || (isFetching && !currentData && Boolean(displayedData)),
    hasChanges,
    error,
  };
};
