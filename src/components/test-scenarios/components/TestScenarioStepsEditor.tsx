// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Alert, Box, Button, Heading, HStack, IconButton, Text, VStack } from '@chakra-ui/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FiChevronDown, FiChevronUp, FiTrash2 } from 'react-icons/fi';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { Input, Textarea } from '@/components/ui';
import {
  useDeleteApiV2TestScenariosByScenarioIdStepsAndStepIdMutation,
  usePatchApiV2TestScenariosByScenarioIdStepsAndStepIdMutation,
  usePostApiV2TestScenariosByScenarioIdStepsMutation,
  usePutApiV2TestScenariosByScenarioIdStepsOrderMutation,
  type TestScenario,
} from '@/redux/apis/generatedApi';
import { testScenarioStepSchema } from '@/schemas';

import {
  getTestScenarioStepAppendPayload,
  getTestScenarioStepPatchPayload,
} from '../utils';

type StepDraft = { action: string; expectedResult: string };
type Operation = 'append' | `edit:${string}` | `delete:${string}` | 'reorder' | null;
type ReorderIntent = { stepId: string; direction: -1 | 1 };

export interface TestScenarioStepsEditorProps {
  scenario: TestScenario;
  projectId: string;
  scenarioId: string;
  onScenarioUpdated: (scenario: TestScenario) => void;
  onRefresh?: () => Promise<unknown>;
}

const orderedSteps = (scenario: TestScenario) => [...scenario.steps].sort((left, right) => left.position - right.position);

const getErrorStatus = (error: unknown) => {
  if (error && typeof error === 'object' && 'status' in error) return (error as FetchBaseQueryError).status;
  return undefined;
};

const errorMessage = (error: unknown) => {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data?: { error?: string } }).data;
    if (data?.error) return data.error;
  }
  return 'The step change could not be saved. Please review the draft and try again.';
};

const draftForStep = (step: TestScenario['steps'][number]): StepDraft => ({
  action: step.action,
  expectedResult: step.expectedResult ?? '',
});

const isDraftChanged = (draft: StepDraft | undefined, step: TestScenario['steps'][number]) =>
  Boolean(getTestScenarioStepPatchPayload(draft ?? draftForStep(step), step));

