// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Alert, Box, Button, Heading, HStack, IconButton, Text, VStack } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiArrowLeft, FiChevronDown, FiChevronUp, FiTrash2 } from 'react-icons/fi';

import { Input, Textarea } from '@/components/ui';
import {
  testScenarioAuthoringSchema,
  testScenarioStepSchema,
  type TestScenarioAuthoringFormData,
} from '@/schemas';

import type {
  TestScenarioEditableField,
  TestScenarioEditableValues,
  TestScenarioInitialStepDraft,
} from '../types';

export type TestScenarioFormMode = 'create' | 'edit';

export interface TestScenarioFormReconciliation {
  token: number;
  values: TestScenarioEditableValues;
  submittedFields: TestScenarioEditableField[];
}

export interface TestScenarioFormProps {
  mode: TestScenarioFormMode;
  initialValues?: Partial<TestScenarioEditableValues> & Pick<TestScenarioEditableValues, 'title'>;
  initialSteps?: TestScenarioInitialStepDraft[];
  reconciliation?: TestScenarioFormReconciliation;
  isSubmitting?: boolean;
  apiError?: string;
  errorMessage?: string;
  successMessage?: string;
  onSubmit: (values: TestScenarioAuthoringFormData, steps: TestScenarioInitialStepDraft[]) => void | Promise<void>;
  onCancel: () => void;
}

const EMPTY_VALUES: TestScenarioEditableValues = {
  title: '',
  details: null,
  objective: null,
  preconditions: null,
  testData: null,
  expectedResult: null,
  notes: null,
};

const EMPTY_INITIAL_STEPS: TestScenarioInitialStepDraft[] = [];

let draftSequence = 0;

const createDraftStep = (): TestScenarioInitialStepDraft => ({
  key: `initial-step-${++draftSequence}`,
  action: '',
  expectedResult: '',
});

const toFormValues = (values: Partial<TestScenarioEditableValues> & Pick<TestScenarioEditableValues, 'title'>) => ({
  title: values.title ?? '',
  details: values.details ?? '',
  objective: values.objective ?? '',
  preconditions: values.preconditions ?? '',
  testData: values.testData ?? '',
  expectedResult: values.expectedResult ?? '',
  notes: values.notes ?? '',
});

const fieldLabels: Record<Exclude<TestScenarioEditableField, 'title'>, string> = {
  details: 'Details',
  objective: 'Objective',
  preconditions: 'Preconditions',
  testData: 'Test data',
  expectedResult: 'Expected result',
  notes: 'Notes',
};

