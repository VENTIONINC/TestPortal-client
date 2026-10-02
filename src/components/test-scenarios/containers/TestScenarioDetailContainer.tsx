// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useRef, useState } from 'react';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useNavigate } from 'react-router';

import { toaster } from '@/components/ui';
import { usePostApiV2TestScenariosByScenarioIdManualRunsMutation } from '@/redux/apis/extendedApi';
import { PATHS } from '@/types/paths';
import { extractApiError, isNetworkError } from '@/utils/apiErrors';

import { TestScenarioDetailStateView, TestScenarioDetailsView } from '../components';
import { getManualTestRunPath } from '../constants';
import { useTestScenarioContextMenu } from '../hooks/useTestScenarioContextMenu';
import { useTestScenarioDetail } from '../hooks/useTestScenarioDetail';

export interface TestScenarioDetailContainerProps {
  projectId: string;
  scenarioId: string;
}

export const TestScenarioDetailContainer = ({ projectId, scenarioId }: TestScenarioDetailContainerProps) => {
  const navigate = useNavigate();
  const onContextMenu = useTestScenarioContextMenu(projectId);
  const detail = useTestScenarioDetail(projectId, scenarioId);
  const [startManualRun, { isLoading: isStartingManualRun }] = usePostApiV2TestScenariosByScenarioIdManualRunsMutation();
  const [startError, setStartError] = useState<string>();
  const [startUncertain, setStartUncertain] = useState(false);
  const startInFlight = useRef(false);
  const mountedRef = useRef(true);
  const latestScope = useRef(`${projectId}:${scenarioId}`);
  const goToCatalog = () => navigate(PATHS.TEST_SCENARIOS);

  latestScope.current = `${projectId}:${scenarioId}`;
  useEffect(() => () => {
    mountedRef.current = false;
  }, []);

  const isCurrentScope = useCallback(
    () => mountedRef.current && latestScope.current === `${projectId}:${scenarioId}`,
    [projectId, scenarioId],
  );

  const handleStartManualRun = async () => {
    if (startInFlight.current || !detail.scenario) return;

    startInFlight.current = true;
    setStartError(undefined);

    try {
      const run = await startManualRun({
        scenarioId,
        projectId,
        manualTestRunStartRequest: {},
      }).unwrap();

      if (!isCurrentScope()) return;
      toaster.create({ title: 'Manual test run started.', type: 'success' });
      navigate(getManualTestRunPath(run.id));
    } catch (error) {
      if (!isCurrentScope()) return;
      const message = isNetworkError(error as FetchBaseQueryError)
        ? 'The request did not confirm whether a run was created. A run may have been created; starting again could create another run.'
        : extractApiError(error as FetchBaseQueryError);
      const uncertain = isNetworkError(error as FetchBaseQueryError);
      setStartUncertain(uncertain);
      setStartError(message);
      toaster.create({ title: uncertain ? 'Start result is uncertain.' : message, type: uncertain ? 'warning' : 'error' });
    } finally {
      if (isCurrentScope()) startInFlight.current = false;
    }
  };

  return (
    <TestScenarioDetailStateView
      scenario={detail.scenario}
      isLoading={detail.isLoading}
      isUnavailable={detail.isUnavailable}
      isError={detail.isError}
      onRetry={() => void detail.refetch()}
      onBack={goToCatalog}
    >
      {(scenario) => (
        <TestScenarioDetailsView
          scenario={scenario}
          onContextMenu={onContextMenu}
          onStartManualRun={() => void handleStartManualRun()}
          isStartingManualRun={isStartingManualRun || startInFlight.current}
          startError={startError}
          startUncertain={startUncertain}
        />
      )}
    </TestScenarioDetailStateView>
  );
};
