// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, Flex, Text, VStack } from '@chakra-ui/react';

import { CompleteManualRunDialog } from './CompleteManualRunDialog';
import { DeleteManualRunDialog } from './DeleteManualRunDialog';
import { ManageScenariosDialog } from './ManageScenariosDialog';
import { ManualRunDetailsDialog } from './ManualRunDetailsDialog';
import { ManualRunHeader } from './ManualRunHeader';
import { ManualRunScenarioTable } from './ManualRunScenarioTable';
import { ManualRunSidebar } from './ManualRunSidebar';
import { useManualRunList } from './useManualRunList';
import { ManualRunBulkActions } from './workspace/ManualRunBulkActions';
import { ManualRunEmptyState } from './workspace/ManualRunEmptyState';
import { ManualRunScenarioFilters } from './workspace/ManualRunScenarioFilters';
import { ManualRunScenarioPagination } from './workspace/ManualRunScenarioPagination';
import { useManualRun } from './workspace/useManualRun';
import { useManualRunEditing } from './workspace/useManualRunEditing';
import { useManualRunScenarios } from './workspace/useManualRunScenarios';

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
  const editing = useManualRunEditing({ projectId, run, completed, writesBlocked, mutate });
  const scenarios = useManualRunScenarios({ projectId, selectedRunId, run, completed, writesBlocked, mutate });
  const { scenarioFilters } = scenarios;

  const showEmptyState = !selectedRunId && !listQuery.isLoading;
  const hasListedRuns = listedRuns.length > 0;
  const hasAnyRuns = Boolean(allRunsQuery.currentData?.total);
  const availableScenarioCount = scenarioCountQuery.currentData?.total;
  const showRecoveryHint = !details.feedback;
  const scenarioCount = run?.scenarios.length;
  const deleteScenarioCount = scenarioCount ?? 0;
  const filteredScenarioCount = scenarioFilters.filteredScenarios.length;

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
              completionTriggerRef={details.completionTriggerRef}
              onComplete={details.requestCompletion}
              onReopen={details.reopen}
              onManageScenarios={editing.handleManageScenarios}
              onEdit={editing.openEdit}
              onDelete={details.openDelete}
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
      {editing.managedRun && (
        <ManageScenariosDialog
          projectId={projectId}
          runTitle={editing.managedRun.title}
          existing={editing.managedRun.scenarios}
          saving={writesBlocked}
          onClose={editing.handleCloseManageScenarios}
          onSelectionChange={editing.handleManageSelectionChange}
          warning={editing.confirmRemovedResults}
          onSave={editing.saveManagedScenarios}
        />
      )}
      {editing.editedRun && (
        <ManualRunDetailsDialog
          projectId={projectId}
          mode="edit"
          name={editing.editTitle}
          onNameChange={editing.setEditTitle}
          selectedIds={editing.editScenarioIds}
          onSelectionChange={editing.handleEditSelectionChange}
          environment={editing.editEnvironment}
          onEnvironmentChange={editing.setEditEnvironment}
          existing={editing.editedRun.scenarios}
          saving={writesBlocked}
          warning={editing.confirmRemovedResults}
          onClose={editing.handleCloseEdit}
          onSubmit={editing.saveRunDetails}
        />
      )}
      {details.deleteOpen && (
        <DeleteManualRunDialog
          title={run?.title}
          scenarioCount={deleteScenarioCount}
          marked={details.marked}
          writesBlocked={writesBlocked}
          onCancel={details.cancelDelete}
          onDelete={details.deleteSelectedRun}
        />
      )}
      {details.completionOpen && (
        <CompleteManualRunDialog
          untestedCount={details.untestedCount}
          scenarioCount={scenarioCount}
          writesBlocked={writesBlocked}
          cancelRef={details.cancelRef}
          triggerRef={details.completionTriggerRef}
          onCancel={details.cancelCompletion}
          onComplete={details.complete}
        />
      )}
    </Flex>
  );
};
