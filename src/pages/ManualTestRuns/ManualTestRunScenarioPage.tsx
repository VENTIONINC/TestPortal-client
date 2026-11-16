// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Box, Button, Heading, HStack, Input, Tabs, Text, Textarea, VStack } from '@chakra-ui/react';
import {
  LuArrowRight,
  LuChevronLeft,
  LuChevronRight,
  LuFlag,
  LuFolder,
  LuLink,
  LuMessageSquare,
  LuX,
} from 'react-icons/lu';

import { TestManagementTabList } from '@/pages/TestScenarios/TestManagementTabs';
import { AssigneePicker } from '@/components/manual-test-runs/components/AssigneePicker';
import { MainTemplate } from '@/components/ui/components/Templates/MainTemplate';
import { Tooltip } from '@/components/ui';
import {
  useGetApiV2ManualTestRunsByRunIdQuery,
  useGetApiV2TestScenariosByScenarioIdQuery,
  useGetApiV2UsersQuery,
  usePatchApiV2ManualTestRunsByRunIdScenariosAndScenarioIdAssigneeMutation,
  usePatchApiV2ManualTestRunsByRunIdScenariosAndScenarioIdEvidenceMutation,
  usePostApiV2ManualTestRunsByRunIdCompleteMutation,
  usePutApiV2ManualTestRunsByRunIdScenariosAndScenarioIdResultMutation,
} from '@/redux/apis/generatedApi';
import type { ManualTestRunScenarioResult } from '@/redux/apis/generatedApi';
import { useSelectedProjectId } from '@/redux/slices/projects';
import { PATHS } from '@/types/paths';

const RESULT_OPTIONS: ManualTestRunScenarioResult[] = ['passed', 'failed', 'blocked', 'skipped'];
const resultLabel = (result: ManualTestRunScenarioResult) => result[0].toUpperCase() + result.slice(1);
const ticketLabel = (value: string) => {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (!host.includes('youtrack') && !host.startsWith('yt-') && !host.endsWith('.myjetbrains.com')) return value;
    const match = url.pathname.match(/^\/issue\/([A-Za-z][A-Za-z0-9_]*-\d+)(?:\/([^/]+))?\/?$/i);
    if (!match) return value;
    const title = match[2] ? decodeURIComponent(match[2]).replace(/[-_]+/g, ' ').trim() : '';
    return [match[1], title].filter(Boolean).join(' ');
  } catch {
    return value;
  }
};

