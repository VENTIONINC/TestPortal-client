// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  Input,
  Menu,
  Popover,
  Portal,
  Table,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router';
import { FiCheck, FiCheckCircle, FiChevronDown, FiChevronLeft, FiChevronRight, FiEdit, FiFlag, FiInfo, FiMoreHorizontal, FiRotateCcw, FiSearch, FiSkipForward, FiSlash, FiSliders, FiTrash2, FiUserPlus, FiX } from 'react-icons/fi';

import {
  useGetApiV2ManualTestRunsQuery,
  useGetApiV2ManualTestRunsByRunIdQuery,
  useLazyGetApiV2UsersQuery,
  useDeleteManualTestRunMutation,
  usePostApiV2ManualTestRunsByRunIdCompleteMutation,
  usePostApiV2ManualTestRunsByRunIdReopenMutation,
  usePostApiV2ManualTestRunsByRunIdScenariosBulkMutation,
  usePatchApiV2ManualTestRunsByRunIdScenariosAndScenarioIdAssigneeMutation,
  usePutApiV2ManualTestRunsByRunIdScenariosAndScenarioIdResultMutation,
  usePutApiV2ManualTestRunsByRunIdScenariosOrderMutation,
} from '@/redux/apis/extendedApi';
import { useGetApiV2TestScenariosQuery } from '@/redux/apis/generatedApi';
import type {
  ManualTestRunRead,
  ManualTestRunScenarioRead,
  ManualTestRunScenarioResult,
} from '@/redux/apis/generatedApi';
import { PATHS } from '@/types/paths';
import { grey_2100, orange_300 } from '@/theme/colors/palette';
import { NativeSelect } from '@/components/ui';

import { MANUAL_RUN_PERIOD, MANUAL_RUN_RESULT, MANUAL_RUN_SHOW, MANUAL_RUN_STATUS, UNASSIGNED_FILTER_VALUE } from '../constants';

const RUN_PAGE_SIZE = 20;
const RESULTS = [MANUAL_RUN_RESULT.PASSED, MANUAL_RUN_RESULT.FAILED, MANUAL_RUN_RESULT.BLOCKED, MANUAL_RUN_RESULT.SKIPPED] as const;
const resultLabels: Record<ManualTestRunScenarioResult, string> = {
  untested: 'Untested',
  passed: 'Passed',
  failed: 'Failed',
  blocked: 'Blocked',
  skipped: 'Skipped',
};
const periods = [
  [MANUAL_RUN_PERIOD.RECENT, 'Recent'],
  [MANUAL_RUN_PERIOD.TODAY, 'Today'],
  [MANUAL_RUN_PERIOD.LAST_7_DAYS, 'Last 7 days'],
  [MANUAL_RUN_PERIOD.LAST_30_DAYS, 'Last 30 days'],
  [MANUAL_RUN_PERIOD.THIS_MONTH, 'This month'],
  [MANUAL_RUN_PERIOD.LAST_MONTH, 'Last month'],
  [MANUAL_RUN_PERIOD.ANY_TIME, 'Any time'],
  [MANUAL_RUN_PERIOD.CUSTOM, 'Custom range'],
] as const;

const dateLabel = (date?: string | null) => (date ? new Date(date).toLocaleString() : '—');
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

