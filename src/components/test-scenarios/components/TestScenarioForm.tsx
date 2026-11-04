// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Alert, Box, Button, Grid, Heading, HStack, IconButton, Link, Popover, Portal, Text, VStack } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiArrowLeft, FiCheck, FiChevronDown, FiFolder, FiLink, FiPlus, FiSearch, FiX } from 'react-icons/fi';

import { Input, Textarea, Tooltip } from '@/components/ui';
import { testScenarioAuthoringSchema, type TestScenarioAuthoringFormData } from '@/schemas';

import { SuitePicker } from './SuitePicker';
import type { TestScenarioEditableField, TestScenarioEditableValues, TestScenarioInitialStepDraft } from '../types';

export type TestScenarioFormMode = 'create' | 'edit';
export interface ScenarioSuiteDraft {
  id: string;
  name: string;
  isNew?: boolean;
}
export interface ScenarioDraftCollections {
  suiteIds: string[];
  newSuites: { name: string }[];
}
export interface TestScenarioFormReconciliation {
  token: number;
  values: TestScenarioEditableValues;
  submittedFields: TestScenarioEditableField[];
}
export interface TestScenarioFormProps {
  mode: TestScenarioFormMode;
  initialValues?: Partial<TestScenarioEditableValues> & Pick<TestScenarioEditableValues, 'title'>;
  initialSteps?: TestScenarioInitialStepDraft[];
  initialSuites?: ScenarioSuiteDraft[];
  suites?: Array<{ id: string; name: string; members?: unknown[] }>;
  reconciliation?: TestScenarioFormReconciliation;
  isSubmitting?: boolean;
  apiError?: string;
  errorMessage?: string;
  successMessage?: string;
  folders?: Array<{ id: string; name: string; depth?: number }>;
  initialFolderId?: string | null;
  onDirtyChange?: (dirty: boolean) => void;
  onReload?: () => void;
  errorCatalogPath?: string;
  onSubmit: (
    values: TestScenarioAuthoringFormData,
    steps: TestScenarioInitialStepDraft[],
    folderId?: string | null,
    collections?: ScenarioDraftCollections,
  ) => void | Promise<void>;
  onCancel: (folderId?: string | null) => void;
}
const EMPTY_VALUES = { title: '' };
const EMPTY_STEPS: TestScenarioInitialStepDraft[] = [];
const EMPTY_SUITES: ScenarioSuiteDraft[] = [];
let draftSequence = 0;
const newStep = (): TestScenarioInitialStepDraft => ({
  key: `draft-${++draftSequence}`,
  action: '',
  expectedResult: '',
});
const toValues = (values: TestScenarioFormProps['initialValues']) => ({
  title: values?.title ?? '',
  details: values?.details ?? '',
  priority: values?.priority || ('medium' as const),
  preconditions: values?.preconditions ?? '',
  testData: values?.testData ?? '',
  relatedIssueUrl: values?.relatedIssueUrl ?? '',
});

