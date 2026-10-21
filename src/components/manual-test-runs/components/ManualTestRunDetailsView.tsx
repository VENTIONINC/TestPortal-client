// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useRef, useState } from 'react';
import { Alert, Badge, Box, Button, Grid, Heading, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { FiArrowLeft, FiClock, FiEdit2, FiFileText } from 'react-icons/fi';
import { LuBan, LuCheck, LuCircleHelp, LuCircleX, LuSkipForward } from 'react-icons/lu';
import type { IconType } from 'react-icons';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { Input, Link, NativeSelect, Textarea, Tooltip, Wrap } from '@/components/ui';
import type {
  ActiveUserDirectoryEntry,
  ManualTestRunRead,
  ManualTestRunStepRead,
  ManualTestRunStepStatus,
} from '@/redux/apis/generatedApi';
import { PATHS } from '@/types/paths';
import { getTestScenarioDetailPath } from '@/components/test-scenarios/constants';
import { extractApiError } from '@/utils/apiErrors';

import { MANUAL_TEST_RUN_STEP_STATUSES } from '../types';
import { getManualTestRunProgressCounts, isManualTestRunPassedEligible } from '../utils';
import { ManualTestRunCompletionDialog } from './ManualTestRunCompletionDialog';
import { useManualTestRunExecution } from '../hooks/useManualTestRunExecution';

const formatDate = (timestamp: string | null) =>
  timestamp ? new Date(timestamp).toLocaleString('en-US') : 'Not available';
const formatLabel = (value: string) => value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const snapshotFields = [
  ['Details', 'details'],
  ['Objective', 'objective'],
  ['Preconditions', 'preconditions'],
  ['Test data', 'testData'],
  ['Expected result', 'expectedResult'],
  ['Scenario notes', 'scenarioNotes'],
] as const;
const environmentFields = [
  ['Browser', 'browser'],
  ['Operating system', 'operatingSystem'],
  ['Device', 'device'],
  ['API environment', 'apiEnvironment'],
  ['Build', 'build'],
  ['Deployment', 'deployment'],
] as const;

const stepStatusVisuals: Record<ManualTestRunStepStatus, { Icon: IconType; color: string; label: string }> = {
  not_started: { Icon: LuCircleHelp, color: 'text.secondary', label: 'Not started' },
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
    <Box
      as="section"
      aria-labelledby="manual-test-run-progress-heading"
      p={4}
      borderWidth="1px"
      borderColor="border.subtle"
      borderRadius="xl"
      bg="bg.section"
    >
      <VStack align="stretch" gap={4}>
        <HStack justify="space-between" align="start" gap={4} flexWrap="wrap">
          <Heading id="manual-test-run-progress-heading" size="md">
            Step progress
          </Heading>
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
                      minW={16}
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
                      <Text as="span" fontWeight="semibold">
                        {index + 1}
                      </Text>
                      <Icon as={visual.Icon} aria-hidden="true" boxSize={4} />
                    </Button>
                  </Tooltip>
                  {index < steps.length - 1 && (
                    <Box aria-hidden="true" w={{ base: 4, sm: 8 }} h="1px" bg="border.main" />
                  )}
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
  backHref?: string;
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
  backHref = PATHS.TEST_SCENARIOS,
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
  const stepsDisclosureInitialized = useRef(false);
  const runKeyInputRef = useRef<HTMLInputElement>(null);
  const runKeyTriggerRef = useRef<HTMLButtonElement>(null);
  const wasSavingRunKey = useRef(false);
  const restoreRunKeyFocus = useRef(false);
  const completionTriggerRef = useRef<HTMLButtonElement>(null);
  const executorEditTriggerRef = useRef<HTMLButtonElement>(null);
  const stepHeadingRefs = useRef<Record<string, HTMLHeadingElement | null>>({});
  const wasCompletionOpen = useRef(false);
  const isMounted = useRef(true);
  const latestScope = useRef(`${projectId}:${runId}`);
  latestScope.current = `${projectId}:${runId}`;
  const [executorDraft, setExecutorDraft] = useState(run.executedById ?? '');
  const [isRunKeyEditorOpen, setIsRunKeyEditorOpen] = useState(false);
  const [activeStepId, setActiveStepId] = useState<string>();
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
  const cancelRunKey = () => {
    execution.discardRunKey();
    restoreRunKeyFocus.current = true;
    setIsRunKeyEditorOpen(false);
  };
  useEffect(() => {
    if (isRunKeyEditorOpen) runKeyInputRef.current?.focus();
    else if (restoreRunKeyFocus.current) {
      runKeyTriggerRef.current?.focus();
      restoreRunKeyFocus.current = false;
    }
  }, [isRunKeyEditorOpen]);
  useEffect(() => {
    const saving = execution.pendingWrite?.kind === 'metadata';
    if (
      wasSavingRunKey.current &&
      !saving &&
      execution.feedback?.title === 'Run key saved.' &&
      !execution.isRunKeyDirty
    ) {
      restoreRunKeyFocus.current = true;
      setIsRunKeyEditorOpen(false);
    }
    wasSavingRunKey.current = saving;
  }, [execution.pendingWrite, execution.feedback, execution.isRunKeyDirty]);
  const isPassedEligible = isManualTestRunPassedEligible(execution.savedRun.steps);
  const focusStep = (stepId: string) => {
    const heading = stepHeadingRefs.current[stepId];
    if (typeof heading?.scrollIntoView === 'function')
      heading.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        block: 'start',
      });
    setActiveStepId(stepId);
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
    )
      return;

    setExecutorFeedback(undefined);
    try {
      const response = await onReassignExecutor(executorDraft);
      if (!response) return;
      if (
        !isMounted.current ||
        latestScope.current !== scope ||
        response.id !== runId ||
        response.projectId !== projectId
      )
        return;

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
      ? [
          {
            value: execution.savedRun.executedById,
            label: `${execution.savedRun.executedBy?.name ?? 'Saved Executor'} (inactive or unavailable)`,
            disabled: true,
          },
        ]
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
        <HStack align="start" gap={2}>
          <Link
            href={backHref}
            aria-label={backHref === PATHS.MANUAL_TEST_RUNS ? 'Return to Manual Test Runs' : 'Return to Test Scenarios'}
            title={backHref === PATHS.MANUAL_TEST_RUNS ? 'Return to Manual Test Runs' : 'Return to Test Scenarios'}
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            p={2}
            mt={1}
            flexShrink={0}
            borderRadius="md"
            color="text.active"
            _hover={{ bg: 'bg.subtle' }}
            onClick={(event) => {
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              event.preventDefault();
              onBack();
            }}
          >
            <FiArrowLeft size={18} aria-hidden="true" />
          </Link>
          <VStack align="start" gap={0}>
            <HStack gap={3} flexWrap="wrap">
              <Heading size="lg">{execution.savedRun.title}</Heading>
              <Badge
                colorPalette={
                  execution.savedRun.status === 'passed'
                    ? 'green'
                    : execution.savedRun.status === 'failed'
                      ? 'red'
                      : execution.savedRun.status === 'in_progress'
                        ? 'blue'
                        : 'orange'
                }
                variant="subtle"
                px={3}
                py={1}
                borderRadius="full"
              >
                {formatLabel(execution.savedRun.status)}
              </Badge>
              {execution.savedRun.status !== 'in_progress' && (
                <Text fontSize="sm" color="text.secondary">
                  Results are read-only
                </Text>
              )}
            </HStack>
            <HStack gap={3} flexWrap="wrap">
              {execution.canEditRunKey && isRunKeyEditorOpen ? (
                <VStack align="stretch" gap={1} aria-label="Run key editing" maxW="100%">
                  <HStack gap={2} flexWrap="wrap" align="start">
                    <Text color="text.secondary" pt={1}>
                      Run key:
                    </Text>
                    <Box w={{ base: '100%', sm: '240px' }}>
                      <Input
                        ref={runKeyInputRef}
                        name="run-key"
                        aria-label="Edit Run key"
                        size="sm"
                        value={execution.runKeyDraft}
                        onChange={(event) => execution.setRunKeyDraft(event.target.value)}
                        readOnly={isPending || execution.isCompletionOpen}
                        error={
                          execution.runKeyError ||
                          (execution.feedback?.title === 'Run key was not saved.'
                            ? execution.feedback.description
                            : undefined)
                        }
                        onKeyDown={(event) => {
                          if (event.nativeEvent.isComposing) return;
                          if (event.key === 'Escape' && !isPending) {
                            event.preventDefault();
                            cancelRunKey();
                          }
                          if (
                            event.key === 'Enter' &&
                            execution.isRunKeyDirty &&
                            !isPending &&
                            !execution.recoveryBlocked &&
                            !execution.isCompletionOpen
                          ) {
                            event.preventDefault();
                            void execution.saveRunKey();
                          }
                        }}
                      />
                      <Text fontSize="xs" color="text.secondary" mt={1}>
                        Up to 100 characters. Duplicate keys are allowed.
                      </Text>
                    </Box>
                    <Button
                      size="sm"
                      aria-label="Save Run key"
                      loading={execution.pendingWrite?.kind === 'metadata'}
                      loadingText="Saving…"
                      disabled={
                        !execution.isRunKeyDirty || isPending || execution.recoveryBlocked || execution.isCompletionOpen
                      }
                      onClick={() => void execution.saveRunKey()}
                    >
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" disabled={isPending} onClick={cancelRunKey}>
                      Cancel
                    </Button>
                  </HStack>
                </VStack>
              ) : (
                <HStack gap={2}>
                  <Text color="text.secondary">Run key: {execution.savedRun.runKey ?? 'Not set'}</Text>
                  {execution.canEditRunKey && (
                    <Button
                      ref={runKeyTriggerRef}
                      size="xs"
                      variant="ghost"
                      aria-label="Edit Run key"
                      aria-expanded={false}
                      onClick={() => setIsRunKeyEditorOpen(true)}
                    >
                      <FiEdit2 aria-hidden="true" />
                    </Button>
                  )}
                </HStack>
              )}
            </HStack>
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
        <Text>
          <Text as="span" fontWeight="semibold" color="text.main">
            Started:
          </Text>{' '}
          {formatDate(execution.savedRun.startedAt)}
        </Text>
        {execution.savedRun.completedAt && (
          <Text>
            <Text as="span" fontWeight="semibold" color="text.main">
              Completed:
            </Text>{' '}
            {formatDate(execution.savedRun.completedAt)}
          </Text>
        )}
        <HStack gap={2} flexWrap="wrap">
          <Text>
            <Text as="span" fontWeight="semibold" color="text.main">
              Executor:
            </Text>{' '}
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
            <Text role="status" fontSize="sm" color="status.success.text">
              {executorFeedback.title}
            </Text>
          )}
        </HStack>
      </HStack>

      {isExecutorEditorOpen && (
        <Box
          id="manual-test-run-executor-editor"
          as="section"
          aria-labelledby="manual-test-run-executor-heading"
          p={{ base: 4, md: 5 }}
          borderWidth="1px"
          borderColor="border.main"
          borderRadius="md"
        >
          <VStack align="stretch" gap={3} maxW="560px">
            <Heading id="manual-test-run-executor-heading" size="md">
              Executor assignment
            </Heading>
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
            {isActiveUsersError && (
              <Button type="button" variant="outline" onClick={onRetryActiveUsers}>
                Retry active users
              </Button>
            )}
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
                {activeUsers.length === 0 && (
                  <Text color="text.secondary">No active users are available to assign.</Text>
                )}
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
                    <Text role="status" fontSize="sm" color="text.secondary">
                      Unsaved Executor selection
                    </Text>
                  )}
                </HStack>
              </>
            )}
            {executorFeedback?.status === 'error' && (
              <Alert.Root status="error" role="alert" aria-live="polite">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>{executorFeedback.title}</Alert.Title>
                  {executorFeedback.description && (
                    <Alert.Description>{executorFeedback.description}</Alert.Description>
                  )}
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
            <Alert.Description>
              These local changes were not submitted and will not be saved automatically. Copy anything you need before
              leaving this run.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
      {readOnly && execution.savedRun.status === 'in_progress' && (
        <Alert.Root status="info" role="status">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>View-only run</Alert.Title>
            <Alert.Description>
              Execution controls in this client are available to the assigned Executor. Change the Executor above to
              continue this run as another user.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
      {execution.savedRun.status !== 'in_progress' && (
        <Text fontSize="sm" color="text.secondary">
          {execution.savedRun.testScenarioId ? 'Retest uses the current scenario' : 'Source deleted'}
        </Text>
      )}
      {execution.recoveryBlocked && (
        <HStack justify="end">
          <Button type="button" variant="outline" onClick={() => void execution.retryAuthoritativeRecovery()}>
            Retry refresh
          </Button>
        </HStack>
      )}

      <ManualTestRunProgress steps={orderedSteps} dirtyStepIds={execution.dirtyStepIds} onNavigate={focusStep} />

      <Box
        as="details"
        borderWidth="1px"
        borderColor="border.subtle"
        borderRadius="xl"
        bg="bg.section"
        p={{ base: 4, md: 6 }}
      >
        <Box
          as="summary"
          cursor="pointer"
          fontWeight="semibold"
          _focusVisible={{ outline: '2px solid', outlineColor: 'text.active', outlineOffset: '4px' }}
        >
          Scenario context &amp; environment
        </Box>
        <VStack align="stretch" gap={6} pt={5}>
          <HStack gap={4} flexWrap="wrap">
            {execution.savedRun.testScenarioId ? (
              <>
                <Link
                  href={getTestScenarioDetailPath(execution.savedRun.testScenarioId)}
                  display="inline-flex"
                  alignItems="center"
                  gap={2}
                  h={8}
                  px={3}
                  py={0}
                  borderWidth="1px"
                  borderColor="border.main"
                  borderRadius="md"
                  fontSize="sm"
                  fontWeight="medium"
                  _hover={{ bg: 'bg.hover', textDecoration: 'none' }}
                  _focusVisible={{ outline: '2px solid', outlineColor: 'text.active', outlineOffset: '2px' }}
                >
                  <Icon as={FiFileText} aria-hidden="true" />
                  View current scenario
                </Link>
                <Text color="text.secondary" fontSize="sm">
                  Current content may differ from this saved snapshot.
                </Text>
              </>
            ) : (
              <Text color="text.secondary">Source deleted</Text>
            )}
            {onViewSourceHistory && (
              <Button variant="outline" size="sm" onClick={onViewSourceHistory}>
                <Icon as={FiClock} aria-hidden="true" />
                View source history
              </Button>
            )}
          </HStack>
          <VStack align="stretch" gap={4}>
            <Heading size="md" pb={3} borderBottomWidth="1px" borderColor="border.main">
              Scenario snapshot
            </Heading>
            <Box>
              <Text fontWeight="semibold">Source scenario key at start</Text>
              <Text whiteSpace="pre-wrap" color="text.secondary">
                {execution.savedRun.sourceScenarioKey ?? 'N/A'}
              </Text>
            </Box>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }} gap={6}>
              {snapshotFields.map(([label, field]) => (
                <Box key={field}>
                  <Text fontWeight="semibold">{label}</Text>
                  <Text whiteSpace="pre-wrap" color="text.secondary">
                    {execution.savedRun[field] ?? 'No value'}
                  </Text>
                </Box>
              ))}
            </Grid>
          </VStack>
          <VStack align="stretch" gap={4}>
            <Heading
              id="manual-test-run-environment-heading"
              size="md"
              pb={3}
              borderBottomWidth="1px"
              borderColor="border.main"
            >
              Environment
            </Heading>
            {environmentFields.some(([, key]) => execution.savedRun[key]) ? (
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }} gap={6}>
                {environmentFields
                  .filter(([, key]) => execution.savedRun[key])
                  .map(([label, key]) => (
                    <Box key={key}>
                      <Text fontWeight="semibold">{label}</Text>
                      <Text color="text.secondary" overflowWrap="anywhere">
                        {execution.savedRun[key]}
                      </Text>
                    </Box>
                  ))}
              </Grid>
            ) : (
              <Text color="text.secondary">No environment was recorded for this run.</Text>
            )}
          </VStack>
        </VStack>
      </Box>
      <Box
        as="details"
        ref={(element: HTMLDivElement | null) => {
          if (element && !stepsDisclosureInitialized.current) {
            (element as unknown as HTMLDetailsElement).open = true;
            stepsDisclosureInitialized.current = true;
          }
        }}
        w="100%"
        p={{ base: 4, md: 6 }}
        bg="bg.section"
        shadow="sm"
        borderRadius="12px"
      >
        <Box
          as="summary"
          cursor="pointer"
          fontWeight="semibold"
          _focusVisible={{ outline: '2px solid', outlineColor: 'text.active', outlineOffset: '4px' }}
        >
          Steps
        </Box>
        <VStack id="manual-test-run-steps-content" align="stretch" w="100%" gap={6} pt={5}>
          <VStack align="stretch" gap={5}>
            {orderedSteps.length === 0 ? (
              <Text color="text.muted">No copied steps in this run.</Text>
            ) : (
              orderedSteps.map((step, index) => {
                const draft = execution.stepDrafts[step.id] ?? { status: step.status, notes: '' };
                const stepDirty = execution.dirtyStepIds.includes(step.id);
                const stepPending =
                  execution.pendingWrite?.kind === 'step' && execution.pendingWrite.stepId === step.id;

                return (
                  <Box
                    key={step.id}
                    p={{ base: 4, md: 6 }}
                    borderWidth="1px"
                    borderColor={activeStepId === step.id ? 'text.active' : 'border.main'}
                    borderRadius="lg"
                    bg="bg.card"
                    overflowWrap="anywhere"
                  >
                    <VStack align="stretch" gap={4}>
                      <HStack justify="space-between" align="center" gap={3} flexWrap="wrap">
                        <HStack gap={3} flexWrap="wrap">
                          <Box
                            aria-hidden="true"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            w={9}
                            h={9}
                            borderRadius="full"
                            bg="blue.subtle"
                            color="text.active"
                            fontWeight="semibold"
                            flexShrink={0}
                          >
                            {index + 1}
                          </Box>
                          <Heading
                            as="h3"
                            size="sm"
                            srOnly
                            id={`manual-test-run-step-${step.id}`}
                            tabIndex={-1}
                            scrollMarginTop="100px"
                            ref={(heading) => {
                              stepHeadingRefs.current[step.id] = heading;
                            }}
                          >
                            Step {index + 1}
                          </Heading>
                          <Badge
                            variant="subtle"
                            colorPalette={
                              step.status === 'passed'
                                ? 'green'
                                : step.status === 'failed'
                                  ? 'red'
                                  : step.status === 'blocked'
                                    ? 'orange'
                                    : 'gray'
                            }
                          >
                            <Icon as={stepStatusVisuals[step.status].Icon} aria-hidden="true" />
                            {stepStatusVisuals[step.status].label}
                          </Badge>
                        </HStack>
                        <HStack gap={3}>
                          {stepDirty && (
                            <Text fontSize="sm" color="status.warning.text">
                              Unsaved draft
                            </Text>
                          )}
                        </HStack>
                      </HStack>
                      <Grid
                        templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }}
                        gap={6}
                        pb={4}
                        borderBottomWidth="1px"
                        borderColor="border.main"
                      >
                        <Box>
                          <Text fontWeight="medium" mb={2}>
                            Action
                          </Text>
                          <Text whiteSpace="pre-wrap" color="text.secondary">
                            {step.action}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontWeight="medium" mb={2}>
                            Expected result
                          </Text>
                          <Text whiteSpace="pre-wrap" color="text.secondary">
                            {step.expectedResult ?? 'No expected result'}
                          </Text>
                        </Box>
                      </Grid>
                      {!readOnly && (
                        <HStack align="end" gap={3} w={{ base: '100%', sm: '260px' }}>
                          <Box flex="1" minW={0}>
                            <NativeSelect
                              name={`step-${step.id}-status`}
                              label="Outcome"
                              value={draft.status}
                              onChange={(event) =>
                                execution.setStepStatus(step.id, event.target.value as typeof draft.status)
                              }
                              disabled={readOnly || execution.recoveryBlocked || stepPending}
                              items={MANUAL_TEST_RUN_STEP_STATUSES.map((status) => ({
                                value: status,
                                label: formatLabel(status),
                              }))}
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
                      )}
                      <Textarea
                        name={`step-${step.id}-notes`}
                        aria-label={`Notes for step ${index + 1}`}
                        label="Step notes"
                        value={draft.notes}
                        onChange={(event) => execution.setStepNotes(step.id, event.target.value)}
                        readOnly={readOnly || execution.recoveryBlocked || stepPending}
                        onKeyDown={(event) => {
                          if (
                            !readOnly &&
                            stepDirty &&
                            !isPending &&
                            !execution.recoveryBlocked &&
                            event.key === 'Enter' &&
                            (event.ctrlKey || event.metaKey)
                          ) {
                            event.preventDefault();
                            void execution.saveStep(step.id);
                          }
                        }}
                        rows={3}
                        maxW={{ base: '100%', md: '560px' }}
                      />
                      {!readOnly && (
                        <HStack
                          justify="start"
                          align="center"
                          gap={3}
                          w={{ base: '100%', md: '560px' }}
                          flexWrap="wrap"
                        >
                          <Button
                            type="button"
                            onClick={() => void execution.saveStep(step.id)}
                            loading={stepPending}
                            loadingText="Saving…"
                            disabled={isPending || execution.recoveryBlocked || !stepDirty}
                          >
                            Save step result
                          </Button>
                          {stepPending ? (
                            <Text color="text.secondary" aria-live="polite">
                              Saving…
                            </Text>
                          ) : execution.stepSaveStates[step.id] === 'not_saved' ? (
                            <Text color="status.error.text" aria-live="polite">
                              Not saved
                            </Text>
                          ) : stepDirty ? (
                            <Text color="text.secondary">Unsaved changes</Text>
                          ) : execution.stepSaveStates[step.id] === 'submitted' ? (
                            <Text color="status.success.text">Submitted: {formatLabel(step.status)}</Text>
                          ) : execution.stepSaveStates[step.id] === 'saved_notes' ? (
                            <Text color="status.success.text">Saved notes</Text>
                          ) : null}
                          {stepDirty && (
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => execution.discardStep(step.id)}
                              disabled={isPending || execution.recoveryBlocked}
                            >
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
      </Box>
      <Wrap w="100%" p={{ base: 4, md: 6 }}>
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
              if (
                !readOnly &&
                execution.isRunNotesDirty &&
                !isPending &&
                !execution.recoveryBlocked &&
                event.key === 'Enter' &&
                (event.ctrlKey || event.metaKey)
              ) {
                event.preventDefault();
                void execution.saveRunNotes();
              }
            }}
            rows={5}
            w={{ base: '100%', md: '500px' }}
            maxW="100%"
          />
          {!readOnly && (
            <HStack justify="start" flexWrap="wrap">
              <Button
                type="button"
                onClick={() => void execution.saveRunNotes()}
                loading={execution.pendingWrite?.kind === 'run'}
                loadingText="Saving…"
                disabled={!execution.isRunNotesDirty || isPending || execution.recoveryBlocked}
              >
                Save execution notes
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={execution.discardRunNotes}
                disabled={!execution.isRunNotesDirty || isPending || execution.recoveryBlocked}
              >
                Discard
              </Button>
              <Text role="status" fontSize="sm" color="text.secondary">
                {execution.pendingWrite?.kind === 'run'
                  ? 'Saving…'
                  : execution.isRunNotesDirty
                    ? 'Unsaved changes'
                    : 'Saved'}
              </Text>
            </HStack>
          )}
        </VStack>
      </Wrap>

      {execution.isCompletionOpen && (
        <ManualTestRunCompletionDialog
          steps={execution.savedRun.steps}
          isPassedEligible={isPassedEligible}
          onCancel={execution.closeCompletion}
          onConfirm={execution.confirmCompletion}
        />
      )}
    </VStack>
  );
};
