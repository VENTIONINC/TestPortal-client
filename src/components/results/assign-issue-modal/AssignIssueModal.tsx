// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert as ChakraAlert,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  RadioGroup,
  Spinner,
  Stack,
  Tabs,
  Text,
  VStack,
} from '@chakra-ui/react';
import {
  LuCheck,
  LuClipboard,
  LuFileCode2,
  LuFileText,
  LuInfo,
  LuMaximize2,
  LuMinimize2,
  LuScrollText,
  LuTestTube,
  LuUndo2,
  LuWandSparkles,
} from 'react-icons/lu';

import {
  Badge,
  Dialog,
  DialogBody,
  DialogFooter,
  Input,
  Textarea,
  Tooltip,
  toaster,
} from '@/components/ui';
import { ResultCategory } from '@/types';
import type { DefaultDialogProps } from '@/types';
import { copyToClipboard } from '@/utils';
import { getIssueCategoryStyle } from '@/utils/issue-category';

import {
  assignIssueModalStatus,
  isConfirmedIssueStatus,
  isReadOnlyIssueStatus,
  type AssignIssueModalState,
} from './assignIssueModalState';
import { useAssignIssueModal } from './useAssignIssueModal';

export interface AssignIssueModalProps extends DefaultDialogProps {
  resultErrorId: string;
  projectId: string;
  mode: 'assign' | 'confirmed' | 'context';
  selectedAssumptionId?: string;
}

const categoryItems = [
  { value: 'bug', label: 'Bug', style: getIssueCategoryStyle(ResultCategory.Bug) },
  { value: 'script', label: 'Script', style: getIssueCategoryStyle(ResultCategory.Script) },
  { value: 'infra', label: 'Environment', style: getIssueCategoryStyle(ResultCategory.Infra) },
  { value: 'performance', label: 'Performance', style: getIssueCategoryStyle(ResultCategory.Performance) },
  { value: 'other', label: 'Other', style: getIssueCategoryStyle(ResultCategory.Other) },
] as const;

export const descriptionTextareaProps = {
  h: { base: '240px', lg: 'clamp(160px, 21vh, 320px)' },
  overflowY: 'auto',
  resize: 'none',
} as const;

export const similarityErrorNoticeProps = {
  title: 'Couldn’t check for matching issues. Search by name above, or retry.',
  retryLabel: 'Retry',
} as const;

export const categorisationErrorNoticeProps = {
  title: 'Couldn’t draft the issue details. Fill them in below, or retry.',
  retryLabel: 'Retry',
} as const;

type ResultDialogTitleData = {
  id: string | number;
  attempt: number;
  startTime: string;
  duration: number;
};

export function getResultDialogTitle(result: ResultDialogTitleData | undefined, isContextOnly: boolean, isConfirmed: boolean) {
  const existingTitle = isConfirmed ? 'Edit Issue' : 'Assign Issue';
  const mainTitle = isContextOnly ? 'Result details' : existingTitle;
  if (!result) return 'Result';

  const startedAt = new Date(result.startTime).toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return (
    <>
      <Text as="span">{mainTitle}</Text>{' '}
      <Text as="span" color="text.secondary" fontSize="sm" data-result-metadata>
        · Attempt #{result.attempt} · Started {startedAt} · Duration {formatDuration(result.duration)}
      </Text>
    </>
  );
}

