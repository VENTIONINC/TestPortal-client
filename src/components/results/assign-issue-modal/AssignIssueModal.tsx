// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert as ChakraAlert,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Popover,
  Portal,
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
  LuMaximize2,
  LuMinimize2,
  LuScrollText,
  LuTestTube,
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
import type { DefaultDialogProps } from '@/types';
import { copyToClipboard } from '@/utils';

import type { AssignIssueModalState } from './assignIssueModalState';
import { useAssignIssueModal } from './useAssignIssueModal';

export interface AssignIssueModalProps extends DefaultDialogProps {
  resultErrorId: string;
  projectId: string;
  mode: 'assign' | 'confirmed';
}

const categoryItems = [
  { value: 'bug', label: 'Bug' },
  { value: 'script', label: 'Script' },
  { value: 'infra', label: 'Environment' },
  { value: 'performance', label: 'Performance' },
  { value: 'other', label: 'Other' },
] as const;

export function AssignIssueModal({ resultErrorId, projectId, mode, closeDialog }: AssignIssueModalProps) {
  const modal = useAssignIssueModal({ resultErrorId, projectId, mode, onClose: closeDialog });
  const { state, context, actions } = modal;
  const isReadOnly = state.status === 'opening-search' || state.status === 'ai-categorising' || state.status === 'algorithm-suggestion';
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [isContextExpanded, setIsContextExpanded] = useState(false);

  useEffect(() => {
    if (!isReadOnly) nameInputRef.current?.focus();
  }, [isReadOnly]);

  return (
    <Dialog
      title="Assign issue"
      onClose={actions.close}
      size="xl"
      initialFocusEl={() => (isReadOnly ? null : nameInputRef.current)}
      contentProps={{ h: 'min(750px, calc(100dvh - 8rem))', minW: { lg: '1200px' } }}
    >
      <DialogBody p={0} display="flex" flexDirection="column" minH={0} overflowY={{ base: 'auto', lg: 'hidden' }}>
        {!context ? (
          <ContextLoading isError={modal.contextQuery.isError} onRetry={modal.contextQuery.refetch} />
        ) : (
          <>
            <Flex
              px={{ base: 4, md: 6 }}
              pb={4}
              gap={3}
              align={{ base: 'flex-start', md: 'center' }}
              direction={{ base: 'column', md: 'row' }}
              borderBottomWidth="1px"
              borderColor="border.main"
            >
              <Text fontWeight="semibold">Result #{context.result.id}</Text>·
              <Text color="text.secondary" fontSize="sm">
                Attempt #{context.result.attempt}
              </Text>
              ·
              <Text color="text.muted" fontSize="sm">
                Started{' '}
                {new Date(context.result.startTime).toLocaleString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false,
                })}
              </Text>
              ·
              <Text color="text.muted" fontSize="sm">
                Duration {formatDuration(context.result.duration)}
              </Text>
            </Flex>

            <Flex flex="1" minH={0} direction={{ base: 'column', lg: 'row' }} overflow={{ lg: 'hidden' }}>
              <Box
                as="section"
                aria-label="Result context"
                flex={isContextExpanded ? '1 1 100%' : '1 1 56%'}
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
                </Flex>
              </Box>

              {!isContextExpanded && (
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
                  // bg="bg.panel"
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
                        !isReadOnly ? (
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
                        !isReadOnly ? (
                          <PolishActions field="description" state={modal.polish.description} actions={actions} />
                        ) : undefined
                      }
                      aria-label="Description"
                      minH="120px"
                      autoresize
                      value={state.form.description}
                      disabled={isReadOnly}
                      onChange={(event) => actions.updateForm({ description: event.target.value })}
                      placeholder="Describe the issue..."
                    />
                  </Stack>
                  <Stack mt="auto" gap={3}>
                    <FeedbackArea state={state} actions={actions} operationError={modal.operationError} />
                    <FormActions
                      state={state}
                      actions={actions}
                      isMutating={modal.isMutating}
                      isSearching={modal.similarityRequest.isFetching}
                    />
                  </Stack>
                </VStack>
              )}
            </Flex>
          </>
        )}
      </DialogBody>
      {context && <ModalFooter state={state} actions={actions} isMutating={modal.isMutating} />}
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
          _checked={{ bg: 'accent.solid', borderColor: 'accent.solid', color: 'accent.fg' }}
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
}: {
  state: AssignIssueModalState;
  actions: ReturnType<typeof useAssignIssueModal>['actions'];
}) => {
  if (state.status === 'opening-search') {
    return <Notice loading title="Looking for issues that match this error…" />;
  }
  if (state.status === 'ai-categorising') {
    return <Notice loading title="Categorising this error with AI…" description="Your current draft will be preserved." />;
  }
  if (state.status === 'no-match') {
    return (
      <Notice
        title="No similar issues were found for this error"
        description="Fill out the form manually, or use Categorise with AI to get a suggested category, name and description."
      />
    );
  }
  if (state.status === 'algorithm-suggestion' && state.suggestion) {
    return (
      <Stack gap={2}>
        <HStack justify="space-between" align="center">
          <Badge status="info" isCapitalize={false}>{state.score}% match</Badge>
          <Text fontSize="xs" color="text.secondary">{state.suggestion.otherAffectedTests} other affected tests</Text>
        </HStack>
        <SimilarityExplainer score={state.score ?? 0} />
      </Stack>
    );
  }
  if (state.status === 'ai-suggestion') {
    return <Notice title="AI-generated issue draft" description="Review and edit every field before creating the issue." />;
  }
  if (state.status === 'categorisation-error') {
    return <Notice status="error" title="Couldn’t generate an issue draft" description="Your changes are safe. Retry or continue manually." />;
  }
  if (state.status === 'similarity-error') {
    return (
      <ChakraAlert.Root status="error" variant="subtle" px={3} py={2} borderWidth="1px">
        <ChakraAlert.Indicator />
        <ChakraAlert.Content>
          <ChakraAlert.Title>Couldn’t search for similar issues</ChakraAlert.Title>
          <ChakraAlert.Description>Enter an issue name manually or retry the search.</ChakraAlert.Description>
          <Button mt={2} size="xs" variant="outline" onClick={() => void actions.retrySimilarity()}>Retry search</Button>
        </ChakraAlert.Content>
      </ChakraAlert.Root>
    );
  }
  if (state.status === 'confirmed-edit') {
    return <Notice status="success" title="Confirmed issue" description="Update the issue or remove this result from it." />;
  }
  return <Notice title="Create or assign an issue" description="Describe this failure or search by issue name." />;
};

