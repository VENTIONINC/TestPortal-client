// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { useGetApiV2TestScenariosByScenarioIdQuery, type TestScenario } from '@/redux/apis/generatedApi';

const getErrorStatus = (error: unknown) => {
  if (error && typeof error === 'object' && 'status' in error) {
    return (error as FetchBaseQueryError).status;
  }

  return undefined;
};

const isSameScenario = (left: TestScenario | undefined, right: TestScenario) =>
  left?.id === right.id &&
  left.projectId === right.projectId &&
  left.createdById === right.createdById &&
  left.title === right.title &&
  left.contentMd === right.contentMd &&
  left.details === right.details &&
  left.createdAt === right.createdAt &&
  left.updatedAt === right.updatedAt;

const isScopedScenario = (scenario: TestScenario | undefined, scenarioId: string, projectId: string) =>
  scenario?.id === scenarioId && scenario.projectId === projectId;

export interface UseTestScenarioDetailResult {
  scenario?: TestScenario;
  isLoading: boolean;
  isUnavailable: boolean;
  isError: boolean;
  isNotFound: boolean;
  refetch: () => unknown;
  setPersistedScenario: Dispatch<SetStateAction<TestScenario | undefined>>;
}

export const useTestScenarioDetail = (projectId: string, scenarioId: string): UseTestScenarioDetailResult => {
  const query = useGetApiV2TestScenariosByScenarioIdQuery({ scenarioId, projectId });
  const [persistedScenario, setPersistedScenario] = useState<TestScenario>();
  const isNotFound = getErrorStatus(query.error) === 404;
  const scopedData = isScopedScenario(query.currentData, scenarioId, projectId)
    ? query.currentData
    : isScopedScenario(query.data, scenarioId, projectId)
      ? query.data
      : undefined;

  useEffect(() => {
    if (!scopedData) {
      if (isNotFound) setPersistedScenario(undefined);
      return;
    }

    setPersistedScenario((previous) => (isSameScenario(previous, scopedData) ? previous : scopedData));
  }, [isNotFound, scopedData]);

  const scenario = isNotFound ? undefined : (persistedScenario ?? scopedData);
  const isLoading = !scenario && Boolean(query.isLoading || query.isFetching);

  return {
    scenario,
    isLoading,
    isUnavailable: !scenario && !isLoading && (isNotFound || !query.error),
    isError: !scenario && !isLoading && Boolean(query.error) && !isNotFound,
    isNotFound,
    refetch: query.refetch,
    setPersistedScenario,
  };
};
