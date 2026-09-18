// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { memo, type ChangeEvent } from 'react';
import { Box, Button, Heading, HStack, Icon, Table, Text, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router';
import { LuBan, LuCheck, LuCircleX, LuClock3, LuInfo, LuSkipForward } from 'react-icons/lu';
import type { IconType } from 'react-icons';

import { Alert, Input, NativeSelect, Pagination, Skeleton, Tooltip, Wrap } from '@/components/ui';
import type { ManualTestRunStatus, ManualTestRunSummaryRead } from '@/redux/apis/generatedApi';

import { getManualTestRunPath } from '../utils/paths';
import {
  MANUAL_TEST_RUN_HISTORY_STATUSES,
  type ManualTestRunHistoryFilters,
} from '../utils/history';

const TABLE_CELL_PADDING = { px: 4, py: 4 } as const;
const HISTORY_DESCRIPTION = 'Review saved run snapshots, resume active runs, and inspect completed results.';
const formatDate = (timestamp: string | null) => (timestamp ? new Date(timestamp).toLocaleString('en-US') : 'Not available');
const formatStatus = (status: string) => status.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const statusVisuals: Record<ManualTestRunStatus, { Icon: IconType; color: string }> = {
  in_progress: { Icon: LuClock3, color: 'status.info.icon' },
  passed: { Icon: LuCheck, color: 'status.success.icon' },
  failed: { Icon: LuCircleX, color: 'status.error.icon' },
  blocked: { Icon: LuBan, color: 'status.warning.icon' },
  skipped: { Icon: LuSkipForward, color: 'status.neutral.icon' },
};

const StatusCell = ({ status }: { status: ManualTestRunStatus }) => {
  const { Icon: StatusIcon, color } = statusVisuals[status];

  return (
    <HStack gap={2}>
      <Icon as={StatusIcon} color={color} boxSize={4} aria-hidden="true" />
      <Text>{formatStatus(status)}</Text>
    </HStack>
  );
};

export interface ManualTestRunHistoryViewProps {
  data?: { runs: ManualTestRunSummaryRead[]; total: number; page: number; limit: number; totalPages: number };
  error?: unknown;
  isLoading: boolean;
  isFetching: boolean;
  isNotFound: boolean;
  filters: ManualTestRunHistoryFilters;
  dateError?: string;
  isFiltered: boolean;
  isProjectHistory: boolean;
  onStatusChange: (value: ManualTestRunHistoryFilters['status']) => void;
  onSourceChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
  onRetry: () => unknown;
  onProjectHistory: () => void;
  onSourceHistory: (run: ManualTestRunSummaryRead) => void;
}

const LoadingState = () => (
  <VStack align="stretch" gap={4} aria-label="Loading Manual Test Runs">
    <Text color="text.secondary">Loading Manual Test Runs...</Text>
    <Box overflowX="auto">
      <Table.Root size="sm" variant="outline" minW="1050px">
        <Table.Header><Table.Row>{['Title', 'Status', 'Source', 'Executor', 'Started', 'Completed', ''].map((label) => <Table.ColumnHeader key={label} {...TABLE_CELL_PADDING}>{label}</Table.ColumnHeader>)}</Table.Row></Table.Header>
        <Table.Body>{[1, 2, 3].map((index) => <Table.Row key={index}>{[1, 2, 3, 4, 5, 6, 7].map((cell) => <Table.Cell key={cell} {...TABLE_CELL_PADDING}><Skeleton h="5" loading={true} /></Table.Cell>)}</Table.Row>)}</Table.Body>
      </Table.Root>
    </Box>
  </VStack>
);

const ErrorState = ({ onRetry }: { onRetry: () => unknown }) => (
  <Alert.Root status="error" role="alert">
    <Alert.Indicator />
    <Alert.Content>
      <Alert.Title>Failed to load Manual Test Runs</Alert.Title>
      <Alert.Description>Please try again in a moment. <Button variant="plain" onClick={() => void onRetry()}>Retry</Button></Alert.Description>
    </Alert.Content>
  </Alert.Root>
);

const SourceNotFoundState = ({ onProjectHistory }: { onProjectHistory: () => void }) => (
  <Alert.Root status="warning" role="alert">
    <Alert.Indicator />
    <Alert.Content>
      <Alert.Title>Source scenario is no longer available</Alert.Title>
      <Alert.Description>This does not mean the historical runs are empty. Open project history to inspect them using the original source ID.</Alert.Description>
      <Button variant="outline" onClick={onProjectHistory}>View project history</Button>
    </Alert.Content>
  </Alert.Root>
);

const EmptyState = ({ isFiltered, onClearFilters }: { isFiltered: boolean; onClearFilters: () => void }) => (
  <VStack py={8} gap={3}>
    <Text color="text.muted">{isFiltered ? 'No Manual Test Runs match these filters.' : 'No Manual Test Runs have been recorded for this project.'}</Text>
    {isFiltered && <Button variant="outline" onClick={onClearFilters}>Clear filters</Button>}
  </VStack>
);

const Filters = ({
  filters,
  dateError,
  isProjectHistory,
  isFiltered,
  onStatusChange,
  onSourceChange,
  onStartDateChange,
  onEndDateChange,
  onClearFilters,
}: Pick<ManualTestRunHistoryViewProps, 'filters' | 'dateError' | 'isProjectHistory' | 'isFiltered' | 'onStatusChange' | 'onSourceChange' | 'onStartDateChange' | 'onEndDateChange' | 'onClearFilters'>) => (
  <VStack align="stretch" gap={3}>
    <Box overflowX="auto" w="100%">
      <HStack align="end" gap={3} flexWrap="nowrap" minW="max-content" w="100%" pb={1}>
        <HStack align="end" gap={3} flexShrink={0}>
          <NativeSelect name="manual-test-run-status" label="Status" value={filters.status} onChange={(event: ChangeEvent<HTMLSelectElement>) => onStatusChange(event.target.value as ManualTestRunHistoryFilters['status'])} items={MANUAL_TEST_RUN_HISTORY_STATUSES} w="190px" />
          {isProjectHistory && <Input name="manual-test-run-source" label="Source scenario ID" value={filters.sourceTestScenarioId} onChange={(event) => onSourceChange(event.target.value)} placeholder="UUID, including deleted sources" w="290px" />}
          <Input name="manual-test-run-start-date" label="Started on or after" type="date" value={filters.startedOnOrAfter} onChange={(event) => onStartDateChange(event.target.value)} error={dateError?.includes('start') ? dateError : undefined} w="190px" />
          <Input name="manual-test-run-end-date" label="Started on or before" type="date" value={filters.startedOnOrBefore} onChange={(event) => onEndDateChange(event.target.value)} error={dateError?.includes('end') || dateError?.includes('before') ? dateError : undefined} w="190px" />
        </HStack>
        <Button variant="outline" onClick={onClearFilters} disabled={!isFiltered} flexShrink={0} marginStart="auto">Clear filters</Button>
      </HStack>
    </Box>
    {dateError && !dateError.includes('start') && !dateError.includes('end') && <Alert.Root status="error" role="alert"><Alert.Indicator /><Alert.Content><Alert.Description>{dateError}</Alert.Description></Alert.Content></Alert.Root>}
  </VStack>
);

const RunTable = ({ runs, onSourceHistory }: { runs: ManualTestRunSummaryRead[]; onSourceHistory: ManualTestRunHistoryViewProps['onSourceHistory'] }) => (
  <Box overflowX="auto">
    <Table.Root size="sm" variant="outline" minW="1050px">
      <Table.Header><Table.Row><Table.ColumnHeader {...TABLE_CELL_PADDING}>Title</Table.ColumnHeader><Table.ColumnHeader {...TABLE_CELL_PADDING}>Status</Table.ColumnHeader><Table.ColumnHeader {...TABLE_CELL_PADDING}>Source</Table.ColumnHeader><Table.ColumnHeader {...TABLE_CELL_PADDING}>Executor</Table.ColumnHeader><Table.ColumnHeader {...TABLE_CELL_PADDING}>Started</Table.ColumnHeader><Table.ColumnHeader {...TABLE_CELL_PADDING}>Completed</Table.ColumnHeader><Table.ColumnHeader {...TABLE_CELL_PADDING} /></Table.Row></Table.Header>
      <Table.Body>
        {runs.map((run) => (
          <Table.Row key={run.id} data-testid={`manual-test-run-${run.id}`}>
            <Table.Cell {...TABLE_CELL_PADDING}><RouterLink to={getManualTestRunPath(run.id)} state={{ from: 'manual-test-run-history' }}>{run.title}</RouterLink></Table.Cell>
            <Table.Cell {...TABLE_CELL_PADDING}><StatusCell status={run.status} /></Table.Cell>
            <Table.Cell {...TABLE_CELL_PADDING}><VStack align="start" gap={1}>{!run.testScenarioId && <Text>Source deleted</Text>}<Button variant="plain" size="sm" onClick={() => onSourceHistory(run)}>View source history</Button></VStack></Table.Cell>
            <Table.Cell {...TABLE_CELL_PADDING}>{run.executedBy?.name ?? 'Executor unavailable'}</Table.Cell>
            <Table.Cell {...TABLE_CELL_PADDING} color="text.secondary">{formatDate(run.startedAt)}</Table.Cell>
            <Table.Cell {...TABLE_CELL_PADDING} color="text.secondary">{formatDate(run.completedAt)}</Table.Cell>
            <Table.Cell {...TABLE_CELL_PADDING} textAlign="end" w="1%"><RouterLink to={getManualTestRunPath(run.id)} state={{ from: 'manual-test-run-history' }}>{run.status === 'in_progress' ? 'Resume' : 'View'}</RouterLink></Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  </Box>
);

export const ManualTestRunHistoryView = memo(function ManualTestRunHistoryView({
  data, error, isLoading, isFetching, isNotFound, filters, dateError, isFiltered, isProjectHistory,
  onStatusChange, onSourceChange, onStartDateChange, onEndDateChange, onClearFilters, onPageChange, onRetry, onProjectHistory, onSourceHistory,
}: ManualTestRunHistoryViewProps) {
  const showLoading = isLoading || (isFetching && !data);

  return (
    <Wrap my={4} mx={6} p={4}>
      <VStack align="stretch" gap={5} w="100%">
        <HStack gap={2}>
          <Heading fontSize="lg">{isProjectHistory ? 'Manual Test Run History' : 'Scenario Manual Test Run History'}</Heading>
          <Tooltip content={HISTORY_DESCRIPTION} openDelay={300} closeDelay={100} contentProps={{ maxW: '360px' }}>
            <Box as="span" display="inline-flex" aria-label="Manual Test Run History information" color="text.secondary" cursor="help">
              <LuInfo size={17} aria-hidden="true" />
            </Box>
          </Tooltip>
        </HStack>
        <Filters filters={filters} dateError={dateError} isProjectHistory={isProjectHistory} isFiltered={isFiltered} onStatusChange={onStatusChange} onSourceChange={onSourceChange} onStartDateChange={onStartDateChange} onEndDateChange={onEndDateChange} onClearFilters={onClearFilters} />
        {isNotFound ? <SourceNotFoundState onProjectHistory={onProjectHistory} /> : error ? <ErrorState onRetry={onRetry} /> : showLoading ? <LoadingState /> : !data || data.runs.length === 0 ? <EmptyState isFiltered={isFiltered} onClearFilters={onClearFilters} /> : <VStack align="stretch" gap={4}><RunTable runs={data.runs} onSourceHistory={onSourceHistory} />{data.totalPages > 1 && <Box as="nav" aria-label="Manual Test Run pagination"><HStack justify="center" py={2}><Pagination currentPage={data.page} totalPages={data.totalPages} onPageChange={onPageChange} /></HStack></Box>}<Text color="text.secondary" fontSize="sm" textAlign="right">Showing {data.total === 0 ? 0 : (data.page - 1) * data.limit + 1}-{Math.min(data.page * data.limit, data.total)} of {data.total} Manual Test Runs</Text></VStack>}
      </VStack>
    </Wrap>
  );
});