const shortName = (name: string) => {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${Array.from(parts[parts.length - 1])[0]}.` : parts[0];
};

const AssigneeAvatar = ({ name }: { name?: string }) => (
  <Box
    aria-hidden="true"
    flexShrink={0}
    w="6"
    h="6"
    display="grid"
    placeItems="center"
    borderRadius="full"
    bg={name ? 'blue.subtle' : 'bg.panel'}
    borderWidth={name ? '0' : '1px'}
    borderColor="border.main"
    color="blue.fg"
    fontSize="xs"
    fontWeight="medium"
  >
    {name?.trim().charAt(0).toUpperCase()}
  </Box>
);

const AssigneeOptions = ({ users, selectedId, onSelect }: {
  users: Array<{ id: string; name: string }>;
  selectedId?: string | null;
  onSelect: (id: string | null) => void;
}) => (
  <VStack align="stretch" gap={0}>
    {users.map((user) => (
      <Button key={user.id} size="sm" variant="ghost" justifyContent="flex-start" px={2}
        bg={selectedId === user.id ? 'blue.50' : undefined}
        onClick={() => onSelect(user.id)} title={user.name}>
        <AssigneeAvatar name={user.name} />
        <Text overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">{shortName(user.name)}</Text>
      </Button>
    ))}
    <Button size="sm" variant="ghost" justifyContent="flex-start" px={2}
      bg={selectedId === null ? 'blue.50' : undefined} onClick={() => onSelect(null)}>
      <AssigneeAvatar />
      Unassigned
    </Button>
  </VStack>
);

interface AssigneePickerProps {
  scenario: ManualTestRunScenarioRead;
  users: Array<{ id: string; name: string }>;
  disabled: boolean;
  onOpen: () => void;
  onChange: (assigneeId: string | null) => void;
}

const AssigneePicker = ({ scenario, users, disabled, onOpen, onChange }: AssigneePickerProps) => {
  const [open, setOpen] = useState(false);
  const options = scenario.assignee && !users.some((user) => user.id === scenario.assigneeId)
    ? [scenario.assignee, ...users]
    : users;

  return (
    <Popover.Root open={open} onOpenChange={({ open: nextOpen }) => {
      setOpen(nextOpen);
      if (nextOpen) onOpen();
    }} positioning={{ placement: 'bottom-start' }}>
      <Popover.Trigger asChild>
        <Button
          aria-label={`Assignee for ${scenario.title}`}
          variant="ghost"
          size="xs"
          fontSize="13px"
          w="full"
          minW={0}
          p={0}
          justifyContent="flex-start"
          bg="transparent"
          cursor={disabled ? 'not-allowed' : 'pointer'}
          _hover={{ bg: 'transparent' }}
          _active={{ bg: 'transparent' }}
          _expanded={{ bg: 'transparent' }}
          disabled={disabled}
          title={scenario.assignee?.name ?? 'Unassigned'}
        >
          <AssigneeAvatar name={scenario.assignee?.name} />
          <Text flex="1" minW={0} textAlign="left" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
            {scenario.assignee ? shortName(scenario.assignee.name) : 'Unassigned'}
          </Text>
        </Button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content w="200px" maxW="calc(100vw - 32px)" bg="bg.panel" p={1}>
            <Popover.Body p={0} maxH="240px" overflowY="auto">
              <AssigneeOptions users={options} selectedId={scenario.assigneeId ?? null}
                onSelect={(id) => { setOpen(false); if ((scenario.assigneeId ?? null) !== id) onChange(id); }} />
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};

const BulkAssigneePicker = ({ count, users, disabled, onOpen, onChange }: {
  count: number;
  users: Array<{ id: string; name: string }>;
  disabled: boolean;
  onOpen: () => void;
  onChange: (id: string | null) => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <Popover.Root open={open} onOpenChange={({ open: nextOpen }) => {
      setOpen(nextOpen);
      if (nextOpen) onOpen();
    }} positioning={{ placement: 'top-end' }}>
      <Popover.Trigger asChild>
        <Button size="xs" variant="ghost" color="white" disabled={disabled} aria-label="Bulk assign"
          _hover={{ bg: 'gray.700', color: 'white' }} _active={{ bg: 'gray.600', color: 'white' }}
          _expanded={{ bg: 'gray.700', color: 'white' }}>
          <FiUserPlus aria-hidden="true" /> Assign
        </Button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content w="200px" maxW="calc(100vw - 32px)" bg="bg.panel" color="text.primary" p={1}>
            <Popover.Body p={0} maxH="240px" overflowY="auto">
              <Text fontSize="xs" color="text.secondary" px={2} py={2}>Assign {count} selected to</Text>
              <AssigneeOptions users={users} onSelect={(id) => { setOpen(false); onChange(id); }} />
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};

interface SearchableFilterProps {
  label: string;
  value: string[];
  options: Array<{ value: string; label: string; count?: number }>;
  onChange: (value: string[]) => void;
}

const SearchableFilter = ({ label, value, options, onChange }: SearchableFilterProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const matches = options.filter((option) =>
    option.label.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()),
  );
  const toggle = (optionValue: string) =>
    onChange(value.includes(optionValue) ? value.filter((item) => item !== optionValue) : [...value, optionValue]);
  const close = () => {
    setOpen(false);
    setSearch('');
  };
  const onSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && matches[0]) {
      event.preventDefault();
      toggle(matches[0].value);
    }
  };
  return (
    <Popover.Root
      open={open}
      onOpenChange={({ open: nextOpen }) => {
        setOpen(nextOpen);
        if (!nextOpen) setSearch('');
      }}
    >
      <Popover.Trigger asChild>
        <Button
          variant="outline"
          bg="bg.card"
          borderColor={value.length ? 'border.active' : undefined}
          color={value.length ? 'text.primary' : undefined}
          minW="90px"
          maxW="250px"
          justifyContent="space-between"
          fontSize="sm"
        >
          {value.length ? `${label}: ${value.length}` : label}
          <FiChevronDown aria-hidden="true" />
        </Button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content w="260px" maxW="calc(100vw - 32px)" bg="bg.card" p={0}>
            <Box position="relative" px={3} borderBottomWidth="1px" borderColor="border.main">
              <Box
                position="absolute"
                insetStart={3}
                top="50%"
                transform="translateY(-50%)"
                zIndex={1}
                color="text.muted"
                pointerEvents="none"
              >
                <FiSearch aria-hidden="true" size={13} />
              </Box>
              <Input
                size="sm"
                aria-label={`Search ${label} options`}
                placeholder={`Type to find ${label === 'Assignee' ? 'an assignee' : label === 'Status' ? 'a status' : 'a folder'}`}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={onSearchKeyDown}
                ps={7}
                border={0}
                focusRing="none"
              />
            </Box>
            <Popover.Body p={1} maxH="240px" overflowY="auto">
              <VStack align="stretch" gap={0}>
                {matches.map((option) => (
                  <HStack as="label" key={option.value} px={2} py={1.5} cursor="pointer" justify="space-between">
                    <HStack gap={2} minW={0}>
                      <input
                        type="checkbox"
                        aria-label={option.label}
                        checked={value.includes(option.value)}
                        onChange={() => toggle(option.value)}
                      />
                      <Text as="span" fontSize="sm" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                        {option.label}
                      </Text>
                    </HStack>
                    {option.count !== undefined && (
                      <Text flexShrink={0} fontSize="xs" color="text.secondary">
                        {option.count}
                      </Text>
                    )}
                  </HStack>
                ))}
                {matches.length === 0 && (
                  <Text fontSize="sm" color="text.secondary" px={2} py={2}>
                    No matches for “{search}”
                  </Text>
                )}
              </VStack>
            </Popover.Body>
            <HStack justify="space-between" p={2} borderTopWidth="1px" borderColor="border.main">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  onChange([]);
                  close();
                }}
              >
                Clear
              </Button>
              <Button size="sm" variant="primary" onClick={close}>
                Done
              </Button>
            </HStack>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};

export interface ManualTestRunWorkspaceProps {
  projectId: string;
  selectedRunId?: string;
  onSelectRun: (runId: string) => void;
}

export const ManualTestRunWorkspace = ({ projectId, selectedRunId, onSelectRun }: ManualTestRunWorkspaceProps) => {
  const navigate = useNavigate();
  const [runSearch, setRunSearch] = useState('');
  const [show, setShow] = useState<(typeof MANUAL_RUN_SHOW)[keyof typeof MANUAL_RUN_SHOW]>(MANUAL_RUN_SHOW.IN_PROGRESS);
  const [period, setPeriod] = useState<(typeof periods)[number][0]>(MANUAL_RUN_PERIOD.RECENT);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!filtersOpen) return;
    const closeOutside = (event: MouseEvent) => {
      if (!filtersRef.current?.contains(event.target as Node)) setFiltersOpen(false);
    };
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setFiltersOpen(false);
    };
    document.addEventListener('mousedown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [filtersOpen]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const activeRunFilterCount = Number(show !== MANUAL_RUN_STATUS.IN_PROGRESS) + Number(period !== MANUAL_RUN_PERIOD.RECENT);
  const [runPage, setRunPage] = useState(1);
  const [scenarioSearch, setScenarioSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [folderFilter, setFolderFilter] = useState<string[]>([]);
  const [assigneeFilter, setAssigneeFilter] = useState<string[]>([]);
  const [scenarioPage, setScenarioPage] = useState(1);
  const [scenarioPageSize, setScenarioPageSize] = useState(25);
  const [selectedScenarioIds, setSelectedScenarioIds] = useState<string[]>([]);
  const [currentRun, setCurrentRun] = useState<ManualTestRunRead>();
  const [feedback, setFeedback] = useState<string>();
  const [completionOpen, setCompletionOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [expandedScenarioId, setExpandedScenarioId] = useState<string>();
  const deletedRunRef = useRef<{ projectId: string; runId: string } | null>(null);
  const draggedScenarioId = useRef<string | undefined>(undefined);
  const scopeRef = useRef({ projectId, selectedRunId });
  scopeRef.current = { projectId, selectedRunId };
  const [isSaving, setIsSaving] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const completionTriggerRef = useRef<HTMLButtonElement>(null);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const listQuery = useGetApiV2ManualTestRunsQuery({
    projectId,
    page: runPage,
    limit: RUN_PAGE_SIZE,
    search: runSearch || undefined,
    show,
    period,
    timeZone,
    ...(period === MANUAL_RUN_PERIOD.CUSTOM ? { dateFrom: dateFrom || undefined, dateTo: dateTo || undefined } : {}),
  });
  const completedCountQuery = useGetApiV2ManualTestRunsQuery({
    projectId, page: 1, limit: 1, search: runSearch || undefined,
    show: MANUAL_RUN_STATUS.COMPLETED, period, timeZone,
    ...(period === MANUAL_RUN_PERIOD.CUSTOM ? { dateFrom: dateFrom || undefined, dateTo: dateTo || undefined } : {}),
  }, { skip: show !== MANUAL_RUN_SHOW.ALL });
  const inProgressCountQuery = useGetApiV2ManualTestRunsQuery({
    projectId, page: 1, limit: 1, search: runSearch || undefined,
    show: MANUAL_RUN_STATUS.IN_PROGRESS, period, timeZone,
    ...(period === MANUAL_RUN_PERIOD.CUSTOM ? { dateFrom: dateFrom || undefined, dateTo: dateTo || undefined } : {}),
  }, { skip: show !== MANUAL_RUN_SHOW.ALL });
  const allRunsQuery = useGetApiV2ManualTestRunsQuery({
    projectId,
    page: 1,
    limit: 1,
    show: MANUAL_RUN_SHOW.ALL,
    period: MANUAL_RUN_PERIOD.ANY_TIME,
    timeZone,
  });
  const noRunsYet = !allRunsQuery.isLoading && !allRunsQuery.error && allRunsQuery.currentData?.total === 0;
  const scenarioCountQuery = useGetApiV2TestScenariosQuery({ projectId, page: 1, limit: 1 });
  const detailQuery = useGetApiV2ManualTestRunsByRunIdQuery(
    { projectId, runId: selectedRunId ?? '' },
    { skip: !selectedRunId },
  );
  const [loadUsers, usersQuery] = useLazyGetApiV2UsersQuery();
  const [deleteRun] = useDeleteManualTestRunMutation();
  const [completeRun] = usePostApiV2ManualTestRunsByRunIdCompleteMutation();
  const [reopenRun] = usePostApiV2ManualTestRunsByRunIdReopenMutation();
  const [bulkScenarios] = usePostApiV2ManualTestRunsByRunIdScenariosBulkMutation();
  const [setScenarioAssignee] = usePatchApiV2ManualTestRunsByRunIdScenariosAndScenarioIdAssigneeMutation();
  const [setScenarioResult] = usePutApiV2ManualTestRunsByRunIdScenariosAndScenarioIdResultMutation();
  const [saveOrder] = usePutApiV2ManualTestRunsByRunIdScenariosOrderMutation();
  const listedRuns = useMemo(() => listQuery.currentData?.runs ?? [], [listQuery.currentData?.runs]);
  const noRunsInProgress = Boolean(allRunsQuery.currentData?.total) && !runSearch &&
    show === MANUAL_RUN_STATUS.IN_PROGRESS && period === MANUAL_RUN_PERIOD.RECENT && listedRuns.length === 0;
  const completedGroups = useMemo(() => {
    const groups = new Map<string, typeof listedRuns>();
    for (const item of listedRuns.filter((candidate) => candidate.status === MANUAL_RUN_STATUS.COMPLETED)) {
      const group = item.completedDay ?? 'Completed';
      groups.set(group, [...(groups.get(group) ?? []), item]);
    }
    return [...groups.entries()];
  }, [listedRuns]);
  const activeRuns = listedRuns.filter((item) => item.status === MANUAL_RUN_STATUS.IN_PROGRESS);
  const completedCount = show === MANUAL_RUN_SHOW.ALL ? completedCountQuery.currentData?.total : listQuery.currentData?.total;
  const inProgressCount = show === MANUAL_RUN_SHOW.ALL ? inProgressCountQuery.currentData?.total : listQuery.currentData?.total;
  const run = currentRun?.id === selectedRunId ? currentRun : detailQuery.currentData;
  const completed = run?.status === MANUAL_RUN_STATUS.COMPLETED;
  const untestedCount = run?.scenarios.filter((scenario) => scenario.result === MANUAL_RUN_RESULT.UNTESTED).length ?? 0;

  useEffect(() => {
    setCurrentRun(undefined);
    setFeedback(undefined);
    setSelectedScenarioIds([]);
    setScenarioPage(1);
    setExpandedScenarioId(undefined);
    setCompletionOpen(false);
    setDeleteOpen(false);
    setIsSaving(false);
  }, [projectId, selectedRunId]);
  useEffect(() => {
    if (detailQuery.currentData?.projectId === projectId && detailQuery.currentData.id === selectedRunId)
      setCurrentRun(detailQuery.currentData);
  }, [detailQuery.currentData, projectId, selectedRunId]);
  useEffect(() => {
    const next = listedRuns.find((item) => !(deletedRunRef.current?.projectId === projectId && deletedRunRef.current.runId === item.id));
    if (!selectedRunId && next) onSelectRun(next.id);
  }, [listedRuns, onSelectRun, projectId, selectedRunId]);
  useEffect(() => {
    setRunPage(1);
  }, [runSearch, show, period, dateFrom, dateTo]);
  useEffect(() => {
    setScenarioPage(1);
    setSelectedScenarioIds([]);
  }, [scenarioSearch, statusFilter, folderFilter, assigneeFilter, selectedRunId]);
  useEffect(() => {
    if (completionOpen) cancelRef.current?.focus();
  }, [completionOpen]);

  const filteredScenarios = useMemo(
    () =>
      (run?.scenarios ?? []).filter((scenario) => {
        const needle = scenarioSearch.trim().toLocaleLowerCase();
        if (needle && !`${scenario.title} ${scenario.sourceScenarioKey}`.toLocaleLowerCase().includes(needle))
          return false;
        if (statusFilter.length && !statusFilter.includes(scenario.result)) return false;
        if (folderFilter.length && !folderFilter.includes(scenario.folderPath ?? 'Unfiled')) return false;
        return !(assigneeFilter.length && !assigneeFilter.includes(scenario.assigneeId ?? UNASSIGNED_FILTER_VALUE));
      }),
    [assigneeFilter, folderFilter, run?.scenarios, scenarioSearch, statusFilter],
  );
  const scenarioPageCount = Math.max(1, Math.ceil(filteredScenarios.length / scenarioPageSize));
  const visibleScenarios = filteredScenarios.slice(
    (scenarioPage - 1) * scenarioPageSize,
    scenarioPage * scenarioPageSize,
  );
  const folders = [...new Set((run?.scenarios ?? []).map((scenario) => scenario.folderPath ?? 'Unfiled'))];
  const counts = useMemo(
    () =>
      (run?.scenarios ?? []).reduce<Record<ManualTestRunScenarioResult, number>>(
        (acc, scenario) => {
          acc[scenario.result] += 1;
          return acc;
        },
        { untested: 0, passed: 0, failed: 0, blocked: 0, skipped: 0 },
      ),
    [run?.scenarios],
  );
  const marked = run ? run.scenarios.length - counts.untested : 0;

  const isCurrentScope = () =>
    scopeRef.current.projectId === projectId && scopeRef.current.selectedRunId === selectedRunId;
  const acceptRun = (updated: ManualTestRunRead) => {
    if (updated.projectId !== scopeRef.current.projectId || updated.id !== scopeRef.current.selectedRunId) return;
    setCurrentRun(updated);
    setFeedback(undefined);
  };
  const recover = async (error: unknown) => {
    if (!isCurrentScope()) return;
    const status =
      error && typeof error === 'object' && 'status' in error ? (error as { status: unknown }).status : undefined;
    setFeedback(
      status === 409 || status === 'FETCH_ERROR' || status === 'TIMEOUT_ERROR' || status === 'PARSING_ERROR'
        ? 'The server did not confirm this update. Refreshing the run; review its current values before trying again.'
        : 'Could not update the run. Refresh and try again.',
    );
    setCurrentRun(undefined);
    await detailQuery.refetch();
  };
  const mutate = async (operation: () => Promise<ManualTestRunRead>) => {
    if (!run || completed || isSaving) return;
    setIsSaving(true);
    setFeedback(undefined);
    try {
      acceptRun(await operation());
    } catch (error) {
      await recover(error);
    } finally {
      if (isCurrentScope()) setIsSaving(false);
    }
  };
  const updateResult = (scenario: ManualTestRunScenarioRead, result: ManualTestRunScenarioResult) =>
    mutate(async () =>
      setScenarioResult({
        projectId,
        runId: run!.id,
        scenarioId: scenario.id,
        manualTestRunScenarioResultRequest: { result: scenario.result === result ? MANUAL_RUN_RESULT.UNTESTED : result },
      }).unwrap(),
    );
  const updateAssignee = (scenarioId: string, assigneeId: string | null) =>
    mutate(async () =>
      setScenarioAssignee({
        projectId,
        runId: run!.id,
        scenarioId,
        manualTestRunScenarioAssigneeRequest: { assigneeId },
      }).unwrap(),
    );
  const updateBulk = (input: { result?: ManualTestRunScenarioResult; assigneeId?: string | null }) =>
    mutate(async () =>
      bulkScenarios({
        projectId,
        runId: run!.id,
        manualTestRunScenarioBulkRequest: { scenarioIds: selectedScenarioIds, ...input },
      }).unwrap(),
    );
  const reorderScenarios = (sourceId: string, targetId: string) => {
    if (!run || sourceId === targetId) return;
    const ids = run.scenarios.map((item) => item.id);
    const from = ids.indexOf(sourceId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;
    ids.splice(to, 0, ids.splice(from, 1)[0]);
    void mutate(() =>
      saveOrder({ projectId, runId: run.id, manualTestRunScenarioOrderRequest: { scenarioIds: ids } }).unwrap(),
    );
  };
  const deleteSelectedRun = async () => {
    if (!run || isSaving) return;
    setIsSaving(true);
    try {
      await deleteRun({ projectId, runId: run.id }).unwrap();
      if (!isCurrentScope()) return;
      deletedRunRef.current = { projectId, runId: run.id };
      setDeleteOpen(false);
      setCurrentRun(undefined);
      onSelectRun('');
    } catch {
      if (isCurrentScope()) {
        setDeleteOpen(false);
        setFeedback('Could not delete the run. Please try again.');
      }
    } finally {
      if (isCurrentScope()) setIsSaving(false);
    }
  };
  const complete = async () => {
    if (!run || completed || isSaving) return;
    setIsSaving(true);
    try {
      acceptRun(await completeRun({ projectId, runId: run.id, body: {} }).unwrap());
      if (isCurrentScope()) setCompletionOpen(false);
    } catch (error) {
      await recover(error);
      if (isCurrentScope()) setCompletionOpen(false);
    } finally {
      if (isCurrentScope()) setIsSaving(false);
    }
  };
  const reopen = async () => {
    if (!run || !completed || isSaving) return;
    setIsSaving(true);
    try {
      acceptRun(await reopenRun({ projectId, runId: run.id, body: {} }).unwrap());
    } catch (error) {
      await recover(error);
    } finally {
      if (isCurrentScope()) setIsSaving(false);
    }
  };
  const requestCompletion = (trigger: HTMLButtonElement) => {
    completionTriggerRef.current = trigger;
    if (untestedCount) setCompletionOpen(true);
    else void complete();
  };
  const cancelCompletion = () => {
    setCompletionOpen(false);
    completionTriggerRef.current?.focus();
  };
  const activateResult = (scenario: ManualTestRunScenarioRead, event: React.KeyboardEvent) => {
    if (completed || isSaving || event.target !== event.currentTarget) return;
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      const index = run?.scenarios.findIndex((item) => item.id === scenario.id) ?? -1;
      const neighbor = run?.scenarios[index + (event.key === 'ArrowUp' ? -1 : 1)];
      if (neighbor) {
        event.preventDefault();
        reorderScenarios(scenario.id, neighbor.id);
      }
      return;
    }
    const keys: Record<string, ManualTestRunScenarioResult> = { p: MANUAL_RUN_RESULT.PASSED, f: MANUAL_RUN_RESULT.FAILED, b: MANUAL_RUN_RESULT.BLOCKED, s: MANUAL_RUN_RESULT.SKIPPED };
    const chosen = keys[event.key.toLowerCase()];
    if (chosen) {
      event.preventDefault();
      void updateResult(scenario, chosen).then(() => {
        const currentIndex = visibleScenarios.findIndex((item) => item.id === scenario.id);
        const nextScenario = visibleScenarios[currentIndex + 1];
        const row = nextScenario ? document.getElementById(`manual-run-scenario-${nextScenario.id}`) : null;
        row?.focus();
      });
    }
  };

  const renderRun = (item: (typeof listedRuns)[number]) => {
    const markedCount = item.scenarioCount - item.untestedCount;
    if (item.status === MANUAL_RUN_STATUS.COMPLETED) {
      const resultLabel = item.failedCount > 0 ? 'Failed' : item.blockedCount > 0 || item.skippedCount > 0 ? 'Blocked or skipped' : 'Passed';
      const resultColor = resultLabel === 'Failed' ? 'red.500' : resultLabel === 'Blocked or skipped' ? orange_300 : 'green.500';
      return (
        <Button key={item.id} variant="ghost" bg={selectedRunId === item.id ? 'blue.50' : undefined}
          h="auto" minH="0" w="full" px={2} py={2} justifyContent="flex-start" textAlign="left"
          onClick={() => onSelectRun(item.id)}>
          <HStack align="start" w="full" gap={2}>
            <Box boxSize="7px" borderRadius="full" bg={resultColor} flexShrink={0} mt="7px" role="img" aria-label={resultLabel} />
            <VStack align="stretch" gap={0} minW={0} flex="1">
              <Text fontSize="sm" fontWeight="medium" truncate title={item.title}>{item.title}</Text>
              <Text fontSize="xs" color="fg.muted">{item.passedCount}/{item.scenarioCount} passed</Text>
            </VStack>
          </HStack>
        </Button>
      );
    }
    return (
      <Button
        key={item.id}
        variant={selectedRunId === item.id ? 'subtle' : 'ghost'}
        colorPalette={selectedRunId === item.id ? 'blue' : undefined}
        bg={selectedRunId === item.id ? 'blue.50' : undefined}
        textAlign="left"
        justifyContent="flex-start"
        h="auto"
        minH="60px"
        px={2}
        py={2}
        whiteSpace="normal"
        onClick={() => onSelectRun(item.id)}
      >
        <VStack align="stretch" gap={1} w="100%">
          <Text fontSize="sm" fontWeight="medium" lineClamp={1} title={item.title}>
            {item.title}
          </Text>
          <Text fontSize="xs" color="fg.muted">
            {new Date(item.completedAt ?? item.startedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}{' '}
            · {markedCount}/{item.scenarioCount} marked
          </Text>
          <Flex
            h="1.5"
            borderRadius="full"
            overflow="hidden"
            bg="bg.subtle"
            aria-label={`${markedCount} of ${item.scenarioCount} marked`}
          >
            {item.passedCount > 0 && <Box flex={item.passedCount} bg="green.500" />}
            {item.failedCount > 0 && <Box flex={item.failedCount} bg="red.500" />}
            {item.blockedCount > 0 && <Box flex={item.blockedCount} bg={orange_300} />}
            {item.skippedCount > 0 && <Box flex={item.skippedCount} bg="gray.500" />}
            {item.untestedCount > 0 && <Box flex={item.untestedCount} bg="gray.200" />}
          </Flex>
        </VStack>
      </Button>
    );
  };
  return (
    <Flex
      align="stretch"
      gap={0}
      minH={{ base: 'auto', lg: 'min(780px, calc(100vh - 220px))' }}
      w="auto"
      mx={3}
      mt={3}
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border"
      borderRadius="lg"
      direction={{ base: 'column', lg: 'row' }}
    >
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
            <Button
              size="xs"
              variant="ghost"
              aria-label="New manual run"
              onClick={() => navigate(PATHS.TEST_SCENARIOS)}
            >
              ＋
            </Button>
          )}
        </HStack>
        {!noRunsYet && (
          <HStack ref={filtersRef} gap={1} position="relative">
            <Box position="relative" flex="1" minW={0}>
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
                pe={runSearch ? 9 : 3}
                size="sm"
                h="36px"
                bg="bg.card"
                borderColor={runSearch.trim() ? 'border.active' : undefined}
                aria-label="Search runs"
                placeholder="Search runs"
                value={runSearch}
                onChange={(e) => setRunSearch(e.target.value)}
              />
              {runSearch && (
                <IconButton position="absolute" insetEnd={1} top="50%" transform="translateY(-50%)"
                  size="xs" variant="ghost" aria-label="Clear run search" onClick={() => setRunSearch('')}>
                  <FiX />
                </IconButton>
              )}
            </Box>
            <Button
              size="sm"
              h="36px"
              w="36px"
              minW="36px"
              variant="outline"
              p={0}
              position="relative"
              bg={activeRunFilterCount ? 'blue.50' : undefined}
              color={activeRunFilterCount ? 'blue.fg' : undefined}
              borderColor={filtersOpen || activeRunFilterCount ? 'blue.500' : undefined}
              aria-label={activeRunFilterCount ? `Filters, ${activeRunFilterCount} active` : 'Filters'}
              title="Filters"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
              aria-controls="manual-run-filters"
            >
              <FiSliders />
              {activeRunFilterCount > 0 && (
                <Badge position="absolute" top="-6px" right="-6px" borderRadius="full" bg="blue.500" color="white"
                  minW="18px" h="18px" p={0} display="grid" placeItems="center" fontSize="xs" aria-hidden="true">
                  {activeRunFilterCount}
                </Badge>
              )}
            </Button>
            {filtersOpen && (
              <Box
                id="manual-run-filters"
                position="absolute"
                top="calc(100% + 4px)"
                left={0}
                zIndex="popover"
                w="252px"
                maxW="min(252px, calc(100vw - 32px))"
                bg="bg.panel"
                borderWidth="1px"
                borderColor="border"
                borderRadius="lg"
                boxShadow="lg"
                py={1}
              >
                <Box role="radiogroup" aria-label="Show runs" px={1} pb={1}>
                  <Text fontSize="xs" color="fg.muted" px={2} py={1}>
                    Show
                  </Text>
                  {(
                    [
                      [MANUAL_RUN_STATUS.IN_PROGRESS, 'In progress'],
                      [MANUAL_RUN_STATUS.COMPLETED, 'Completed'],
                      [MANUAL_RUN_SHOW.ALL, 'All runs'],
                    ] as const
                  ).map(([value, label]) => (
                    <Button
                      key={value}
                      role="radio"
                      aria-checked={show === value}
                      variant="ghost"
                      size="sm"
                      w="100%"
                      justifyContent="space-between"
                      fontWeight="normal"
                      bg={show === value ? 'blue.50' : undefined}
                      onClick={() => { setShow(value); setFiltersOpen(false); }}
                    >
                      {label}
                      {show === value && (
                        <Box color="blue.500">
                          <FiCheck />
                        </Box>
                      )}
                    </Button>
                  ))}
                </Box>
                <Box role="radiogroup" aria-label="Run period" borderTopWidth="1px" borderColor="border" px={1} pt={1}>
                  <Text fontSize="xs" color="fg.muted" px={2} py={1}>
                    Period
                  </Text>
                  {periods.map(([value, label]) => (
                    <Button
                      key={value}
                      role="radio"
                      aria-label={label}
                      aria-checked={period === value}
                      variant="ghost"
                      size="sm"
                      w="100%"
                      h="auto"
                      minH="8"
                      py={1}
                      justifyContent="space-between"
                      textAlign="left"
                      whiteSpace="normal"
                      fontWeight="normal"
                      bg={period === value ? 'blue.50' : undefined}
                      onClick={() => { setPeriod(value); if (value !== MANUAL_RUN_PERIOD.CUSTOM) setFiltersOpen(false); }}
                    >
                      <Box>
                        <Text>{label}</Text>
                        {value === MANUAL_RUN_PERIOD.RECENT && (
                          <Text fontSize="xs" color="fg.muted" fontWeight="normal">
                            All runs in progress, and runs completed in the last 7 days
                          </Text>
                        )}
                      </Box>
                      {period === value && (
                        <Box color="blue.500" flexShrink={0}>
                          <FiCheck />
                        </Box>
                      )}
                    </Button>
                  ))}
                  {period === MANUAL_RUN_PERIOD.CUSTOM && (
                    <VStack align="stretch" gap={2} p={2}>
                      <Input
                        size="sm"
                        aria-label="Period from"
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                      />
                      <Input
                        size="sm"
                        aria-label="Period to"
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                      />
                    </VStack>
                  )}
                </Box>
              </Box>
            )}
          </HStack>
        )}
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
          <Text color="fg.muted" fontSize="md" mt={noRunsYet ? 2 : undefined}>
            {runSearch
              ? 'No runs match your search.'
              : noRunsInProgress
                ? 'No runs in progress'
                : allRunsQuery.currentData?.total
                  ? 'No runs match these filters.'
                  : 'No runs yet'}
          </Text>
        ) : (
          <>
            {activeRuns.map(renderRun)}
            {completedGroups.length > 0 && (
              <VStack align="stretch" gap={1} mt={2}>
                <HStack justify="space-between" px={1}>
                  <Text fontSize="sm" fontWeight="medium">Completed · {period === MANUAL_RUN_PERIOD.RECENT ? 'last 7 days' : periods.find(([value]) => value === period)?.[1]?.toLowerCase()}</Text>
                  <Text fontSize="xs" color="fg.muted">{completedCount ?? 0}</Text>
                </HStack>
                {completedGroups.map(([day, groupRuns]) => (
                  <VStack key={day} align="stretch" gap={1} mt={2}>
                    <Text fontSize="xs" color="fg.muted" px={1}>{completedDayLabel(day)}</Text>
                    {groupRuns.map(renderRun)}
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
      </VStack>

      <VStack align="stretch" gap={3} flex="1" minW={0} bg="bg.panel" p={{ base: 3, md: 4 }}>
        {!selectedRunId && !listQuery.isLoading && (
          <Box m="auto" textAlign="center">
            <Heading size="lg">
              {listedRuns.length
                ? 'Select a run'
                : noRunsInProgress
                  ? 'Nothing in progress'
                  : allRunsQuery.currentData?.total
                    ? 'No runs match these filters'
                    : (scenarioCountQuery.currentData?.total ?? 0) > 0
                      ? 'Start your first manual run'
                      : 'Nothing to run yet'}
            </Heading>
            <Text
              color="fg.muted"
              fontSize="sm"
              maxW={'450px'}
              my={3}
            >
              {listedRuns.length
                ? 'Choose a run from the list to view its scenarios.'
                : noRunsInProgress
                  ? 'Start a new manual run, or open Filters and set Show to Completed to look at finished ones.'
                  : (scenarioCountQuery.currentData?.total ?? 0) > 0
                    ? noRunsYet
                      ? 'A manual run is one pass through your scenarios where you mark each as Passed, Failed, Blocked or Skipped. Start from a suite, such as a smoke check or a regression pass, or pick scenarios one by one.'
                      : 'Start from a suite or select scenarios individually.'
                    : scenarioCountQuery.currentData?.total === 0
                      ? 'A manual run needs scenarios. Create scenarios first, then group them into suites or pick them one by one when you start a run.'
                      : null}
            </Text>
            {noRunsInProgress ? (
              <Box asChild color="blue.500" fontSize="sm" _hover={{ textDecoration: 'underline' }}>
                <Link to={PATHS.TEST_SCENARIOS}>＋ New manual run</Link>
              </Box>
            ) : (scenarioCountQuery.currentData?.total ?? 0) > 0 ? (
              noRunsYet ? (
                <Box asChild color="blue.500" fontSize="sm" _hover={{ textDecoration: 'underline' }}>
                  <Link to={PATHS.TEST_SCENARIOS}>＋ New manual run</Link>
                </Box>
              ) : (
                <Button colorPalette="blue" onClick={() => navigate(PATHS.TEST_SCENARIOS)}>
                  New manual run
                </Button>
              )
            ) : (
              <Box asChild color="blue.500" fontSize="sm" _hover={{ textDecoration: 'underline' }}>
                <Link to={PATHS.TEST_SCENARIO_NEW}>＋ New scenario</Link>
              </Box>
            )}
          </Box>
        )}
        {selectedRunId && detailQuery.isLoading && <Text>Loading run…</Text>}
        {selectedRunId && detailQuery.error && (
          <Box>
            <Text role="alert">This run is unavailable in the selected project.</Text>
            <Button onClick={() => void detailQuery.refetch()}>Retry</Button>
          </Box>
        )}
        {run && (
          <>
            <HStack justify="space-between" align="start" wrap="wrap">
              <Box>
                <HStack>
                  <Heading size="md" fontSize="18px">{run.title}</Heading>
                  <Badge
                    colorPalette={completed ? 'green' : 'blue'}
                    bg={completed ? 'green.subtle' : 'blue.subtle'}
                    color={completed ? 'green.fg' : undefined}
                    borderWidth="0"
                    borderRadius="full"
                    px={3}
                    py={0}
                    fontSize="xs"
                    fontWeight="medium"
                    textTransform="none"
                  >
                    {completed ? 'Completed' : 'In Progress'}
                  </Badge>
                </HStack>
                <Text color="fg.muted" fontSize="xs" mt={1}>
                  {[
                    run.browser,
                    run.operatingSystem,
                    run.device,
                    run.apiEnvironment,
                    run.build ? `build ${run.build}` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ') || 'Environment not set'}{' '}
                  · Started {dateLabel(run.startedAt)} by {run.executedBy?.name ?? 'Unknown user'}
                </Text>
              </Box>
              <HStack>
                {completed ? (
                  <Button size="sm" h="40px" variant="outline" disabled={isSaving} onClick={() => void reopen()}>
                    <FiRotateCcw aria-hidden="true" /> Reopen
                  </Button>
                ) : (
                  <Button
                    ref={completionTriggerRef}
                    size="sm"
                    h="40px"
                    variant="outline"
                    disabled={isSaving}
                    onClick={(event) => requestCompletion(event.currentTarget)}
                  >
                    <FiFlag /> Complete run
                  </Button>
                )}
                <Menu.Root positioning={{ placement: 'bottom-end' }}>
                  <Menu.Trigger asChild>
                    <IconButton size="sm" h="40px" w="40px" variant="outline" aria-label="Run actions">
                      <FiMoreHorizontal aria-hidden="true" />
                    </IconButton>
                  </Menu.Trigger>
                  <Portal>
                    <Menu.Positioner>
                      <Menu.Content minW="210px" bg="bg.panel" p={1}>
                        <Menu.Item value="edit" disabled={completed}>
                          <FiEdit aria-hidden="true" />
                          Edit run details
                        </Menu.Item>
                        <Menu.Separator />
                        <Menu.Item value="delete" color="fg.error" disabled={isSaving} onClick={() => setDeleteOpen(true)}>
                          <FiTrash2 aria-hidden="true" />
                          Delete run
                        </Menu.Item>
                      </Menu.Content>
                    </Menu.Positioner>
                  </Portal>
                </Menu.Root>
              </HStack>
            </HStack>
            {completed && (
              <HStack role="status" borderRadius="md" bg="green.subtle" color="green.fg" p={3} align="start">
                <Box as={FiCheckCircle} flexShrink={0} mt="0.5" aria-hidden="true" />
                <Text fontSize="sm">
                  Completed{run.completedAt ? ` ${new Date(run.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : ''}
                  {run.completedBy?.name ? ` by ${run.completedBy.name}` : ''}.
                  {run.skippedAtCompletion > 0 && ` ${run.skippedAtCompletion} untested ${run.skippedAtCompletion === 1 ? 'scenario was' : 'scenarios were'} marked Skipped.`}
                  {' '}The results are locked; reopen the run to change them.
                </Text>
              </HStack>
            )}
            {!completed && marked === run.scenarios.length && run.scenarios.length > 0 && (
              <HStack role="status" borderRadius="md" bg="blue.subtle" color="blue.fg" minH="46px" px={4} py={2}>
                <Box as={FiInfo} boxSize="14px" flexShrink={0} aria-hidden="true" />
                <Text fontSize="14px">All scenarios are marked. Complete the run to finish it: its results are then locked until you reopen it.</Text>
              </HStack>
            )}
            <Box position="absolute" w="1px" h="1px" overflow="hidden" clipPath="inset(50%)">
              {(
                [
                  MANUAL_RUN_RESULT.PASSED,
                  MANUAL_RUN_RESULT.FAILED,
                  MANUAL_RUN_RESULT.BLOCKED,
                  MANUAL_RUN_RESULT.SKIPPED,
                  MANUAL_RUN_RESULT.UNTESTED,
                ] as const
              ).map((key) => (
                <Text key={key}>
                  {resultLabels[key]} {counts[key]}
                </Text>
              ))}
            </Box>
            <Flex
              role="img"
              aria-label={`Run progress: ${marked} of ${run.scenarios.length} marked`}
              h="1.5"
              borderRadius="full"
              overflow="hidden"
              bg="bg.subtle"
            >
              {counts.passed > 0 && <Box flex={counts.passed} bg="green.500" />}
              {counts.failed > 0 && <Box flex={counts.failed} bg="red.500" />}
              {counts.blocked > 0 && <Box flex={counts.blocked} bg={orange_300} />}
              {counts.skipped > 0 && <Box flex={counts.skipped} bg="gray.500" />}
              {counts.untested > 0 && <Box flex={counts.untested} bg="gray.200" />}
            </Flex>
            {feedback && (
              <Text role="alert" color="fg.error">
                {feedback}
              </Text>
            )}
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
                  pe={scenarioSearch ? 9 : 3}
                  size="sm"
                  h="40px"
                  bg="bg.card"
                  borderColor={scenarioSearch.trim() ? 'border.active' : undefined}
                  aria-label="Search scenarios"
                  placeholder="Search by title or key"
                  value={scenarioSearch}
                  onChange={(e) => setScenarioSearch(e.target.value)}
                />
                {scenarioSearch && (
                  <IconButton position="absolute" insetEnd={1} top="50%" transform="translateY(-50%)"
                    size="xs" variant="ghost" aria-label="Clear scenario search" onClick={() => setScenarioSearch('')}>
                    <FiX />
                  </IconButton>
                )}
              </Box>
              <SearchableFilter
                label="Status"
                value={statusFilter}
                onChange={setStatusFilter}
                options={([MANUAL_RUN_RESULT.UNTESTED, ...RESULTS] as ManualTestRunScenarioResult[]).map((value) => ({
                  value,
                  label: resultLabels[value],
                  count: counts[value],
                }))}
              />
              <SearchableFilter
                label="Folder"
                value={folderFilter}
                onChange={setFolderFilter}
                options={folders.map((folder) => ({ value: folder, label: folder }))}
              />
              <Box onFocus={() => void loadUsers()}>
                <SearchableFilter
                  label="Assignee"
                  value={assigneeFilter}
                  onChange={setAssigneeFilter}
                  options={[
                    { value: UNASSIGNED_FILTER_VALUE, label: 'Unassigned' },
                    ...(usersQuery.currentData ?? []).map((user) => ({ value: user.id, label: user.name })),
                  ]}
                />
              </Box>
            </HStack>
            <Box overflowX="auto" borderWidth="1px" borderColor="border" borderRadius="md">
              <Table.Root size="sm" variant="line" tableLayout="fixed" minW="810px" w="full">
                <colgroup>
                  <col style={{ width: '28px' }} />
                  <col style={{ width: '40px' }} />
                  <col style={{ width: '152px' }} />
                  <col style={{ width: '80px' }} />
                  <col />
                  <col style={{ width: '160px' }} />
                  <col style={{ width: '150px' }} />
                </colgroup>
                <Table.Header>
                  <Table.Row bg="bg.subtle">
                    <Table.ColumnHeader aria-label="Reorder" w="28px"></Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center" verticalAlign="middle">
                      <input
                        aria-label="Select visible scenarios"
                        type="checkbox"
                        style={{ width: '16px', height: '16px', display: 'block', margin: 'auto' }}
                        disabled={completed}
                        checked={
                          visibleScenarios.length > 0 &&
                          visibleScenarios.every((item) => selectedScenarioIds.includes(item.id))
                        }
                        onChange={(event) =>
                          setSelectedScenarioIds((current) =>
                            event.target.checked
                              ? [...new Set([...current, ...visibleScenarios.map((item) => item.id)])]
                              : current.filter((id) => !visibleScenarios.some((item) => item.id === id)),
                          )
                        }
                      />
                    </Table.ColumnHeader>
                    <Table.ColumnHeader color="fg.muted" fontSize="xs">
                      Status
                    </Table.ColumnHeader>
                    <Table.ColumnHeader color="fg.muted" fontSize="xs">
                      Key
                    </Table.ColumnHeader>
                    <Table.ColumnHeader color="fg.muted" fontSize="xs">
                      Title
                    </Table.ColumnHeader>
                    <Table.ColumnHeader color="fg.muted" fontSize="xs">
                      Folder
                    </Table.ColumnHeader>
                    <Table.ColumnHeader color="fg.muted" fontSize="xs">
                      Assignee
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {visibleScenarios.map((scenario) => (
                    <Table.Row
                      id={`manual-run-scenario-${scenario.id}`}
                      key={scenario.id}
                      tabIndex={0}
                      draggable={!completed && !isSaving}
                      onDragStart={(event) => {
                        draggedScenarioId.current = scenario.id;
                        event.dataTransfer.effectAllowed = 'move';
                        event.dataTransfer.setData('text/plain', scenario.id);
                      }}
                      onDragOver={(event) => {
                        event.preventDefault();
                        event.dataTransfer.dropEffect = 'move';
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        if (draggedScenarioId.current) reorderScenarios(draggedScenarioId.current, scenario.id);
                        draggedScenarioId.current = undefined;
                      }}
                      onDragEnd={() => {
                        draggedScenarioId.current = undefined;
                      }}
                      onKeyDown={(event) => activateResult(scenario, event)}
                      bg={
                        selectedScenarioIds.includes(scenario.id)
                          ? 'blue.50'
                          : scenario.result === MANUAL_RUN_RESULT.PASSED
                            ? 'green.subtle'
                            : scenario.result === MANUAL_RUN_RESULT.FAILED
                              ? 'red.subtle'
                              : scenario.result === MANUAL_RUN_RESULT.BLOCKED
                                ? 'orange.subtle'
                                : scenario.result === MANUAL_RUN_RESULT.SKIPPED
                                  ? 'gray.subtle'
                                  : undefined
                      }
                    >
                      <Table.Cell
                        color="fg.muted"
                        cursor={completed ? 'default' : 'grab'}
                        aria-label={`Drag ${scenario.title} to reorder`}
                        title="Drag to reorder"
                      >
                        ⠿
                      </Table.Cell>
                      <Table.Cell textAlign="center" verticalAlign="middle">
                        <input
                          aria-label={`Select ${scenario.title}`}
                          type="checkbox"
                          style={{ width: '16px', height: '16px', display: 'block', margin: 'auto' }}
                          disabled={completed}
                          checked={selectedScenarioIds.includes(scenario.id)}
                          onChange={(event) =>
                            setSelectedScenarioIds((current) =>
                              event.target.checked
                                ? [...current, scenario.id]
                                : current.filter((id) => id !== scenario.id),
                            )
                          }
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <HStack gap={1}>
                          {RESULTS.map((result) => {
                            const palettes = {
                              passed: 'green',
                              failed: 'red',
                              blocked: 'orange',
                              skipped: 'gray',
                            } as const;
                            const icons = { passed: FiCheck, failed: FiX, blocked: FiSlash, skipped: FiSkipForward } as const;
                            const ResultIcon = icons[result];
                            return (
                              <Button
                                key={result}
                                size="xs"
                                minW="30px"
                                w="30px"
                                h="30px"
                                p={0}
                                display="inline-flex"
                                alignItems="center"
                                justifyContent="center"
                                fontSize="18px"
                                lineHeight="1"
                                colorPalette={palettes[result]}
                                variant={scenario.result === result ? 'solid' : 'outline'}
                                bg={scenario.result === result ? (result === MANUAL_RUN_RESULT.BLOCKED ? orange_300 : result === MANUAL_RUN_RESULT.SKIPPED ? grey_2100 : undefined) : 'bg.panel'}
                                borderColor={scenario.result === result ? (result === MANUAL_RUN_RESULT.BLOCKED ? orange_300 : result === MANUAL_RUN_RESULT.SKIPPED ? grey_2100 : undefined) : 'border.main'}
                                _hover={scenario.result === result && (result === MANUAL_RUN_RESULT.BLOCKED || result === MANUAL_RUN_RESULT.SKIPPED) ? { bg: result === MANUAL_RUN_RESULT.BLOCKED ? orange_300 : grey_2100 } : undefined}
                                aria-label={`${scenario.title}: mark ${resultLabels[result]}`}
                                aria-pressed={scenario.result === result}
                                title={`${resultLabels[result]} (${result[0].toUpperCase()})`}
                                disabled={completed || isSaving}
                                onClick={() => void updateResult(scenario, result)}
                              >
                                <ResultIcon size={18} strokeWidth={2.5} aria-hidden="true" />
                              </Button>
                            );
                          })}
                        </HStack>
                      </Table.Cell>
                      <Table.Cell>{scenario.sourceScenarioKey}</Table.Cell>
                      <Table.Cell>
                        <VStack align="start" gap={0} minW={0}>
                          <HStack gap={1} align="center" maxW="full" minW={0}>
                            <Text fontWeight="medium" minW={0} overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap" title={scenario.title}>
                              {scenario.title}
                            </Text>
                            <Button
                              size="xs"
                              variant="ghost"
                              minW="5"
                              h="5"
                              p={0}
                              flexShrink={0}
                              aria-label={`Instructions for ${scenario.title}`}
                              aria-expanded={expandedScenarioId === scenario.id}
                              onClick={() =>
                                setExpandedScenarioId((current) => (current === scenario.id ? undefined : scenario.id))
                              }
                            >
                              ⓘ
                            </Button>
                          </HStack>
                          {expandedScenarioId === scenario.id && (
                            <Box py={2} whiteSpace="pre-wrap">
                              {(
                                [
                                  ['Details', scenario.details],
                                  ['Preconditions', scenario.preconditions],
                                  ['Test data', scenario.testData],
                                ] as const
                              ).map(
                                ([label, value]) =>
                                  value && (
                                    <Box key={label} mb={2}>
                                      <Text fontWeight="semibold">{label}</Text>
                                      <Text>{value}</Text>
                                    </Box>
                                  ),
                              )}
                              <Text fontWeight="semibold">Steps</Text>
                              {scenario.steps.length ? (
                                [...scenario.steps]
                                  .sort((a, b) => a.position - b.position)
                                  .map((step, index) => (
                                    <Box key={step.id} mt={2}>
                                      <Text>
                                        {index + 1}. {step.action}
                                      </Text>
                                      <Text color="fg.muted">Expected: {step.expectedResult || 'Not specified'}</Text>
                                    </Box>
                                  ))
                              ) : (
                                <Text color="fg.muted">No steps captured.</Text>
                              )}
                            </Box>
                          )}
                        </VStack>
                      </Table.Cell>
                      <Table.Cell fontSize="13px" overflowWrap="anywhere">{scenario.folderPath ?? 'Unfiled'}</Table.Cell>
                      <Table.Cell>
                        <AssigneePicker scenario={scenario} users={usersQuery.currentData ?? []}
                          disabled={completed || isSaving} onOpen={() => void loadUsers()}
                          onChange={(assigneeId) => void updateAssignee(scenario.id, assigneeId)} />
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
            <HStack justify="space-between" wrap="wrap">
              <Text fontSize="sm" color="text.secondary">
                {filteredScenarios.length
                  ? `${(scenarioPage - 1) * scenarioPageSize + 1}–${Math.min(scenarioPage * scenarioPageSize, filteredScenarios.length)} of ${filteredScenarios.length}`
                  : 'No scenarios match these filters.'}
              </Text>
              <HStack as="nav" aria-label="Run scenarios pagination" gap={2}>
                <Text fontSize="sm" color="text.secondary" whiteSpace="nowrap">
                  Rows per page
                </Text>
                <Box w="64px">
                  <NativeSelect
                    aria-label="Rows per page"
                    h="8"
                    bg="bg.card"
                    ps={2}
                    value={scenarioPageSize}
                    onChange={(event) => {
                      setScenarioPageSize(Number(event.target.value));
                      setScenarioPage(1);
                      setSelectedScenarioIds([]);
                    }}
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                  </NativeSelect>
                </Box>
                <IconButton
                  size="sm"
                  variant="outline"
                  aria-label="Previous page"
                  disabled={scenarioPage <= 1}
                  onClick={() => {
                    setSelectedScenarioIds([]);
                    setScenarioPage((page) => page - 1);
                  }}
                >
                  <FiChevronLeft />
                </IconButton>
                <IconButton
                  size="sm"
                  variant="outline"
                  aria-label="Next page"
                  disabled={scenarioPage >= scenarioPageCount}
                  onClick={() => {
                    setSelectedScenarioIds([]);
                    setScenarioPage((page) => page + 1);
                  }}
                >
                  <FiChevronRight />
                </IconButton>
              </HStack>
            </HStack>
            {!completed && visibleScenarios.length > 1 && (
              <Text fontSize="xs" color="fg.muted">
                Drag rows to change the order.
              </Text>
            )}
            {!completed && selectedScenarioIds.length > 0 && (
              <HStack
                role="toolbar"
                aria-label="Bulk scenario actions"
                alignSelf="center"
                position="sticky"
                bottom={2}
                zIndex={2}
                bg="gray.900"
                color="white"
                px={3}
                py={2}
                borderRadius="lg"
                boxShadow="lg"
                gap={1}
                maxW="100%"
                overflowX="auto"
                flexShrink={0}
              >
                <Text fontSize="sm" fontWeight="medium" whiteSpace="nowrap" px={2}>
                  {selectedScenarioIds.length} selected
                </Text>
                <Text fontSize="sm" color="gray.400" px={2} borderLeftWidth="1px" borderColor="gray.600">
                  Mark as
                </Text>
                {RESULTS.map((result) => (
                  <Button
                    key={result}
                    size="xs"
                    variant="ghost"
                    color="white"
                    _hover={{ bg: 'gray.700', color: 'white' }}
                    _active={{ bg: 'gray.600', color: 'white' }}
                    flexShrink={0}
                    disabled={isSaving}
                    aria-label={`Mark selected ${resultLabels[result]}`}
                    onClick={() => void updateBulk({ result })}
                  >
                    <Box
                      w="2"
                      h="2"
                      borderRadius="full"
                      bg={
                        result === MANUAL_RUN_RESULT.PASSED
                          ? 'green.500'
                          : result === MANUAL_RUN_RESULT.FAILED
                            ? 'red.500'
                            : result === MANUAL_RUN_RESULT.BLOCKED
                              ? orange_300
                              : 'gray.400'
                      }
                    />
                    {resultLabels[result]}
                  </Button>
                ))}
                <Box h="24px" borderLeftWidth="1px" borderColor="gray.600" mx={1} flexShrink={0} />
                <BulkAssigneePicker count={selectedScenarioIds.length} users={usersQuery.currentData ?? []}
                  disabled={isSaving} onOpen={() => void loadUsers()}
                  onChange={(assigneeId) => void updateBulk({ assigneeId })} />
                <IconButton
                  size="sm"
                  variant="ghost"
                  color="white"
                  _hover={{ bg: 'gray.700', color: 'white' }}
                  _active={{ bg: 'gray.600', color: 'white' }}
                  aria-label="Clear selection"
                  onClick={() => setSelectedScenarioIds([])}
                >
                  <FiX aria-hidden="true" />
                </IconButton>
              </HStack>
            )}
          </>
        )}
      </VStack>
      {deleteOpen && (
        <Box position="fixed" inset="0" bg="blackAlpha.600" display="grid" placeItems="center" zIndex="modal">
          <VStack role="alertdialog" aria-modal="true" aria-labelledby="delete-run-title" align="stretch" bg="bg.panel" borderRadius="lg" p={6} maxW="460px" shadow="lg">
            <Heading id="delete-run-title" size="md">Delete this run?</Heading>
            <Text>This permanently deletes the run and its results. This cannot be undone.</Text>
            <HStack justify="end">
              <Button variant="outline" disabled={isSaving} onClick={() => setDeleteOpen(false)}>Cancel</Button>
              <Button colorPalette="red" disabled={isSaving} onClick={() => void deleteSelectedRun()}>Delete run</Button>
            </HStack>
          </VStack>
        </Box>
      )}
      {completionOpen && (
        <Box position="fixed" inset="0" bg="blackAlpha.600" display="grid" placeItems="center" zIndex="modal">
          <VStack
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="complete-run-title"
            aria-describedby="complete-run-description"
            align="stretch"
            bg="bg.panel"
            borderRadius="xl"
            p={6}
            gap={4}
            w="calc(100% - 32px)"
            maxW="420px"
            shadow="lg"
          >
            <HStack align="center" gap={3}>
              <Box display="grid" placeItems="center" boxSize="40px" flexShrink={0} borderRadius="lg" bg="blue.subtle" color="blue.fg">
                <FiFlag aria-hidden="true" />
              </Box>
              <Heading id="complete-run-title" fontSize="18px" lineHeight="short">
                Complete the run with {untestedCount} untested?
              </Heading>
            </HStack>
            <Text id="complete-run-description" fontSize="14px" lineHeight="1.5" color="text.secondary">
              {untestedCount} of {run?.scenarios.length} {run?.scenarios.length === 1 ? 'scenario has' : 'scenarios have'} no status yet. Completing the run
              {' '}marks {untestedCount === 1 ? 'it' : 'them'} as Skipped. The results are locked afterwards; reopen the run to change them.
            </Text>
            <HStack justify="end">
              <Button ref={cancelRef} variant="outline" disabled={isSaving} onClick={cancelCompletion}>
                Keep testing
              </Button>
              <Button colorPalette="blue" disabled={isSaving} onClick={() => void complete()}>
                Complete and skip {untestedCount}
              </Button>
            </HStack>
          </VStack>
        </Box>
      )}
    </Flex>
  );
};
