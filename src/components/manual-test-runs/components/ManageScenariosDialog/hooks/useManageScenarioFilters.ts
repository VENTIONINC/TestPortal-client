// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import {
  useGetApiV2TestScenariosQuery,
  useLazyGetApiV2TestScenariosQuery,
  useGetApiV2TestScenarioFoldersQuery,
  useGetApiV2TestSuitesQuery,
} from '@/redux/apis/generatedApi';
import type { TestScenarioSummary } from '@/redux/apis/generatedApi';

const PAGE_SIZE = 100;

export const useManageScenarioFilters = (projectId: string) => {
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('');
  const [suiteIds, setSuiteIds] = useState<string[]>([]);
  const [filteredRows, setFilteredRows] = useState<TestScenarioSummary[]>([]);
  const [filterLoading, setFilterLoading] = useState(false);
  const [filterError, setFilterError] = useState(false);
  const [page, setPage] = useState(1);

  const [loadScenarios] = useLazyGetApiV2TestScenariosQuery();
  const queryFilters = {
    projectId,
    limit: PAGE_SIZE,
    search: search || undefined,
    folderId: folder || undefined,
    includeDescendants: folder && folder !== 'unfiled' ? true : undefined,
  };
  const scenarios = useGetApiV2TestScenariosQuery({
    ...queryFilters,
    page: suiteIds.length ? 1 : page,
  });
  const totalScenarios = useGetApiV2TestScenariosQuery({ projectId, page: 1, limit: 1 });
  const folders = useGetApiV2TestScenarioFoldersQuery({ projectId });
  const suites = useGetApiV2TestSuitesQuery({ projectId });

  useEffect(() => {
    const first = scenarios.currentData;
    const availableSuites = suites.currentData;

    if (!suiteIds.length || !first || !availableSuites) return;

    let active = true;

    const load = async () => {
      setFilterLoading(true);
      setFilterError(false);

      try {
        const remaining = await Promise.all(
          Array.from({ length: first.totalPages - 1 }, (_, index) =>
            loadScenarios(
              {
                projectId,
                page: index + 2,
                limit: PAGE_SIZE,
                search: search || undefined,
                folderId: folder || undefined,
                includeDescendants: folder && folder !== 'unfiled' ? true : undefined,
              },
              true,
            ).unwrap(),
          ),
        );

        const memberIds = new Set(
          availableSuites
            .filter((suite) => suiteIds.includes(suite.id))
            .flatMap((suite) => (suite.members ?? []).map((member) => member.testScenarioId)),
        );

        if (active) {
          setFilteredRows(
            [first, ...remaining].flatMap((result) => result.scenarios).filter((row) => memberIds.has(row.id)),
          );
        }
      } catch {
        if (active) setFilterError(true);
      } finally {
        if (active) setFilterLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [suiteIds, scenarios.currentData, suites.currentData, loadScenarios, projectId, search, folder]);

  const hasSuiteFilter = suiteIds.length > 0;
  const rows = hasSuiteFilter
    ? filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : (scenarios.currentData?.scenarios ?? []);
  const totalPages = hasSuiteFilter
    ? Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE))
    : (scenarios.currentData?.totalPages ?? 1);

  const changeFolder = (id: string) => {
    setFolder(id);
    setPage(1);
  };

  const changeSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const toggleSuite = (id: string) => {
    setSuiteIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
    setPage(1);
  };

  const clearSuites = () => {
    setSuiteIds([]);
    setPage(1);
  };

  return {
    rows,
    folder,
    folders: folders.currentData ?? [],
    total: totalScenarios.currentData?.total ?? 0,
    search,
    suiteIds,
    suites: suites.currentData ?? [],
    suitesLoading: suites.isLoading,
    suitesHaveError: Boolean(suites.error),
    page,
    totalPages,
    isFetching: scenarios.isFetching,
    hasError: Boolean(scenarios.error) || (hasSuiteFilter && filterError),
    isLoading: scenarios.isLoading || (hasSuiteFilter && (filterLoading || scenarios.isFetching)),
    changeFolder,
    changeSearch,
    toggleSuite,
    clearSuites,
    setPage,
  };
};
