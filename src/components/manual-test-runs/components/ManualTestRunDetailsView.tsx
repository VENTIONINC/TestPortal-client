// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useRef } from 'react';
import { Alert, Box, Button, Heading, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { FiArrowLeft } from 'react-icons/fi';
import { LuBan, LuCheck, LuCircleHelp, LuCircleX, LuSkipForward } from 'react-icons/lu';
import type { IconType } from 'react-icons';

import { Link, NativeSelect, Textarea, Tooltip, Wrap } from '@/components/ui';
import type { ManualTestRunRead, ManualTestRunStepRead, ManualTestRunStepStatus } from '@/redux/apis/generatedApi';
import { PATHS } from '@/types/paths';

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
}

export const ManualTestRunDetailsView = ({
  projectId,
  runId,
  run,
  setPersistedRun,
  refetch,
  onBack,
}: ManualTestRunDetailsViewProps) => {
  const completionTriggerRef = useRef<HTMLButtonElement>(null);
  const stepHeadingRefs = useRef<Record<string, HTMLHeadingElement | null>>({});
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
  const focusStep = (stepId: string) => {
    const heading = stepHeadingRefs.current[stepId];
    if (typeof heading?.scrollIntoView === 'function') heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
    heading?.focus();
  };

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
              fieldProps={{ helperText: readOnly ? 'Completed run; saved values are immutable.' : 'Notes are saved explicitly and are separate from scenario notes.' }}
              rows={5}
            />
            {!readOnly && (
              <HStack justify="end">
                <Button type="button" variant="ghost" onClick={execution.discardRunNotes} disabled={isPending || execution.recoveryBlocked}>Discard</Button>
                <Button type="button" onClick={() => void execution.saveRunNotes()} disabled={isPending || execution.recoveryBlocked}>Save execution notes</Button>
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
                        rows={3}
                        maxW={{ base: '100%', md: '560px' }}
                      />
                      {!readOnly && (
                        <HStack justify="start" align="center" gap={3} w={{ base: '100%', md: '560px' }} flexWrap="wrap">
                          {stepPending ? (
                            <Text color="text.secondary" aria-live="polite">Saving</Text>
                          ) : execution.stepSaveStates[step.id] === 'not_saved' ? (
                            <Text color="status.error.text" aria-live="polite">Not saved</Text>
                          ) : execution.dirtyStepIds.includes(step.id) ? (
                            <Text color="text.secondary">Unsaved changes</Text>
                          ) : execution.stepSaveStates[step.id] === 'submitted' ? (
                            <Text color="status.success.text">Submitted: {formatLabel(step.status)}</Text>
                          ) : execution.stepSaveStates[step.id] === 'saved_notes' ? (
                            <Text color="status.success.text">Saved notes</Text>
                          ) : null}
                          {execution.dirtyStepIds.includes(step.id) && (
                            <Button type="button" variant="ghost" onClick={() => execution.discardStep(step.id)} disabled={isPending || execution.recoveryBlocked}>
                              Discard changes
                            </Button>
                          )}
                          <Button
                            type="button"
                            onClick={() => void execution.saveStep(step.id)}
                            disabled={isPending || execution.recoveryBlocked || !execution.dirtyStepIds.includes(step.id)}
                          >
                            {step.status === 'not_started' ? 'Submit' : 'Submit changes'}
                          </Button>
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