const FeedbackArea = ({
  state,
  actions,
  operationError,
}: {
  state: AssignIssueModalState;
  actions: ReturnType<typeof useAssignIssueModal>['actions'];
  operationError: string | null;
}) => (
  <Stack gap={2}>
    <StateNotice state={state} actions={actions} />
    {operationError && (
      <ChakraAlert.Root status="error" variant="subtle" px={3} py={2} borderWidth="1px">
        <ChakraAlert.Indicator />
        <ChakraAlert.Content>
          <ChakraAlert.Description>{operationError}</ChakraAlert.Description>
        </ChakraAlert.Content>
      </ChakraAlert.Root>
    )}
    {(state.status === 'ai-suggestion' || state.status === 'categorisation-error') && <AiProvenance />}
  </Stack>
);

const FormActions = ({
  state,
  actions,
  isMutating,
  isSearching,
}: {
  state: AssignIssueModalState;
  actions: ReturnType<typeof useAssignIssueModal>['actions'];
  isMutating: boolean;
  isSearching: boolean;
}) => {
  if (state.status === 'algorithm-suggestion' || state.status === 'confirmed-edit') return null;

  const isRequesting = state.status === 'opening-search' || state.status === 'ai-categorising';

  return (
    <HStack gap={2}>
      <Button
        flex="1"
        variant="outline"
        disabled={isRequesting || isMutating}
        loading={state.status === 'ai-categorising'}
        onClick={() => void actions.categorise()}
      >
        Categorise with AI
      </Button>
      <Button
        flex="1"
        variant="outline"
        disabled={state.status === 'no-match' || isRequesting || isMutating}
        loading={isSearching || state.status === 'opening-search'}
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
}: {
  title: string;
  description?: string;
  status?: 'info' | 'success' | 'warning' | 'error';
  loading?: boolean;
}) => (
  <ChakraAlert.Root status={status} variant="subtle" px={3} py={2} borderWidth="1px">
    {loading ? <Spinner size="sm" /> : <ChakraAlert.Indicator />}
    <ChakraAlert.Content>
      <ChakraAlert.Title>{title}</ChakraAlert.Title>
      {description && <ChakraAlert.Description>{description}</ChakraAlert.Description>}
    </ChakraAlert.Content>
  </ChakraAlert.Root>
);

