// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { HStack, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router';

import { PATHS } from '@/types/paths';

import type { useManualRunList } from '../ManualTestRunWorkspace/hooks/useManualRunList';
import { ManualRunSidebarFilters } from './ManualRunSidebarFilters';
import { ManualRunSidebarList } from './ManualRunSidebarList';

interface ManualRunSidebarProps {
  runList: ReturnType<typeof useManualRunList>;
  selectedRunId?: string;
  onSelectRun: (runId: string) => void;
}

export const ManualRunSidebar = ({ runList, selectedRunId, onSelectRun }: ManualRunSidebarProps) => {
  const { allRunsQuery, scenarioCountQuery } = runList;
  const navigate = useNavigate();

  return (
    <VStack
      align="stretch"
      gap={2}
      bg="bg.panel"
      borderRightWidth={{ base: 0, lg: '1px' }}
      borderBottomWidth={{ base: '1px', lg: 0 }}
      borderColor="border"
      borderLeftRadius="lg"
      p={3}
      w={{ base: '100%', lg: '240px' }}
      flexShrink={0}
    >
      <HStack justify="space-between">
        <Text fontSize="xs" color="fg.muted">
          RUNS
        </Text>
        {((scenarioCountQuery.currentData?.total ?? 1) > 0 || Boolean(allRunsQuery.currentData?.total)) && (
          <Text
            fontSize="20px"
            color="fg.muted"
            aria-label="New manual run"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(PATHS.MANUAL_TEST_RUN_NEW)}
          >
            +
          </Text>
        )}
      </HStack>
      <ManualRunSidebarFilters runList={runList} />
      <ManualRunSidebarList runList={runList} selectedRunId={selectedRunId} onSelectRun={onSelectRun} />
    </VStack>
  );
};
