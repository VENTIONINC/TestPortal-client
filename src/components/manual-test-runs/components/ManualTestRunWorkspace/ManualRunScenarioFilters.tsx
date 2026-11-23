// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { ChangeEvent } from 'react';
import { Box, HStack, IconButton, Input } from '@chakra-ui/react';
import { FiSearch, FiX } from 'react-icons/fi';

import { TagFilter } from '@/components/test-scenarios/tags';
import type { ManualTestRunScenarioResult } from '@/redux/apis/generatedApi';

import { MANUAL_RUN_RESULT, UNASSIGNED_FILTER_VALUE } from '../../constants';
import { RESULTS, resultLabels } from '../manualRunResults';
import { SearchableFilter } from '../SearchableFilter';
import type { useManualRunScenarioFilters } from './hooks/useManualRunScenarioFilters';

const statusResults = [MANUAL_RUN_RESULT.UNTESTED, ...RESULTS];

interface ManualRunScenarioFiltersProps {
  projectId: string;
  filters: Pick<
    ReturnType<typeof useManualRunScenarioFilters>,
    | 'scenarioSearch'
    | 'setScenarioSearch'
    | 'statusFilter'
    | 'setStatusFilter'
    | 'folderFilter'
    | 'setFolderFilter'
    | 'assigneeFilter'
    | 'setAssigneeFilter'
    | 'tagFilter'
    | 'setTagFilter'
    | 'tagCounts'
    | 'folders'
  >;
  counts: Record<ManualTestRunScenarioResult, number>;
  users: Array<{ id: string; name: string }>;
  onLoadUsers: () => void;
}

export const ManualRunScenarioFilters = ({ projectId, filters, counts, users, onLoadUsers }: ManualRunScenarioFiltersProps) => {
  const {
    scenarioSearch,
    setScenarioSearch,
    statusFilter,
    setStatusFilter,
    folderFilter,
    setFolderFilter,
    assigneeFilter,
    setAssigneeFilter,
    folders,
  } = filters;

  const showClearSearch = Boolean(scenarioSearch);
  const searchEndPadding = showClearSearch ? 9 : 3;
  const searchBorderColor = scenarioSearch.trim() ? 'border.active' : undefined;
  const statusOptions = statusResults.map((value) => ({ value, label: resultLabels[value], count: counts[value] }));
  const folderOptions = folders.map((folder) => ({ value: folder, label: folder }));
  const assigneeOptions = [
    { value: UNASSIGNED_FILTER_VALUE, label: 'Unassigned' },
    ...users.map((user) => ({ value: user.id, label: user.name })),
  ];

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => setScenarioSearch(event.target.value);
  const clearSearch = () => setScenarioSearch('');

  return (
    <HStack wrap="wrap">
      <Box position="relative" w={{ base: '100%', sm: '260px' }}>
        <Box
          position="absolute"
          left={3}
          top="50%"
          transform="translateY(-50%)"
          zIndex={1}
          color="text.muted"
          pointerEvents="none"
        >
          <FiSearch aria-hidden="true" size={14} />
        </Box>
        <Input
          pl={9}
          pe={searchEndPadding}
          size="sm"
          h="40px"
          bg="bg.card"
          borderColor={searchBorderColor}
          aria-label="Search scenarios"
          placeholder="Search by title or key"
          value={scenarioSearch}
          onChange={handleSearchChange}
        />
        {showClearSearch && (
          <IconButton
            position="absolute"
            insetEnd={1}
            top="50%"
            transform="translateY(-50%)"
            size="xs"
            variant="ghost"
            aria-label="Clear scenario search"
            onClick={clearSearch}
          >
            <FiX />
          </IconButton>
        )}
      </Box>
      <SearchableFilter label="Status" value={statusFilter} onChange={setStatusFilter} options={statusOptions} />
      <SearchableFilter label="Folder" value={folderFilter} onChange={setFolderFilter} options={folderOptions} />
      <Box onFocus={onLoadUsers}>
        <SearchableFilter
          label="Assignee"
          value={assigneeFilter}
          onChange={setAssigneeFilter}
          options={assigneeOptions}
        />
      </Box>
      <TagFilter projectId={projectId} selectedIds={filters.tagFilter} onChange={filters.setTagFilter} counts={filters.tagCounts} />
    </HStack>
  );
};
