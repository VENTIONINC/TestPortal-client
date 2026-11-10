// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0
import { useEffect, useRef, useState, type ComponentProps } from 'react';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useLocation, useNavigate } from 'react-router';

import {
  usePatchApiV2TestScenariosByScenarioIdMutation,
  useGetApiV2TestScenarioFoldersQuery,
  useGetApiV2TestSuitesQuery,
} from '@/redux/apis/extendedApi';
import type { TestScenario } from '@/redux/apis/generatedApi';
import { extractApiError } from '@/utils/apiErrors';
import { PATHS } from '@/types/paths';

import { TestScenarioDetailStateView, TestScenarioForm } from '../components';
import { ScenarioDraftNavigationGuard } from '../components/ScenarioDraftNavigationGuard';
import { useTestScenarioDetail } from '../hooks/useTestScenarioDetail';
import { getScenarioOrigin, scenarioOriginDestination, scenarioOriginSearch } from '../scenarioOrigin';
import {
  flattenScenarioFolders,
  getScenarioFolderReturnPath,
  getTestScenarioEditableValues,
  getTestScenarioPatchPayload,
} from '../utils';

type EditorScenario = TestScenario;
export interface TestScenarioEditContainerProps {
  projectId: string;
  scenarioId: string;
}
const rows = (scenario: TestScenario) =>
  scenario.steps.map((step) => ({
    key: step.id,
    id: step.id,
    action: step.action,
    expectedResult: step.expectedResult ?? '',
  }));