export function AssignIssueModal({ resultErrorId, projectId, mode, selectedAssumptionId, closeDialog }: AssignIssueModalProps) {
  const modal = useAssignIssueModal({ resultErrorId, projectId, mode, selectedAssumptionId, onClose: closeDialog });
  const { state, context, actions } = modal;
  const isContextOnly = mode === 'context';
  const isReadOnly = isReadOnlyIssueStatus(state.status);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [isContextExpanded, setIsContextExpanded] = useState(false);

  useEffect(() => {
    if (!isReadOnly) nameInputRef.current?.focus();
  }, [isReadOnly]);

  return (
    <Dialog
      title={getResultDialogTitle(context?.result, isContextOnly, isConfirmedIssueStatus(state.status))}
      onClose={actions.close}
      size="xl"
      initialFocusEl={() => (isContextOnly || isReadOnly ? null : nameInputRef.current)}
      contentProps={{ h: 'min(750px, calc(100dvh - 8rem))', minW: { lg: 'clamp(1000px, calc(100vw - 8rem), 1400px)' } }}
    >
      <DialogBody p={0} display="flex" flexDirection="column" minH={0} overflowY={{ base: 'auto', lg: 'hidden' }}>
        <Box flexShrink={0} borderBottomWidth="1px" borderColor="border.main" />
        {!context ? (
          <ContextLoading isError={modal.contextQuery.isError} onRetry={modal.contextQuery.refetch} />
        ) : (
          <>
            <Flex flex="1" minH={0} direction={{ base: 'column', lg: 'row' }} overflow={{ lg: 'hidden' }}>
              <Box
                as="section"
                aria-label="Result context"
                flex={isContextOnly || isContextExpanded ? '1 1 100%' : '1 1 56%'}
                minW={0}
                minH={{ base: '320px', lg: 0 }}
                borderEndWidth={{ base: 0, lg: '1px' }}
                borderBottomWidth={{ base: '1px', lg: 0 }}
                borderColor="border.main"
              >
                <Flex h="full" minH={0}>
                  <Box flex="1" minW={0} minH={0}>
                    <ContextTabs context={context} />
                  </Box>
                  {!isContextOnly && (
                    <Flex
                      role="toolbar"
                      aria-label="Result context controls"
                      display={{ base: 'none', lg: 'flex' }}
                      direction="column"
                      align="center"
                      flexShrink={0}
                      w="56px"
                      py={3}
                      borderStartWidth="1px"
                      borderColor="border.main"
                    >
                      <Tooltip content={isContextExpanded ? 'Restore issue assignment' : 'Expand result context'}>
                        <IconButton
                          aria-label={isContextExpanded ? 'Restore issue assignment' : 'Expand result context'}
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsContextExpanded((expanded) => !expanded)}
                        >
                          {isContextExpanded ? <LuMinimize2 /> : <LuMaximize2 />}
                        </IconButton>
                      </Tooltip>
                    </Flex>
                  )}
                </Flex>
              </Box>

              {!isContextOnly && !isContextExpanded && (
                <VStack
                  as="section"
                  aria-label="Issue assignment"
                  align="stretch"
                  flex="1 1 44%"
                  minW={0}
                  minH={0}
                  overflowY={{ lg: 'auto' }}
                  p={{ base: 4, md: 6 }}
                  gap={4}
                >
                  <CategorySelector
                    value={state.form.category}
                    disabled={isReadOnly}
                    onChange={(category) => actions.updateForm({ category })}
                  />
                  <Stack gap={1}>
                    <Input
                      ref={nameInputRef}
                      name="issue-name"
                      label="Issue name"
                      labelAction={
                        !isReadOnly && state.form.name ? (
                          <PolishActions field="name" state={modal.polish.name} actions={actions} />
                        ) : undefined
                      }
                      aria-label="Issue name"
                      autoFocus={!isReadOnly}
                      value={state.form.name}
                      disabled={isReadOnly}
                      onChange={(event) => actions.updateForm({ name: event.target.value })}
                      placeholder="Type at least 3 characters to search..."
                    />
                  </Stack>
                  <Stack gap={1}>
                    <Textarea
                      name="description"
                      label="Description"
                      labelAction={
                        !isReadOnly && state.form.description ? (
                          <PolishActions field="description" state={modal.polish.description} actions={actions} />
                        ) : undefined
                      }
                      aria-label="Description"
                      {...descriptionTextareaProps}
                      value={state.form.description}
                      disabled={isReadOnly}
                      onChange={(event) => actions.updateForm({ description: event.target.value })}
                      placeholder="Describe the issue..."
                    />
                  </Stack>
                  <Stack mt="auto" gap={3}>
                    {state.status === assignIssueModalStatus.similarityError && (
                      <SimilarityErrorNotice
                        onRetry={actions.retrySimilarity}
                        isSearching={modal.similarityRequest.isLoading}
                      />
                    )}
                    {state.status === assignIssueModalStatus.categorisationError && (
                      <CategorisationErrorNotice
                        onRetry={actions.categorise}
                        isCategorising={modal.categorisationRequest.isLoading}
                      />
                    )}
                    <FeedbackArea
                      state={state}
                      actions={actions}
                      isMutating={modal.isMutating}
                      operationError={modal.operationError}
                    />
                    <FormActions
                      state={state}
                      actions={actions}
                      isMutating={modal.isMutating}
                      isSearching={modal.similarityRequest.isLoading}
                      canFindMatchingIssues={modal.canFindMatchingIssues}
                    />
                    <ConfirmedIssueActions state={state} actions={actions} isMutating={modal.isMutating} />
                  </Stack>
                </VStack>
              )}
            </Flex>
          </>
        )}
      </DialogBody>
      {context && !isContextOnly && <ModalFooter state={state} actions={actions} isMutating={modal.isMutating} />}
    </Dialog>
  );
}

