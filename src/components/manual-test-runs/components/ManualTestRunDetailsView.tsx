// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, Heading, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { FiArrowLeft, FiEdit2 } from 'react-icons/fi';
import { LuBan, LuCheck, LuCircleHelp, LuCircleX, LuSkipForward } from 'react-icons/lu';
import type { IconType } from 'react-icons';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { Input, Link, NativeSelect, Textarea, Tooltip, Wrap } from '@/components/ui';
import type { ActiveUserDirectoryEntry, ManualTestRunRead, ManualTestRunStepRead, ManualTestRunStepStatus } from '@/redux/apis/generatedApi';
import { PATHS } from '@/types/paths';
import { getTestScenarioDetailPath } from '@/components/test-scenarios/constants';
import { extractApiError } from '@/utils/apiErrors';

import { MANUAL_TEST_RUN_STEP_STATUSES } from '../types';
import { getManualTestRunProgressCounts, isManualTestRunPassedEligible } from '../utils';
import { ManualTestRunCompletionDialog } from './ManualTestRunCompletionDialog';
import { useManualTestRunExecution } from '../hooks/useManualTestRunExecution';

const formatDate = (timestamp: string | null) => (timestamp ? new Date(timestamp).toLocaleString('en-US') : 'Not available');
const formatLabel = (value: string) => value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const snapshotFields = [
  ['Details', 'details'],
  ['Objective', 'objective'],
  ['Preconditions', 'preconditions'],
  ['Test data', 'testData'],
  ['Expected result', 'expectedResult'],
  ['Scenario notes', 'scenarioNotes'],
] as const;

const stepStatusVisuals: Record<ManualTestRunStepStatus, { Icon: IconType; color: string; label: string }> = {
  not_started: { Icon: LuCircleHelp, color: 'status.neutral.icon', label: 'Not started' },
  passed: { Icon: LuCheck, color: 'status.success.icon', label: 'Passed' },
  failed: { Icon: LuCircleX, color: 'status.error.icon', label: 'Failed' },
  blocked: { Icon: LuBan, color: 'status.warning.icon', label: 'Blocked' },
  skipped: { Icon: LuSkipForward, color: 'status.neutral.icon', label: 'Skipped' },
};

interface ManualTestRunProgressProps {
  steps: ManualTestRunStepRead[];
  dirtyStepIds: string[];
  onNavigate: (stepId: string) => void;
}

const ManualTestRunProgress = ({ steps, dirtyStepIds, onNavigate }: ManualTestRunProgressProps) => {
  const counts = getManualTestRunProgressCounts(steps);
  const dirtyIds = new Set(dirtyStepIds);

  return (
    <Box as="section" aria-labelledby="manual-test-run-progress-heading" p={{ base: 4, md: 6 }} borderWidth="1px" borderColor="border.subtle" borderRadius="md">
      <VStack align="stretch" gap={4}>
        <HStack justify="space-between" align="start" gap={4} flexWrap="wrap">
          <Heading id="manual-test-run-progress-heading" size="md">Step progress</Heading>
          <Text color="text.secondary">
            {counts.total === 0 ? 'No steps in this run' : `${counts.submitted} of ${counts.total} steps submitted`}
          </Text>
        </HStack>
        {counts.total > 0 && (
          <Box display="flex" alignItems="center" flexWrap="wrap" gap={2}>
            {steps.map((step, index) => {
              const visual = stepStatusVisuals[step.status];
              const hasDraft = dirtyIds.has(step.id);
              const label = `Step ${index + 1} · ${visual.label}${hasDraft ? ' · Unsaved changes' : ''}`;

              return (
                <HStack key={step.id} gap={2}>
                  <Tooltip content={label}>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      borderRadius="full"
                      minW={10}
                      h={10}
                      px={0}
                      borderColor={visual.color}
                      color={visual.color}
                      outline={hasDraft ? '2px solid' : undefined}
                      outlineColor={hasDraft ? 'status.warning.icon' : undefined}
                      outlineOffset={hasDraft ? '2px' : undefined}
                      aria-label={label}
                      title={label}
                      onClick={() => onNavigate(step.id)}
                    >
                      <Icon as={visual.Icon} aria-hidden="true" boxSize={5} />
                    </Button>
                  </Tooltip>
                  {index < steps.length - 1 && <Box aria-hidden="true" w={{ base: 4, sm: 8 }} h="1px" bg="border.subtle" />}
                </HStack>
              );
            })}
          </Box>
        )}
        {counts.total > 0 && (
          <HStack gap={4} flexWrap="wrap" color="text.secondary" aria-label="Saved step result counts">
            <Text>Passed: {counts.passed}</Text>
            <Text>Failed: {counts.failed}</Text>
            <Text>Blocked: {counts.blocked}</Text>
            <Text>Skipped: {counts.skipped}</Text>
          </HStack>
        )}
      </VStack>
    </Box>
  );
};

