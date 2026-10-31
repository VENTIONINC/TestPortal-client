// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0
import { useEffect, useRef, useState, type ComponentProps } from 'react';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useNavigate } from 'react-router';

import { toaster } from '@/components/ui';
import { usePostApiV2TestScenariosMutation } from '@/redux/apis/generatedApi';
import { useGetApiV2TestScenarioFoldersQuery, useGetApiV2TestSuitesQuery } from '@/redux/apis/extendedApi';
import { extractApiError } from '@/utils/apiErrors';
import { PATHS } from '@/types/paths';

import { TestScenarioForm } from '../components/TestScenarioForm';
import { ScenarioDraftNavigationGuard } from '../components/ScenarioDraftNavigationGuard';
import { getTestScenarioDetailPath } from '../constants';
import { flattenScenarioFolders, getScenarioFolderReturnPath, getTestScenarioCreatePayload } from '../utils';

export interface TestScenarioCreateContainerProps {
  projectId: string;
  initialFolderId?: string | null;
}
const ScopedScenarioCreateContainer = ({ projectId, initialFolderId = null }: TestScenarioCreateContainerProps) => {
  const navigate = useNavigate();
  const [createScenario, { isLoading }] = usePostApiV2TestScenariosMutation();
  const { currentData: folders = [] } = useGetApiV2TestScenarioFoldersQuery({ projectId });
  const { currentData: suites = [] } = useGetApiV2TestSuitesQuery({ projectId });
  const [apiError, setApiError] = useState<string>();
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inFlight = useRef(false);
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
  const handleSubmit: ComponentProps<typeof TestScenarioForm>['onSubmit'] = async (
    values,
    steps,
    folderId,
    collections,
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
      setSaved(true);
      toaster.create({ title: 'Test Scenario created successfully.', type: 'success' });
      // Let the clean guard render before navigating to the server-assigned UUID.
      setTimeout(() => {
        if (current()) navigate(getTestScenarioDetailPath(scenario.id), { replace: true });
      }, 0);
    } catch (error) {
      if (!current()) return;
      const status = (error as FetchBaseQueryError).status;
      const uncertain = status === 'FETCH_ERROR' || status === 'TIMEOUT_ERROR' || status === 'PARSING_ERROR';
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
  return (
    <>
      <ScenarioDraftNavigationGuard dirty={dirty && !saved} />
      <TestScenarioForm
        key={projectId}
        mode="create"
        folders={flatFolders}
        initialFolderId={initialFolderId === 'unfiled' ? null : initialFolderId}
        suites={suites}
        isSubmitting={submitting || isLoading}
        apiError={apiError}
        errorCatalogPath={`${PATHS.TEST_SCENARIOS}?${new URLSearchParams({ projectId }).toString()}`}
        onDirtyChange={setDirty}
        onSubmit={handleSubmit}
        onCancel={(folderId) => navigate(getScenarioFolderReturnPath(projectId, folderId ?? null, flatFolders))}
      />
    </>
  );
};

export const TestScenarioCreateContainer = (props: TestScenarioCreateContainerProps) => (
  <ScopedScenarioCreateContainer key={props.projectId} {...props} />
);
