// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Box, Button, Heading, HStack, Tabs, Text } from '@chakra-ui/react';

import { resultLabels } from '@/components/manual-test-runs/components/manualRunResults';
import { ManualRunScenarioEvidence } from '@/components/manual-test-runs/components/scenario-execution/ManualRunScenarioEvidence';
import { ManualRunScenarioResults } from '@/components/manual-test-runs/components/scenario-execution/ManualRunScenarioResults';
import { ManualRunScenarioSidebar } from '@/components/manual-test-runs/components/scenario-execution/ManualRunScenarioSidebar';
import type { StepDraft } from '@/components/manual-test-runs/components/scenario-execution/ManualRunScenarioStep';
import { ManualRunScenarioSteps } from '@/components/manual-test-runs/components/scenario-execution/ManualRunScenarioSteps';
import {
  isRunRecoveryLocked,
  lockRunRecovery,
  unlockRunRecovery,
  useRunRecoveryLocked,
} from '@/components/manual-test-runs/recoveryLock';
import { TestManagementTabList } from '@/pages/TestScenarios/TestManagementTabs';
import { MainTemplate } from '@/components/ui/components/Templates/MainTemplate';
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

export function ManualTestRunScenarioPage() {
  const { runId = '', scenarioId = '' } = useParams();
  const projectId = useSelectedProjectId();
  const navigate = useNavigate();
  const recoveryLocked = useRunRecoveryLocked(projectId, runId);
  const query = useGetApiV2ManualTestRunsByRunIdQuery(
    { projectId, runId },
    { pollingInterval: 15000, refetchOnFocus: true },
  );
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
  const [stepDraft, setStepDraft] = useState<Record<string, StepDraft>>({});
  const [error, setError] = useState('');
  const [evidenceRecovery, setEvidenceRecovery] = useState(false);
  const evidenceBlocked = useRef(false);
  const previousCompleted = useRef<boolean | undefined>(undefined);
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
    if (!scenario || recoveryLocked) return;
    const scope = `${projectId}:${runId}:${scenarioId}`;
    if (draftScope === scope) return;
    evidenceBlocked.current = false;
    setEvidenceRecovery(false);
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
  }, [scenario, projectId, runId, scenarioId, draftScope, recoveryLocked]);

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
            failedFlag: Boolean(stepDraft[step.id]?.failedFlag),
            failedComment: stepDraft[step.id]?.failedComment.trim() || null,
            blockedFlag: Boolean(stepDraft[step.id]?.blockedFlag),
            blockedComment: stepDraft[step.id]?.blockedComment.trim() || null,
          })),
        }
      : null;
  const evidenceKey = evidence ? JSON.stringify(evidence) : '';
  useEffect(() => {
    if (previousCompleted.current === false && completed && evidenceKey && evidenceKey !== savedEvidence.current) {
      setError(
        `Your changes were not saved because ${run?.completedBy?.name || 'another user'} completed this run. Your unsaved notes remain visible; copy them before leaving this page.`,
      );
    }
    if (run) previousCompleted.current = completed;
  }, [completed, evidenceKey, run]);
  const save = () => {
    if (evidenceBlocked.current || isRunRecoveryLocked(projectId, runId)) return Promise.resolve(false);
    if (!evidence || completed) return Promise.resolve(true);
    const payload = evidence;
    const key = evidenceKey;
    const task = saveQueue.current.then(async () => {
      if (evidenceBlocked.current || isRunRecoveryLocked(projectId, runId)) return false;
      if (savedEvidence.current === key) return true;
      try {
        await saveEvidence({ projectId, runId, scenarioId, manualTestRunScenarioEvidenceRequest: payload }).unwrap();
        savedEvidence.current = key;
        setError('');
        return true;
      } catch {
        evidenceBlocked.current = true;
        lockRunRecovery(projectId, runId);
        setEvidenceRecovery(true);
        const refreshed = await query.refetch();
        setError(
          refreshed.data?.status === 'completed'
            ? `Your changes were not saved because ${refreshed.data.completedBy?.name || 'another user'} completed this run. Your unsaved notes remain visible; copy them before leaving this page.`
            : 'The save result is uncertain. Your draft is preserved. Review the run before explicitly retrying.',
        );
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
    if (!run || !scenario || completed || evidenceBlocked.current || isRunRecoveryLocked(projectId, runId)) return;
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
      evidenceBlocked.current = true;
      lockRunRecovery(projectId, runId);
      setEvidenceRecovery(true);
      const refreshed = await query.refetch();
      setError(
        refreshed.data?.status === 'completed'
          ? `The result ${resultLabels[result]} was not saved because ${refreshed.data.completedBy?.name || 'another user'} completed this run. Reopen the run to change the result.`
          : 'The result was not saved. Refresh and try again.',
      );
    }
  };
  const changeAssignee = async (assigneeId: string | null) => {
    if (!run || !scenario || completed || evidenceBlocked.current || isRunRecoveryLocked(projectId, runId)) return;
    try {
      await setAssignee({
        projectId,
        runId,
        scenarioId,
        manualTestRunScenarioAssigneeRequest: { assigneeId: assigneeId || null },
      }).unwrap();
      await query.refetch();
    } catch {
      evidenceBlocked.current = true;
      lockRunRecovery(projectId, runId);
      setEvidenceRecovery(true);
      const refreshed = await query.refetch();
      setError(
        refreshed.data?.status === 'completed'
          ? `The assignee was not saved because ${refreshed.data.completedBy?.name || 'another user'} completed this run. Reopen the run to make changes.`
          : 'The assignee was not saved. Refresh and try again.',
      );
    }
  };
  const complete = async () => {
    if (
      !run ||
      completed ||
      completeState.isLoading ||
      evidenceBlocked.current ||
      isRunRecoveryLocked(projectId, runId)
    )
      return;
    if (!(await save())) return;
    setError('');
    try {
      await completeRun({ projectId, runId, body: { requireAllMarked: true } }).unwrap();
      await query.refetch();
      navigate(PATHS.MANUAL_TEST_RUN_DETAILS.replace(':runId', encodeURIComponent(runId)));
    } catch {
      evidenceBlocked.current = true;
      lockRunRecovery(projectId, runId);
      setEvidenceRecovery(true);
      setError('The run could not be completed. Its status has been refreshed; review it before trying again.');
      await query.refetch();
    }
  };

  if (recoveryLocked && !evidenceRecovery) {
    const handleRetry = async () => {
      const refreshed = await query.refetch();
      if (!refreshed.error && refreshed.data?.id === runId && refreshed.data.projectId === projectId) {
        unlockRunRecovery(projectId, runId);
      } else {
        setError('Could not refresh the run. Try again.');
      }
    };

    return (
      <MainTemplate pageHeader="Test Management">
        <Box p={8}>
          <Text role="alert">Refresh the run before making changes.</Text>
          <Button onClick={handleRetry}>Retry refresh</Button>
          {error && <Text role="alert">{error}</Text>}
        </Box>
      </MainTemplate>
    );
  }
  if (query.isLoading)
    return (
      <MainTemplate pageHeader="Test Management">
        <Text p={8}>Loading scenario…</Text>
      </MainTemplate>
    );
  if (!run || !scenario)
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

  const sourceStatus = sourceQuery.isError
    ? 'status' in sourceQuery.error && sourceQuery.error.status === 404
      ? 'unavailable'
      : 'error'
    : sourceQuery.isLoading
      ? 'loading'
      : 'available';

  const handleRecoverExecution = async () => {
    await saveQueue.current;
    const refreshed = await query.refetch();
    if (refreshed.error || !refreshed.data || refreshed.data.status === 'completed') {
      setError('Could not recover an editable run. Your draft is preserved; refresh and review the run.');
      return;
    }
    unlockRunRecovery(projectId, runId);
    evidenceBlocked.current = false;
    setEvidenceRecovery(false);
    await latestSave.current();
  };

  return (
    <MainTemplate pageHeader="Test Management">
      <Tabs.Root className="test-management-tabs" value="manual-runs">
        <TestManagementTabList
          onNavigate={(tab) =>
            navigate(tab === 'manual-runs' ? PATHS.MANUAL_TEST_RUNS : PATHS.TEST_MANAGEMENT, {
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
            h="40px"
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
            h="40px"
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
        <Box bg="bg.panel" borderRadius="xl" pl={{ base: 5, md: 20, lg: 16 }} pr={{ base: 2.5, md: 10, lg: 8 }} py={8}>
          <Box
            display="grid"
            gridTemplateColumns={{ base: '1fr', lg: 'minmax(0, 1fr) 270px' }}
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
                <ManualRunScenarioResults
                  result={scenario.result}
                  run={run}
                  runPath={runPath}
                  completed={completed}
                  recoveryRequired={evidenceRecovery}
                  completing={completeState.isLoading}
                  allScenariosMarked={untestedCount === 0}
                  scenarioNumber={index + 1}
                  scenarioCount={ordered.length}
                  previousId={previous?.id}
                  nextId={next?.id}
                  nextUntestedId={nextUntested?.id}
                  onChangeResult={changeResult}
                  onNavigate={goToScenario}
                  onComplete={complete}
                />
                <ManualRunScenarioEvidence
                  executionComment={executionComment}
                  defectReference={defectReference}
                  readOnly={completed}
                  onChangeComment={setExecutionComment}
                  onChangeDefectReference={setDefectReference}
                />
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
              <ManualRunScenarioSteps
                steps={scenario.steps}
                result={scenario.result}
                completed={completed}
                stepDraft={stepDraft}
                openComments={openComments}
                setStepDraft={setStepDraft}
                setOpenComments={setOpenComments}
              />
              {error && (
                <Text mt={3} role="alert" color="red.500">
                  {error}
                </Text>
              )}
              {evidenceRecovery && !completed && (
                <Button mt={2} size="sm" onClick={handleRecoverExecution}>
                  Refresh and retry saving draft
                </Button>
              )}
            </Box>
            <ManualRunScenarioSidebar
              scenario={scenario}
              users={usersQuery.currentData ?? []}
              assigneeDisabled={completed || evidenceRecovery}
              sourceStatus={sourceStatus}
              onChangeAssignee={changeAssignee}
            />
          </Box>
        </Box>
      </Box>
    </MainTemplate>
  );
}