export const TestScenarioForm = ({
  mode,
  initialValues = EMPTY_VALUES,
  initialSteps = EMPTY_INITIAL_STEPS,
  reconciliation,
  isSubmitting = false,
  apiError,
  errorMessage,
  successMessage,
  onSubmit,
  onCancel,
}: TestScenarioFormProps) => {
  const [initialStepDrafts, setInitialStepDrafts] = useState<TestScenarioInitialStepDraft[]>(initialSteps);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const appliedReconciliationToken = useRef<number | undefined>(undefined);
  const isCreate = mode === 'create';
  const initialTitle = initialValues.title;
  const initialDetails = initialValues.details;
  const initialObjective = initialValues.objective;
  const initialPreconditions = initialValues.preconditions;
  const initialTestData = initialValues.testData;
  const initialExpectedResult = initialValues.expectedResult;
  const initialNotes = initialValues.notes;
  const formValues = useMemo(
    () => toFormValues({
      title: initialTitle,
      details: initialDetails,
      objective: initialObjective,
      preconditions: initialPreconditions,
      testData: initialTestData,
      expectedResult: initialExpectedResult,
      notes: initialNotes,
    }),
    [initialDetails, initialExpectedResult, initialNotes, initialObjective, initialPreconditions, initialTestData, initialTitle],
  );
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting, dirtyFields },
  } = useForm<TestScenarioAuthoringFormData>({
    resolver: zodResolver(testScenarioAuthoringSchema),
    mode: 'onChange',
    defaultValues: formValues,
  });

  useEffect(() => {
    reset(formValues, { keepDirtyValues: true });
  }, [formValues, reset]);

  useEffect(() => {
    setInitialStepDrafts(initialSteps);
    setStepErrors({});
  }, [initialSteps]);

  useEffect(() => {
    if (!reconciliation) return;
    if (appliedReconciliationToken.current === reconciliation.token) return;
    appliedReconciliationToken.current = reconciliation.token;

    const currentValues = getValues();
    const dirty = dirtyFields as Partial<Record<TestScenarioEditableField, boolean>>;
    const nextValues = { ...toFormValues(reconciliation.values) };

    for (const field of Object.keys(nextValues) as TestScenarioEditableField[]) {
      if (dirty[field] && !reconciliation.submittedFields.includes(field)) {
        nextValues[field] = currentValues[field] ?? '';
      }
    }

    reset(nextValues);
    for (const field of reconciliation.submittedFields) {
      setValue(field, nextValues[field] ?? '', { shouldDirty: false, shouldValidate: true });
    }
    for (const field of Object.keys(dirty) as TestScenarioEditableField[]) {
      if (dirty[field] && !reconciliation.submittedFields.includes(field)) {
        setValue(field, currentValues[field] ?? '', { shouldDirty: true, shouldValidate: false });
      }
    }
  }, [dirtyFields, getValues, reconciliation, reset, setValue]);

  const pending = isSubmitting || isFormSubmitting;
  const displayedError = apiError ?? errorMessage;

  const updateStepDraft = (key: string, field: 'action' | 'expectedResult', value: string) => {
    setInitialStepDrafts((drafts) =>
      drafts.map((draft) => (draft.key === key ? { ...draft, [field]: value } : draft)),
    );
    setStepErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const moveStep = (index: number, direction: -1 | 1) => {
    setInitialStepDrafts((drafts) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= drafts.length) return drafts;
      const next = [...drafts];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  const handleValidSubmit = (values: TestScenarioAuthoringFormData) => {
    if (isCreate) {
      const nextErrors: Record<string, string> = {};
      for (const draft of initialStepDrafts) {
        const result = testScenarioStepSchema.safeParse(draft);
        if (!result.success) nextErrors[draft.key] = result.error.issues[0]?.message ?? 'Step action is required';
      }
      setStepErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) return;
    }

    return onSubmit(values, initialStepDrafts);
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit(handleValidSubmit)}
      maxW="900px"
      mx={{ base: 4, md: 6 }}
      my={4}
      p={{ base: 4, md: 6 }}
      bg="bg.section"
      borderRadius="12px"
      shadow="sm"
    >
      <VStack align="stretch" gap={6}>
        <HStack align="center" gap={2}>
          {!isCreate && (
            <IconButton
              type="button"
              aria-label="Return to Test Scenarios"
              title="Return to Test Scenarios"
              variant="ghost"
              color="text.active"
              onClick={onCancel}
              disabled={pending}
            >
              <FiArrowLeft size={18} aria-hidden="true" />
            </IconButton>
          )}
          <Heading size="lg">{isCreate ? 'Create Test Scenario' : 'Edit Test Scenario'}</Heading>
        </HStack>

        {displayedError && (
          <Alert.Root status="error" role="alert">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Test Scenario save failed</Alert.Title>
              <Alert.Description>{displayedError}</Alert.Description>
            </Alert.Content>
          </Alert.Root>
        )}
        {successMessage && (
          <Alert.Root status="success" role="status">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>{successMessage}</Alert.Title>
            </Alert.Content>
          </Alert.Root>
        )}

        <Input {...register('title')} name="title" label="Title" error={errors.title?.message} />

        {(Object.keys(fieldLabels) as Exclude<TestScenarioEditableField, 'title'>[]).map((field) => (
          <Textarea
            key={field}
            {...register(field)}
            name={field}
            label={fieldLabels[field]}
            resize="vertical"
            error={errors[field]?.message}
          />
        ))}

        {isCreate && (
          <VStack align="stretch" gap={4} borderTopWidth="1px" borderColor="border.subtle" pt={5}>
            <HStack justify="space-between" align="center">
              <VStack align="start" gap={0}>
                <Heading size="md">Initial steps</Heading>
                <Text color="text.secondary" fontSize="sm">
                  Add optional ordered steps. They are saved atomically with the scenario.
                </Text>
              </VStack>
              <Button type="button" variant="outline" onClick={() => setInitialStepDrafts((steps) => [...steps, createDraftStep()])}>
                Add step
              </Button>
            </HStack>

            {initialStepDrafts.length === 0 ? (
              <Text color="text.muted">No initial steps. You can add them later.</Text>
            ) : (
              initialStepDrafts.map((step, index) => (
                <Box key={step.key} p={4} borderWidth="1px" borderColor="border.subtle" borderRadius="md">
                  <VStack align="stretch" gap={3}>
                    <HStack justify="space-between" align="center">
                      <Heading size="sm">Step {index + 1}</Heading>
                      <HStack gap={1}>
                        <IconButton
                          type="button"
                          size="sm"
                          variant="ghost"
                          aria-label={`Move step ${index + 1} up`}
                          onClick={() => moveStep(index, -1)}
                          disabled={pending || index === 0}
                        >
                          <FiChevronUp aria-hidden="true" />
                        </IconButton>
                        <IconButton
                          type="button"
                          size="sm"
                          variant="ghost"
                          aria-label={`Move step ${index + 1} down`}
                          onClick={() => moveStep(index, 1)}
                          disabled={pending || index === initialStepDrafts.length - 1}
                        >
                          <FiChevronDown aria-hidden="true" />
                        </IconButton>
                        <IconButton
                          type="button"
                          size="sm"
                          variant="ghost"
                          aria-label={`Remove step ${index + 1}`}
                          onClick={() => setInitialStepDrafts((steps) => steps.filter(({ key }) => key !== step.key))}
                          disabled={pending}
                        >
                          <FiTrash2 aria-hidden="true" />
                        </IconButton>
                      </HStack>
                    </HStack>
                    <Input
                      name={`initial-step-${step.key}-action`}
                      label={`Step ${index + 1} action`}
                      value={step.action}
                      onChange={(event) => updateStepDraft(step.key, 'action', event.target.value)}
                      error={stepErrors[step.key]}
                      disabled={pending}
                    />
                    <Textarea
                      name={`initial-step-${step.key}-expected-result`}
                      label={`Step ${index + 1} expected result`}
                      value={step.expectedResult}
                      onChange={(event) => updateStepDraft(step.key, 'expectedResult', event.target.value)}
                      resize="vertical"
                      disabled={pending}
                    />
                  </VStack>
                </Box>
              ))
            )}
          </VStack>
        )}

        <HStack justify="flex-end" gap={3}>
          <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={pending} disabled={pending}>
            {isCreate ? 'Create Test Scenario' : 'Save Test Scenario'}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export const TestScenarioAuthoringForm = TestScenarioForm;