const CategorySelector = ({
  value,
  disabled,
  onChange,
}: {
  value: AssignIssueModalState['form']['category'];
  disabled: boolean;
  onChange: (value: AssignIssueModalState['form']['category']) => void;
}) => (
  <RadioGroup.Root
    aria-label="Category"
    value={value}
    disabled={disabled}
    onValueChange={(details) => onChange(details.value as AssignIssueModalState['form']['category'])}
  >
    <RadioGroup.Label mb={1} fontSize="12px">Category</RadioGroup.Label>
    <HStack gap={2} flexWrap="wrap">
      {categoryItems.map((item) => (
        <RadioGroup.Item
          key={item.value}
          value={item.value}
          minH="26px"
          px={3}
          py={1}
          borderWidth="1px"
          borderColor="border.main"
          borderRadius="full"
          bg="transparent"
          color="text.secondary"
          cursor="pointer"
          _checked={{ bg: item.style.color, borderColor: item.style.color, color: 'white' }}
          _disabled={{ cursor: 'not-allowed', opacity: 0.5 }}
        >
          <RadioGroup.ItemHiddenInput />
          <RadioGroup.ItemText fontSize="12px" lineHeight="1">{item.label}</RadioGroup.ItemText>
        </RadioGroup.Item>
      ))}
    </HStack>
  </RadioGroup.Root>
);

const ContextLoading = ({ isError, onRetry }: { isError: boolean; onRetry: () => unknown }) => (
  <VStack flex="1" justify="center" gap={4} p={8}>
    {isError ? (
      <>
        <Text>Couldn’t load result context.</Text>
        <Button onClick={() => void onRetry()}>Retry</Button>
      </>
    ) : (
      <>
        <Spinner color="blue.500" />
        <Text color="text.secondary">Loading result context…</Text>
      </>
    )}
  </VStack>
);

const ContextTabs = ({ context }: { context: NonNullable<ReturnType<typeof useAssignIssueModal>['context']> }) => {
  const hasLogs = context.error.logs.length > 0;
  const hasSnippet = Boolean(context.error.sourceSnippet);
  const hasTestCase = Boolean(context.error.generatedTestCase?.trim());
  const hasOptionalTabs = hasLogs || hasSnippet || hasTestCase;

  if (!hasOptionalTabs) {
    return (
      <Box h="full" minH={0} p={{ base: 4, md: 6 }} overflow="hidden">
        <ErrorContext context={context} />
      </Box>
    );
  }

  return (
    <Tabs.Root
      defaultValue="error"
      orientation="vertical"
      display="grid"
      gridTemplateColumns="56px minmax(0, 1fr)"
      h="full"
      minH={0}
      overflow="hidden"
      variant="subtle"
    >
      <Tabs.List
        flexDirection="column"
        flexShrink={0}
        w="56px"
        px={2}
        py={3}
        gap={1}
        borderEndWidth="1px"
        borderColor="border.main"
      >
        <ContextTab value="error" icon={<LuFileText />} label="Error" />
        {hasLogs && <ContextTab value="logs" icon={<LuScrollText />} label="Logs" />}
        {hasSnippet && <ContextTab value="snippet" icon={<LuFileCode2 />} label="Snippet" />}
        {hasTestCase && <ContextTab value="test-case" icon={<LuTestTube />} label="Test Case" />}
      </Tabs.List>
      <Box gridColumn="2" minW={0} minH={0} overflow={{ lg: 'auto' }}>
        <Tabs.Content value="error" aria-label="Error" h="full" minH={0} p={{ base: 4, md: 6 }} overflow="hidden">
          <ErrorContext context={context} />
        </Tabs.Content>
        {hasLogs && (
          <Tabs.Content value="logs" aria-label="Logs" h="full" minH={0} p={{ base: 4, md: 6 }} overflow="hidden">
            <CodeSection title="Logs" value={context.error.logs.join('\n')} h="full" />
          </Tabs.Content>
        )}
        {hasSnippet && context.error.sourceSnippet && (
          <Tabs.Content value="snippet" aria-label="Snippet" p={{ base: 4, md: 6 }}>
            <SourceSnippet snippet={context.error.sourceSnippet} />
          </Tabs.Content>
        )}
        {hasTestCase && context.error.generatedTestCase && (
          <Tabs.Content value="test-case" aria-label="Test Case" p={{ base: 4, md: 6 }}>
            <CodeSection title="Generated test case" value={context.error.generatedTestCase} />
          </Tabs.Content>
        )}
      </Box>
    </Tabs.Root>
  );
};

