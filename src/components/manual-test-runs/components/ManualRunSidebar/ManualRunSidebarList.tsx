// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react';

import type { ManualTestRunSummary } from '@/redux/apis/generatedApi';

import { MANUAL_RUN_PERIOD, MANUAL_RUN_STATUS } from '../../constants';
import { periods, type useManualRunList } from '../useManualRunList';
import { ManualRunSidebarItem } from './ManualRunSidebarItem';

const completedDayLabel = (day: string) => {
  if (day === 'Completed') return day;
  const date = new Date(`${day}T12:00:00`);
  if (Number.isNaN(date.getTime())) return day;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

interface ManualRunSidebarListProps {
  runList: Pick<
    ReturnType<typeof useManualRunList>,
    | 'listQuery'
    | 'allRunsQuery'
    | 'noRunsYet'
    | 'listedRuns'
    | 'noRunsInProgress'
    | 'runSearch'
    | 'show'
    | 'period'
    | 'setPeriod'
    | 'runPage'
    | 'setRunPage'
    | 'completedGroups'
    | 'activeRuns'
    | 'completedCount'
    | 'inProgressCount'
  >;
  selectedRunId?: string;
  onSelectRun: (runId: string) => void;
}

export const ManualRunSidebarList = ({ runList, selectedRunId, onSelectRun }: ManualRunSidebarListProps) => {
  const {
    listQuery,
    allRunsQuery,
    noRunsYet,
    listedRuns,
    noRunsInProgress,
    runSearch,
    show,
    period,
    setPeriod,
    runPage,
    setRunPage,
    completedGroups,
    activeRuns,
    completedCount,
    inProgressCount,
  } = runList;

  const renderRunItem = (item: ManualTestRunSummary) => (
    <ManualRunSidebarItem key={item.id} item={item} selected={selectedRunId === item.id} onSelectRun={onSelectRun} />
  );

  return (
    <>
      {!noRunsYet && show !== MANUAL_RUN_STATUS.COMPLETED && (
        <HStack justify="space-between" px={1} mt={2}>
          <Text fontSize="sm" fontWeight="medium">
            In progress
          </Text>
          <Text color="fg.muted" fontSize="xs">
            {inProgressCount ?? 0}
          </Text>
        </HStack>
      )}
      {listQuery.isLoading ? (
        <Text>Loading runs…</Text>
      ) : listQuery.error ? (
        <Box>
          <Text role="alert">Could not load runs.</Text>
          <Button size="sm" onClick={() => void listQuery.refetch()}>
            Retry
          </Button>
        </Box>
      ) : listedRuns.length === 0 ? (
        <VStack align="start" gap={2} mt={noRunsYet ? 2 : undefined}>
          <Text color="fg.muted" fontSize="md">
            {runSearch
              ? `No runs match “${runSearch}” for ${periods.find(([value]) => value === period)?.[1]?.toLowerCase()}.`
              : noRunsInProgress
                ? 'No runs in progress'
                : allRunsQuery.currentData?.total
                  ? 'No runs match these filters.'
                  : 'No runs yet'}
          </Text>
          {allRunsQuery.currentData?.total && period !== MANUAL_RUN_PERIOD.ANY_TIME && (
            <Button size="xs" variant="outline" onClick={() => setPeriod(MANUAL_RUN_PERIOD.ANY_TIME)}>
              Search any time
            </Button>
          )}
        </VStack>
      ) : (
        <>
          {activeRuns.map(renderRunItem)}
          {completedGroups.length > 0 && (
            <VStack align="stretch" gap={1} mt={2}>
              <HStack justify="space-between" px={1}>
                <Text fontSize="sm" fontWeight="medium">
                  Completed ·{' '}
                  {period === MANUAL_RUN_PERIOD.RECENT
                    ? 'last 7 days'
                    : periods.find(([value]) => value === period)?.[1]?.toLowerCase()}
                </Text>
                <Text fontSize="xs" color="fg.muted">
                  {completedCount ?? 0}
                </Text>
              </HStack>
              {completedGroups.map(([day, groupRuns]) => (
                <VStack key={day} align="stretch" gap={1} mt={2}>
                  <Text fontSize="xs" color="fg.muted" px={1}>
                    {completedDayLabel(day)}
                  </Text>
                  {groupRuns.map(renderRunItem)}
                </VStack>
              ))}
            </VStack>
          )}
        </>
      )}
      {listQuery.currentData && listQuery.currentData.totalPages > 1 && (
        <HStack justify="space-between">
          <Button size="xs" disabled={runPage <= 1} onClick={() => setRunPage((p) => p - 1)}>
            Previous
          </Button>
          <Text fontSize="xs">
            Page {runPage} of {listQuery.currentData.totalPages}
          </Text>
          <Button
            size="xs"
            disabled={runPage >= listQuery.currentData.totalPages}
            onClick={() => setRunPage((p) => p + 1)}
          >
            Next
          </Button>
        </HStack>
      )}
    </>
  );
};
