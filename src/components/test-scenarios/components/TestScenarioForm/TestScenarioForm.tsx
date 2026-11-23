// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import {
  Alert,
  Box,
  Button,
  Grid,
  Heading,
  HStack,
  IconButton,
  Link,
  Popover,
  Portal,
  Text,
  VStack,
} from '@chakra-ui/react';
import { FiCheck, FiChevronDown, FiFolder, FiLink, FiPlus, FiSearch, FiX } from 'react-icons/fi';

import { Input, Textarea } from '@/components/ui';
import type { TestScenarioAuthoringFormData } from '@/schemas';

import { SuitePicker } from '../SuitePicker';
import { useTestScenarioForm } from './hooks/useTestScenarioForm';
import type { TestScenarioEditableField, TestScenarioEditableValues, TestScenarioInitialStepDraft } from '../../types';

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
  createAnotherReset?: { token: number; suites: ScenarioSuiteDraft[] };
  focusTitle?: boolean;
  history?: {
    createdAt: string;
    updatedAt: string;
    createdBy?: { name?: string | null } | null;
    updatedBy?: { name?: string | null } | null;
  };
  originLabel?: string;
  originKind?: 'scenarios' | 'suites';
  onNavigateOrigin?: () => void;
  onNavigateSection?: () => void;
  isSubmitting?: boolean;
  apiError?: string;
  errorMessage?: string;
  successMessage?: string;
  folders?: Array<{ id: string; name: string; depth?: number; path?: string }>;
  initialFolderId?: string | null;
  onDirtyChange?: (dirty: boolean) => void;
  onReload?: () => void;
  errorCatalogPath?: string;
  onSubmit: (
    values: TestScenarioAuthoringFormData,
    steps: TestScenarioInitialStepDraft[],
    folderId?: string | null,
    collections?: ScenarioDraftCollections,
    createAnother?: boolean,
  ) => void | Promise<void>;
  onCancel: (folderId?: string | null) => void;
}
export const TestScenarioForm = (props: TestScenarioFormProps) => {
  const {
    mode,
    initialValues,
    suites = [],
    originLabel,
    originKind = 'scenarios',
    onNavigateOrigin,
    onNavigateSection,
    apiError,
    errorMessage,
    successMessage,
    onReload,
    errorCatalogPath,
  } = props;
  const {
    root,
    register,
    handleSubmit,
    submit,
    createdConfirmation,
    setCreatedConfirmation,
    pending,
    errors,
    steps,
    draggedStep,
    dropTarget,
    grabbed,
    getStepReorderHandlers,
    stepErrors,
    update,
    append,
    setSteps,
    announcement,
    createAnother,
    setCreateAnother,
    cancel,
    folderId,
    values,
    priorityOpen,
    setPriorityOpen,
    setValue,
    selectedSuites,
    setSelectedSuites,
    folderPicker: {
      folder,
      filteredFolders,
      selectFolder,
      folderOpen,
      changeFolderOpen,
      folderSearch,
      setFolderSearch,
      folderSearchRef,
    },
  } = useTestScenarioForm(props);
  const handleClearCreatedConfirmation = () => {
    if (createdConfirmation) setCreatedConfirmation(false);
  };

  const handleScheduleClearCreatedConfirmation = () => {
    if (createdConfirmation) setTimeout(() => setCreatedConfirmation(false), 0);
  };

  const handleSelectFolderOnEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (filteredFolders[0]) selectFolder(filteredFolders[0].id);
    }
  };

  const handleAppendStepOnEnter = (index: number, e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      e.key === 'Enter' &&
      !e.shiftKey &&
      !e.nativeEvent.isComposing &&
      index === steps.length - 1
    ) {
      e.preventDefault();
      if (!e.repeat) append();
    }
  };

  const handleSelectPriority = (priority: 'high' | 'medium' | 'low') => {
    setValue('priority', priority, { shouldDirty: true, shouldValidate: true });
    setPriorityOpen(false);
  };

  return (
    <Box
      as="form"
      ref={root}
      onSubmit={handleSubmit(submit)}
      onChangeCapture={handleClearCreatedConfirmation}
      onClickCapture={handleScheduleClearCreatedConfirmation}
      mx={{ base: 3, md: 6 }}
      my={4}
      position="relative"
    >
      <VStack align="stretch" gap={4}>
        <HStack as="nav" aria-label="Breadcrumb" gap={2} wrap="wrap" fontSize="md" color="text.secondary">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            fontSize="md"
            fontWeight="normal"
            color="text.secondary"
            _hover={{ bg: 'transparent', textDecoration: 'underline' }}
            onClick={onNavigateSection ?? onNavigateOrigin ?? cancel}
            disabled={pending}
          >
            {originKind === 'suites' ? 'Suites' : 'Scenarios'}
          </Button>
          {originLabel && originLabel !== 'All scenarios' && (
            <>
              <Text>›</Text>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                fontSize="md"
                fontWeight="normal"
                color="text.secondary"
                _hover={{ bg: 'transparent', textDecoration: 'underline' }}
                onClick={onNavigateOrigin ?? cancel}
                disabled={pending}
              >
                {originLabel}
              </Button>
            </>
          )}
          <Text>›</Text>
          <Text color="text.primary">
            {mode === 'create' ? 'New scenario' : initialValues?.scenarioKey || 'Scenario'}
          </Text>
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
        {createdConfirmation && (
          <Alert.Root status="success">
            <Alert.Content>Scenario created.</Alert.Content>
          </Alert.Root>
        )}
        {successMessage && (
          <Alert.Root status="success">
            <Alert.Content>{successMessage}</Alert.Content>
          </Alert.Root>
        )}
        <Grid
          templateColumns={{ base: '1fr', lg: 'minmax(0, 2fr) minmax(300px, 300px)' }}
          gap={{ base: 6, lg: 8 }}
          p={{ base: 4, md: 8 }}
          bg="bg.card"
          borderRadius="12px"
          shadow="sm"
        >
          <VStack data-testid="scenario-card-main" align="stretch" gap={4}>
            <VStack align="stretch" gap={2} ml={{ md: '78px' }} mr={{ md: '42px' }}>
              <Input
                {...register('title')}
                bg="bg.card"
                name="title"
                aria-label="Title"
                fontSize="xl"
                fontWeight="semibold"
                h="44px"
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
                minH="40px"
                rows={1}
                resize="none"
                data-autogrow="true"
                disabled={pending}
                error={errors.details?.message}
              />
            </VStack>
            <VStack align="stretch" gap={4}>
              <Grid
                data-autogrow-group
                templateColumns={{ base: '1fr', md: '1fr 1fr' }}
                gap={3}
                ml={{ md: '78px' }}
                mr={{ md: '42px' }}
              >
                <Textarea
                  {...register('preconditions')}
                  bg="bg.card"
                  name="preconditions"
                  label="Preconditions"
                  fieldProps={{ labelProps: { fontSize: 'md', fontWeight: 'semibold' } }}
                  fontSize="md"
                  placeholder="State before step 1"
                  minH="40px"
                  rows={1}
                  resize="none"
                  data-autogrow="true"
                  disabled={pending}
                  error={errors.preconditions?.message}
                />
                <Textarea
                  {...register('testData')}
                  bg="bg.card"
                  name="testData"
                  label="Test data"
                  fieldProps={{ labelProps: { fontSize: 'md', fontWeight: 'semibold' } }}
                  fontSize="md"
                  placeholder="Accounts, cards, URLs"
                  minH="40px"
                  rows={1}
                  resize="none"
                  data-autogrow="true"
                  disabled={pending}
                  error={errors.testData?.message}
                />
              </Grid>
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
                <Text color="text.secondary">#</Text>
                <Text color="text.secondary">Steps</Text>
                <Text color="text.secondary">Expected result</Text>
                <Box />
              </Grid>
              <VStack as="ol" aria-label="Scenario steps" align="stretch" gap={3} m={0} p={0}>
                {steps.map((step, index) => (
                  <Box
                    as="li"
                    key={step.key}
                    data-step-key={step.key}
                    data-dragging={draggedStep === step.key || undefined}
                    data-drop-target={dropTarget === step.key || undefined}
                    opacity={draggedStep === step.key ? 0.45 : 1}
                    listStyle="none"
                    position="relative"
                    borderRadius="md"
                    bg={draggedStep === step.key || grabbed === step.key ? 'blue.50' : 'transparent'}
                    outline={draggedStep === step.key || grabbed === step.key ? '2px solid' : '2px solid transparent'}
                    outlineColor={draggedStep === step.key || grabbed === step.key ? 'blue.400' : 'transparent'}
                    boxShadow={draggedStep === step.key || grabbed === step.key ? 'md' : 'none'}
                    _after={
                      dropTarget === step.key && draggedStep && draggedStep !== step.key
                        ? {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            height: '2px',
                            bg: 'blue.500',
                            borderRadius: 'full',
                            pointerEvents: 'none',
                            zIndex: 1,
                            ...(steps.findIndex((row) => row.key === draggedStep) < index
                              ? { bottom: '-7px' }
                              : { top: '-7px' }),
                          }
                        : undefined
                    }
                    _dark={{ bg: draggedStep === step.key || grabbed === step.key ? 'blue.900' : 'transparent' }}
                  >
                    <Grid
                      templateColumns={{
                        base: '24px 20px minmax(0, 1fr) 28px',
                        md: '30px 24px minmax(0, 1fr) minmax(0, 1fr) 30px',
                      }}
                      gap={3}
                      alignItems="start"
                    >
                      <IconButton
                        type="button"
                        size="xs"
                        mt={1}
                        variant="ghost"
                        aria-label={`Reorder step ${index + 1}`}
                        aria-pressed={grabbed === step.key}
                        data-handle-key={step.key}
                        gridColumn={{ base: '1', md: 'auto' }}
                        gridRow={{ base: '1 / span 2', md: 'auto' }}
                        disabled={pending}
                        cursor={draggedStep === step.key ? 'grabbing' : 'grab'}
                        color={draggedStep === step.key || grabbed === step.key ? 'blue.600' : 'text.secondary'}
                        style={{ touchAction: 'none' }}
                        {...getStepReorderHandlers(step, index)}
                      >
                        <Text aria-hidden="true">⠿</Text>
                      </IconButton>
                      <Text
                        gridColumn={{ base: '2', md: 'auto' }}
                        gridRow={{ base: '1', md: 'auto' }}
                        pt={1}
                        color="text.secondary"
                      >
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
                        fieldProps={{ gridColumn: { base: '3', md: 'auto' }, gridRow: { base: '1', md: 'auto' } }}
                        data-autogrow="true"
                        value={step.action}
                        disabled={pending}
                        error={stepErrors[step.key]}
                        onChange={(e) => update(step.key, 'action', e.target.value)}
                        resize="none"
                      />
                      <Box gridColumn={{ base: '3', md: 'auto' }} gridRow={{ base: '2', md: 'auto' }}>
                        <Textarea
                          name={`step-${step.key}-expected`}
                          bg="bg.card"
                          placeholder="What should happen"
                          minH="40px"
                          rows={1}
                          aria-label={`Step ${index + 1} expected result`}
                          data-autogrow="true"
                          value={step.expectedResult}
                          disabled={pending}
                          onChange={(e) => update(step.key, 'expectedResult', e.target.value)}
                          onKeyDown={(e) => handleAppendStepOnEnter(index, e)}
                          resize="none"
                        />
                      </Box>
                      <IconButton
                        type="button"
                        aria-label={`Remove step ${index + 1}`}
                        gridColumn={{ base: '4', md: 'auto' }}
                        gridRow={{ base: '1', md: 'auto' }}
                        size="xs"
                        mt={1}
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
            <HStack justify="end" gap={2} flexWrap="wrap" mr={{ md: '42px' }}>
              {mode === 'create' && (
                <label>
                  <input
                    type="checkbox"
                    checked={createAnother}
                    onChange={(event) => setCreateAnother(event.currentTarget.checked)}
                  />{' '}
                  Create another scenario
                </label>
              )}
              <Button type="button" variant="ghost" onClick={cancel} disabled={pending}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={pending} disabled={pending}>
                {mode === 'create' ? 'Save scenario' : 'Save changes'}
              </Button>
            </HStack>
          </VStack>
          <VStack
            data-testid="scenario-card-sidebar"
            align="stretch"
            gap={6}
            borderLeftWidth={{ base: 0, lg: '1px' }}
            borderColor="border.main"
            pl={{ base: 0, lg: 6 }}
          >
            <Box>
              <Text fontSize="sm" mb={2}>
                Folder
              </Text>
              <Popover.Root
                initialFocusEl={() => folderSearchRef.current}
                open={folderOpen}
                onOpenChange={({ open }) => changeFolderOpen(open)}
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
                          left={5}
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
                          bg="bg.card"
                          value={folderSearch}
                          onChange={(event) => setFolderSearch(event.currentTarget.value)}
                          onKeyDown={handleSelectFolderOnEnter}
                          ps="33px"
                          border={0}
                        />
                      </Box>
                      <Popover.Body p={1} maxH="240px" overflowY="auto">
                        {filteredFolders.length === 0 && (
                          <Text p={2} fontSize="sm">
                            No folders found.
                          </Text>
                        )}
                        {filteredFolders.map((item) => (
                          <Button
                            key={item.id}
                            type="button"
                            variant="ghost"
                            size="sm"
                            w="full"
                            justifyContent="space-between"
                            aria-label={item.name}
                            aria-pressed={(folderId ?? '') === item.id}
                            bg={(folderId ?? '') === item.id ? 'blue.subtle' : 'transparent'}
                            onClick={() => selectFolder(item.id)}
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
            </Box>
            <Box>
              <Text fontSize="sm" mb={2}>
                Priority
              </Text>
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
                            onClick={() => handleSelectPriority(priority)}
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
            </Box>
            <Box>
              <Heading size="sm" mb={2}>
                Suites
              </Heading>
              <HStack gap={2} flexWrap="wrap" align="start">
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
                  selectedIds={selectedSuites.filter((suite) => !suite.isNew).map((suite) => suite.id)}
                  selectedNewNames={selectedSuites.filter((suite) => suite.isNew).map((suite) => suite.name)}
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
