// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Alert, Box, Button, Grid, Heading, HStack, IconButton, Text, VStack } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiArrowLeft, FiChevronDown, FiChevronUp, FiTrash2 } from 'react-icons/fi';

import { Input, NativeSelect, Textarea } from '@/components/ui';
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
  folders?: Array<{ id: string; name: string; depth?: number }>;
  initialFolderId?: string | null;
  onSubmit: (values: TestScenarioAuthoringFormData, steps: TestScenarioInitialStepDraft[], folderId?: string | null) => void | Promise<void>;
  onCancel: () => void;
}

const EMPTY_VALUES: TestScenarioEditableValues = {
  scenarioKey: '',
  title: '',
  details: null,
  priority: null,
  preconditions: null,
  testData: null,
  relatedIssueUrl: null,
};

const EMPTY_INITIAL_STEPS: TestScenarioInitialStepDraft[] = [];

let draftSequence = 0;

const createDraftStep = (): TestScenarioInitialStepDraft => ({
  key: `initial-step-${++draftSequence}`,
  action: '',
  expectedResult: '',
});

const toFormValues = (values: Partial<TestScenarioEditableValues> & Pick<TestScenarioEditableValues, 'title'>) => ({
  scenarioKey: values.scenarioKey ?? '',
  title: values.title ?? '',
  details: values.details ?? '',
  priority: values.priority ?? '',
  preconditions: values.preconditions ?? '',
  testData: values.testData ?? '',
  relatedIssueUrl: values.relatedIssueUrl ?? '',
});