const ScopedScenarioEditContainer = ({ projectId, scenarioId }: TestScenarioEditContainerProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const search = new URLSearchParams(location.search);
  const originSearch = search.has('originProject') ? scenarioOriginSearch(projectId, getScenarioOrigin(search, projectId)) : '';
  const detail = useTestScenarioDetail(projectId, scenarioId);
  const { currentData: folders = [] } = useGetApiV2TestScenarioFoldersQuery({ projectId });
  const { currentData: suites = [] } = useGetApiV2TestSuitesQuery({ projectId });
  const [updateScenario, { isLoading }] = usePatchApiV2TestScenariosByScenarioIdMutation();
  const [baseline, setBaseline] = useState<EditorScenario>();
  const [apiError, setApiError] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [token, setToken] = useState(0);
  const inFlight = useRef(false);
  const allowNavigation = useRef(false);
  const mounted = useRef(true);
  const scope = useRef(`${projectId}:${scenarioId}`);
  scope.current = `${projectId}:${scenarioId}`;
  const flatFolders = flattenScenarioFolders(folders);
  const origin = getScenarioOrigin(search, projectId);
  const originDestination = scenarioOriginDestination(projectId, origin, flatFolders, suites);
  const current = () => mounted.current && scope.current === `${projectId}:${scenarioId}`;
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    if (detail.scenario && !baseline) setBaseline(detail.scenario);
  }, [baseline, detail.scenario]);
  const adopt = (scenario: EditorScenario) => {
    setBaseline(scenario);
    detail.setPersistedScenario(scenario);
    setToken((value) => value + 1);
    setDirty(false);
  };
  const handleSubmit: ComponentProps<typeof TestScenarioForm>['onSubmit'] = async (
    values,
    steps,
    folderId,
    collections,
  ) => {
    if (inFlight.current || !baseline) return;
    const fields = getTestScenarioPatchPayload(values, getTestScenarioEditableValues(baseline));
    const finalSteps = steps.map(({ id, action, expectedResult }) => ({
      ...(id ? { id } : {}),
      action: action.trim(),
      expectedResult: expectedResult.trim() || null,
    }));
    const savedSteps = baseline.steps.map(({ id, action, expectedResult }) => ({ id, action, expectedResult }));
    const suiteIds = collections?.suiteIds ?? [];
    const newSuites = collections?.newSuites ?? [];
    const folderChanged = folderId !== undefined && folderId !== baseline.folderId;
    if (
      !fields &&
      !folderChanged &&
      JSON.stringify(finalSteps) === JSON.stringify(savedSteps) &&
      JSON.stringify([...suiteIds].sort()) === JSON.stringify((baseline.suites ?? []).map((s) => s.id).sort()) &&
      !newSuites.length
    ) {
      setSuccessMessage('No changes to save.');
      return;
    }
    inFlight.current = true;
    setSubmitting(true);
    setApiError(undefined);
    setSuccessMessage(undefined);
    try {
      const request = {
        ...fields,
        ...(folderChanged ? { folderId } : {}),
        expectedRevision: baseline.revision,
        steps: finalSteps,
        suiteIds,
        newSuites,
      };
      const response = await updateScenario({ scenarioId, projectId, updateTestScenarioRequest: request }).unwrap();
      if (!current()) return;
      adopt(response);
      allowNavigation.current = true;
      setSaved(true);
      setSuccessMessage('Test Scenario saved successfully.');
      setTimeout(() => { if (current()) navigate(`/test-scenarios/${encodeURIComponent(scenarioId)}${originSearch}`); }, 0);
    } catch (error) {
      if (!current()) return;
      setApiError(
        (error as FetchBaseQueryError).status === 409
          ? 'The saved scenario or suite membership changed. Your entire draft is preserved. Correct any suite name conflict, or reload the saved scenario to recover from a stale revision.'
          : extractApiError(error as FetchBaseQueryError | SerializedError),
      );
    } finally {
      if (current()) {
        inFlight.current = false;
        setSubmitting(false);
      }
    }
  };
  const reload = async () => {
    if (inFlight.current || !window.confirm('Discard unsaved scenario changes and reload the saved scenario?')) return;
    inFlight.current = true;
    setSubmitting(true);
    try {
      const result = (await detail.refetch()) as { data?: EditorScenario; error?: unknown };
      if (!current()) return;
      if (result.error || !result.data) throw result.error ?? new Error('Reload failed');
      adopt(result.data);
      setApiError(undefined);
      setSuccessMessage(undefined);
    } catch {
      if (current()) setApiError('Reload failed. Your draft is preserved. Please try again.');
    } finally {
      if (current()) {
        inFlight.current = false;
        setSubmitting(false);
      }
    }
  };
  const scenario = baseline ?? (detail.scenario as EditorScenario | undefined);
  return (
    <>
      <ScenarioDraftNavigationGuard dirty={dirty && !saved} allowNavigation={allowNavigation} />
      <TestScenarioDetailStateView
        scenario={scenario}
        isLoading={detail.isLoading}
        isUnavailable={detail.isUnavailable}
        isError={detail.isError}
        onRetry={() => void detail.refetch()}
        onBack={() => navigate(getScenarioFolderReturnPath(projectId, scenario?.folderId ?? null, flatFolders))}
      >
        {(saved) => (
          <TestScenarioForm
            key={`${projectId}:${scenarioId}`}
            mode="edit"
            initialValues={saved}
            history={saved}
            originLabel={originDestination.label}
            originKind={origin.kind === 'suite' && originDestination.label !== 'All scenarios' ? 'suites' : 'scenarios'}
            onNavigateOrigin={() => navigate(originDestination.path)}
            onNavigateSection={() => navigate(`${PATHS.TEST_SCENARIOS}?${new URLSearchParams({ projectId, ...(origin.kind === 'suite' && originDestination.label !== 'All scenarios' ? { tab: 'suites' } : {}) })}`)}
            initialSteps={rows(saved)}
            initialSuites={(saved as EditorScenario).suites ?? []}
            suites={suites}
            folders={flatFolders}
            initialFolderId={saved.folderId}
            reconciliation={
              token ? { token, values: getTestScenarioEditableValues(saved), submittedFields: [] } : undefined
            }
            isSubmitting={submitting || isLoading}
            apiError={apiError}
            successMessage={successMessage}
            onDirtyChange={setDirty}
            onReload={() => void reload()}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/test-scenarios/${scenarioId}${originSearch}`)}
          />
        )}
      </TestScenarioDetailStateView>
    </>
  );
};

export const TestScenarioEditContainer = (props: TestScenarioEditContainerProps) => (
  <ScopedScenarioEditContainer key={`${props.projectId}:${props.scenarioId}`} {...props} />
);