export function ManualTestRunScenarioPage() {
  const { runId = '', scenarioId = '' } = useParams();
  const projectId = useSelectedProjectId();
  const navigate = useNavigate();
  const query = useGetApiV2ManualTestRunsByRunIdQuery({ projectId, runId });
  const run = query.currentData;
  const scenario = run?.scenarios.find((item) => item.id === scenarioId);
  const sourceQuery = useGetApiV2TestScenariosByScenarioIdQuery(
    { projectId, scenarioId: scenario?.sourceScenarioId ?? '' },
    { skip: !scenario },
  );
  const usersQuery = useGetApiV2UsersQuery();
  const [setResult] = usePutApiV2ManualTestRunsByRunIdScenariosAndScenarioIdResultMutation();
  const [setAssignee] = usePatchApiV2ManualTestRunsByRunIdScenariosAndScenarioIdAssigneeMutation();
  const [saveEvidence] = usePatchApiV2ManualTestRunsByRunIdScenariosAndScenarioIdEvidenceMutation();
  const [completeRun, completeState] = usePostApiV2ManualTestRunsByRunIdCompleteMutation();
  const [executionComment, setExecutionComment] = useState('');
  const [defectReference, setDefectReference] = useState('');
  const [stepDraft, setStepDraft] = useState<
    Record<
      string,
      { comment: string; failedFlag: boolean; failedComment: string; blockedFlag: boolean; blockedComment: string }
    >
  >({});
  const [error, setError] = useState('');
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [draftScope, setDraftScope] = useState('');
  const savedEvidence = useRef('');
  const saveQueue = useRef<Promise<boolean>>(Promise.resolve(true));
  const latestSave = useRef<() => Promise<boolean>>(async () => true);
  const completed = run?.status === 'completed';
  const untestedCount = run?.scenarios.filter((item) => item.result === 'untested').length ?? 0;
  const ordered = useMemo(() => [...(run?.scenarios ?? [])].sort((a, b) => a.position - b.position), [run?.scenarios]);
  const index = ordered.findIndex((item) => item.id === scenarioId);
  const previous = index > 0 ? ordered[index - 1] : undefined;
  const next = index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : undefined;
  const nextUntested = index < 0 ? undefined : ordered.slice(index + 1).find((item) => item.result === 'untested');

  useEffect(() => {
    if (!scenario) return;
    const scope = `${projectId}:${runId}:${scenarioId}`;
    if (draftScope === scope) return;
    savedEvidence.current = JSON.stringify({
      executionComment: scenario.executionComment?.trim() || null,
      defectReference: scenario.defectReference?.trim() || null,
      steps: scenario.steps.map((step) => ({
        id: step.id,
        comment: step.comment?.trim() || null,
        failedFlag: step.failedFlag,
        failedComment: step.failedComment?.trim() || null,
        blockedFlag: step.blockedFlag,
        blockedComment: step.blockedComment?.trim() || null,
      })),
    });
    setDraftScope(scope);
    setOpenComments({});
    setExecutionComment(scenario.executionComment ?? '');
    setDefectReference(scenario.defectReference ?? '');
    setStepDraft(
      Object.fromEntries(
        scenario.steps.map((step) => [
          step.id,
          {
            comment: step.comment ?? '',
            failedFlag: step.failedFlag,
            failedComment: step.failedComment ?? '',
            blockedFlag: step.blockedFlag,
            blockedComment: step.blockedComment ?? '',
          },
        ]),
      ),
    );
  }, [scenario, projectId, runId, scenarioId, draftScope]);

  const scope = `${projectId}:${runId}:${scenarioId}`;
  const evidence =
    scenario && draftScope === scope
      ? {
          executionComment: executionComment.trim() || null,
          defectReference: defectReference.trim() || null,
          steps: scenario.steps.map((step) => ({
            id: step.id,
            ...stepDraft[step.id],
            comment: stepDraft[step.id]?.comment.trim() || null,
            failedComment: stepDraft[step.id]?.failedComment.trim() || null,
            blockedComment: stepDraft[step.id]?.blockedComment.trim() || null,
          })),
        }
      : null;
  const evidenceKey = evidence ? JSON.stringify(evidence) : '';
  const save = () => {
    if (!evidence || completed) return Promise.resolve(true);
    const payload = evidence;
    const key = evidenceKey;
    const task = saveQueue.current.then(async () => {
      if (savedEvidence.current === key) return true;
      try {
        await saveEvidence({ projectId, runId, scenarioId, manualTestRunScenarioEvidenceRequest: payload }).unwrap();
        savedEvidence.current = key;
        setError('');
        return true;
      } catch {
        setError('The evidence was not saved. Changes will be retried when you continue editing.');
        return false;
      }
    });
    saveQueue.current = task;
    return task;
  };
  latestSave.current = save;
  useEffect(() => {
    if (!evidenceKey || completed) return;
    const timer = window.setTimeout(() => {
      void latestSave.current();
    }, 600);
    return () => window.clearTimeout(timer);
  }, [evidenceKey, completed]);
  useEffect(
    () => () => {
      void latestSave.current();
    },
    [],
  );
  const changeResult = async (result: ManualTestRunScenarioResult) => {
    if (!run || !scenario || completed) return;
    setError('');
    try {
      await setResult({
        projectId,
        runId,
        scenarioId,
        manualTestRunScenarioResultRequest: { result: scenario.result === result ? 'untested' : result },
      }).unwrap();
      await query.refetch();
    } catch {
      setError(
        'The result was not saved. The run may have been completed in another session; refresh and review its status.',
      );
      await query.refetch();
    }
  };
  const changeAssignee = async (assigneeId: string | null) => {
    if (!run || !scenario || completed) return;
    try {
      await setAssignee({
        projectId,
        runId,
        scenarioId,
        manualTestRunScenarioAssigneeRequest: { assigneeId: assigneeId || null },
      }).unwrap();
      await query.refetch();
    } catch {
      setError('The assignee was not saved. Refresh and try again.');
      await query.refetch();
    }
  };
  const complete = async () => {
    if (!run || completed || completeState.isLoading) return;
    if (!(await save())) return;
    setError('');
    try {
      await completeRun({ projectId, runId, body: {} }).unwrap();
      await query.refetch();
      navigate(PATHS.MANUAL_TEST_RUN_DETAILS.replace(':runId', encodeURIComponent(runId)));
    } catch {
      setError('The run could not be completed. Its status has been refreshed; review it before trying again.');
      await query.refetch();
    }
  };

  if (query.isLoading)
    return (
      <MainTemplate pageHeader="Test Management">
        <Text p={8}>Loading scenario…</Text>
      </MainTemplate>
    );
  if (query.error || !run || !scenario)
    return (
      <MainTemplate pageHeader="Test Management">
        <Box p={8}>
          <Text role="alert">This scenario is not available in the selected run.</Text>
          <Link to={PATHS.MANUAL_TEST_RUNS}>Back to manual runs</Link>
        </Box>
      </MainTemplate>
    );

  const goToScenario = async (id: string) => {
    if (!completed && !(await save())) return;
    navigate(
      PATHS.MANUAL_TEST_RUN_SCENARIO.replace(':runId', encodeURIComponent(runId)).replace(
        ':scenarioId',
        encodeURIComponent(id),
      ),
    );
  };
  const runPath = PATHS.MANUAL_TEST_RUN_DETAILS.replace(':runId', encodeURIComponent(runId));
  const flagKind = scenario.result === 'failed' ? 'failed' : scenario.result === 'blocked' ? 'blocked' : null;
  const colors = { passed: 'green', failed: 'red', blocked: 'orange', skipped: 'gray', untested: 'gray' } as const;

  return (
    <MainTemplate pageHeader="Test Management">
      <Tabs.Root className="test-management-tabs" value="manual-runs">
        <TestManagementTabList
          onNavigate={(tab) =>
            navigate(tab === 'manual-runs' ? PATHS.MANUAL_TEST_RUNS : PATHS.TEST_SCENARIOS, {
              state: { testManagementTab: tab },
            })
          }
        />
      </Tabs.Root>
      <Box p={{ base: 4, md: 6 }}>
        <HStack
          as="nav"
          aria-label="Breadcrumb"
          gap={2}
          minW={0}
          wrap="wrap"
          fontSize="md"
          color="text.secondary"
          pb={4}
        >
          <Button
            asChild
            variant="ghost"
            size="xs"
            fontSize="md"
            fontWeight="normal"
            color="text.secondary"
            _hover={{ bg: 'transparent', textDecoration: 'underline' }}
          >
            <Link to={PATHS.MANUAL_TEST_RUNS}>Manual runs</Link>
          </Button>
          <Text aria-hidden="true">›</Text>
          <Button
            asChild
            variant="ghost"
            size="xs"
            fontSize="md"
            fontWeight="normal"
            color="text.secondary"
            _hover={{ bg: 'transparent', textDecoration: 'underline' }}
          >
            <Link to={runPath}>{run.title}</Link>
          </Button>
          <Text aria-hidden="true">›</Text>
          <Text color="text.primary" aria-current="page">
            {scenario.sourceScenarioKey}
          </Text>
        </HStack>
        <Box bg="bg.panel" borderRadius="xl" px={{ base: 5, md: 10, lg: 16 }} py={8}>
          <Box
            display="grid"
            gridTemplateColumns={{ base: '1fr', lg: 'minmax(0, 1fr) 230px' }}
            gap={{ base: 8, lg: 10 }}
          >
            <Box minW={0}>
              <Heading size="lg" mb={4}>
                {scenario.title}
              </Heading>
              {scenario.details && (
                <Text fontSize="sm" color="fg.muted" whiteSpace="pre-wrap" mb={6}>
                  {scenario.details}
                </Text>
              )}
              <Box bg="bg.subtle" borderRadius="lg" p={4} mb={6}>
                <HStack wrap="wrap" gap={2}>
                  {RESULT_OPTIONS.map((result) => (
                    <Button
                      key={result}
                      size="sm"
                      variant={scenario.result === result ? 'solid' : 'outline'}
                      bg={scenario.result === result ? undefined : 'bg.panel'}
                      colorPalette={colors[result]}
                      disabled={completed}
                      aria-pressed={scenario.result === result}
                      onClick={() => void changeResult(result)}
                    >
                      <Box
                        as="span"
                        w="7px"
                        h="7px"
                        borderRadius="full"
                        bg={scenario.result === result ? 'currentColor' : `${colors[result]}.500`}
                      />
                      {resultLabel(result)}
                    </Button>
                  ))}
                </HStack>
                <HStack justify="end" mt={3} wrap="wrap" gap={2}>
                  <Text fontSize="sm" color="fg.muted">
                    {index + 1} of {ordered.length}
                  </Text>
                  <Button
                    size="sm"
                    variant="outline"
                    bg="bg.panel"
                    w="32px"
                    minW="32px"
                    h="32px"
                    p={0}
                    aria-label="Previous scenario"
                    disabled={!previous}
                    onClick={() => previous && void goToScenario(previous.id)}
                  >
                    <LuChevronLeft />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    bg="bg.panel"
                    w="32px"
                    minW="32px"
                    h="32px"
                    p={0}
                    aria-label="Next scenario"
                    disabled={!next}
                    onClick={() => next && void goToScenario(next.id)}
                  >
                    <LuChevronRight />
                  </Button>
                  {completed ? (
                    <Text fontSize="sm" fontWeight="semibold">
                      Completed
                    </Text>
                  ) : untestedCount === 0 ? (
                    <Button
                      size="sm"
                      colorPalette="blue"
                      loading={completeState.isLoading}
                      onClick={() => void complete()}
                    >
                      Complete run
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      colorPalette="blue"
                      disabled={!nextUntested}
                      onClick={() => nextUntested && void goToScenario(nextUntested.id)}
                    >
                      <LuArrowRight />
                      Next untested
                    </Button>
                  )}
                </HStack>
                {completed && (
                  <Box mt={3} p={3} borderRadius="md" bg="bg.panel" fontSize="sm">
                    Run completed{run.completedAt ? ` on ${new Date(run.completedAt).toLocaleDateString()}` : ''}
                    {run.completedBy?.name ? ` by ${run.completedBy.name}` : ''}. Results are locked.{' '}
                    <Link to={runPath}>Open run</Link>
                  </Box>
                )}
                {!completed && untestedCount === 0 && (
                  <Box mt={3} p={3} borderRadius="md" bg="bg.panel" fontSize="sm">
                    {run.hasBeenReopened
                      ? 'This run was reopened. Results are editable again.'
                      : 'All scenarios are marked.'}{' '}
                    Complete the run when you are finished; results will be locked until it is reopened.
                  </Box>
                )}
                <Box display="grid" gridTemplateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={3} mt={4}>
                  <Box>
                    <Text fontSize="xs" color="fg.muted">
                      Comment on the scenario
                    </Text>
                    <Textarea
                      aria-label="Comment on the scenario"
                      id="run-comment"
                      bg="bg.panel"
                      size="sm"
                      mt={1}
                      placeholder="Add a comment"
                      value={executionComment}
                      readOnly={completed}
                      onChange={(event) => setExecutionComment(event.target.value)}
                    />
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="fg.muted">
                      Bug or ticket
                    </Text>
                    <Input
                      aria-label="Bug or ticket"
                      id="run-defect"
                      bg="bg.panel"
                      size="sm"
                      mt={1}
                      placeholder="https://youtrack… or https://jira…"
                      value={defectReference}
                      readOnly={completed}
                      onChange={(event) => setDefectReference(event.target.value)}
                    />
                  </Box>
                </Box>
              </Box>
              <Box display="grid" gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6} mb={8}>
                {(
                  [
                    ['Preconditions', scenario.preconditions],
                    ['Test data', scenario.testData],
                  ] as const
                ).map(([label, value]) => (
                  <Box key={label}>
                    <Text fontWeight="semibold" fontSize="16px" mb={2}>
                      {label}
                    </Text>
                    <Text fontSize="16px" whiteSpace="pre-wrap">
                      {value || '—'}
                    </Text>
                  </Box>
                ))}
              </Box>
              <Box overflowX="auto" ml={{ base: 0, md: '-42px' }}>
                <Box minW="500px">
                  <Box
                    display="grid"
                    gridTemplateColumns="30px minmax(0, calc(50% - 21px)) minmax(0, 1fr) 64px"
                    gap={3}
                    color="fg.muted"
                    fontSize="xs"
                    pb={2}
                  >
                    <Text pl={3}>#</Text>
                    <Text>Steps</Text>
                    <Text>Expected result</Text>
                    <Text />
                  </Box>
                  {flagKind && !completed && (
                    <Text color={flagKind === 'failed' ? 'red.600' : 'orange.600'} fontSize="13px" ml="42px" mb={3}>
                      Flag the step where it {flagKind === 'failed' ? 'failed' : 'was blocked'}. Add a comment to any
                      step to say what you saw.
                    </Text>
                  )}
                  {[...scenario.steps]
                    .sort((a, b) => a.position - b.position)
                    .map((step, stepIndex) => {
                      const draft = stepDraft[step.id] ?? {
                        comment: '',
                        failedFlag: false,
                        failedComment: '',
                        blockedFlag: false,
                        blockedComment: '',
                      };
                      const flagged =
                        flagKind === 'failed'
                          ? draft.failedFlag
                          : flagKind === 'blocked'
                            ? draft.blockedFlag
                            : completed && (draft.failedFlag || draft.blockedFlag);
                      const commentOpen = !flagged && Boolean(openComments[step.id] || draft.comment);
                      const update = (patch: Partial<typeof draft>) =>
                        setStepDraft((items) => ({ ...items, [step.id]: { ...draft, ...patch } }));
                      const flagTooltip =
                        flagKind === 'failed'
                          ? 'Mark this step as the one that failed'
                          : 'Mark this step as the one that got blocked';
                      return (
                        <Box
                          key={step.id}
                          boxShadow={
                            flagged
                              ? `inset 2px 0 ${scenario.result === 'blocked' ? 'var(--chakra-colors-orange-500)' : 'var(--chakra-colors-red-500)'}`
                              : undefined
                          }
                          pl={0}
                          py={3}
                        >
                          <Box
                            display="grid"
                            gridTemplateColumns="30px minmax(0, calc(50% - 21px)) minmax(0, 1fr) 64px"
                            gap={3}
                            alignItems="start"
                            fontSize="sm"
                          >
                            <Text color="fg.muted" pl={3}>
                              {stepIndex + 1}
                            </Text>
                            <Text whiteSpace="pre-wrap">{step.action}</Text>
                            <Text whiteSpace="pre-wrap">{step.expectedResult || '—'}</Text>
                            <HStack gap={1} justify="end">
                              {flagKind && !completed && !commentOpen && (
                                <Tooltip content={flagTooltip}>
                                  <Button
                                    size="xs"
                                    variant={flagged ? 'subtle' : 'ghost'}
                                    colorPalette={colors[scenario.result]}
                                    aria-label={`${flagTooltip} (${stepIndex + 1})`}
                                    aria-pressed={!!flagged}
                                    w="28px"
                                    h="28px"
                                    minW="28px"
                                    p={0}
                                    onClick={() => {
                                      update(
                                        flagKind === 'failed'
                                          ? {
                                              failedFlag: !draft.failedFlag,
                                              failedComment: draft.failedFlag ? '' : draft.failedComment,
                                              comment: '',
                                            }
                                          : {
                                              blockedFlag: !draft.blockedFlag,
                                              blockedComment: draft.blockedFlag ? '' : draft.blockedComment,
                                              comment: '',
                                            },
                                      );
                                      setOpenComments((items) => ({ ...items, [step.id]: false }));
                                    }}
                                  >
                                    <LuFlag />
                                  </Button>
                                </Tooltip>
                              )}
                              {!completed && !flagged && (
                                <Tooltip content="Comment on this step">
                                  <Button
                                    size="xs"
                                    variant={commentOpen ? 'subtle' : 'ghost'}
                                    colorPalette="blue"
                                    w="28px"
                                    h="28px"
                                    minW="28px"
                                    p={0}
                                    aria-pressed={commentOpen}
                                    aria-label={`Comment on this step (${stepIndex + 1})`}
                                    onClick={() => {
                                      const opening = !commentOpen;
                                      setOpenComments((items) => ({ ...items, [step.id]: opening }));
                                      update({
                                        comment: opening ? draft.comment : '',
                                        ...(flagKind === 'failed'
                                          ? { failedFlag: false, failedComment: '' }
                                          : flagKind === 'blocked'
                                            ? { blockedFlag: false, blockedComment: '' }
                                            : {}),
                                      });
                                    }}
                                  >
                                    <LuMessageSquare />
                                  </Button>
                                </Tooltip>
                              )}
                              {completed && flagged && <LuFlag />}
                            </HStack>
                          </Box>
                          {commentOpen && (
                            <HStack ml="42px" mt={2} gap={2}>
                              <Input
                                size="sm"
                                aria-label={`Comment for step ${stepIndex + 1}`}
                                placeholder="Comment on this step (optional)"
                                value={draft.comment}
                                readOnly={completed}
                                onChange={(event) => update({ comment: event.target.value })}
                              />
                              {!completed && (
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  w="28px"
                                  minW="28px"
                                  p={0}
                                  aria-label={`Clear comment for step ${stepIndex + 1}`}
                                  onClick={() => {
                                    update({ comment: '' });
                                    setOpenComments((items) => ({ ...items, [step.id]: false }));
                                  }}
                                >
                                  <LuX />
                                </Button>
                              )}
                            </HStack>
                          )}
                          {flagKind && flagged && (
                            <HStack ml="42px" mt={2} gap={2}>
                              <Input
                                size="sm"
                                aria-label={`${flagKind === 'failed' ? 'Failed' : 'Blocked'} note for step ${stepIndex + 1}`}
                                placeholder={
                                  flagKind === 'failed' ? 'What happened at this step?' : 'What blocked this step?'
                                }
                                value={flagKind === 'failed' ? draft.failedComment : draft.blockedComment}
                                readOnly={completed}
                                onChange={(event) =>
                                  update(
                                    flagKind === 'failed'
                                      ? { failedComment: event.target.value }
                                      : { blockedComment: event.target.value },
                                  )
                                }
                              />
                              {!completed && (
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  w="28px"
                                  minW="28px"
                                  p={0}
                                  aria-label={`Clear ${flagKind} note for step ${stepIndex + 1}`}
                                  onClick={() =>
                                    update(flagKind === 'failed' ? { failedComment: '' } : { blockedComment: '' })
                                  }
                                >
                                  <LuX />
                                </Button>
                              )}
                            </HStack>
                          )}
                        </Box>
                      );
                    })}
                </Box>
              </Box>
              {error && (
                <Text mt={3} role="alert" color="red.500">
                  {error}
                </Text>
              )}
            </Box>
            <VStack
              align="stretch"
              gap={5}
              borderLeftWidth={{ base: 0, lg: '1px' }}
              borderColor="border"
              pl={{ base: 0, lg: 6 }}
              fontSize="sm"
            >
              <Box>
                <Text fontSize="xs" color="fg.muted" mb={1}>
                  Assignee
                </Text>
                <AssigneePicker
                  scenario={scenario}
                  users={usersQuery.currentData ?? []}
                  disabled={completed}
                  onOpen={() => {}}
                  onChange={(assigneeId) => void changeAssignee(assigneeId)}
                />
              </Box>
              <Box>
                <Text fontSize="xs" color="fg.muted" mb={1}>
                  Folder
                </Text>
                <HStack display="inline-flex" bg="bg.subtle" px={2} py={1} borderRadius="md" gap={1.5}>
                  <LuFolder aria-hidden="true" />
                  <Text>{scenario.folderPath || 'No folder'}</Text>
                </HStack>
              </Box>
              <Box>
                <Text fontSize="xs" color="fg.muted" mb={1}>
                  Priority
                </Text>
                <Text
                  as="span"
                  textTransform="capitalize"
                  bg={
                    scenario.priority === 'high'
                      ? 'status.attention.bg'
                      : scenario.priority === 'medium'
                        ? 'status.total.bg'
                        : 'status.neutral.bg'
                  }
                  color={
                    scenario.priority === 'high' ? 'orange.fg' : scenario.priority === 'medium' ? 'blue.fg' : 'fg.muted'
                  }
                  px={2}
                  py={0.5}
                  borderRadius="full"
                  fontSize="xs"
                >
                  {scenario.priority}
                </Text>
              </Box>
              <Box>
                <Text fontSize="xs" color="fg.muted" mb={1}>
                  Requirement or ticket
                </Text>
                {scenario.requirementContext.length ? (
                  scenario.requirementContext.map((item, i) => (
                    <Box key={`${item.reference}-${i}`} minW={0}>
                      {item.url && /^https?:\/\//i.test(item.url) ? (
                        <HStack asChild color="blue.500" gap={1} minW={0} maxW="100%">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            title={
                              item.reference === item.url ? ticketLabel(item.url) : `${item.reference} ${item.title}`
                            }
                          >
                            <LuLink aria-hidden="true" style={{ flexShrink: 0 }} />
                            <Text as="span" minW={0} overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                              {item.reference === item.url ? ticketLabel(item.url) : `${item.reference} ${item.title}`}
                            </Text>
                          </a>
                        </HStack>
                      ) : (
                        <Text overflowWrap="anywhere">
                          {item.reference} {item.title}
                        </Text>
                      )}
                    </Box>
                  ))
                ) : (
                  <Text>—</Text>
                )}
              </Box>
              <Box>
                <Text fontSize="xs" color="fg.muted" mb={1}>
                  Scenario
                </Text>
                <Text color="fg.muted">Steps as saved when the scenario was added to the run.</Text>
                {!sourceQuery.isLoading && !sourceQuery.isError && (
                  <Text color="blue.500" mt={1}>
                    <Link
                      to={PATHS.TEST_SCENARIO_DETAILS.replace(
                        ':scenarioId',
                        encodeURIComponent(scenario.sourceScenarioId),
                      )}
                    >
                      Open in Scenarios
                    </Link>
                  </Text>
                )}
              </Box>
              <Box>
                <Text fontSize="xs" color="fg.muted" mb={1}>
                  Results in this run
                </Text>
                <Text>
                  <Text as="span" color={`${colors[scenario.result]}.500`}>
                    ●
                  </Text>{' '}
                  {resultLabel(scenario.result)}
                  {scenario.resultAt ? ` · ${new Date(scenario.resultAt).toLocaleString()}` : ''}
                </Text>
                {scenario.resultBy?.name && <Text color="fg.muted">by {scenario.resultBy.name}</Text>}
              </Box>
            </VStack>
          </Box>
        </Box>
      </Box>
    </MainTemplate>
  );
}