const ErrorContext = ({ context }: { context: NonNullable<ReturnType<typeof useAssignIssueModal>['context']> }) => (
  <Stack h="full" minH={0} gap={4} overflow="hidden">
    <CodeSection title="Error message" value={context.error.message} maxH="160px" flexShrink={0} />
    {context.error.callLog.length > 0 && (
      <CodeSection title="Call log" value={context.error.callLog.join('\n')} flex="1 1 0" />
    )}
    {context.error.callStack.length > 0 && (
      <CodeSection title="Call stack" value={context.error.callStack.join('\n')} flex="1 1 0" />
    )}
  </Stack>
);

const ContextTab = ({ value, icon, label }: { value: string; icon: React.ReactNode; label: string }) => (
  <Tabs.Trigger
    value={value}
    aria-label={label}
    title={label}
    justifyContent="center"
    w="40px"
    h="40px"
    p={0}
  >
    {icon}
  </Tabs.Trigger>
);

const CodeSection = ({
  title,
  value,
  flex,
  flexShrink,
  h,
  maxH,
}: {
  title: string;
  value: string;
  flex?: string;
  flexShrink?: number;
  h?: string;
  maxH?: string;
}) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await copyToClipboard(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toaster.create({ title: 'Failed to copy', type: 'error' });
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      flex={flex}
      flexShrink={flexShrink}
      h={h}
      maxH={maxH}
      minH={0}
      minW={0}
      borderWidth="1px"
      borderColor="border.main"
      borderRadius="md"
      overflow="hidden"
      bg="bg.input"
    >
      <Flex align="center" justify="space-between" px={3} py={2} bg="bg.panel" borderBottomWidth="1px" borderColor="border.main">
        <Text fontSize="xs" fontWeight="semibold" color="text.secondary">{title}</Text>
        <Tooltip content={copied ? 'Copied' : `Copy ${title.toLowerCase()}`}>
          <IconButton aria-label={`Copy ${title.toLowerCase()}`} size="xs" variant="ghost" onClick={() => void copy()}>
            {copied ? <LuCheck /> : <LuClipboard />}
          </IconButton>
        </Tooltip>
      </Flex>
      <Text
        as="pre"
        role="region"
        aria-label={`${title} content`}
        tabIndex={0}
        flex="1"
        minH={0}
        minW={0}
        m={0}
        p={4}
        overflow="auto"
        fontFamily="mono"
        fontSize="xs"
        whiteSpace="pre"
      >
        {value}
      </Text>
    </Box>
  );
};

const SourceSnippet = ({
  snippet,
}: {
  snippet: NonNullable<NonNullable<ReturnType<typeof useAssignIssueModal>['context']>['error']['sourceSnippet']>;
}) => {
  const lines = useMemo(() => snippet.text.split('\n'), [snippet.text]);
  return (
    <Box borderWidth="1px" borderColor="border.main" borderRadius="md" overflow="hidden" bg="bg.input">
      <Text px={4} py={2} bg="bg.panel" borderBottomWidth="1px" borderColor="border.main" fontSize="xs" color="text.secondary">
        {snippet.path}
      </Text>
      <Box py={3} overflowX="auto" fontFamily="mono" fontSize="xs">
        {lines.map((line, index) => {
          const lineNumber = snippet.startLine + index;
          const failing = lineNumber === snippet.failingLine;
          return (
            <Flex key={`${lineNumber}-${line}`} bg={failing ? 'badge.error.bg' : undefined} color={failing ? 'badge.error.text' : 'text.primary'}>
              <Text
                data-failing-line={failing ? 'true' : undefined}
                w="52px"
                px={3}
                textAlign="end"
                flexShrink={0}
                color={failing ? 'badge.error.text' : 'text.muted'}
              >
                {lineNumber}
              </Text>
              <Text as="code" px={3} whiteSpace="pre">{line || ' '}</Text>
            </Flex>
          );
        })}
      </Box>
    </Box>
  );
};

