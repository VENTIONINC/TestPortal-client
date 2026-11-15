// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Box, Button, Heading, HStack, Input, Text, Textarea, VStack } from '@chakra-ui/react';

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

const RESULT_OPTIONS: ManualTestRunScenarioResult[] = ['untested', 'passed', 'failed', 'blocked', 'skipped'];
const resultLabel = (result: ManualTestRunScenarioResult) => result[0].toUpperCase() + result.slice(1);

export function ManualTestRunScenarioPage() {
  const { runId = '', scenarioId = '' } = useParams();
  const projectId = useSelectedProjectId();
  const navigate = useNavigate();
  const query = useGetApiV2ManualTestRunsByRunIdQuery({ projectId, runId });
  const run = query.currentData;
  const scenario = run?.scenarios.find((item) => item.id === scenarioId);
  const sourceQuery = useGetApiV2TestScenariosByScenarioIdQuery({ projectId, scenarioId: scenario?.sourceScenarioId ?? '' }, { skip: !scenario });
  const usersQuery = useGetApiV2UsersQuery();
  const [setResult] = usePutApiV2ManualTestRunsByRunIdScenariosAndScenarioIdResultMutation();
  const [setAssignee] = usePatchApiV2ManualTestRunsByRunIdScenariosAndScenarioIdAssigneeMutation();
  const [saveEvidence, saveState] = usePatchApiV2ManualTestRunsByRunIdScenariosAndScenarioIdEvidenceMutation();
  const [completeRun, completeState] = usePostApiV2ManualTestRunsByRunIdCompleteMutation();
  const [executionComment, setExecutionComment] = useState('');
  const [defectReference, setDefectReference] = useState('');
  const [stepDraft, setStepDraft] = useState<Record<string, { comment: string; failedFlag: boolean; failedComment: string; blockedFlag: boolean; blockedComment: string }>>({});
  const [error, setError] = useState('');
  const [completionOpen, setCompletionOpen] = useState(false);
  const draftScope = useRef('');
  const completed = run?.status === 'completed';
  const untestedCount = run?.scenarios.filter((item) => item.result === 'untested').length ?? 0;
  const ordered = useMemo(() => [...(run?.scenarios ?? [])].sort((a, b) => a.position - b.position), [run?.scenarios]);
  const index = ordered.findIndex((item) => item.id === scenarioId);
  const previous = index > 0 ? ordered[index - 1] : undefined;
  const next = index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : undefined;
  const nextUntested = index < 0 ? undefined : [...ordered.slice(index + 1), ...ordered.slice(0, index + 1)].find((item) => item.result === 'untested');

  useEffect(() => {
    if (!scenario) return;
    const scope = `${projectId}:${runId}:${scenarioId}`;
    if (draftScope.current === scope) return;
    draftScope.current = scope;
    setExecutionComment(scenario.executionComment ?? '');
    setDefectReference(scenario.defectReference ?? '');
    setStepDraft(Object.fromEntries(scenario.steps.map((step) => [step.id, {
      comment: step.comment ?? '', failedFlag: step.failedFlag, failedComment: step.failedComment ?? '', blockedFlag: step.blockedFlag, blockedComment: step.blockedComment ?? '',
    }])));
  }, [scenario, projectId, runId, scenarioId]);

  const save = async () => {
    if (!run || !scenario || completed || saveState.isLoading) return;
    setError('');
    try {
      await saveEvidence({
        projectId, runId, scenarioId,
        manualTestRunScenarioEvidenceRequest: {
          executionComment: executionComment.trim() || null,
          defectReference: defectReference.trim() || null,
          steps: scenario.steps.map((step) => ({ id: step.id, ...stepDraft[step.id], comment: stepDraft[step.id]?.comment.trim() || null, failedComment: stepDraft[step.id]?.failedComment.trim() || null, blockedComment: stepDraft[step.id]?.blockedComment.trim() || null })),
        },
      }).unwrap();
      await query.refetch();
    } catch {
      setError('The evidence was not saved. Refresh the run before trying again.');
    }
  };
  const changeResult = async (result: ManualTestRunScenarioResult) => {
    if (!run || !scenario || completed) return;
    setError('');
    try { await setResult({ projectId, runId, scenarioId, manualTestRunScenarioResultRequest: { result } }).unwrap(); await query.refetch(); }
    catch { setError('The result was not saved. The run may have been completed in another session; refresh and review its status.'); await query.refetch(); }
  };
  const changeAssignee = async (assigneeId: string) => {
    if (!run || !scenario || completed) return;
    try { await setAssignee({ projectId, runId, scenarioId, manualTestRunScenarioAssigneeRequest: { assigneeId: assigneeId || null } }).unwrap(); await query.refetch(); }
    catch { setError('The assignee was not saved. Refresh and try again.'); await query.refetch(); }
  };
  const complete = async () => {
    if (!run || completed || completeState.isLoading) return;
    setError('');
    try { await completeRun({ projectId, runId, body: {} }).unwrap(); await query.refetch(); navigate(PATHS.MANUAL_TEST_RUN_DETAILS.replace(':runId', encodeURIComponent(runId))); }
    catch { setError('The run could not be completed. Its status has been refreshed; review it before trying again.'); await query.refetch(); }
  };

  if (query.isLoading) return <MainTemplate pageHeader="Test Management"><Text p={8}>Loading scenario…</Text></MainTemplate>;
  if (query.error || !run || !scenario) return <MainTemplate pageHeader="Test Management"><Box p={8}><Text role="alert">This scenario is not available in the selected run.</Text><Link to={PATHS.MANUAL_TEST_RUNS}>Back to manual runs</Link></Box></MainTemplate>;

  return <MainTemplate pageHeader="Test Management">
    <Box maxW="920px" mx="auto" p={{ base: 4, md: 8 }}>
      <Text mb={2}><Link to={PATHS.MANUAL_TEST_RUNS}>Manual runs</Link> / <Link to={PATHS.MANUAL_TEST_RUN_DETAILS.replace(':runId', encodeURIComponent(runId))}>{run.title}</Link> / {scenario.sourceScenarioKey}</Text>
      <HStack justify="space-between" align="start" mb={5}><Box><Heading size="lg">{scenario.title}</Heading><Text color="fg.muted">{scenario.sourceScenarioKey} · {scenario.priority} priority · {scenario.folderPath || 'No folder'}</Text></Box><Text>{completed ? 'Completed · read only' : 'In progress'}</Text></HStack>
      <VStack align="stretch" gap={4}>
        {([['Details', scenario.details], ['Preconditions', scenario.preconditions], ['Test data', scenario.testData]] as const).map(([label, value]) => value && <Box key={label}><Text fontWeight="semibold">{label}</Text><Text whiteSpace="pre-wrap">{value}</Text></Box>)}
        <Box><Text fontWeight="semibold" mb={2}>Requirements and tickets</Text>{scenario.requirementContext.length ? scenario.requirementContext.map((item, itemIndex) => <Text key={`${item.type}-${item.reference}-${itemIndex}`}>{item.url ? <a href={item.url} target="_blank" rel="noreferrer">{item.reference} · {item.title}</a> : `${item.reference} · ${item.title}`}</Text>) : <Text color="fg.muted">No linked requirements or tickets in this snapshot.</Text>}</Box>
        <Text color="fg.muted" fontSize="sm">Source scenario {sourceQuery.isLoading ? 'availability is being checked' : sourceQuery.isError ? 'is no longer available; this run uses its saved snapshot' : 'is available in the current catalog'}.</Text>
        <Box><Text fontWeight="semibold" mb={2}>Result</Text><HStack wrap="wrap">{RESULT_OPTIONS.map((result) => <Button key={result} variant={scenario.result === result ? 'solid' : 'outline'} colorPalette={result === 'passed' ? 'green' : result === 'failed' ? 'red' : result === 'blocked' ? 'orange' : 'gray'} disabled={completed} aria-pressed={scenario.result === result} onClick={() => void changeResult(result)}>{resultLabel(result)}</Button>)}</HStack><Text mt={2} color="fg.muted">{scenario.resultBy?.name ? `Set by ${scenario.resultBy.name}${scenario.resultAt ? ` on ${new Date(scenario.resultAt).toLocaleString()}` : ''}` : 'No result saved yet.'}</Text></Box>
        <Box><Text fontWeight="semibold" mb={2}>Assignee</Text><select aria-label="Assignee" disabled={completed} value={scenario.assigneeId ?? ''} onChange={(event) => void changeAssignee(event.target.value)}><option value="">Unassigned</option>{(usersQuery.currentData ?? []).map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></Box>
        <Box><Text fontWeight="semibold" mb={2}>Execution comment</Text><Textarea aria-label="Scenario comment" value={executionComment} readOnly={completed} onChange={(event) => setExecutionComment(event.target.value)} /></Box>
        <Box><Text fontWeight="semibold" mb={2}>Defect reference</Text><Input aria-label="Defect reference" value={defectReference} readOnly={completed} onChange={(event) => setDefectReference(event.target.value)} /></Box>
        <Box><Heading size="md" mb={3}>Steps</Heading><VStack align="stretch" gap={3}>{[...scenario.steps].sort((a, b) => a.position - b.position).map((step, stepIndex) => { const draft = stepDraft[step.id] ?? { comment: '', failedFlag: false, failedComment: '', blockedFlag: false, blockedComment: '' }; return <Box key={step.id} borderWidth="1px" borderColor="border" borderRadius="md" p={4}><Text fontWeight="semibold">{stepIndex + 1}. {step.action}</Text><Text>{step.expectedResult || 'No expected result recorded.'}</Text><Textarea mt={2} aria-label={`Comment for step ${stepIndex + 1}`} placeholder="Step comment" value={draft.comment} readOnly={completed} onChange={(event) => setStepDraft((items) => ({ ...items, [step.id]: { ...draft, comment: event.target.value } }))} /><HStack mt={2}><label><input type="checkbox" checked={draft.failedFlag} disabled={completed} onChange={(event) => setStepDraft((items) => ({ ...items, [step.id]: { ...draft, failedFlag: event.target.checked } }))} /> Failed</label><label><input type="checkbox" checked={draft.blockedFlag} disabled={completed} onChange={(event) => setStepDraft((items) => ({ ...items, [step.id]: { ...draft, blockedFlag: event.target.checked } }))} /> Blocked</label></HStack>{draft.failedFlag && <Input mt={2} aria-label={`Failed note for step ${stepIndex + 1}`} placeholder="Why this step failed" value={draft.failedComment} readOnly={completed} onChange={(event) => setStepDraft((items) => ({ ...items, [step.id]: { ...draft, failedComment: event.target.value } }))} />}{draft.blockedFlag && <Input mt={2} aria-label={`Blocked note for step ${stepIndex + 1}`} placeholder="Why this step was blocked" value={draft.blockedComment} readOnly={completed} onChange={(event) => setStepDraft((items) => ({ ...items, [step.id]: { ...draft, blockedComment: event.target.value } }))} />}</Box>; })}</VStack></Box>
        {!completed && <Button alignSelf="start" colorPalette="blue" disabled={saveState.isLoading} loading={saveState.isLoading} onClick={() => void save()}>Save evidence</Button>}
        {error && <Text role="alert" color="red.500">{error}</Text>}
        <HStack justify="space-between" borderTopWidth="1px" borderColor="border" pt={4}><Button variant="outline" disabled={!previous} onClick={() => previous && navigate(`/manual-test-runs/${encodeURIComponent(runId)}/scenarios/${encodeURIComponent(previous.id)}`)}>Previous</Button><HStack>{!completed && <Button variant="outline" disabled={!nextUntested} onClick={() => nextUntested && navigate(`/manual-test-runs/${encodeURIComponent(runId)}/scenarios/${encodeURIComponent(nextUntested.id)}`)}>Next untested</Button>}<Button variant="outline" disabled={!next} onClick={() => next && navigate(`/manual-test-runs/${encodeURIComponent(runId)}/scenarios/${encodeURIComponent(next.id)}`)}>Next</Button></HStack></HStack>
        {!completed && <Button colorPalette="blue" alignSelf="end" loading={completeState.isLoading} onClick={() => untestedCount ? setCompletionOpen(true) : void complete()}>Complete run</Button>}
      </VStack>
      {completionOpen && <Box position="fixed" inset="0" bg="blackAlpha.600" display="grid" placeItems="center" zIndex="modal" p={4}>
        <VStack role="alertdialog" aria-modal="true" aria-labelledby="scenario-complete-title" align="stretch" bg="bg.panel" borderRadius="lg" p={6} maxW="420px" gap={4}>
          <Heading id="scenario-complete-title" size="md">Complete the run with {untestedCount} untested?</Heading>
          <Text>Completing the run marks {untestedCount} untested {untestedCount === 1 ? 'scenario' : 'scenarios'} as Skipped and locks the results until the run is reopened.</Text>
          <HStack justify="end"><Button variant="outline" onClick={() => setCompletionOpen(false)}>Keep testing</Button><Button colorPalette="blue" loading={completeState.isLoading} onClick={() => void complete()}>Complete and skip {untestedCount}</Button></HStack>
        </VStack>
      </Box>}
    </Box>
  </MainTemplate>;
}
