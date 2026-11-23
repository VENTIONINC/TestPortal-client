// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useRef } from 'react';
import { Box, Button, Flex, Text, VStack } from '@chakra-ui/react';

import { useCompleteManualRunDialog } from '../CompleteManualRunDialog';
import { useDeleteManualRunDialog } from '../DeleteManualRunDialog';
import { ManualRunHeader } from '../ManualRunHeader';
import { ManualRunScenarioTable } from '../ManualRunScenarioTable';
import { ManualRunSidebar } from '../ManualRunSidebar';
import { useManualRun } from './hooks/useManualRun';
import { useManualRunEditing } from './hooks/useManualRunEditing';
import { useManualRunList } from './hooks/useManualRunList';
import { useManualRunScenarios } from './hooks/useManualRunScenarios';
import { ManualRunBulkActions } from './ManualRunBulkActions';
import { ManualRunEmptyState } from './ManualRunEmptyState';
import { ManualRunScenarioFilters } from './ManualRunScenarioFilters';
import { ManualRunScenarioPagination } from './ManualRunScenarioPagination';

export interface ManualTestRunWorkspaceProps {
  projectId: string;
  selectedRunId?: string;
  onSelectRun: (runId: string) => void;
}

export const ManualTestRunWorkspace = ({ projectId, selectedRunId, onSelectRun }: ManualTestRunWorkspaceProps) => {
  const runList = useManualRunList(projectId);
  const { listQuery, allRunsQuery, scenarioCountQuery, noRunsYet, listedRuns, noRunsInProgress } = runList;
  const details = useManualRun({ projectId, selectedRunId, listedRuns, onSelectRun });
  const { run, completed, writesBlocked, mutate } = details;
  const editing = useManualRunEditing({
    projectId, selectedRunId, run, completed, writesBlocked, getRun: details.getRun, mutate,
  });
  const scenarios = useManualRunScenarios({ projectId, selectedRunId, run, completed, writesBlocked, mutate });
  const { scenarioFilters } = scenarios;
  const openCompleteManualRunDialog = useCompleteManualRunDialog(projectId, selectedRunId);
  const openDeleteManualRunDialog = useDeleteManualRunDialog(projectId, selectedRunId);
  const completionTriggerRef = useRef<HTMLButtonElement>(null);

  const showEmptyState = !selectedRunId && !listQuery.isLoading;
  const hasListedRuns = listedRuns.length > 0;
  const hasAnyRuns = Boolean(allRunsQuery.currentData?.total);
  const availableScenarioCount = scenarioCountQuery.currentData?.total;
  const showRecoveryHint = !details.feedback;
  const filteredScenarioCount = scenarioFilters.filteredScenarios.length;

  const requestCompletion = () => {
    if (!run || completed || writesBlocked) return;
    if (details.untestedCount === 0) {
      void details.complete();
      return;
    }

    openCompleteManualRunDialog({
      projectId,
      runId: run.id,
      untestedCount: details.untestedCount,
      scenarioCount: run.scenarios.length,
      getTrigger: () => completionTriggerRef.current,
      onStart: details.beginWrite,
      onCompleted: details.acceptRun,
      onError: details.recover,
      onSettled: details.finishWrite,
    });
  };

  const requestDeletion = () => {
    if (!run || writesBlocked) return;

    openDeleteManualRunDialog({
      projectId,
      runId: run.id,
      title: run.title,
      scenarioCount: run.scenarios.length,
      marked: details.marked,
      onStart: details.beginWrite,
      onDeleted: details.acceptDeletion,
      onError: details.recover,
      onSettled: details.finishWrite,
    });
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
        {showEmptyState && (
          <ManualRunEmptyState
            hasListedRuns={hasListedRuns}
            hasAnyRuns={hasAnyRuns}
            noRunsYet={noRunsYet}
            noRunsInProgress={noRunsInProgress}
            scenarioCount={availableScenarioCount}
          />
        )}
        {details.isLoading && <Text>Loading run…</Text>}
        {details.isUnavailable && (
          <Box>
            <Text role="alert">This run is unavailable in the selected project.</Text>
            <Button onClick={details.retryLoad}>Retry</Button>
          </Box>
        )}
        {run && (
          <>
            <ManualRunHeader
              run={run}
              completed={completed}
              counts={details.counts}
              marked={details.marked}
              writesBlocked={writesBlocked}
              completionTriggerRef={completionTriggerRef}
              onComplete={requestCompletion}
              onReopen={details.reopen}
              onManageScenarios={editing.openManageScenarios}
              onEdit={editing.openEdit}
              onDelete={requestDeletion}
            />
            {details.feedback && (
              <Text role="alert" color="fg.error">
                {details.feedback}
              </Text>
            )}
            {details.recoveryRequired && (
              <Box>
                {showRecoveryHint && <Text role="alert">Refresh the run before making changes.</Text>}
                <Button size="sm" disabled={details.isSaving} onClick={details.retryRecovery}>
                  Retry refresh
                </Button>
              </Box>
            )}
            <ManualRunScenarioFilters
              projectId={projectId}
              filters={scenarioFilters}
              counts={details.counts}
              users={scenarios.users}
              onLoadUsers={scenarios.loadScenarioUsers}
            />
            <ManualRunScenarioTable
              runId={run.id}
              completed={completed}
              writesBlocked={writesBlocked}
              visibleScenarios={scenarioFilters.visibleScenarios}
              selectedScenarioIds={scenarioFilters.selectedScenarioIds}
              setSelectedScenarioIds={scenarioFilters.setSelectedScenarioIds}
              expandedScenarioId={scenarios.expandedScenarioId}
              setExpandedScenarioId={scenarios.setExpandedScenarioId}
              users={scenarios.users}
              onLoadUsers={scenarios.loadScenarioUsers}
              onUpdateAssignee={scenarios.updateAssignee}
              onUpdateResult={scenarios.updateResult}
              onScenarioKeyDown={scenarios.activateResult}
              onReorder={scenarios.reorderScenarios}
            />
            <ManualRunScenarioPagination filters={scenarioFilters} total={filteredScenarioCount} />
            {scenarios.showReorderHint && (
              <Text fontSize="xs" color="fg.muted">
                Drag rows to change the order.
              </Text>
            )}
            {scenarios.showBulkActions && (
              <ManualRunBulkActions
                selectedCount={scenarios.selectedCount}
                filteredCount={filteredScenarioCount}
                canSelectAll={scenarios.canSelectAll}
                writesBlocked={writesBlocked}
                users={scenarios.users}
                resultActions={scenarios.bulkResultActions}
                onSelectAll={scenarios.selectAllFilteredScenarios}
                onClearSelection={scenarios.clearSelection}
                onLoadUsers={scenarios.loadScenarioUsers}
                onResultChange={scenarios.setBulkResult}
                onAssigneeChange={scenarios.setBulkAssignee}
              />
            )}
          </>
        )}
      </VStack>
    </Flex>
  );
};