const StateNotice = ({
  state,
  actions,
  isMutating,
}: {
  state: AssignIssueModalState;
  actions: ReturnType<typeof useAssignIssueModal>['actions'];
  isMutating: boolean;
}) => {
  if (state.status === assignIssueModalStatus.openingSearch) {
    return <Notice loading title="Looking for issues that match this error…" />;
  }
  if (state.status === assignIssueModalStatus.aiCategorising) {
    return (
      <Notice
        loading
        title="Drafting a category, name and description from this error…"
      />
    );
  }
  if (state.status === assignIssueModalStatus.noMatch) {
    return (
      <Notice
        title="No similar issues were found for this error"
        description="Fill out the form manually, or use Categorise with AI to get a suggested category, name and description."
      />
    );
  }
  if (state.status === assignIssueModalStatus.algorithmSuggestion && state.suggestion) {
    return (
      <Stack gap={2}>
        <HStack
          gap={2}
          p={2}
          borderWidth="1px"
          borderColor="orange.400"
          borderRadius="md"
          bg="orange.50"
          _dark={{ bg: 'orange.950' }}
        >
          <Badge flexShrink={0} bg="dashboard.purple" color="white" isCapitalize={false}>{state.score}% match</Badge>
          <Tooltip
            content={<SimilarityTooltipContent score={state.score ?? 0} />}
            contentProps={{ maxW: '440px', p: 3 }}
          >
            <IconButton
              aria-label="Explain similarity score"
              size="2xs"
              variant="ghost"
              color="orange.600"
              flexShrink={0}
            >
              <LuInfo />
            </IconButton>
          </Tooltip>
          <Text fontSize="sm" lineHeight="short" flex="1">
            We found an existing issue that looks like this failure. Confirm to link it, or Reject to create a new one.
          </Text>
        </HStack>
        <HStack gap={2}>
          <Button flex="1" variant="outline" disabled={isMutating} onClick={() => void actions.rejectSuggestion()}>Reject</Button>
          <Button flex="1" loading={isMutating} onClick={() => void actions.confirmSuggestion()}>Confirm</Button>
        </HStack>
      </Stack>
    );
  }
  if (state.status === assignIssueModalStatus.aiSuggestion) {
    return (
      <Notice
        title={
          <HStack gap={1}>
            <Text>AI-generated suggestion</Text>
            <Tooltip content={<AiSuggestionTooltipContent />} contentProps={{ maxW: '440px', p: 3 }}>
              <IconButton aria-label="Explain AI suggestion" size="2xs" variant="ghost" color="blue.600">
                <LuInfo />
              </IconButton>
            </Tooltip>
          </HStack>
        }
        description="Category, name and description were drafted from this error. Review before assigning."
        showIndicator={false}
      />
    );
  }
  if (state.status === assignIssueModalStatus.categorisationError) {
    return null;
  }
  if (state.status === assignIssueModalStatus.similarityError) {
    return null;
  }
  if (isConfirmedIssueStatus(state.status)) {
    return null;
  }
  return <Notice title="Create or assign an issue" description="Describe this failure or search by issue name." />;
};

const SimilarityErrorNotice = ({ onRetry, isSearching }: { onRetry: () => Promise<void>; isSearching: boolean }) => (
  <ChakraAlert.Root status="warning" variant="subtle" px={3} py={2} borderWidth="1px" borderColor="orange.400">
    <ChakraAlert.Indicator />
    <HStack flex="1" justify="space-between" gap={3}>
      <Text fontSize="sm">{similarityErrorNoticeProps.title}</Text>
      <Button
        size="sm"
        variant="outline"
        colorPalette="orange"
        flexShrink={0}
        loading={isSearching}
        onClick={() => void onRetry()}
      >
        {similarityErrorNoticeProps.retryLabel}
      </Button>
    </HStack>
  </ChakraAlert.Root>
);

