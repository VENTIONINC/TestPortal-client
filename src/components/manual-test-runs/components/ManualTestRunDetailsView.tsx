// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useRef } from 'react';
import { Alert, Box, Button, Heading, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { FiArrowLeft } from 'react-icons/fi';
import { LuBan, LuCheck, LuCircleHelp, LuCircleX, LuSkipForward } from 'react-icons/lu';
import type { IconType } from 'react-icons';

import { Link, NativeSelect, Textarea, Wrap } from '@/components/ui';
import type { ManualTestRunRead, ManualTestRunStepStatus } from '@/redux/apis/generatedApi';
import { PATHS } from '@/types/paths';
import { getTestScenarioDetailPath } from '@/components/test-scenarios/constants';

import { MANUAL_TEST_RUN_STEP_STATUSES } from '../types';
import { isManualTestRunPassedEligible } from '../utils';
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

export interface ManualTestRunDetailsViewProps {
  projectId: string;
  runId: string;
  run: ManualTestRunRead;
  setPersistedRun: (run: ManualTestRunRead) => void;
  refetch: () => Promise<ManualTestRunRead | undefined>;
  onBack: () => void;
  onRetest?: () => void;
  isRetesting?: boolean;
  retestError?: string;
  retestUncertain?: boolean;
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
  retestError,
  retestUncertain = false,
  onViewSourceHistory,
}: ManualTestRunDetailsViewProps) => {
  const completionTriggerRef = useRef<HTMLButtonElement>(null);
  const wasCompletionOpen = useRef(false);
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
          <Heading size="lg">{execution.savedRun.title}</Heading>
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
            <Button type="button" onClick={onRetest} loading={isRetesting} disabled={isRetesting || !execution.savedRun.testScenarioId}>
              Retest
            </Button>
          )}
        </HStack>
      </HStack>

      <HStack gap={6} flexWrap="wrap" color="text.secondary">
        <Text><Text as="span" fontWeight="semibold" color="text.main">Status:</Text> {formatLabel(execution.savedRun.status)}</Text>
        <Text><Text as="span" fontWeight="semibold" color="text.main">Started:</Text> {formatDate(execution.savedRun.startedAt)}</Text>
        <Text><Text as="span" fontWeight="semibold" color="text.main">Completed:</Text> {formatDate(execution.savedRun.completedAt)}</Text>
        <Text>
          <Text as="span" fontWeight="semibold" color="text.main">Executor:</Text>{' '}
          {execution.savedRun.executedBy?.name ?? 'Executor unavailable'}
          {execution.savedRun.executedBy?.email ? ` (${execution.savedRun.executedBy.email})` : ''}
        </Text>
      </HStack>

      {execution.feedback && (
        <Alert.Root status={execution.feedback.status} role="alert" aria-live="polite">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>{execution.feedback.title}</Alert.Title>
            {execution.feedback.description && <Alert.Description>{execution.feedback.description}</Alert.Description>}
          </Alert.Content>
        </Alert.Root>
      )}
      {readOnly && execution.savedRun.status === 'in_progress' && (
        <Alert.Root status="info" role="status">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>View-only run</Alert.Title>
            <Alert.Description>Only the user who started this run can change its results, notes or complete it.</Alert.Description>
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
      {retestError && (
        <Alert.Root status={retestUncertain ? 'warning' : 'error'} role="alert">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>{retestUncertain ? 'Retest result is uncertain' : 'Retest was not started'}</Alert.Title>
            <Alert.Description>{retestError}</Alert.Description>
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

      <Wrap w="100%" p={{ base: 4, md: 6 }}>
        <VStack align="stretch" w="100%" gap={6}>
          <VStack align="stretch" gap={4}>
            <Heading size="md">Scenario snapshot</Heading>
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
              fieldProps={{ helperText: readOnly ? 'View-only run; saved notes cannot be edited.' : 'Save notes explicitly, or press Ctrl/Cmd + Enter.' }}
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
                      <Text fontWeight="semibold">Step {index + 1}</Text>
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
                        <HStack justify="start" flexWrap="wrap" maxW={{ base: '100%', md: '560px' }}>
                          <Button type="button" onClick={() => void execution.saveStep(step.id)} loading={stepPending} loadingText="Saving…" disabled={!stepDirty || isPending || execution.recoveryBlocked}>Save step</Button>
                          <Button type="button" variant="ghost" onClick={() => execution.discardStep(step.id)} disabled={!stepDirty || isPending || execution.recoveryBlocked}>Discard</Button>
                          <Text role="status" fontSize="sm" color="text.secondary">{stepPending ? 'Saving…' : stepDirty ? 'Unsaved changes' : 'Saved'}</Text>
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
