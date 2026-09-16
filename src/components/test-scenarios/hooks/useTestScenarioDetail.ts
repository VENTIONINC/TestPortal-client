// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react';
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
  left.objective === right.objective &&
  left.preconditions === right.preconditions &&
  left.testData === right.testData &&
  left.expectedResult === right.expectedResult &&
  left.notes === right.notes &&
  left.contentMdHash === right.contentMdHash &&
  left.contentMdFormatVersion === right.contentMdFormatVersion &&
  left.createdAt === right.createdAt &&
  left.updatedAt === right.updatedAt &&
  left.steps.length === right.steps.length &&
  left.steps.every(
    (step, index) =>
      step.id === right.steps[index]?.id &&
      step.position === right.steps[index]?.position &&
      step.action === right.steps[index]?.action &&
      step.expectedResult === right.steps[index]?.expectedResult,
  );

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
  const scopeKey = `${projectId}:${scenarioId}`;
  const [persistedEntry, setPersistedEntry] = useState<{ scopeKey: string; scenario?: TestScenario }>({ scopeKey });
  const isNotFound = getErrorStatus(query.error) === 404;
  const scopedData = isScopedScenario(query.currentData, scenarioId, projectId)
    ? query.currentData
    : isScopedScenario(query.data, scenarioId, projectId)
      ? query.data
      : undefined;

  const setPersistedScenario = useCallback<Dispatch<SetStateAction<TestScenario | undefined>>>(
    (update) => {
      setPersistedEntry((previous) => {
        if (previous.scopeKey !== scopeKey) return previous;
        const scenario = typeof update === 'function' ? update(previous.scenario) : update;
        if (scenario === previous.scenario) return previous;
        return { scopeKey, scenario };
      });
    },
    [scopeKey],
  );

  useEffect(() => {
    setPersistedEntry((previous) => (previous.scopeKey === scopeKey ? previous : { scopeKey }));
  }, [scopeKey]);

  useEffect(() => {
    if (!scopedData) {
      if (isNotFound) setPersistedScenario(undefined);
      return;
    }

    setPersistedScenario((previous) => (isSameScenario(previous, scopedData) ? previous : scopedData));
  }, [isNotFound, scopedData, setPersistedScenario]);

  const scenario = isNotFound ? undefined : (persistedEntry.scopeKey === scopeKey ? persistedEntry.scenario ?? scopedData : scopedData);
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
