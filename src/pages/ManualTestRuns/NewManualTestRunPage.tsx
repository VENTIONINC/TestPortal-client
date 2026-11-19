// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import {
  ManualRunDetailsDialog,
  normalizeEnvironment,
} from '@/components/manual-test-runs/components/ManualRunDetailsDialog';
import {
  useLazyGetApiV2ManualTestRunsQuery,
  useGetApiV2TestSuitesQuery,
  usePostApiV2ManualTestRunsMutation,
} from '@/redux/apis/extendedApi';
import type { ManualTestRunEnvironmentProperty, ManualTestRunSummary } from '@/redux/apis/generatedApi';
import { useSelectedProjectId } from '@/redux/slices/projects';
import { PATHS } from '@/types/paths';
import { TestScenariosPage } from '@/pages/TestScenarios/TestScenariosPage';

type EntryState = { scenarioIds?: string[]; suiteId?: string };
const date = () => new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export function NewManualTestRunPage() {
  const projectId = useSelectedProjectId();
  const location = useLocation();
  const navigate = useNavigate();
  const mounted = useRef(false);
  const draftProject = useRef(projectId);
  const draftInvalid = useRef(false);
  if (draftProject.current !== projectId) draftInvalid.current = true;
  const scope = useRef({ projectId, locationKey: location.key, generation: 0 });
  if (scope.current.projectId !== projectId || scope.current.locationKey !== location.key) {
    scope.current = { projectId, locationKey: location.key, generation: scope.current.generation + 1 };
  }
  const submitting = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  useEffect(() => {
    if (draftInvalid.current) navigate(PATHS.MANUAL_TEST_RUNS, { replace: true });
  }, [projectId, navigate]);
  const entry = (location.state as EntryState | null) ?? {};
  const [name, setName] = useState(`Manual run — ${date()}`);
  const [selectedIds, setSelectedIds] = useState<string[]>(entry.scenarioIds ?? []);
  const [environment, setEnvironment] = useState<ManualTestRunEnvironmentProperty[]>([]);
  const [error, setError] = useState('');
  const [createRun, createState] = usePostApiV2ManualTestRunsMutation();
  const [loadRuns] = useLazyGetApiV2ManualTestRunsQuery();
  const [sourceRun, setSourceRun] = useState<ManualTestRunSummary>();
  const suites = useGetApiV2TestSuitesQuery({ projectId });
  const initializedSuite = useRef(false);
  const initializedEnvironment = useRef(false);
  const nameEdited = useRef(false);
  const sourceSuite = suites.currentData?.find((suite) => suite.id === entry.suiteId);
  const suiteIds = sourceSuite?.members?.map((member) => member.testScenarioId) ?? [];
  const selectionMatchesSuite =
    sourceSuite && suiteIds.length === selectedIds.length && suiteIds.every((id) => selectedIds.includes(id));
  useEffect(() => {
    if (!sourceSuite || initializedSuite.current) return;
    initializedSuite.current = true;
    if (!nameEdited.current) setName(`${sourceSuite.name} — ${date()}`);
    setSelectedIds(
      sourceSuite.members
        ?.slice()
        .sort((a, b) => a.position - b.position)
        .map((member) => member.testScenarioId) ?? [],
    );
  }, [sourceSuite]);
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const params = { projectId, limit: 100, show: 'all' as const, period: 'any_time' as const };
        const first = await loadRuns({ ...params, page: 1 }, true).unwrap();
        const pages = await Promise.all(Array.from({ length: Math.max(0, first.totalPages - 1) }, (_, index) =>
          loadRuns({ ...params, page: index + 2 }, true).unwrap(),
        ));
        if (!active || draftInvalid.current || initializedEnvironment.current) return;
        const latest = [first, ...pages].flatMap((page) => page.runs)
          .reduce<ManualTestRunSummary | undefined>((newest, run) =>
            !newest || run.startedAt > newest.startedAt ? run : newest, undefined);
        initializedEnvironment.current = true;
        setSourceRun(latest);
        setEnvironment((latest?.environmentProperties ?? []).map((item) => ({
          ...item,
          value: item.name.trim().toLowerCase() === 'build' ? '' : item.value,
        })));
      } catch {
        if (active && !draftInvalid.current) setError('Could not load the latest run environment. You can enter properties manually.');
      }
    };
    void load();
    return () => { active = false; };
  }, [projectId, loadRuns]);
  const close = () => {
    scope.current.generation += 1;
    navigate(entry.suiteId || entry.scenarioIds ? PATHS.TEST_MANAGEMENT : PATHS.MANUAL_TEST_RUNS, {
      state: entry.suiteId ? { testManagementTab: 'suites' } : undefined,
    });
  };
  const start = async () => {
    if (draftInvalid.current || !name.trim() || !selectedIds.length || submitting.current) return;
    submitting.current = true;
    const generation = scope.current.generation;
    const isCurrentScope = () => mounted.current && !draftInvalid.current && scope.current.generation === generation;
    setError('');
    try {
      const run = await createRun({
        projectId,
        manualTestRunCreateRequest: {
          title: name.trim(),
          scenarioIds: selectedIds,
          environmentProperties: normalizeEnvironment(environment),
        },
      }).unwrap();
      if (!isCurrentScope()) return;
      navigate(PATHS.MANUAL_TEST_RUN_DETAILS.replace(':runId', encodeURIComponent(run.id)), {
        state: { from: 'manual-test-run-history' },
      });
    } catch (failure) {
      if (!isCurrentScope()) return;
      const status = typeof failure === 'object' && failure !== null && 'status' in failure ? failure.status : undefined;
      const uncertain = status === 'FETCH_ERROR' || status === 'TIMEOUT_ERROR' || status === 'PARSING_ERROR' ||
        (typeof status === 'number' && status >= 500);
      setError(uncertain
        ? 'The server did not confirm run creation. A run may have been created; check Manual runs before trying again. Your draft is preserved.'
        : 'The run could not be created. Your draft is still here; review the error and try again.');
    } finally {
      submitting.current = false;
    }
  };
  if (draftInvalid.current) return null;
  const handleNameChange = (value: string) => {
    nameEdited.current = true;
    setName(value);
  };

  const handleSelectionChange = (ids: string[]) => {
    initializedSuite.current = true;
    setSelectedIds(ids);
  };

  const handleEnvironmentChange = (items: Array<{ name: string; value: string }>) => {
    initializedEnvironment.current = true;
    setEnvironment(items);
  };

  return (
    <>
      <TestScenariosPage initialTab={entry.suiteId ? 'suites' : entry.scenarioIds ? 'scenarios' : 'manual-runs'} />
      <ManualRunDetailsDialog
        projectId={projectId}
        mode="new"
        name={name}
        onNameChange={handleNameChange}
        selectedIds={selectedIds}
        onSelectionChange={handleSelectionChange}
        environment={environment}
        onEnvironmentChange={handleEnvironmentChange}
        sourceSuiteName={selectionMatchesSuite ? sourceSuite.name : undefined}
        sourceRunTitle={sourceRun?.title}
        saving={createState.isLoading}
        error={error}
        onClose={close}
        onSubmit={() => void start()}
      />
    </>
  );
}