const CategorisationErrorNotice = ({
  onRetry,
  isCategorising,
}: {
  onRetry: () => Promise<void>;
  isCategorising: boolean;
}) => (
  <ChakraAlert.Root status="warning" variant="subtle" px={3} py={2} borderWidth="1px" borderColor="orange.400">
    <ChakraAlert.Indicator />
    <HStack flex="1" justify="space-between" gap={3}>
      <Text fontSize="sm">{categorisationErrorNoticeProps.title}</Text>
      <Button
        size="sm"
        variant="outline"
        colorPalette="orange"
        flexShrink={0}
        loading={isCategorising}
        onClick={() => void onRetry()}
      >
        {categorisationErrorNoticeProps.retryLabel}
      </Button>
    </HStack>
  </ChakraAlert.Root>
);

const FeedbackArea = ({
  state,
  actions,
  isMutating,
  operationError,
}: {
  state: AssignIssueModalState;
  actions: ReturnType<typeof useAssignIssueModal>['actions'];
  isMutating: boolean;
  operationError: string | null;
}) => (
  <Stack gap={2}>
    <StateNotice state={state} actions={actions} isMutating={isMutating} />
    {operationError && (
      <ChakraAlert.Root status="error" variant="subtle" px={3} py={2} borderWidth="1px">
        <ChakraAlert.Indicator />
        <ChakraAlert.Content>
          <ChakraAlert.Description>{operationError}</ChakraAlert.Description>
        </ChakraAlert.Content>
      </ChakraAlert.Root>
    )}
  </Stack>
);

const FormActions = ({
  state,
  actions,
  isMutating,
  isSearching,
  canFindMatchingIssues,
}: {
  state: AssignIssueModalState;
  actions: ReturnType<typeof useAssignIssueModal>['actions'];
  isMutating: boolean;
  isSearching: boolean;
  canFindMatchingIssues: boolean;
}) => {
  if (
    state.status === assignIssueModalStatus.algorithmSuggestion ||
    isConfirmedIssueStatus(state.status)
  ) return null;

  const isRequesting =
    state.status === assignIssueModalStatus.openingSearch || state.status === assignIssueModalStatus.aiCategorising;

  return (
    <HStack gap={2}>
      <Button
        flex="1"
        variant="outline"
        disabled={isRequesting || isMutating}
        loading={state.status === assignIssueModalStatus.aiCategorising}
        onClick={() => void actions.categorise()}
      >
        Categorise with AI
      </Button>
      <Button
        flex="1"
        variant="outline"
        disabled={!canFindMatchingIssues || state.status === assignIssueModalStatus.noMatch || isRequesting || isMutating}
        loading={isSearching || state.status === assignIssueModalStatus.openingSearch}
        onClick={() => void actions.retrySimilarity()}
      >
        Find matching issues
      </Button>
    </HStack>
  );
};

const Notice = ({
  title,
  description,
  status = 'info',
  loading = false,
  showIndicator = true,
}: {
  title: ReactNode;
  description?: string;
  status?: 'info' | 'success' | 'warning' | 'error';
  loading?: boolean;
  showIndicator?: boolean;
}) => (
  <ChakraAlert.Root status={status} variant="subtle" px={3} py={2} borderWidth="1px">
    {loading ? <Spinner size="sm" /> : showIndicator && <ChakraAlert.Indicator />}
    <ChakraAlert.Content>
      <ChakraAlert.Title>{title}</ChakraAlert.Title>
      {description && <ChakraAlert.Description>{description}</ChakraAlert.Description>}
    </ChakraAlert.Content>
  </ChakraAlert.Root>
);

const AiSuggestionTooltipContent = () => (
  <Stack gap={2} fontSize="sm" lineHeight="short">
    <Text fontWeight="semibold">How this suggestion was generated</Text>
    <Text>The model uses the error message, call stack, error location, test title, and spec file.</Text>
    <Text>
      Category is selected from those signals, with human feedback taking priority when available. Name and description
      are drafted separately from the same error context.
    </Text>
  </Stack>
);

