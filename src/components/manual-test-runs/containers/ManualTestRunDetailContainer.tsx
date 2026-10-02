// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useRef, useState } from 'react';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useLocation, useNavigate } from 'react-router';

import { toaster } from '@/components/ui';
import { usePostApiV2TestScenariosByScenarioIdManualRunsMutation } from '@/redux/apis/extendedApi';
import { PATHS } from '@/types/paths';
import { extractApiError, isNetworkError } from '@/utils/apiErrors';

import { ManualTestRunDetailStateView, ManualTestRunDetailsView } from '../components';
import { useManualTestRunDetail } from '../hooks/useManualTestRunDetail';
import { getManualTestRunPath } from '../utils/paths';

export interface ManualTestRunDetailContainerProps {
  projectId: string;
  runId: string;
}

export const ManualTestRunDetailContainer = ({ projectId, runId }: ManualTestRunDetailContainerProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const detail = useManualTestRunDetail(projectId, runId);
  const [startManualRun] = usePostApiV2TestScenariosByScenarioIdManualRunsMutation();
  const [retestError, setRetestError] = useState<string>();
  const [retestUncertain, setRetestUncertain] = useState(false);
  const [isRetesting, setIsRetesting] = useState(false);
  const retestInFlight = useRef(false);
  const mountedRef = useRef(true);
  const latestScope = useRef(`${projectId}:${runId}`);
  latestScope.current = `${projectId}:${runId}`;

  useEffect(() => () => {
    mountedRef.current = false;
  }, []);

  const isCurrentScope = useCallback(
    () => mountedRef.current && latestScope.current === `${projectId}:${runId}`,
    [projectId, runId],
  );

  const goToScenarios = useCallback(
    () => navigate(location.state?.from === 'manual-test-run-history' ? PATHS.MANUAL_TEST_RUNS : PATHS.TEST_SCENARIOS),
    [location.state, navigate],
  );

  const handleRetest = useCallback(async () => {
    const historicalRun = detail.run;
    const sourceScenarioId = historicalRun?.testScenarioId;
    if (!historicalRun || !sourceScenarioId || historicalRun.status === 'in_progress' || retestInFlight.current) return;

    retestInFlight.current = true;
    setIsRetesting(true);
    setRetestError(undefined);
    setRetestUncertain(false);
    try {
      const run = await startManualRun({
        scenarioId: sourceScenarioId,
        projectId,
        manualTestRunStartRequest: {},
      }).unwrap();
      if (!isCurrentScope()) return;
      toaster.create({ title: 'Fresh manual test run started.', type: 'success' });
      navigate(getManualTestRunPath(run.id), { state: { from: 'manual-test-run-history' } });
    } catch (error) {
      if (!isCurrentScope()) return;
      const isUncertain = isNetworkError(error as FetchBaseQueryError);
      const status = error && typeof error === 'object' && 'status' in error
        ? (error as FetchBaseQueryError).status
        : undefined;
      const message = status === 404
        ? 'The source scenario is no longer available. Refreshing this historical detail; no historical-version rerun was created.'
        : isUncertain
          ? 'The request did not confirm whether a run was created. Inspect history before trying again; the start was not replayed automatically.'
          : extractApiError(error as FetchBaseQueryError);
      setRetestUncertain(isUncertain);
      setRetestError(message);
      toaster.create({ title: isUncertain ? 'Retest result is uncertain.' : message, type: isUncertain ? 'warning' : 'error' });
      if (status === 404) await detail.refetch();
    } finally {
      retestInFlight.current = false;
      if (isCurrentScope()) setIsRetesting(false);
    }
  }, [detail, isCurrentScope, navigate, projectId, startManualRun]);

  const viewSourceHistory = useCallback(() => {
    if (!detail.run) return;
    navigate(PATHS.MANUAL_TEST_RUNS, {
      state: { manualTestRunHistory: { sourceTestScenarioId: detail.run.sourceTestScenarioId } },
    });
  }, [detail.run, navigate]);

  return (
    <ManualTestRunDetailStateView
      run={detail.run}
      isLoading={detail.isLoading}
      isUnavailable={detail.isUnavailable}
      isError={detail.isError}
      onRetry={() => void detail.refetch()}
      onBack={goToScenarios}
    >
      {(run) => (
        <ManualTestRunDetailsView
          projectId={projectId}
          runId={runId}
          run={run}
          setPersistedRun={detail.setPersistedRun}
          refetch={detail.refetch}
          onBack={goToScenarios}
          onRetest={() => void handleRetest()}
          isRetesting={isRetesting}
          retestError={retestError}
          retestUncertain={retestUncertain}
          onViewSourceHistory={viewSourceHistory}
        />
      )}
    </ManualTestRunDetailStateView>
  );
};
