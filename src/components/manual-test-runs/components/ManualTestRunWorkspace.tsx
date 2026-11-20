// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Flex, Heading, HStack, IconButton, Input, Text, VStack } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router';
import { FiChevronLeft, FiChevronRight, FiSearch, FiX } from 'react-icons/fi';

import {
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
import { usePutApiV2ManualTestRunsByRunIdDetailsMutation } from '@/redux/apis/generatedApi';
import type {
  ManualTestRunRead,
  ManualTestRunScenarioRead,
  ManualTestRunScenarioResult,
} from '@/redux/apis/generatedApi';
import { PATHS } from '@/types/paths';
import { orange_300 } from '@/theme/colors/palette';
import { NativeSelect, Tooltip } from '@/components/ui';

import {
  isRunRecoveryLocked,
  lockRunRecovery,
  unlockRunRecovery,
  useRunRecoveryLocked,
  wasRunChangeRejected,
} from '../recoveryLock';
import { ManageScenariosDialog } from './ManageScenariosDialog';
import { ManualRunDetailsDialog, normalizeEnvironment } from './ManualRunDetailsDialog';
import { BulkAssigneePicker } from './BulkAssigneePicker';
import { CompleteManualRunDialog } from './CompleteManualRunDialog';
import { DeleteManualRunDialog } from './DeleteManualRunDialog';
import { ManualRunHeader } from './ManualRunHeader';
import { ManualRunScenarioTable } from './ManualRunScenarioTable';
import { ManualRunSidebar } from './ManualRunSidebar';
import { SearchableFilter } from './SearchableFilter';
import { RESULTS, resultExplanations, resultLabels } from './manualRunResults';
import { useManualRunList } from './useManualRunList';
import { useManualRunScenarioFilters } from './useManualRunScenarioFilters';
import { MANUAL_RUN_RESULT, MANUAL_RUN_STATUS, UNASSIGNED_FILTER_VALUE } from '../constants';

export interface ManualTestRunWorkspaceProps {
  projectId: string;
  selectedRunId?: string;
  onSelectRun: (runId: string) => void;
}

export const ManualTestRunWorkspace = ({ projectId, selectedRunId, onSelectRun }: ManualTestRunWorkspaceProps) => {
  const navigate = useNavigate();
  const runList = useManualRunList(projectId);
  const { listQuery, allRunsQuery, scenarioCountQuery, noRunsYet, listedRuns, noRunsInProgress } = runList;
  const [currentRun, setCurrentRun] = useState<ManualTestRunRead>();
  const [feedback, setFeedback] = useState<string>();
  const [completionOpen, setCompletionOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editScenarioIds, setEditScenarioIds] = useState<string[]>([]);
  const [editEnvironment, setEditEnvironment] = useState<Array<{ name: string; value: string }>>([]);
  const [confirmRemovedResults, setConfirmRemovedResults] = useState(false);
  const [expandedScenarioId, setExpandedScenarioId] = useState<string>();

  const deletedRunRef = useRef<{ projectId: string; runId: string } | null>(null);
  const scopeRef = useRef({ projectId, selectedRunId });
  scopeRef.current = { projectId, selectedRunId };
  const [isSaving, setIsSaving] = useState(false);
  const recoveryRequired = useRunRecoveryLocked(projectId, selectedRunId ?? '');
  const writesBlocked = isSaving || recoveryRequired;
  const cancelRef = useRef<HTMLButtonElement>(null);
  const completionTriggerRef = useRef<HTMLButtonElement>(null);

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
  const [saveDetails] = usePutApiV2ManualTestRunsByRunIdDetailsMutation();
  const run = currentRun?.id === selectedRunId ? currentRun : detailQuery.currentData;
  const {
    scenarioSearch,
    setScenarioSearch,
    statusFilter,
    setStatusFilter,
    folderFilter,
    setFolderFilter,
    assigneeFilter,
    setAssigneeFilter,
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
  } = useManualRunScenarioFilters(projectId, selectedRunId, run?.scenarios);
  const completed = run?.status === MANUAL_RUN_STATUS.COMPLETED;
  const untestedCount = run?.scenarios.filter((scenario) => scenario.result === MANUAL_RUN_RESULT.UNTESTED).length ?? 0;
  const selectedScenarios = useMemo(() => {
    const selectedIds = new Set(selectedScenarioIds);
    return (run?.scenarios ?? []).filter((scenario) => selectedIds.has(scenario.id));
  }, [run?.scenarios, selectedScenarioIds]);
  const selectionIsResolved = selectedScenarioIds.length > 0 && selectedScenarios.length === selectedScenarioIds.length;
  const bulkStatusWillReset = (result: ManualTestRunScenarioResult) =>
    selectionIsResolved && selectedScenarios.every((scenario) => scenario.result === result);

  useEffect(() => {
    setCurrentRun(undefined);
    setFeedback(undefined);
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
    const next = listedRuns.find(
      (item) => !(deletedRunRef.current?.projectId === projectId && deletedRunRef.current.runId === item.id),
    );
    if (!selectedRunId && next) onSelectRun(next.id);
  }, [listedRuns, onSelectRun, projectId, selectedRunId]);

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
  const refreshForRecovery = async () => {
    try {
      const refreshed = await detailQuery.refetch();
      if (!isCurrentScope()) return;
      if (
        refreshed.error ||
        !refreshed.data ||
        refreshed.data.id !== selectedRunId ||
        refreshed.data.projectId !== projectId
      ) {
        setFeedback('Could not refresh the run. Retry the refresh before making changes.');
        return;
      }
      acceptRun(refreshed.data);
      const rejected = wasRunChangeRejected(projectId, selectedRunId ?? '');
      unlockRunRecovery(projectId, selectedRunId ?? '');
      setFeedback(
        rejected && refreshed.data.status === 'completed'
          ? `Your change was not saved because ${refreshed.data.completedBy?.name || 'another user'} completed the run.`
          : rejected
            ? 'Your change was not saved. Review the refreshed run before trying again.'
            : 'The run was refreshed. Review its current values before trying again.',
      );
    } catch {
      if (isCurrentScope()) setFeedback('Could not refresh the run. Retry the refresh before making changes.');
    }
  };
  const recover = async (error: unknown) => {
    const rejected = Boolean(error && typeof error === 'object' && 'status' in error && error.status === 409);
    lockRunRecovery(projectId, selectedRunId ?? '', rejected);
    if (!isCurrentScope()) return;
    setFeedback('The server did not confirm this update. Refreshing the run.');
    setCurrentRun(undefined);
    await refreshForRecovery();
  };
  const mutate = async (operation: () => Promise<ManualTestRunRead>) => {
    if (!run || completed || writesBlocked || isRunRecoveryLocked(projectId, selectedRunId ?? '')) return false;
    setIsSaving(true);
    setFeedback(undefined);
    let saved = false;
    try {
      acceptRun(await operation());
      saved = true;
    } catch (error) {
      await recover(error);
    } finally {
      if (isCurrentScope()) setIsSaving(false);
    }
    return saved;
  };
  const updateResult = (scenario: ManualTestRunScenarioRead, result: ManualTestRunScenarioResult) =>
    mutate(async () =>
      setScenarioResult({
        projectId,
        runId: run!.id,
        scenarioId: scenario.id,
        manualTestRunScenarioResultRequest: {
          result: scenario.result === result ? MANUAL_RUN_RESULT.UNTESTED : result,
        },
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
  const openEdit = () => {
    if (!run || completed || writesBlocked) return;
    setEditTitle(run.title);
    setEditScenarioIds(run.scenarios.map((scenario) => scenario.sourceScenarioId));
    setEditEnvironment(run.environmentProperties.map((property) => ({ ...property })));
    setConfirmRemovedResults(false);
    setEditOpen(true);
  };
  const commitEdit = async (confirmed = false, selectedIds = editScenarioIds) => {
    if (!run || completed || writesBlocked || !editTitle.trim() || !selectedIds.length) return;
    const selected = new Set(selectedIds);
    const removedMarked = run.scenarios.filter(
      (scenario) => !selected.has(scenario.sourceScenarioId) && scenario.result !== MANUAL_RUN_RESULT.UNTESTED,
    ).length;
    if (removedMarked > 0 && !confirmed) {
      setConfirmRemovedResults(true);
      return;
    }
    const saved = await mutate(async () =>
      saveDetails({
        projectId,
        runId: run.id,
        manualTestRunDetailsRequest: {
          title: editTitle.trim(),
          scenarioIds: selectedIds,
          environmentProperties: normalizeEnvironment(editEnvironment),
        },
      }).unwrap(),
    );
    if (!saved) return;
    setEditOpen(false);
    setManageOpen(false);
    setConfirmRemovedResults(false);
  };
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
    if (!run || writesBlocked) return;
    setIsSaving(true);
    try {
      await deleteRun({ projectId, runId: run.id }).unwrap();
      if (!isCurrentScope()) return;
      deletedRunRef.current = { projectId, runId: run.id };
      setDeleteOpen(false);
      setCurrentRun(undefined);
      onSelectRun('');
    } catch (error) {
      if (isCurrentScope()) setDeleteOpen(false);
      await recover(error);
    } finally {
      if (isCurrentScope()) setIsSaving(false);
    }
  };

  const complete = async () => {
    if (!run || completed || writesBlocked) return;
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
    if (!run || !completed || writesBlocked) return;
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
  };

  const activateResult = (scenario: ManualTestRunScenarioRead, event: React.KeyboardEvent) => {
    if (completed || writesBlocked || event.target !== event.currentTarget) return;
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      const index = run?.scenarios.findIndex((item) => item.id === scenario.id) ?? -1;
      const neighbor = run?.scenarios[index + (event.key === 'ArrowUp' ? -1 : 1)];
      if (neighbor) {
        event.preventDefault();
        reorderScenarios(scenario.id, neighbor.id);
      }
      return;
    }
    const keys: Record<string, ManualTestRunScenarioResult> = {
      p: MANUAL_RUN_RESULT.PASSED,
      f: MANUAL_RUN_RESULT.FAILED,
      b: MANUAL_RUN_RESULT.BLOCKED,
      s: MANUAL_RUN_RESULT.SKIPPED,
    };
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

  const handleManageScenarios = () => {
    if (!run) return;

    setEditTitle(run.title);
    setEditEnvironment(run.environmentProperties.map((property) => ({ ...property })));
    setConfirmRemovedResults(false);
    setManageOpen(true);
  };

  const handleScenarioPageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setScenarioPageSize(Number(event.target.value));
    setScenarioPage(1);
  };

  const handlePreviousScenarioPage = () => {
    setScenarioPage((page) => page - 1);
  };

  const handleNextScenarioPage = () => {
    setScenarioPage((page) => page + 1);
  };

  const handleCloseManageScenarios = () => {
    setManageOpen(false);
    setConfirmRemovedResults(false);
  };

  const handleEditSelectionChange = (ids: string[]) => {
    setEditScenarioIds(ids);
    setConfirmRemovedResults(false);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setConfirmRemovedResults(false);
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
      <ManualRunSidebar runList={runList} selectedRunId={selectedRunId} onSelectRun={onSelectRun} />

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
            <Text color="fg.muted" fontSize="sm" maxW={'450px'} my={3}>
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
                <Link to={PATHS.MANUAL_TEST_RUN_NEW}>＋ New manual run</Link>
              </Box>
            ) : (scenarioCountQuery.currentData?.total ?? 0) > 0 ? (
              noRunsYet ? (
                <Box asChild color="blue.500" fontSize="sm" _hover={{ textDecoration: 'underline' }}>
                  <Link to={PATHS.MANUAL_TEST_RUN_NEW}>＋ New manual run</Link>
                </Box>
              ) : (
                <Button colorPalette="blue" onClick={() => navigate(PATHS.MANUAL_TEST_RUN_NEW)}>
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
            <ManualRunHeader
              run={run}
              completed={completed}
              counts={counts}
              marked={marked}
              writesBlocked={writesBlocked}
              completionTriggerRef={completionTriggerRef}
              onComplete={requestCompletion}
              onReopen={() => void reopen()}
              onManageScenarios={handleManageScenarios}
              onEdit={openEdit}
              onDelete={() => setDeleteOpen(true)}
            />
            {feedback && (
              <Text role="alert" color="fg.error">
                {feedback}
              </Text>
            )}
            {recoveryRequired && (
              <Box>
                {!feedback && <Text role="alert">Refresh the run before making changes.</Text>}
                <Button size="sm" disabled={isSaving} onClick={() => void refreshForRecovery()}>
                  Retry refresh
                </Button>
              </Box>
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
                  <IconButton
                    position="absolute"
                    insetEnd={1}
                    top="50%"
                    transform="translateY(-50%)"
                    size="xs"
                    variant="ghost"
                    aria-label="Clear scenario search"
                    onClick={() => setScenarioSearch('')}
                  >
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
            <ManualRunScenarioTable
              runId={run.id}
              completed={completed}
              writesBlocked={writesBlocked}
              visibleScenarios={visibleScenarios}
              selectedScenarioIds={selectedScenarioIds}
              setSelectedScenarioIds={setSelectedScenarioIds}
              expandedScenarioId={expandedScenarioId}
              setExpandedScenarioId={setExpandedScenarioId}
              users={usersQuery.currentData ?? []}
              onLoadUsers={() => void loadUsers()}
              onUpdateAssignee={updateAssignee}
              onUpdateResult={updateResult}
              onScenarioKeyDown={activateResult}
              onReorder={reorderScenarios}
            />
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
                    onChange={handleScenarioPageSizeChange}
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
                  onClick={handlePreviousScenarioPage}
                >
                  <FiChevronLeft />
                </IconButton>
                <IconButton
                  size="sm"
                  variant="outline"
                  aria-label="Next page"
                  disabled={scenarioPage >= scenarioPageCount}
                  onClick={handleNextScenarioPage}
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
                {filteredScenarios.some((scenario) => !selectedScenarioIds.includes(scenario.id)) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    color="blue.300"
                    disabled={writesBlocked}
                    onClick={() => setSelectedScenarioIds(filteredScenarios.map((scenario) => scenario.id))}
                  >
                    Select all {filteredScenarios.length}
                  </Button>
                )}
                <Text fontSize="sm" color="gray.400" px={2} borderLeftWidth="1px" borderColor="gray.600">
                  Mark as
                </Text>
                {RESULTS.map((result) => {
                  const willReset = bulkStatusWillReset(result);
                  const label = resultLabels[result];
                  return (
                    <Tooltip
                      key={result}
                      openDelay={500}
                      closeDelay={0}
                      contentProps={{ maxW: '240px' }}
                      content={`${resultExplanations[result]} ${
                        willReset
                          ? `Click to reset all selected scenarios to Untested.`
                          : `Click to mark all selected scenarios as ${label}.`
                      }`}
                    >
                      <Button
                        size="xs"
                        variant="ghost"
                        color="white"
                        _hover={{ bg: 'gray.700', color: 'white' }}
                        _active={{ bg: 'gray.600', color: 'white' }}
                        flexShrink={0}
                        disabled={writesBlocked}
                        aria-label={willReset ? 'Reset selected scenarios to Untested' : `Mark selected ${label}`}
                        onClick={() => void updateBulk({ result: willReset ? MANUAL_RUN_RESULT.UNTESTED : result })}
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
                        {label}
                      </Button>
                    </Tooltip>
                  );
                })}
                <Box h="24px" borderLeftWidth="1px" borderColor="gray.600" mx={1} flexShrink={0} />
                <BulkAssigneePicker
                  count={selectedScenarioIds.length}
                  users={usersQuery.currentData ?? []}
                  disabled={writesBlocked}
                  onOpen={() => void loadUsers()}
                  onChange={(assigneeId) => void updateBulk({ assigneeId })}
                />
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
      {manageOpen && run && (
        <ManageScenariosDialog
          projectId={projectId}
          runTitle={run.title}
          existing={run.scenarios}
          saving={writesBlocked}
          onClose={handleCloseManageScenarios}
          onSelectionChange={() => setConfirmRemovedResults(false)}
          warning={confirmRemovedResults}
          onSave={(ids) => void commitEdit(confirmRemovedResults, ids)}
        />
      )}
      {editOpen && run && (
        <ManualRunDetailsDialog
          projectId={projectId}
          mode="edit"
          name={editTitle}
          onNameChange={setEditTitle}
          selectedIds={editScenarioIds}
          onSelectionChange={handleEditSelectionChange}
          environment={editEnvironment}
          onEnvironmentChange={setEditEnvironment}
          existing={run.scenarios}
          saving={writesBlocked}
          warning={confirmRemovedResults}
          onClose={handleCloseEdit}
          onSubmit={() => void commitEdit(confirmRemovedResults)}
        />
      )}
      {deleteOpen && (
        <DeleteManualRunDialog
          title={run?.title}
          scenarioCount={run?.scenarios.length ?? 0}
          marked={marked}
          writesBlocked={writesBlocked}
          onCancel={() => setDeleteOpen(false)}
          onDelete={() => void deleteSelectedRun()}
        />
      )}
      {completionOpen && (
        <CompleteManualRunDialog
          untestedCount={untestedCount}
          scenarioCount={run?.scenarios.length}
          writesBlocked={writesBlocked}
          cancelRef={cancelRef}
          triggerRef={completionTriggerRef}
          onCancel={cancelCompletion}
          onComplete={() => void complete()}
        />
      )}
    </Flex>
  );
};