export const TestScenarioForm = ({
  mode,
  initialValues = EMPTY_VALUES,
  initialSteps = EMPTY_INITIAL_STEPS,
  reconciliation,
  isSubmitting = false,
  apiError,
  errorMessage,
  successMessage,
  folders = [],
  initialFolderId = null,
  onSubmit,
  onCancel,
}: TestScenarioFormProps) => {
  const [initialStepDrafts, setInitialStepDrafts] = useState<TestScenarioInitialStepDraft[]>(initialSteps);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [folderId, setFolderId] = useState<string | null>(initialFolderId);
  const appliedReconciliationToken = useRef<number | undefined>(undefined);
  const isCreate = mode === 'create';
  const initialScenarioKey = initialValues.scenarioKey;
  const initialTitle = initialValues.title;
  const initialDetails = initialValues.details;
  const initialPriority = initialValues.priority;
  const initialPreconditions = initialValues.preconditions;
  const initialTestData = initialValues.testData;
  const initialRelatedIssueUrl = initialValues.relatedIssueUrl;
  const formValues = useMemo(
    () => toFormValues({
      scenarioKey: initialScenarioKey,
      title: initialTitle,
      details: initialDetails,
      priority: initialPriority,
      preconditions: initialPreconditions,
      testData: initialTestData,
      relatedIssueUrl: initialRelatedIssueUrl,
    }),
    [
      initialDetails,
      initialRelatedIssueUrl,
      initialPriority,
      initialPreconditions,
      initialScenarioKey,
      initialTestData,
      initialTitle,
    ],
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

  useEffect(() => setFolderId(initialFolderId), [initialFolderId]);

  useEffect(() => {
    if (!reconciliation) return;
    if (appliedReconciliationToken.current === reconciliation.token) return;
    appliedReconciliationToken.current = reconciliation.token;

    const currentValues = getValues();
    const dirty = dirtyFields as Partial<Record<TestScenarioEditableField, boolean>>;
    const nextValues = { ...toFormValues(reconciliation.values) };

    for (const field of Object.keys(nextValues) as TestScenarioEditableField[]) {
      if (dirty[field] && !reconciliation.submittedFields.includes(field)) {
        if (field === 'priority') nextValues.priority = currentValues.priority ?? '';
        else nextValues[field] = currentValues[field] ?? '';
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

    return onSubmit(values, initialStepDrafts, folderId);
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit(handleValidSubmit)}
      maxW={isCreate ? undefined : '900px'}
      mx={{ base: 4, md: 6 }}
      my={4}
      p={{ base: 4, md: 6 }}
      bg="bg.section"
      borderRadius="12px"
      shadow="sm"
    >
      <VStack align="stretch" gap={6}>
        {!isCreate && (
          <HStack align="center" gap={2}>
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
            <Heading size="lg">Edit Test Scenario</Heading>
          </HStack>
        )}

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

        <VStack align="stretch" gap={4}>
          <Heading size="md" pb={3} borderBottomWidth="1px" borderColor="border.main">Scenario fields</Heading>
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }} gap={{ base: 4, md: 6 }}>
            <NativeSelect name="scenario-folder" label="Folder" aria-label="Scenario folder" value={folderId ?? ''}
              onChange={(event) => setFolderId(event.currentTarget.value || null)}>
              <option value="">Unfiled</option>
              {folders.map((folder) => <option key={folder.id} value={folder.id}>{'　'.repeat(folder.depth ?? 0)}{folder.name}</option>)}
            </NativeSelect>
            <Input {...register('scenarioKey')} name="scenarioKey" label="Scenario key (optional)"
              placeholder="e.g. R1 or AUTH-LOGIN" fieldProps={{ helperText: 'Up to 100 characters. Duplicate keys are allowed.' }} error={errors.scenarioKey?.message} />
            <Input {...register('title')} name="title" label="Title" error={errors.title?.message} />
            <NativeSelect {...register('priority')} name="priority" label="Priority" error={errors.priority?.message}>
              <option value="">Unset</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
            </NativeSelect>
            <Input {...register('relatedIssueUrl')} name="relatedIssueUrl" label="Related issue URL" error={errors.relatedIssueUrl?.message} />
            <Textarea {...register('details')} name="details" label="Details" resize="vertical" error={errors.details?.message} />
          </Grid>
        </VStack>
        <VStack align="stretch" gap={4}>
          <Heading size="md" pb={3} borderBottomWidth="1px" borderColor="border.main">Test setup</Heading>
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }} gap={{ base: 4, md: 6 }}>
            <Textarea {...register('preconditions')} name="preconditions" label="Preconditions" resize="vertical" error={errors.preconditions?.message} />
            <Textarea {...register('testData')} name="testData" label="Test data" resize="vertical" error={errors.testData?.message} />
          </Grid>
        </VStack>

        {isCreate && (
          <VStack align="stretch" gap={3} pt={5} borderTopWidth="1px" borderColor="border.main">
            <HStack justify="space-between" align="center">
              <VStack align="start" gap={0}>
                <Heading size="md">Scenario steps ({initialStepDrafts.length})</Heading>
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
              <VStack as="ol" aria-label="Scenario steps" align="stretch" gap={0} m={0} p={0}>
                {initialStepDrafts.map((step, index) => (
                  <Box
                    as="li"
                    key={step.key}
                    listStyle="none"
                    py={5}
                    borderTopWidth="1px"
                    borderColor="border.main"
                    _last={{ borderBottomWidth: '1px' }}
                  >
                    <VStack align="stretch" gap={3}>
                      <HStack align="center" gap={2}>
                        <Box
                          aria-hidden="true"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          flexShrink={0}
                          w="34px"
                          h="34px"
                          borderRadius="full"
                          bg="bg.active"
                          borderWidth="1px"
                          borderColor="border.main"
                          color="text.active"
                          fontWeight="semibold"
                          fontSize="sm"
                        >
                          {index + 1}
                        </Box>
                        <HStack gap={0}>
                          <IconButton
                            type="button"
                            size="xs"
                            variant="ghost"
                            aria-label={`Move step ${index + 1} up`}
                            title={`Move step ${index + 1} up`}
                            onClick={() => moveStep(index, -1)}
                            disabled={pending || index === 0}
                          >
                            <FiChevronUp aria-hidden="true" />
                          </IconButton>
                          <IconButton
                            type="button"
                            size="xs"
                            variant="ghost"
                            aria-label={`Move step ${index + 1} down`}
                            title={`Move step ${index + 1} down`}
                            onClick={() => moveStep(index, 1)}
                            disabled={pending || index === initialStepDrafts.length - 1}
                          >
                            <FiChevronDown aria-hidden="true" />
                          </IconButton>
                          <IconButton
                            type="button"
                            size="xs"
                            variant="ghost"
                            aria-label={`Remove step ${index + 1}`}
                            title={`Remove step ${index + 1}`}
                            onClick={() => setInitialStepDrafts((steps) => steps.filter(({ key }) => key !== step.key))}
                            disabled={pending}
                          >
                            <FiTrash2 aria-hidden="true" />
                          </IconButton>
                        </HStack>
                      </HStack>
                      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }} gap={{ base: 3, md: 6 }}>
                        <Textarea
                          name={`initial-step-${step.key}-action`}
                          label="Action"
                          aria-label={`Step ${index + 1} action`}
                          value={step.action}
                          onChange={(event) => updateStepDraft(step.key, 'action', event.target.value)}
                          error={stepErrors[step.key]}
                          resize="vertical"
                          disabled={pending}
                          fieldProps={{ labelProps: { fontSize: 'md', fontWeight: 'semibold' } }}
                        />
                        <Textarea
                          name={`initial-step-${step.key}-expected-result`}
                          label="Expected result"
                          aria-label={`Step ${index + 1} expected result`}
                          value={step.expectedResult}
                          onChange={(event) => updateStepDraft(step.key, 'expectedResult', event.target.value)}
                          resize="vertical"
                          disabled={pending}
                          fieldProps={{ labelProps: { fontSize: 'md', fontWeight: 'semibold' } }}
                        />
                      </Grid>
                    </VStack>
                  </Box>
                ))}
              </VStack>
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