export const TestScenarioForm = ({
  mode,
  initialValues = EMPTY_VALUES,
  initialSteps = EMPTY_STEPS,
  initialSuites = EMPTY_SUITES,
  suites = [],
  reconciliation,
  isSubmitting = false,
  apiError,
  errorMessage,
  successMessage,
  folders = [],
  initialFolderId = null,
  onDirtyChange,
  onReload,
  errorCatalogPath,
  onSubmit,
  onCancel,
}: TestScenarioFormProps) => {
  const [steps, setSteps] = useState(() => (initialSteps.length ? initialSteps : mode === 'create' ? [newStep()] : []));
  const [folderId, setFolderId] = useState(initialFolderId);
  const [folderOpen, setFolderOpen] = useState(false);
  const [folderSearch, setFolderSearch] = useState('');
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [selectedSuites, setSelectedSuites] = useState(initialSuites);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [announcement, setAnnouncement] = useState('');
  const [grabbed, setGrabbed] = useState<string>();
  const [draggedStep, setDraggedStep] = useState<string>();
  const pickedUpOrder = useRef<string[]>([]);
  const [focusStep, setFocusStep] = useState<string>();
  const [focusHandle, setFocusHandle] = useState<string>();
  const root = useRef<HTMLFormElement>(null);
  const folderSearchRef = useRef<HTMLInputElement>(null);
  const pointer = useRef<{ key: string; id: number } | null>(null);
  const baseline = useRef({ steps: initialSteps, suites: initialSuites, folderId: initialFolderId });
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting: submitting, isDirty },
  } = useForm<TestScenarioAuthoringFormData>({
    resolver: zodResolver(testScenarioAuthoringSchema),
    defaultValues: toValues(initialValues),
    mode: 'onChange',
  });
  const values = watch();
  const pending = submitting || isSubmitting;
  const meaningfulSteps = steps.filter((s) => s.id || s.action.trim() || s.expectedResult.trim());
  const dirty =
    isDirty ||
    folderId !== baseline.current.folderId ||
    JSON.stringify(meaningfulSteps) !== JSON.stringify(baseline.current.steps) ||
    JSON.stringify(selectedSuites) !== JSON.stringify(baseline.current.suites);
  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  useEffect(() => {
    if (!reconciliation) return;
    reset(toValues(reconciliation.values));
    setSteps(initialSteps);
    setSelectedSuites(initialSuites);
    setFolderId(initialFolderId);
    baseline.current = { steps: initialSteps, suites: initialSuites, folderId: initialFolderId };
    setStepErrors({});
    // Only an explicit save/reload token may replace an active draft.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reconciliation?.token, reset]);
  useEffect(() => {
    if (focusStep) {
      root.current?.querySelector<HTMLTextAreaElement>(`[data-action-key="${focusStep}"]`)?.focus();
      setFocusStep(undefined);
    }
    if (focusHandle) {
      root.current?.querySelector<HTMLButtonElement>(`[data-handle-key="${focusHandle}"]`)?.focus();
      setFocusHandle(undefined);
    }
  }, [focusStep, focusHandle, steps]);
  const append = () => {
    if (pending) return;
    let step = newStep();
    while (steps.some((existing) => existing.key === step.key)) step = newStep();
    setSteps((previous) => [...previous, step]);
    setFocusStep(step.key);
  };
  const move = (key: string, target: number) => {
    if (pending) return;
    setSteps((previous) => {
      const from = previous.findIndex((s) => s.key === key);
      if (from < 0 || target < 0 || target >= previous.length || target === from) return previous;
      const next = [...previous];
      next.splice(target, 0, next.splice(from, 1)[0]);
      setAnnouncement(`Step moved to position ${target + 1} of ${next.length}`);
      return next;
    });
    setFocusHandle(key);
  };
  const update = (key: string, field: 'action' | 'expectedResult', value: string) => {
    setSteps((previous) => previous.map((s) => (s.key === key ? { ...s, [field]: value } : s)));
    setStepErrors((previous) => ({ ...previous, [key]: '' }));
  };
  const submit = (data: TestScenarioAuthoringFormData) => {
    if (pending) return;
    const invalid = Object.fromEntries(
      meaningfulSteps.filter((s) => !s.action.trim()).map((s) => [s.key, 'Step action is required']),
    );
    setStepErrors(invalid);
    if (Object.keys(invalid).length) return;
    return onSubmit(data, meaningfulSteps, folderId, {
      suiteIds: selectedSuites.filter((s) => !s.isNew).map((s) => s.id),
      newSuites: selectedSuites.filter((s) => s.isNew).map(({ name }) => ({ name })),
    });
  };
  const folder = folderId ? folders.find((f) => f.id === folderId) : null;
  const backLabel = folderId ? (folder ? folder.name : 'All scenarios') : 'No folder';
  const cancel = () => onCancel(folderId);
  return (
    <Box
      as="form"
      ref={root}
      onSubmit={handleSubmit(submit)}
      mx={{ base: 3, md: 6 }}
      my={4}
      p={{ base: 4, md: 6 }}
      bg="bg.card"
      borderRadius="12px"
      shadow="sm"
      position="relative"
    >
      <VStack align="stretch" gap={4}>
        <HStack justify="space-between" flexWrap="wrap">
          <Button type="button" variant="ghost" onClick={cancel} disabled={pending}
            h="5" minW={0} p={0} gap={2} fontSize="sm" fontWeight="normal" color="text.secondary" textDecoration="none" flexShrink={0}
            _hover={{ bg: 'bg.subtle' }}>
            <FiArrowLeft size={16} aria-hidden="true" style={{ width: 16, height: 16, flex: '0 0 16px' }} />
            Back to {backLabel}
          </Button>
          <HStack gap={2} position={{ base: 'static', md: 'absolute' }} top={{ md: '72px' }} right={{ md: 6 }}>
            <Button type="button" variant="ghost" onClick={cancel} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={pending} disabled={pending}>
              {mode === 'create' ? 'Save scenario' : 'Save changes'}
            </Button>
          </HStack>
        </HStack>
        {(apiError || errorMessage) && (
          <Alert.Root status="error" role="alert">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Scenario save failed</Alert.Title>
              <Alert.Description>{apiError || errorMessage}</Alert.Description>
              {errorCatalogPath && (
                <Link href={errorCatalogPath} color="text.active" textDecoration="underline">
                  Inspect scenario catalog
                </Link>
              )}
              {onReload && (
                <Button type="button" variant="outline" onClick={onReload} disabled={pending}>
                  Reload saved scenario
                </Button>
              )}
            </Alert.Content>
          </Alert.Root>
        )}
        {successMessage && (
          <Alert.Root status="success">
            <Alert.Content>{successMessage}</Alert.Content>
          </Alert.Root>
        )}
        <VStack align="stretch" gap={2} maxW={{ lg: 'calc(100% - 224px)' }}>
          {mode === 'create' && (
            <Text fontSize="xs" fontWeight="semibold" color="blue.500">
              NEW SCENARIO
            </Text>
          )}
          <HStack gap={2} flexWrap="wrap">
            {mode === 'create' ? (
              <Tooltip content="The key is assigned automatically when the scenario is saved.">
                <Text as="span" tabIndex={0} fontSize="sm" bg="bg.subtle" px={2} py={1} borderRadius="md" cursor="help">
                  On save
                </Text>
              </Tooltip>
            ) : (
              <Text fontSize="sm" bg="bg.subtle" px={2} py={1} borderRadius="md">
                {initialValues.scenarioKey}
              </Text>
            )}
            <Popover.Root
              initialFocusEl={() => folderSearchRef.current}
              open={folderOpen}
              onOpenChange={({ open }) => {
                setFolderOpen(open);
                if (!open) setFolderSearch('');
              }}
            >
              <Popover.Trigger asChild>
                <Button type="button" variant="outline" size="sm" aria-label="Scenario folder" disabled={pending}>
                  <FiFolder /> {folder?.name ?? 'No folder'} <FiChevronDown />
                </Button>
              </Popover.Trigger>
              <Portal>
                <Popover.Positioner>
                  <Popover.Content w="260px" bg="bg.card" p={0}>
                    <Box position="relative" px={3} py={2} borderBottomWidth="1px" borderColor="border.main">
                      <Box
                        position="absolute"
                        left={3}
                        top="50%"
                        transform="translateY(-50%)"
                        zIndex={1}
                        color="text.muted"
                      >
                        <FiSearch />
                      </Box>
                      <Input
                        ref={folderSearchRef}
                        name="folder-search"
                        aria-label="Search folders"
                        placeholder="Type to find a folder"
                        size="sm"
                        value={folderSearch}
                        onChange={(event) => setFolderSearch(event.currentTarget.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') event.preventDefault();
                        }}
                        ps={7}
                        border={0}
                      />
                    </Box>
                    <Popover.Body p={1} maxH="240px" overflowY="auto">
                      {[{ id: '', name: 'No folder', depth: 0 }, ...folders]
                        .filter((item) => item.name.toLowerCase().includes(folderSearch.toLowerCase().trim()))
                        .map((item) => (
                          <Button
                            key={item.id}
                            type="button"
                            variant="ghost"
                            size="sm"
                            w="full"
                            justifyContent="space-between"
                            aria-label={item.name}
                            onClick={() => {
                              setFolderId(item.id || null);
                              setFolderOpen(false);
                              setFolderSearch('');
                            }}
                          >
                            <HStack pl={(item.depth ?? 0) * 3}>
                              <FiFolder />
                              <Text>{item.name}</Text>
                            </HStack>
                            {(folderId ?? '') === item.id && <FiCheck />}
                          </Button>
                        ))}
                    </Popover.Body>
                  </Popover.Content>
                </Popover.Positioner>
              </Portal>
            </Popover.Root>
            <Popover.Root open={priorityOpen} onOpenChange={({ open }) => setPriorityOpen(open)}>
              <Popover.Trigger asChild>
                <Button type="button" variant="outline" size="sm" aria-label="Priority" disabled={pending}>
                  <Text
                    as="span"
                    px={2}
                    borderRadius="full"
                    bg={
                      values.priority === 'high'
                        ? 'status.attention.bg'
                        : values.priority === 'low'
                          ? 'status.neutral.bg'
                          : 'status.total.bg'
                    }
                    color="text.secondary"
                  >
                    {values.priority === 'high' ? 'High' : values.priority === 'low' ? 'Low' : 'Medium'}
                  </Text>
                  <FiChevronDown />
                </Button>
              </Popover.Trigger>
              <Portal>
                <Popover.Positioner>
                  <Popover.Content w="120px" bg="bg.card" p={1}>
                    <Popover.Body p={0}>
                      {(['high', 'medium', 'low'] as const).map((priority) => (
                        <Button
                          key={priority}
                          type="button"
                          variant="ghost"
                          size="sm"
                          w="full"
                          justifyContent="flex-start"
                          onClick={() => {
                            setValue('priority', priority, { shouldDirty: true, shouldValidate: true });
                            setPriorityOpen(false);
                          }}
                        >
                          <Text
                            as="span"
                            px={2}
                            borderRadius="full"
                            bg={
                              priority === 'high'
                                ? 'status.attention.bg'
                                : priority === 'low'
                                  ? 'status.neutral.bg'
                                  : 'status.total.bg'
                            }
                            color="text.secondary"
                          >
                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                          </Text>
                        </Button>
                      ))}
                    </Popover.Body>
                  </Popover.Content>
                </Popover.Positioner>
              </Portal>
            </Popover.Root>
          </HStack>
          <Input
            {...register('title')}
            bg="bg.card"
            name="title"
            aria-label="Title"
            fontSize="xl"
            fontWeight="semibold"
            h="48px"
            placeholder="Scenario title"
            disabled={pending}
            error={errors.title?.message}
          />
          <Textarea
            {...register('details')}
            bg="bg.card"
            name="details"
            aria-label="Details"
            placeholder="What this scenario covers and why (optional)"
            minH="64px"
            disabled={pending}
            error={errors.details?.message}
          />
        </VStack>
        <Box borderTopWidth="1px" borderColor="border.main" />
        <Grid templateColumns={{ base: '1fr', lg: 'minmax(0, 1fr) 200px' }} gap={6}>
          <VStack align="stretch" gap={4}>
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={5}>
              <Textarea
                {...register('preconditions')}
                bg="bg.card"
                name="preconditions"
                label="Preconditions"
                fieldProps={{ labelProps: { fontSize: 'sm', fontWeight: 'semibold' } }}
                fontSize="md"
                placeholder="State the system must be in before step 1"
                minH="84px"
                disabled={pending}
                error={errors.preconditions?.message}
              />
              <Textarea
                {...register('testData')}
                bg="bg.card"
                name="testData"
                label="Test data"
                fieldProps={{ labelProps: { fontSize: 'sm', fontWeight: 'semibold' } }}
                fontSize="md"
                placeholder="Accounts, cards, URLs or files the steps need. One per line."
                minH="84px"
                disabled={pending}
                error={errors.testData?.message}
              />
            </Grid>
            <HStack justify="space-between" flexWrap="wrap">
              <Heading size="md">
                Steps{' '}
                <Text as="span" color="text.secondary">
                  {steps.length}
                </Text>
              </Heading>
              <Text fontSize="xs" color="text.secondary">
                Drag to reorder · Enter in the last field adds a step
              </Text>
            </HStack>
            <Grid
              display={{ base: 'none', md: 'grid' }}
              templateColumns="30px 24px minmax(0, 1fr) minmax(0, 1fr) 30px"
              gap={3}
              fontSize="sm"
              color="text.primary"
              fontWeight="semibold"
              mb={-2}
              aria-hidden="true"
            >
              <Box />
              <Text>#</Text>
              <Text>Action</Text>
              <Text>Expected result</Text>
              <Box />
            </Grid>
            <VStack as="ol" aria-label="Scenario steps" align="stretch" gap={3} m={0} p={0}>
              {steps.map((step, index) => (
                <Box
                  as="li"
                  key={step.key}
                  data-step-key={step.key}
                  listStyle="none"
                  borderRadius="md"
                  bg={draggedStep === step.key || grabbed === step.key ? 'blue.50' : 'transparent'}
                  outline={draggedStep === step.key || grabbed === step.key ? '2px solid' : '2px solid transparent'}
                  outlineColor={draggedStep === step.key || grabbed === step.key ? 'blue.400' : 'transparent'}
                  boxShadow={draggedStep === step.key || grabbed === step.key ? 'md' : 'none'}
                  _dark={{ bg: draggedStep === step.key || grabbed === step.key ? 'blue.900' : 'transparent' }}
                >
                  <Grid
                    templateColumns={{ base: '30px 1fr 30px', md: '30px 24px minmax(0, 1fr) minmax(0, 1fr) 30px' }}
                    gap={3}
                    alignItems="center"
                  >
                    <IconButton
                      type="button"
                      size="xs"
                      variant="ghost"
                      aria-label={`Reorder step ${index + 1}`}
                      aria-pressed={grabbed === step.key}
                      data-handle-key={step.key}
                      disabled={pending}
                      cursor={draggedStep === step.key ? 'grabbing' : 'grab'}
                      color={draggedStep === step.key || grabbed === step.key ? 'blue.600' : 'text.secondary'}
                      style={{ touchAction: 'none' }}
                      onPointerDown={(e) => {
                        if (pending) return;
                        pointer.current = { key: step.key, id: e.pointerId };
                        setDraggedStep(step.key);
                        e.currentTarget.setPointerCapture?.(e.pointerId);
                      }}
                      onPointerMove={(e) => {
                        if (pointer.current?.key !== step.key) return;
                        const target = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-step-key]');
                        const key = target?.getAttribute('data-step-key');
                        if (key)
                          move(
                            step.key,
                            steps.findIndex((s) => s.key === key),
                          );
                      }}
                      onPointerUp={(e) => {
                        pointer.current = null;
                        setDraggedStep(undefined);
                        e.currentTarget.releasePointerCapture?.(e.pointerId);
                      }}
                      onPointerCancel={() => {
                        pointer.current = null;
                        setDraggedStep(undefined);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault();
                          if (grabbed !== step.key) pickedUpOrder.current = steps.map((row) => row.key);
                          setGrabbed(grabbed === step.key ? undefined : step.key);
                          setAnnouncement(grabbed === step.key ? 'Step dropped' : `Step ${index + 1} picked up`);
                        } else if (grabbed === step.key && ['ArrowUp', 'ArrowDown'].includes(e.key)) {
                          e.preventDefault();
                          move(step.key, index + (e.key === 'ArrowUp' ? -1 : 1));
                        } else if (e.key === 'Escape' && grabbed === step.key) {
                          e.preventDefault();
                          setSteps((current) => {
                            const order = new Map(pickedUpOrder.current.map((key, position) => [key, position]));
                            return [...current].sort(
                              (left, right) =>
                                (order.get(left.key) ?? current.length) - (order.get(right.key) ?? current.length),
                            );
                          });
                          setGrabbed(undefined);
                          setFocusHandle(step.key);
                          setAnnouncement('Reordering cancelled');
                        }
                      }}
                    >
                      <Text aria-hidden="true">⠿</Text>
                    </IconButton>
                    <Text display={{ base: 'none', md: 'block' }} pt={1}>
                      {index + 1}
                    </Text>
                    <Textarea
                      name={`step-${step.key}-action`}
                      bg="bg.card"
                      placeholder="What the tester does"
                      minH="40px"
                      rows={1}
                      aria-label={`Step ${index + 1} action`}
                      data-action-key={step.key}
                      value={step.action}
                      disabled={pending}
                      error={stepErrors[step.key]}
                      onChange={(e) => update(step.key, 'action', e.target.value)}
                      resize="vertical"
                    />
                    <Box gridColumn={{ base: '2', md: 'auto' }}>
                      <Textarea
                        name={`step-${step.key}-expected`}
                        bg="bg.card"
                        placeholder="What should happen"
                        minH="40px"
                        rows={1}
                        aria-label={`Step ${index + 1} expected result`}
                        value={step.expectedResult}
                        disabled={pending}
                        onChange={(e) => update(step.key, 'expectedResult', e.target.value)}
                        onKeyDown={(e) => {
                          if (
                            e.key === 'Enter' &&
                            !e.shiftKey &&
                            !e.nativeEvent.isComposing &&
                            index === steps.length - 1
                          ) {
                            e.preventDefault();
                            if (!e.repeat) append();
                          }
                        }}
                        resize="vertical"
                      />
                    </Box>
                    <IconButton
                      type="button"
                      aria-label={`Remove step ${index + 1}`}
                      size="xs"
                      variant="ghost"
                      disabled={pending}
                      onClick={() => setSteps((previous) => previous.filter((s) => s.key !== step.key))}
                    >
                      <FiX />
                    </IconButton>
                  </Grid>
                </Box>
              ))}
            </VStack>
            <Button
              type="button"
              variant="outline"
              borderStyle="dashed"
              borderColor="text.muted"
              alignSelf={{ base: 'stretch', md: 'auto' }}
              ml={{ md: '78px' }}
              mr={{ md: '42px' }}
              disabled={pending}
              onClick={append}
            >
              <FiPlus />
              Add step
            </Button>
            <Text role="status" aria-live="polite" srOnly>
              {announcement}
            </Text>
          </VStack>
          <VStack align="stretch" gap={6}>
            <Box>
              <Heading size="sm" mb={2}>
                Suites
              </Heading>
              <HStack gap={2} flexWrap="wrap">
                {selectedSuites.map((suite) => (
                  <HStack
                    key={suite.id}
                    gap={1}
                    bg="blue.100"
                    color="blue.700"
                    _dark={{ bg: 'blue.900', color: 'blue.100' }}
                    borderRadius="full"
                    pl={3}
                    pr={1}
                    py={0.5}
                  >
                    <Text fontSize="sm">{suite.name}</Text>
                    <IconButton
                      type="button"
                      variant="ghost"
                      size="2xs"
                      color="inherit"
                      _hover={{ bg: 'transparent', color: 'inherit' }}
                      aria-label={`Remove suite ${suite.name}`}
                      disabled={pending}
                      onClick={() => setSelectedSuites((previous) => previous.filter((s) => s.id !== suite.id))}
                    >
                      <FiX />
                    </IconButton>
                  </HStack>
                ))}
                <SuitePicker
                  mode="draft"
                  suites={suites}
                  selectedNames={selectedSuites.map((suite) => suite.name)}
                  disabled={pending}
                  onSelect={(suite) => setSelectedSuites((previous) => [...previous, suite])}
                />
                {!selectedSuites.length && (
                  <Text color="text.secondary" fontSize="sm">
                    Not in any suite
                  </Text>
                )}
              </HStack>
            </Box>
            <Box>
              <HStack mb={2}>
                <FiLink />
                <Heading size="sm">Requirement or ticket</Heading>
              </HStack>
              <Input
                {...register('relatedIssueUrl')}
                bg="bg.card"
                name="relatedIssueUrl"
                aria-label="Requirement or ticket"
                placeholder="https://youtrack… or https://jira…"
                disabled={pending}
                error={errors.relatedIssueUrl?.message}
              />
            </Box>
          </VStack>
        </Grid>
      </VStack>
    </Box>
  );
};
export const TestScenarioAuthoringForm = TestScenarioForm;