const ConfirmedIssueActions = ({
  state,
  actions,
  isMutating,
}: {
  state: AssignIssueModalState;
  actions: ReturnType<typeof useAssignIssueModal>['actions'];
  isMutating: boolean;
}) => {
  if (state.status !== assignIssueModalStatus.confirmedView) return null;

  return (
    <HStack gap={2}>
      <Button flex="1" variant="outline" loading={isMutating} onClick={() => void actions.unassign()}>
        Unassign
      </Button>
      <Button flex="1" loading={isMutating} onClick={actions.editConfirmedIssue}>
        Update
      </Button>
    </HStack>
  );
};

const SimilarityTooltipContent = ({ score }: { score: number }) => (
  <Stack gap={2} fontSize="sm" lineHeight="short">
    <Text fontWeight="semibold">What does {score}% mean?</Text>
    <Text>
      It’s a similarity score, not a probability. We compare this failure against open issues in the project on three
      signals — error message text, call stack shape, and the test file/spec it came from — and combine them into a
      single score.
    </Text>
    <Text>
      Higher means the failure looks more like the issue we found. Anything above ~80% is usually the same root cause,
      but flaky and timeout errors often look alike across unrelated tests, so a quick read of the stack trace on the
      left is worth it. Confirm links this result to the matched issue. Reject clears the suggestion so you can fill in
      the form yourself or run AI analysis on the error.
    </Text>
  </Stack>
);

const PolishActions = ({
  field,
  state,
  actions,
}: {
  field: 'name' | 'description';
  state: ReturnType<typeof useAssignIssueModal>['polish']['name'];
  actions: ReturnType<typeof useAssignIssueModal>['actions'];
}) => (
  <HStack gap={1}>
    {state.status === 'success' && (
      <Tooltip content="Undo polish">
        <IconButton
          aria-label={`Undo polish issue ${field}`}
          minW="20px"
          w="20px"
          h="20px"
          p={0}
          borderRadius="5px"
          variant="ghost"
          onClick={() => actions.undoPolish(field)}
          css={{ '& svg': { width: '13px', height: '13px', opacity: '0.6' } }}
        >
          <LuUndo2 />
        </IconButton>
      </Tooltip>
    )}
    {state.status === 'error' && (
      <Button size="xs" variant="plain" onClick={() => void actions.retryPolish(field)}>
        Retry polish
      </Button>
    )}
    <Tooltip content="Rewrite for clarity">
      <IconButton
        aria-label={`Polish issue ${field}`}
        minW="20px"
        w="20px"
        h="20px"
        p={0}
        borderRadius="5px"
        bg="transparent"
        color="accent.solid"
        variant="ghost"
        loading={state.status === 'loading'}
        onClick={() => void actions.polishField(field)}
        css={{ '& svg': { width: '13px', height: '13px', opacity: '0.6' } }}
      >
        <LuWandSparkles />
      </IconButton>
    </Tooltip>
  </HStack>
);

const ModalFooter = ({
  state,
  actions,
  isMutating,
}: {
  state: AssignIssueModalState;
  actions: ReturnType<typeof useAssignIssueModal>['actions'];
  isMutating: boolean;
}) => (
  <DialogFooter borderTopWidth="1px" borderColor="border.main" justifyContent="flex-end" gap={3} flexWrap="wrap">
    <HStack gap={2} ms="auto">
      <Button variant="ghost" loading={isMutating} disabled={isMutating} onClick={actions.close}>Cancel</Button>
      {(state.status === assignIssueModalStatus.noMatch ||
        state.status === assignIssueModalStatus.unassigned ||
        state.status === assignIssueModalStatus.aiSuggestion ||
        state.status === assignIssueModalStatus.categorisationError ||
        state.status === assignIssueModalStatus.similarityError) && (
        <Button
          loading={isMutating}
          disabled={!state.form.category || !state.form.name.trim() || !state.form.description.trim()}
          onClick={() => void actions.createAndAssign()}
        >
          Assign Issue
        </Button>
      )}
      {state.status === assignIssueModalStatus.confirmedEdit && (
        <Button
          loading={isMutating}
          disabled={!state.form.category || !state.form.name.trim() || !state.form.description.trim()}
          onClick={() => void actions.updateConfirmedIssue()}
        >
          Update
        </Button>
      )}
    </HStack>
  </DialogFooter>
);

const formatDuration = (milliseconds: number) =>
  milliseconds < 1000 ? `${milliseconds} ms` : `${(milliseconds / 1000).toFixed(2)} s`;
