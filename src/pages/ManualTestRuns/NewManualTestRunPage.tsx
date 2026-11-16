// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { ManualRunDetailsDialog, normalizeEnvironment } from '@/components/manual-test-runs/components/ManualRunDetailsDialog';
import { useGetApiV2ManualTestRunsQuery, useGetApiV2TestSuitesQuery, usePostApiV2ManualTestRunsMutation } from '@/redux/apis/extendedApi';
import type { ManualTestRunEnvironmentProperty } from '@/redux/apis/generatedApi';
import { useSelectedProjectId } from '@/redux/slices/projects';
import { PATHS } from '@/types/paths';
import { TestScenariosPage } from '@/pages/TestScenarios/TestScenariosPage';

type EntryState = { scenarioIds?: string[]; suiteId?: string };
const date = () => new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export function NewManualTestRunPage() {
  const projectId = useSelectedProjectId();
  const location = useLocation();
  const navigate = useNavigate();
  const entry = (location.state as EntryState | null) ?? {};
  const [name, setName] = useState(`Manual run — ${date()}`);
  const [selectedIds, setSelectedIds] = useState<string[]>(entry.scenarioIds ?? []);
  const [environment, setEnvironment] = useState<ManualTestRunEnvironmentProperty[]>([]);
  const [error, setError] = useState('');
  const [createRun, createState] = usePostApiV2ManualTestRunsMutation();
  const runs = useGetApiV2ManualTestRunsQuery({ projectId, page: 1, limit: 100, show: 'all', period: 'any_time' });
  const suites = useGetApiV2TestSuitesQuery({ projectId });
  const initializedSuite = useRef(false);
  const initializedEnvironment = useRef(false);
  const nameEdited = useRef(false);
  const sourceRun = runs.currentData?.runs?.[0];
  const sourceSuite = suites.currentData?.find((suite) => suite.id === entry.suiteId);
  const suiteIds = sourceSuite?.members?.map((member) => member.testScenarioId) ?? [];
  const selectionMatchesSuite = sourceSuite && suiteIds.length === selectedIds.length && suiteIds.every((id) => selectedIds.includes(id));
  useEffect(() => {
    if (!sourceSuite || initializedSuite.current) return;
    initializedSuite.current = true;
    if (!nameEdited.current) setName(`${sourceSuite.name} — ${date()}`);
    setSelectedIds(sourceSuite.members?.slice().sort((a, b) => a.position - b.position).map((member) => member.testScenarioId) ?? []);
  }, [sourceSuite]);
  useEffect(() => {
    if (!runs.currentData || initializedEnvironment.current) return;
    initializedEnvironment.current = true;
    setEnvironment((runs.currentData.runs?.[0]?.environmentProperties ?? []).map((item) => ({ ...item, value: item.name.trim().toLowerCase() === 'build' ? '' : item.value })));
  }, [runs.currentData]);
  const close = () => navigate(entry.suiteId || entry.scenarioIds ? PATHS.TEST_SCENARIOS : PATHS.MANUAL_TEST_RUNS, { state: entry.suiteId ? { testManagementTab: 'suites' } : undefined });
  const start = async () => {
    if (!name.trim() || !selectedIds.length) return;
    setError('');
    try {
      const run = await createRun({ projectId, manualTestRunCreateRequest: { title: name.trim(), scenarioIds: selectedIds, environmentProperties: normalizeEnvironment(environment) } }).unwrap();
      navigate(PATHS.MANUAL_TEST_RUN_DETAILS.replace(':runId', encodeURIComponent(run.id)), { state: { from: 'manual-test-run-history' } });
    } catch { setError('The run could not be created. Your draft is still here; try again.'); }
  };
  return <><TestScenariosPage initialTab={entry.suiteId ? 'suites' : entry.scenarioIds ? 'scenarios' : 'manual-runs'} /><ManualRunDetailsDialog projectId={projectId} mode="new" name={name} onNameChange={(value) => { nameEdited.current = true; setName(value); }} selectedIds={selectedIds} onSelectionChange={(ids) => { initializedSuite.current = true; setSelectedIds(ids); }} environment={environment} onEnvironmentChange={(items) => { initializedEnvironment.current = true; setEnvironment(items); }} sourceSuiteName={selectionMatchesSuite ? sourceSuite.name : undefined} sourceRunTitle={sourceRun?.title} saving={createState.isLoading} error={error} onClose={close} onSubmit={() => void start()} /></>;
}