export interface ManualTestRunDetailsViewProps {
  projectId: string;
  runId: string;
  run: ManualTestRunRead;
  setPersistedRun: (run: ManualTestRunRead) => void;
  refetch: () => Promise<ManualTestRunRead | undefined>;
  onBack: () => void;
  onRetest?: (trigger: HTMLButtonElement) => void;
  isRetesting?: boolean;
  activeUsers?: ActiveUserDirectoryEntry[];
  isLoadingActiveUsers: boolean;
  isActiveUsersError: boolean;
  onLoadActiveUsers: () => void;
  onRetryActiveUsers: () => void;
  isReassigningExecutor: boolean;
  onReassignExecutor: (userId: string) => Promise<ManualTestRunRead | undefined>;
  onViewSourceHistory?: () => void;
}

export const ManualTestRunDetailsView = ({
  projectId,
  runId,
  run,
  setPersistedRun,
  refetch,
  onBack,
  onRetest,
  isRetesting = false,
  activeUsers,
  isLoadingActiveUsers,
  isActiveUsersError,
  onLoadActiveUsers,
  onRetryActiveUsers,
  isReassigningExecutor,
  onReassignExecutor,
  onViewSourceHistory,
}: ManualTestRunDetailsViewProps) => {
  const completionTriggerRef = useRef<HTMLButtonElement>(null);
  const executorEditTriggerRef = useRef<HTMLButtonElement>(null);
  const stepHeadingRefs = useRef<Record<string, HTMLHeadingElement | null>>({});
  const wasCompletionOpen = useRef(false);
  const isMounted = useRef(true);
  const latestScope = useRef(`${projectId}:${runId}`);
  latestScope.current = `${projectId}:${runId}`;
  const [executorDraft, setExecutorDraft] = useState(run.executedById ?? '');
  const [isExecutorEditorOpen, setIsExecutorEditorOpen] = useState(false);
  const [executorFeedback, setExecutorFeedback] = useState<{
    status: 'success' | 'error';
    title: string;
    description?: string;
  }>();
  const execution = useManualTestRunExecution({ projectId, runId, run, setPersistedRun, refetch });
  const orderedSteps = [...execution.savedRun.steps].sort((left, right) => left.position - right.position);

  useEffect(() => {
    if (execution.isCompletionOpen) {
      wasCompletionOpen.current = true;
      return;
    }
    if (wasCompletionOpen.current) {
      wasCompletionOpen.current = false;
      completionTriggerRef.current?.focus();
    }
  }, [execution.isCompletionOpen]);

  const readOnly = execution.isReadOnly;
  const isPending = Boolean(execution.pendingWrite);
  const isPassedEligible = isManualTestRunPassedEligible(execution.savedRun.steps);
  const focusStep = (stepId: string) => {
    const heading = stepHeadingRefs.current[stepId];
    if (typeof heading?.scrollIntoView === 'function') heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
    heading?.focus();
  };

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    setExecutorDraft(run.executedById ?? '');
    setIsExecutorEditorOpen(false);
  }, [run.executedById, run.id, run.projectId]);

  useEffect(() => {
    setExecutorFeedback(undefined);
  }, [run.id, run.projectId]);

  const saveExecutor = async () => {
    const scope = `${projectId}:${runId}`;
    if (
      !executorDraft ||
      executorDraft === execution.savedRun.executedById ||
      !activeUsers?.some((user) => user.id === executorDraft) ||
      execution.pendingWrite ||
      execution.recoveryBlocked ||
      isReassigningExecutor
    ) return;

    setExecutorFeedback(undefined);
    try {
      const response = await onReassignExecutor(executorDraft);
      if (!response) return;
      if (!isMounted.current || latestScope.current !== scope || response.id !== runId || response.projectId !== projectId) return;

      setExecutorDraft(response.executedById ?? '');
      setExecutorFeedback({
        status: 'success',
        title: 'Executor updated.',
        description: 'Execution controls now follow the saved Executor assignment.',
      });
      setIsExecutorEditorOpen(false);
      executorEditTriggerRef.current?.focus();
    } catch (error) {
      if (!isMounted.current || latestScope.current !== scope) return;
      setExecutorFeedback({
        status: 'error',
        title: 'Executor was not changed.',
        description: extractApiError(error as FetchBaseQueryError),
      });
    }
  };

  const assignableUserIds = new Set(activeUsers?.map((user) => user.id) ?? []);
  const executorItems = [
    ...(execution.savedRun.executedById && !assignableUserIds.has(execution.savedRun.executedById)
      ? [{
          value: execution.savedRun.executedById,
          label: `${execution.savedRun.executedBy?.name ?? 'Saved Executor'} (inactive or unavailable)`,
          disabled: true,
        }]
      : []),
    ...(executorDraft && executorDraft !== execution.savedRun.executedById && !assignableUserIds.has(executorDraft)
      ? [{ value: executorDraft, label: 'Selected user is no longer active', disabled: true }]
      : []),
    ...(activeUsers?.map((user) => ({
      value: user.id,
      label: `${user.name} (${user.email})`,
    })) ?? []),
  ];
  const canSaveExecutor = Boolean(
    executorDraft &&
    executorDraft !== execution.savedRun.executedById &&
    assignableUserIds.has(executorDraft) &&
    !isLoadingActiveUsers &&
    !isActiveUsersError &&
    !isReassigningExecutor &&
    !execution.pendingWrite &&
    !execution.recoveryBlocked,
  );

  return (
    <VStack align="stretch" gap={6} mx={{ base: 4, md: 6 }} my={4}>
      <HStack justify="space-between" align="start" gap={4} flexWrap="wrap">
        <HStack align="center" gap={2}>
          <Link
            href={PATHS.TEST_SCENARIOS}
            aria-label="Return to Test Scenarios"
            title="Return to Test Scenarios"
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            p={2}
            borderRadius="md"
            color="text.active"
            _hover={{ bg: 'bg.subtle' }}
            onClick={(event) => {
              event.preventDefault();
              onBack();
            }}
          >
            <FiArrowLeft size={18} aria-hidden="true" />
          </Link>
          <VStack align="start" gap={0}>
            <Heading size="lg">{execution.savedRun.title}</Heading>
            <Text color="text.secondary">Run key: {execution.savedRun.runKey ?? 'N/A'}</Text>
          </VStack>
        </HStack>
        <HStack gap={2} flexWrap="wrap">
          {!readOnly && (
            <Button
              ref={completionTriggerRef}
              type="button"
              onClick={execution.requestCompletion}
              disabled={isPending || execution.recoveryBlocked}
            >
              Complete run
            </Button>
          )}
          {execution.savedRun.status !== 'in_progress' && onRetest && (
            <Button
              type="button"
              onClick={(event) => {
                if (execution.canStartRetest()) onRetest(event.currentTarget);
              }}
              loading={isRetesting}
              disabled={isRetesting || !execution.savedRun.testScenarioId}
            >
              Retest
            </Button>
          )}
        </HStack>
      </HStack>

      <HStack gap={6} flexWrap="wrap" color="text.secondary">
        <Text><Text as="span" fontWeight="semibold" color="text.main">Status:</Text> {formatLabel(execution.savedRun.status)}</Text>
        <Text><Text as="span" fontWeight="semibold" color="text.main">Started:</Text> {formatDate(execution.savedRun.startedAt)}</Text>
        <Text><Text as="span" fontWeight="semibold" color="text.main">Completed:</Text> {formatDate(execution.savedRun.completedAt)}</Text>
        <HStack gap={2} flexWrap="wrap">
          <Text>
            <Text as="span" fontWeight="semibold" color="text.main">Executor:</Text>{' '}
            {execution.savedRun.executedBy?.name ?? 'Executor unavailable'}
            {execution.savedRun.executedBy?.email ? ` (${execution.savedRun.executedBy.email})` : ''}
          </Text>
          <Button
            ref={executorEditTriggerRef}
            type="button"
            size="sm"
            variant="ghost"
            disabled={isReassigningExecutor}
            aria-expanded={isExecutorEditorOpen}
            aria-controls="manual-test-run-executor-editor"
            onClick={() => {
              if (isExecutorEditorOpen) {
                setExecutorDraft(execution.savedRun.executedById ?? '');
                setExecutorFeedback(undefined);
                setIsExecutorEditorOpen(false);
                return;
              }
              setExecutorDraft(execution.savedRun.executedById ?? '');
              setExecutorFeedback(undefined);
              setIsExecutorEditorOpen(true);
              onLoadActiveUsers();
            }}
          >
            <FiEdit2 aria-hidden="true" />
            Change Executor
          </Button>
          {executorFeedback?.status === 'success' && (
            <Text role="status" fontSize="sm" color="status.success.text">{executorFeedback.title}</Text>
          )}
        </HStack>
      </HStack>

      {isExecutorEditorOpen && (
        <Box id="manual-test-run-executor-editor" as="section" aria-labelledby="manual-test-run-executor-heading" p={{ base: 4, md: 5 }} borderWidth="1px" borderColor="border.subtle" borderRadius="md">
          <VStack align="stretch" gap={3} maxW="560px">
            <Heading id="manual-test-run-executor-heading" size="md">Executor assignment</Heading>
            {isLoadingActiveUsers && <Text role="status">Loading active users…</Text>}
            {isActiveUsersError && (
              <Alert.Root status="error" role="alert">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>Could not load active users.</Alert.Title>
                  <Alert.Description>Retry to choose an Executor.</Alert.Description>
                </Alert.Content>
              </Alert.Root>
            )}
            {isActiveUsersError && <Button type="button" variant="outline" onClick={onRetryActiveUsers}>Retry active users</Button>}
            {activeUsers && !isLoadingActiveUsers && !isActiveUsersError && (
              <>
                <NativeSelect
                  name="manual-test-run-executor"
                  label="Executor"
                  value={executorDraft}
                  onChange={(event) => {
                    setExecutorDraft(event.target.value);
                    setExecutorFeedback(undefined);
                  }}
                  disabled={isReassigningExecutor || Boolean(execution.pendingWrite) || execution.recoveryBlocked}
                  placeholder="Select an active user"
                  items={executorItems}
                  w="100%"
                />
                {activeUsers.length === 0 && <Text color="text.secondary">No active users are available to assign.</Text>}
                <HStack gap={3} flexWrap="wrap">
                  <Button
                    type="button"
                    onClick={() => void saveExecutor()}
                    loading={isReassigningExecutor}
                    loadingText="Saving…"
                    disabled={!canSaveExecutor}
                  >
                    Save Executor
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isReassigningExecutor}
                    onClick={() => {
                      setExecutorDraft(execution.savedRun.executedById ?? '');
                      setExecutorFeedback(undefined);
                      setIsExecutorEditorOpen(false);
                      executorEditTriggerRef.current?.focus();
                    }}
                  >
                    Cancel
                  </Button>
                  {executorDraft !== (execution.savedRun.executedById ?? '') && (
                    <Text role="status" fontSize="sm" color="text.secondary">Unsaved Executor selection</Text>
                  )}
                </HStack>
              </>
            )}
            {executorFeedback?.status === 'error' && (
              <Alert.Root status="error" role="alert" aria-live="polite">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>{executorFeedback.title}</Alert.Title>
                  {executorFeedback.description && <Alert.Description>{executorFeedback.description}</Alert.Description>}
                </Alert.Content>
              </Alert.Root>
            )}
          </VStack>
        </Box>
      )}

      {execution.feedback && (
        <Alert.Root status={execution.feedback.status} role="alert" aria-live="polite">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>{execution.feedback.title}</Alert.Title>
            {execution.feedback.description && <Alert.Description>{execution.feedback.description}</Alert.Description>}
          </Alert.Content>
        </Alert.Root>
      )}
      {readOnly && execution.isDirty && (
        <Alert.Root status="warning" role="status">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Unsaved execution changes are kept for review.</Alert.Title>
            <Alert.Description>These local changes were not submitted and will not be saved automatically. Copy anything you need before leaving this run.</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
      {readOnly && execution.savedRun.status === 'in_progress' && (
        <Alert.Root status="info" role="status">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>View-only run</Alert.Title>
            <Alert.Description>Execution controls in this client are available to the assigned Executor. Change the Executor above to continue this run as another user.</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
      {execution.savedRun.status !== 'in_progress' && (
        <Alert.Root status={execution.savedRun.testScenarioId ? 'info' : 'warning'} role="status">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>{execution.savedRun.testScenarioId ? 'Retest uses the current scenario' : 'Source deleted'}</Alert.Title>
            <Alert.Description>
              {execution.savedRun.testScenarioId
                ? 'Retest starts a fresh run from the current saved scenario content and steps. It does not modify this historical snapshot or copy its outcomes and notes.'
                : 'This saved snapshot remains available, but a fresh run cannot be started because its source scenario was deleted.'}
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
      <HStack gap={4} flexWrap="wrap">
        {execution.savedRun.testScenarioId ? (
          <>
            <Link href={getTestScenarioDetailPath(execution.savedRun.testScenarioId)}>View current scenario</Link>
            <Text color="text.secondary" fontSize="sm">Current content may differ from this saved snapshot.</Text>
          </>
        ) : (
          <Text color="text.secondary">Source deleted</Text>
        )}
        {onViewSourceHistory && <Button variant="plain" onClick={onViewSourceHistory}>View source history</Button>}
      </HStack>
      {execution.recoveryBlocked && (
        <HStack justify="end">
          <Button type="button" variant="outline" onClick={() => void execution.retryAuthoritativeRecovery()}>
            Retry refresh
          </Button>
        </HStack>
      )}

      <ManualTestRunProgress steps={orderedSteps} dirtyStepIds={execution.dirtyStepIds} onNavigate={focusStep} />

      <Wrap w="100%" p={{ base: 4, md: 6 }}>
        <VStack align="stretch" w="100%" gap={6}>
          {execution.canEditRunKey && (
            <VStack align="stretch" gap={3} maxW="560px" aria-label="Run key editing">
              <Input
                name="run-key"
                label="Edit Run key"
                value={execution.runKeyDraft}
                onChange={(event) => execution.setRunKeyDraft(event.target.value)}
                readOnly={execution.pendingWrite?.kind === 'metadata' || execution.isCompletionOpen}
                fieldProps={{ helperText: 'Up to 100 characters. Duplicate keys are allowed.' }}
                error={execution.runKeyError}
              />
              <HStack gap={3} flexWrap="wrap">
                <Button
                  type="button"
                  onClick={() => void execution.saveRunKey()}
                  loading={execution.pendingWrite?.kind === 'metadata'}
                  loadingText="Saving…"
                  disabled={!execution.isRunKeyDirty || isPending || execution.recoveryBlocked || execution.isCompletionOpen}
                >
                  Save Run key
                </Button>
                {execution.isRunKeyDirty && !isPending && !execution.recoveryBlocked && !execution.isCompletionOpen && (
                  <Button type="button" variant="ghost" onClick={execution.discardRunKey}>
                    Discard Run key
                  </Button>
                )}
                <Text role="status" fontSize="sm" color="text.secondary">
                  {execution.pendingWrite?.kind === 'metadata'
                    ? 'Saving…'
                    : execution.isRunKeyDirty
                      ? 'Unsaved changes'
                      : 'Saved'}
                </Text>
              </HStack>
            </VStack>
          )}
          <VStack align="stretch" gap={4}>
            <Heading size="md">Scenario snapshot</Heading>
            <Box>
              <Text fontWeight="semibold">Source scenario key at start</Text>
              <Text whiteSpace="pre-wrap" color="text.secondary">
                {execution.savedRun.sourceScenarioKey ?? 'N/A'}
              </Text>
            </Box>
            {snapshotFields.map(([label, field]) => (
              <Box key={field}>
                <Text fontWeight="semibold">{label}</Text>
                <Text whiteSpace="pre-wrap" color="text.secondary">{execution.savedRun[field] ?? 'No value'}</Text>
              </Box>
            ))}
          </VStack>

          <VStack align="stretch" gap={3}>
            <Heading size="md">Execution notes</Heading>
            <Textarea
              name="execution-notes"
              aria-label="Execution notes"
              value={execution.runNotesDraft}
              onChange={(event) => execution.setRunNotesDraft(event.target.value)}
              readOnly={readOnly || execution.pendingWrite?.kind === 'run'}
              fieldProps={{
                helperText: readOnly
                  ? execution.savedRun.status === 'in_progress'
                    ? 'View-only run; saved notes cannot be edited.'
                    : 'Execution results are frozen. The executor can still edit the Run key.'
                  : 'Save notes explicitly, or press Ctrl/Cmd + Enter.',
              }}
              onKeyDown={(event) => {
                if (!readOnly && execution.isRunNotesDirty && !isPending && !execution.recoveryBlocked && event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                  event.preventDefault();
                  void execution.saveRunNotes();
                }
              }}
              rows={5}
            />
            {!readOnly && (
              <HStack justify="start" flexWrap="wrap">
                <Button type="button" onClick={() => void execution.saveRunNotes()} loading={execution.pendingWrite?.kind === 'run'} loadingText="Saving…" disabled={!execution.isRunNotesDirty || isPending || execution.recoveryBlocked}>Save execution notes</Button>
                <Button type="button" variant="ghost" onClick={execution.discardRunNotes} disabled={!execution.isRunNotesDirty || isPending || execution.recoveryBlocked}>Discard</Button>
                <Text role="status" fontSize="sm" color="text.secondary">{execution.pendingWrite?.kind === 'run' ? 'Saving…' : execution.isRunNotesDirty ? 'Unsaved changes' : 'Saved'}</Text>
              </HStack>
            )}
          </VStack>

          <VStack align="stretch" gap={3}>
            <Heading size="md">Steps</Heading>
            {orderedSteps.length === 0 ? (
              <Text color="text.muted">No copied steps in this run.</Text>
            ) : (
              orderedSteps.map((step, index) => {
                const draft = execution.stepDrafts[step.id] ?? { status: step.status, notes: '' };
                const stepDirty = execution.dirtyStepIds.includes(step.id);
                const stepPending = execution.pendingWrite?.kind === 'step' && execution.pendingWrite.stepId === step.id;

                return (
                  <Box key={step.id} p={4} borderWidth="1px" borderColor="border.subtle" borderRadius="md">
                    <VStack align="stretch" gap={3}>
                      <Heading
                        as="h3"
                        size="sm"
                        id={`manual-test-run-step-${step.id}`}
                        tabIndex={-1}
                        ref={(heading) => {
                          stepHeadingRefs.current[step.id] = heading;
                        }}
                      >
                        Step {index + 1}
                      </Heading>
                      <Text whiteSpace="pre-wrap"><Text as="span" fontWeight="medium">Action: </Text>{step.action}</Text>
                      <Text whiteSpace="pre-wrap" color="text.secondary"><Text as="span" fontWeight="medium" color="text.main">Expected result: </Text>{step.expectedResult ?? 'No expected result'}</Text>
                      <HStack align="end" gap={3} w={{ base: '100%', sm: '260px' }}>
                        <Box flex="1" minW={0}>
                          <NativeSelect
                            name={`step-${step.id}-status`}
                            label="Outcome"
                            value={draft.status}
                            onChange={(event) => execution.setStepStatus(step.id, event.target.value as typeof draft.status)}
                            disabled={readOnly || execution.recoveryBlocked || stepPending}
                            items={MANUAL_TEST_RUN_STEP_STATUSES.map((status) => ({ value: status, label: formatLabel(status) }))}
                            w="100%"
                          />
                        </Box>
                        <Icon
                          as={stepStatusVisuals[draft.status].Icon}
                          aria-label={`${stepStatusVisuals[draft.status].label} outcome`}
                          aria-hidden={false}
                          color={stepStatusVisuals[draft.status].color}
                          boxSize={5}
                          mb={2}
                          flexShrink={0}
                        />
                      </HStack>
                      <Textarea
                        name={`step-${step.id}-notes`}
                        aria-label={`Notes for step ${index + 1}`}
                        label="Step notes"
                        value={draft.notes}
                        onChange={(event) => execution.setStepNotes(step.id, event.target.value)}
                        readOnly={readOnly || execution.recoveryBlocked || stepPending}
                        onKeyDown={(event) => {
                          if (!readOnly && stepDirty && !isPending && !execution.recoveryBlocked && event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                            event.preventDefault();
                            void execution.saveStep(step.id);
                          }
                        }}
                        rows={3}
                        maxW={{ base: '100%', md: '560px' }}
                      />
                      {!readOnly && (
                        <HStack justify="start" align="center" gap={3} w={{ base: '100%', md: '560px' }} flexWrap="wrap">
                          <Button
                            type="button"
                            onClick={() => void execution.saveStep(step.id)}
                            disabled={isPending || execution.recoveryBlocked || !stepDirty}
                          >
                            {step.status === 'not_started' ? 'Submit' : 'Submit changes'}
                          </Button>
                          {stepPending ? (
                            <Text color="text.secondary" aria-live="polite">Saving</Text>
                          ) : execution.stepSaveStates[step.id] === 'not_saved' ? (
                            <Text color="status.error.text" aria-live="polite">Not saved</Text>
                          ) : stepDirty ? (
                            <Text color="text.secondary">Unsaved changes</Text>
                          ) : execution.stepSaveStates[step.id] === 'submitted' ? (
                            <Text color="status.success.text">Submitted: {formatLabel(step.status)}</Text>
                          ) : execution.stepSaveStates[step.id] === 'saved_notes' ? (
                            <Text color="status.success.text">Saved notes</Text>
                          ) : null}
                          {stepDirty && (
                            <Button type="button" variant="ghost" onClick={() => execution.discardStep(step.id)} disabled={isPending || execution.recoveryBlocked}>
                              Discard changes
                            </Button>
                          )}
                        </HStack>
                      )}
                    </VStack>
                  </Box>
                );
              })
            )}
          </VStack>
        </VStack>
      </Wrap>

      {execution.isCompletionOpen && (
        <ManualTestRunCompletionDialog
          isPassedEligible={isPassedEligible}
          onCancel={execution.closeCompletion}
          onConfirm={execution.confirmCompletion}
        />
      )}
    </VStack>
  );
};