export const TestScenarioStepsEditor = ({
  scenario,
  projectId,
  scenarioId,
  onScenarioUpdated,
  onRefresh,
}: TestScenarioStepsEditorProps) => {
  const [appendStep] = usePostApiV2TestScenariosByScenarioIdStepsMutation();
  const [updateStep] = usePatchApiV2TestScenariosByScenarioIdStepsAndStepIdMutation();
  const [deleteStep] = useDeleteApiV2TestScenariosByScenarioIdStepsAndStepIdMutation();
  const [reorderSteps] = usePutApiV2TestScenariosByScenarioIdStepsOrderMutation();
  const [drafts, setDrafts] = useState<Record<string, StepDraft>>({});
  const [newStep, setNewStep] = useState<StepDraft>({ action: '', expectedResult: '' });
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [operation, setOperation] = useState<Operation>(null);
  const [feedback, setFeedback] = useState<{ kind: 'error' | 'success'; message: string }>();
  const [reorderIntent, setReorderIntent] = useState<ReorderIntent>();
  const operationRef = useRef<Operation>(null);
  const previousSavedSteps = useRef<Record<string, TestScenario['steps'][number]>>({});
  const steps = useMemo(() => orderedSteps(scenario), [scenario]);

  useEffect(() => {
    setDrafts((current) => {
      const next: Record<string, StepDraft> = {};
      for (const step of steps) {
        const previousSaved = previousSavedSteps.current[step.id];
        const currentDraft = current[step.id];
        next[step.id] = previousSaved && currentDraft && isDraftChanged(currentDraft, previousSaved)
          ? currentDraft
          : draftForStep(step);
      }
      previousSavedSteps.current = Object.fromEntries(steps.map((step) => [step.id, step]));
      return next;
    });
  }, [steps]);

  const begin = (nextOperation: Exclude<Operation, null>) => {
    if (operationRef.current) return false;
    operationRef.current = nextOperation;
    setOperation(nextOperation);
    setFeedback(undefined);
    return true;
  };

  const finish = () => {
    operationRef.current = null;
    setOperation(null);
  };

  const refreshAfterMissingResource = async (message: string) => {
    if (!onRefresh) {
      setFeedback({ kind: 'error', message });
      return;
    }
    try {
      const result = await onRefresh();
      if (result && typeof result === 'object' && 'error' in result && result.error) {
        setFeedback({ kind: 'error', message: `${message} Refreshing the current steps also failed; try again.` });
      } else {
        setFeedback({ kind: 'error', message: `${message} The current steps were refreshed; review and retry.` });
      }
    } catch {
      setFeedback({ kind: 'error', message: `${message} Refreshing the current steps also failed; try again.` });
    }
  };

  const validateDraft = (draft: StepDraft, key: string) => {
    const result = testScenarioStepSchema.safeParse(draft);
    if (result.success) {
      setStepErrors((current) => {
        if (!current[key]) return current;
        const next = { ...current };
        delete next[key];
        return next;
      });
      return true;
    }
    setStepErrors((current) => ({ ...current, [key]: result.error.issues[0]?.message ?? 'Step action is required' }));
    return false;
  };

  const handleAppend = async () => {
    if (!validateDraft(newStep, 'new-step') || !begin('append')) return;
    try {
      const response = await appendStep({
        scenarioId,
        projectId,
        appendTestScenarioStepRequest: getTestScenarioStepAppendPayload(newStep),
      }).unwrap();
      onScenarioUpdated(response);
      setNewStep({ action: '', expectedResult: '' });
      setFeedback({ kind: 'success', message: 'Step added successfully.' });
    } catch (error) {
      setFeedback({ kind: 'error', message: errorMessage(error) });
      if (getErrorStatus(error) === 404) await refreshAfterMissingResource('The scenario or step resource is unavailable.');
    } finally {
      finish();
    }
  };

  const handleEdit = async (step: TestScenario['steps'][number]) => {
    const draft = drafts[step.id] ?? draftForStep(step);
    if (!validateDraft(draft, step.id) || !begin(`edit:${step.id}`)) return;
    const payload = getTestScenarioStepPatchPayload(draft, step);
    if (!payload) {
      setFeedback({ kind: 'success', message: `No changes to save for step ${step.position}.` });
      finish();
      return;
    }
    try {
      const response = await updateStep({
        scenarioId,
        stepId: step.id,
        projectId,
        updateTestScenarioStepRequest: payload,
      }).unwrap();
      onScenarioUpdated(response);
      const updatedStep = response.steps.find(({ id }) => id === step.id);
      if (updatedStep) setDrafts((current) => ({ ...current, [step.id]: draftForStep(updatedStep) }));
      setFeedback({ kind: 'success', message: `Step ${step.position} saved successfully.` });
    } catch (error) {
      setFeedback({ kind: 'error', message: errorMessage(error) });
      if (getErrorStatus(error) === 404) await refreshAfterMissingResource('This step no longer exists.');
    } finally {
      finish();
    }
  };

  const handleDelete = async (step: TestScenario['steps'][number]) => {
    if (!begin(`delete:${step.id}`)) return;
    try {
      const response = await deleteStep({ scenarioId, stepId: step.id, projectId }).unwrap();
      onScenarioUpdated(response);
      setFeedback({ kind: 'success', message: `Step ${step.position} deleted successfully.` });
    } catch (error) {
      setFeedback({ kind: 'error', message: errorMessage(error) });
      if (getErrorStatus(error) === 404) await refreshAfterMissingResource('This step no longer exists.');
    } finally {
      finish();
    }
  };

  const handleReorder = async ({ stepId, direction }: ReorderIntent) => {
    const currentSteps = orderedSteps(scenario);
    const index = currentSteps.findIndex(({ id }) => id === stepId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= currentSteps.length || !begin('reorder')) return;

    const nextIds = currentSteps.map(({ id }) => id);
    [nextIds[index], nextIds[nextIndex]] = [nextIds[nextIndex], nextIds[index]];
    try {
      const response = await reorderSteps({
        scenarioId,
        projectId,
        reorderTestScenarioStepsRequest: { stepIds: nextIds },
      }).unwrap();
      onScenarioUpdated(response);
      setReorderIntent(undefined);
      setFeedback({ kind: 'success', message: 'Steps reordered successfully.' });
    } catch (error) {
      if (getErrorStatus(error) === 400) {
        setReorderIntent({ stepId, direction });
        await refreshAfterMissingResource('The order was rejected because the step membership changed.');
      } else {
        setFeedback({ kind: 'error', message: errorMessage(error) });
      }
    } finally {
      finish();
    }
  };

  const isBusy = operation !== null;

  return (
    <Box maxW="900px" mx={{ base: 4, md: 6 }} my={4} p={{ base: 4, md: 6 }} bg="bg.section" borderRadius="12px" shadow="sm">
      <VStack align="stretch" gap={5}>
        <VStack align="start" gap={1}>
          <Heading size="md">Scenario steps</Heading>
          <Text color="text.secondary" fontSize="sm">
            Steps are saved independently. Unsaved field and step drafts remain local until explicitly saved.
          </Text>
        </VStack>

        {feedback && (
          <Alert.Root status={feedback.kind} role={feedback.kind === 'error' ? 'alert' : 'status'}>
            <Alert.Indicator />
            <Alert.Content><Alert.Description>{feedback.message}</Alert.Description></Alert.Content>
          </Alert.Root>
        )}

        {steps.length === 0 ? (
          <Text color="text.muted">No saved steps yet.</Text>
        ) : (
          <VStack align="stretch" gap={3}>
            {steps.map((step, index) => {
              const draft = drafts[step.id] ?? draftForStep(step);
              const stepOperation = operation === `edit:${step.id}` || operation === `delete:${step.id}`;
              return (
                <Box key={step.id} p={4} borderWidth="1px" borderColor="border.subtle" borderRadius="md">
                  <VStack align="stretch" gap={3}>
                    <HStack justify="space-between" align="center">
                      <Heading size="sm">Step {index + 1}</Heading>
                      <HStack gap={1}>
                        <IconButton
                          type="button"
                          size="sm"
                          variant="ghost"
                          aria-label={`Move step ${index + 1} up`}
                          onClick={() => void handleReorder({ stepId: step.id, direction: -1 })}
                          disabled={isBusy || index === 0}
                          loading={operation === 'reorder'}
                        >
                          <FiChevronUp aria-hidden="true" />
                        </IconButton>
                        <IconButton
                          type="button"
                          size="sm"
                          variant="ghost"
                          aria-label={`Move step ${index + 1} down`}
                          onClick={() => void handleReorder({ stepId: step.id, direction: 1 })}
                          disabled={isBusy || index === steps.length - 1}
                          loading={operation === 'reorder'}
                        >
                          <FiChevronDown aria-hidden="true" />
                        </IconButton>
                      </HStack>
                    </HStack>
                    <Input
                      name={`saved-step-${step.id}-action`}
                      label={`Step ${index + 1} action`}
                      value={draft.action}
                      onChange={(event) => setDrafts((current) => ({ ...current, [step.id]: { ...draft, action: event.target.value } }))}
                      error={stepErrors[step.id]}
                      disabled={isBusy}
                    />
                    <Textarea
                      name={`saved-step-${step.id}-expected-result`}
                      label={`Step ${index + 1} expected result`}
                      value={draft.expectedResult}
                      onChange={(event) => setDrafts((current) => ({ ...current, [step.id]: { ...draft, expectedResult: event.target.value } }))}
                      resize="vertical"
                      disabled={isBusy}
                    />
                    <HStack justify="flex-end" gap={2}>
                      <Button type="button" variant="outline" size="sm" onClick={() => void handleEdit(step)} disabled={isBusy} loading={stepOperation && operation?.startsWith('edit:')}>
                        Save step {index + 1}
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => void handleDelete(step)} disabled={isBusy} loading={operation === `delete:${step.id}`}>
                        <FiTrash2 aria-hidden="true" />
                        Delete step {index + 1}
                      </Button>
                    </HStack>
                  </VStack>
                </Box>
              );
            })}
          </VStack>
        )}

        <Box borderTopWidth="1px" borderColor="border.subtle" pt={5}>
          <VStack align="stretch" gap={3}>
            <Heading size="sm">Add a step</Heading>
            <Input
              name="new-step-action"
              label="New step action"
              value={newStep.action}
              onChange={(event) => setNewStep((current) => ({ ...current, action: event.target.value }))}
              error={stepErrors['new-step']}
              disabled={isBusy}
            />
            <Textarea
              name="new-step-expected-result"
              label="New step expected result"
              value={newStep.expectedResult}
              onChange={(event) => setNewStep((current) => ({ ...current, expectedResult: event.target.value }))}
              resize="vertical"
              disabled={isBusy}
            />
            <Button type="button" alignSelf="flex-end" variant="primary" onClick={() => void handleAppend()} disabled={isBusy} loading={operation === 'append'}>
              Add step
            </Button>
          </VStack>
        </Box>

        {reorderIntent && (
          <Button type="button" variant="outline" onClick={() => void handleReorder(reorderIntent)} disabled={isBusy}>
            Retry reorder
          </Button>
        )}
      </VStack>
    </Box>
  );
};