const SimilarityExplainer = ({ score }: { score: number }) => (
  <Popover.Root>
    <Popover.Trigger asChild>
      <Button size="xs" variant="plain" justifyContent="flex-start" px={0}>What does {score}% mean?</Button>
    </Popover.Trigger>
    <Portal>
      <Popover.Positioner>
        <Popover.Content bg="bg.panel" borderColor="border.main" p={4} maxW="340px">
          <Popover.Arrow />
          <Popover.Title fontWeight="semibold">Similarity, not probability</Popover.Title>
          <Popover.Description fontSize="sm" color="text.secondary">
            The score compares message text, call-stack shape, and spec file. Flaky and timeout failures can look alike,
            so review the issue before confirming.
          </Popover.Description>
        </Popover.Content>
      </Popover.Positioner>
    </Portal>
  </Popover.Root>
);

const AiProvenance = () => (
  <Popover.Root>
    <Popover.Trigger asChild>
      <Button size="xs" variant="plain" justifyContent="flex-start" px={0}>How this suggestion was generated</Button>
    </Popover.Trigger>
    <Portal>
      <Popover.Positioner>
        <Popover.Content bg="bg.panel" borderColor="border.main" p={4} maxW="360px">
          <Popover.Arrow />
          <Popover.Title fontWeight="semibold">AI suggestion provenance</Popover.Title>
          <Popover.Description fontSize="sm" color="text.secondary">
            The model receives the error message, call stack, error location, and existing analysis category. Category
            priority: Environment, Performance, Script, Bug, Other. Review the generated content before saving.
          </Popover.Description>
        </Popover.Content>
      </Popover.Positioner>
    </Portal>
  </Popover.Root>
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
      <Button size="xs" variant="plain" onClick={() => actions.undoPolish(field)}>
        Undo
      </Button>
    )}
    {state.status === 'error' && (
      <Button size="xs" variant="plain" onClick={() => void actions.retryPolish(field)}>
        Retry polish
      </Button>
    )}
    <Tooltip content="Polish with AI">
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
      <Button variant="ghost" onClick={actions.close}>Cancel</Button>
      {state.status === 'algorithm-suggestion' && (
        <>
          <Button variant="outline" onClick={actions.rejectSuggestion}>Reject</Button>
          <Button loading={isMutating} onClick={() => void actions.confirmSuggestion()}>Confirm</Button>
        </>
      )}
      {(state.status === 'no-match' ||
        state.status === 'unassigned' ||
        state.status === 'ai-suggestion' ||
        state.status === 'categorisation-error' ||
        state.status === 'similarity-error') && (
        <Button loading={isMutating} disabled={!state.form.name.trim()} onClick={() => void actions.createAndAssign()}>
          Assign Issue
        </Button>
      )}
      {state.status === 'confirmed-edit' && (
        <>
          <Button variant="outline" loading={isMutating} onClick={() => void actions.unassign()}>Unassign</Button>
          <Button loading={isMutating} disabled={!state.form.name.trim()} onClick={() => void actions.updateConfirmedIssue()}>
            Update
          </Button>
        </>
      )}
    </HStack>
  </DialogFooter>
);

const formatDuration = (milliseconds: number) =>
  milliseconds < 1000 ? `${milliseconds} ms` : `${(milliseconds / 1000).toFixed(2)} s`;
