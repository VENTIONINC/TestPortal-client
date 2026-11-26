// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useMemo, useState } from 'react';

import type { ManualTestRunScenarioRead } from '@/redux/apis/generatedApi';

import { UNASSIGNED_FILTER_VALUE } from '../../../constants';

export const useManualRunScenarioFilters = (
  projectId: string,
  selectedRunId: string | undefined,
  scenarios: ManualTestRunScenarioRead[] | undefined,
) => {
  const [scenarioSearch, setScenarioSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [folderFilter, setFolderFilter] = useState<string[]>([]);
  const [assigneeFilter, setAssigneeFilter] = useState<string[]>([]);
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [scenarioPage, setScenarioPage] = useState(1);
  const [scenarioPageSize, setScenarioPageSize] = useState(25);
  const [selectedScenarioIds, setSelectedScenarioIds] = useState<string[]>([]);

  useEffect(() => {
    setTagFilter([]);
  }, [projectId, selectedRunId]);

  useEffect(() => {
    setScenarioPage(1);
    setSelectedScenarioIds([]);
  }, [scenarioSearch, statusFilter, folderFilter, assigneeFilter, tagFilter, projectId, selectedRunId]);

  const matchingOtherFilters = useMemo(
    () =>
      (scenarios ?? []).filter((scenario) => {
        const needle = scenarioSearch.trim().toLocaleLowerCase();
        if (needle && !`${scenario.title} ${scenario.sourceScenarioKey}`.toLocaleLowerCase().includes(needle))
          return false;
        if (statusFilter.length && !statusFilter.includes(scenario.result)) return false;
        if (folderFilter.length && !folderFilter.includes(scenario.folderPath ?? 'Unfiled')) return false;
        return !(assigneeFilter.length && !assigneeFilter.includes(scenario.assigneeId ?? UNASSIGNED_FILTER_VALUE));
      }),
    [assigneeFilter, folderFilter, scenarios, scenarioSearch, statusFilter],
  );
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const scenario of matchingOtherFilters) {
      for (const tag of scenario.tags ?? []) counts[tag.id] = (counts[tag.id] ?? 0) + 1;
    }
    return counts;
  }, [matchingOtherFilters]);
  const filteredScenarios = useMemo(
    () =>
      tagFilter.length
        ? matchingOtherFilters.filter((scenario) => scenario.tags?.some((tag) => tagFilter.includes(tag.id)))
        : matchingOtherFilters,
    [matchingOtherFilters, tagFilter],
  );
  const scenarioPageCount = Math.max(1, Math.ceil(filteredScenarios.length / scenarioPageSize));
  useEffect(() => {
    setScenarioPage((page) => Math.min(page, scenarioPageCount));
    const matchingIds = new Set(filteredScenarios.map(({ id }) => id));
    setSelectedScenarioIds((ids) =>
      ids.every((id) => matchingIds.has(id)) ? ids : ids.filter((id) => matchingIds.has(id)),
    );
  }, [filteredScenarios, scenarioPageCount]);
  const visibleScenarios = filteredScenarios.slice(
    (scenarioPage - 1) * scenarioPageSize,
    scenarioPage * scenarioPageSize,
  );
  const folders = [...new Set((scenarios ?? []).map((scenario) => scenario.folderPath ?? 'Unfiled'))];

  return {
    scenarioSearch,
    setScenarioSearch,
    statusFilter,
    setStatusFilter,
    folderFilter,
    setFolderFilter,
    assigneeFilter,
    setAssigneeFilter,
    tagFilter,
    setTagFilter,
    tagCounts,
    scenarioPage,
    setScenarioPage,
    scenarioPageSize,
    setScenarioPageSize,
    selectedScenarioIds,
    setSelectedScenarioIds,
    filteredScenarios,
    scenarioPageCount,
    visibleScenarios,
    folders,
  };
};
