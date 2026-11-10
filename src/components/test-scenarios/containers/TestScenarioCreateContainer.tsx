// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0
import { useEffect, useRef, useState, type ComponentProps } from 'react';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useLocation, useNavigate } from 'react-router';

import { toaster } from '@/components/ui';
import { usePostApiV2TestScenariosMutation, type TestScenario } from '@/redux/apis/generatedApi';
import { useGetApiV2TestScenarioFoldersQuery, useGetApiV2TestSuitesQuery } from '@/redux/apis/extendedApi';
import { extractApiError } from '@/utils/apiErrors';
import { PATHS } from '@/types/paths';

import { TestScenarioForm } from '../components/TestScenarioForm';
import { ScenarioDraftNavigationGuard } from '../components/ScenarioDraftNavigationGuard';
import { getTestScenarioDetailPath } from '../constants';
import { flattenScenarioFolders, getTestScenarioCreatePayload } from '../utils';
import { getScenarioOrigin, scenarioOriginDestination, scenarioOriginSearch } from '../scenarioOrigin';
import { scenarioCloneDraft } from '../scenarioClone';

export interface TestScenarioCreateContainerProps {
  projectId: string;
  initialFolderId?: string | null;
  sourceScenario?: TestScenario;
}
const ScopedScenarioCreateContainer = ({ projectId, initialFolderId = null, sourceScenario }: TestScenarioCreateContainerProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const origin = getScenarioOrigin(new URLSearchParams(location.search), projectId);
  const originSearch = scenarioOriginSearch(projectId, origin);
  const [createScenario, { isLoading }] = usePostApiV2TestScenariosMutation();
  const foldersQuery = useGetApiV2TestScenarioFoldersQuery({ projectId });
  const folders = foldersQuery.currentData ?? [];
  const { currentData: suites = [] } = useGetApiV2TestSuitesQuery({ projectId });
  const [apiError, setApiError] = useState<string>();
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createAnotherReset, setCreateAnotherReset] = useState<{ token: number; suites: Array<{ id: string; name: string }> }>();
  const inFlight = useRef(false);
  const allowNavigation = useRef(false);
  const mounted = useRef(true);
  const scope = useRef(projectId);
  scope.current = projectId;
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const current = () => mounted.current && scope.current === projectId;
  const flatFolders = flattenScenarioFolders(folders);
  const clone = sourceScenario ? scenarioCloneDraft(sourceScenario) : undefined;
  const originDestination = scenarioOriginDestination(projectId, origin, flatFolders, suites);
  const validInitialFolder = origin.kind === 'folder' && origin.id === initialFolderId && flatFolders.some(({ id }) => id === origin.id) ? origin.id : null;
  const handleSubmit: ComponentProps<typeof TestScenarioForm>['onSubmit'] = async (
    values,
    steps,
    folderId,
    collections,
    createAnother,
  ) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setSubmitting(true);
    setApiError(undefined);
    try {
      const request = {
        ...getTestScenarioCreatePayload(projectId, values, steps, folderId),
        steps: steps.map(({ action, expectedResult }) => ({
          action: action.trim(),
          ...(expectedResult.trim() ? { expectedResult: expectedResult.trim() } : {}),
        })),
        suiteIds: collections?.suiteIds ?? [],
        newSuites: collections?.newSuites ?? [],
      };
      const scenario = await createScenario({ createTestScenarioRequest: request }).unwrap();
      if (!current()) return;
      if (createAnother) {
        setCreateAnotherReset((previous) => ({ token: (previous?.token ?? 0) + 1, suites: scenario.suites }));
        return;
      }
      setSaved(true);
      allowNavigation.current = true;
      toaster.create({ title: 'Test Scenario created successfully.', type: 'success' });
      // Let the clean guard render before navigating to the server-assigned UUID.
      setTimeout(() => {
        if (current()) navigate(`${getTestScenarioDetailPath(scenario.id)}${originSearch}`, { replace: true });
      }, 0);
    } catch (error) {
      if (!current()) return;
      const status = (error as FetchBaseQueryError).status;
      const uncertain = status === 'FETCH_ERROR' || status === 'TIMEOUT_ERROR' || status === 'PARSING_ERROR' || (typeof status === 'number' && status >= 500);
      setApiError(
        uncertain
          ? 'The save result is uncertain. Inspect the scenario catalog before explicitly retrying to avoid creating a duplicate. Your draft is preserved.'
          : extractApiError(error as FetchBaseQueryError | SerializedError),
      );
    } finally {
      if (current()) {
        inFlight.current = false;
        setSubmitting(false);
      }
    }
  };
  if (origin.kind === 'folder' && !foldersQuery.currentData && !foldersQuery.isError) return <div role="status">Loading folders…</div>;
  return (
    <>
      <ScenarioDraftNavigationGuard dirty={dirty && !saved} allowNavigation={allowNavigation} />
      <TestScenarioForm
        key={projectId}
        mode="create"
        initialValues={clone?.values}
        initialSteps={clone?.steps}
        initialSuites={clone?.suites}
        focusTitle={Boolean(clone)}
        originLabel={originDestination.label}
        originKind={origin.kind === 'suite' && originDestination.label !== 'All scenarios' ? 'suites' : 'scenarios'}
        onNavigateOrigin={() => navigate(originDestination.path)}
        onNavigateSection={() => navigate(`${PATHS.TEST_SCENARIOS}?${new URLSearchParams({ projectId, ...(origin.kind === 'suite' && originDestination.label !== 'All scenarios' ? { tab: 'suites' } : {}) })}`)}
        folders={flatFolders}
        initialFolderId={clone ? clone.folderId : validInitialFolder}
        createAnotherReset={createAnotherReset}
        suites={suites}
        isSubmitting={submitting || isLoading}
        apiError={apiError}
        errorCatalogPath={`${PATHS.TEST_SCENARIOS}?${new URLSearchParams({ projectId }).toString()}`}
        onDirtyChange={setDirty}
        onSubmit={handleSubmit}
        onCancel={() => navigate(sourceScenario ? `${getTestScenarioDetailPath(sourceScenario.id)}${originSearch}` : originDestination.path)}
      />
    </>
  );
};

export const TestScenarioCreateContainer = (props: TestScenarioCreateContainerProps) => (
  <ScopedScenarioCreateContainer key={props.projectId} {...props} />
);
