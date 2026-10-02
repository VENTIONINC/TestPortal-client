// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useRef, useState } from 'react';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useLocation, useNavigate } from 'react-router';

import { RunKeyStartDialog } from '@/components/manual-test-runs/components';
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
  const [startManualRun, { isLoading: isStartingRun }] = usePostApiV2TestScenariosByScenarioIdManualRunsMutation();
  const [retestError, setRetestError] = useState<string>();
  const [retestUncertain, setRetestUncertain] = useState(false);
  const [isRetestDialogOpen, setIsRetestDialogOpen] = useState(false);
  const [runKeyDraft, setRunKeyDraft] = useState('');
  const [isRetryConfirmationRequired, setIsRetryConfirmationRequired] = useState(false);
  const [isRetesting, setIsRetesting] = useState(false);
  const retestInFlight = useRef(false);
  const retestTriggerRef = useRef<HTMLButtonElement | null>(null);
  const restoreFocusOnClose = useRef(false);
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

  useEffect(() => {
    if (isRetestDialogOpen || !restoreFocusOnClose.current) return;
    restoreFocusOnClose.current = false;
    retestTriggerRef.current?.focus();
  }, [isRetestDialogOpen]);

  useEffect(() => {
    retestInFlight.current = false;
    setIsRetesting(false);
    setIsRetestDialogOpen(false);
    setRunKeyDraft('');
    setRetestError(undefined);
    setRetestUncertain(false);
    setIsRetryConfirmationRequired(false);
    restoreFocusOnClose.current = false;
  }, [projectId, runId]);

  const goToScenarios = useCallback(
    () => navigate(location.state?.from === 'manual-test-run-history' ? PATHS.MANUAL_TEST_RUNS : PATHS.TEST_SCENARIOS),
    [location.state, navigate],
  );

  const openRetestDialog = useCallback((trigger: HTMLButtonElement) => {
    retestTriggerRef.current = trigger;
    setRunKeyDraft('');
    setRetestError(undefined);
    setRetestUncertain(false);
    setIsRetryConfirmationRequired(false);
    setIsRetestDialogOpen(true);
  }, []);

  const closeRetestDialog = useCallback(() => {
    if (retestInFlight.current) return;
    restoreFocusOnClose.current = true;
    setIsRetestDialogOpen(false);
    setRunKeyDraft('');
    setRetestError(undefined);
    setRetestUncertain(false);
    setIsRetryConfirmationRequired(false);
  }, []);

  const handleRetest = useCallback(async (runKey?: string) => {
    const historicalRun = detail.run;
    const sourceScenarioId = historicalRun?.testScenarioId;
    if (!historicalRun || !sourceScenarioId || historicalRun.status === 'in_progress' || retestInFlight.current) return;

    retestInFlight.current = true;
    setIsRetesting(true);
    setRetestError(undefined);
    setRetestUncertain(false);
    setIsRetryConfirmationRequired(false);
    try {
      const run = await startManualRun({
        scenarioId: sourceScenarioId,
        projectId,
        manualTestRunStartRequest: runKey ? { runKey } : {},
      }).unwrap();
      if (!isCurrentScope()) return;
      setIsRetestDialogOpen(false);
      setRunKeyDraft('');
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
    <>
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
          onRetest={openRetestDialog}
          isRetesting={isRetesting}
          onViewSourceHistory={viewSourceHistory}
        />
      )}
    </ManualTestRunDetailStateView>
    <RunKeyStartDialog
      isOpen={isRetestDialogOpen}
      context="retest"
      value={runKeyDraft}
      error={retestError}
      isUncertain={retestUncertain}
      isRetryConfirmationRequired={isRetryConfirmationRequired}
      isSubmitting={isRetesting || isStartingRun}
      onValueChange={(value) => {
        setRunKeyDraft(value);
        setRetestError(undefined);
      }}
      onCancel={closeRetestDialog}
      onRequireRetryConfirmation={() => setIsRetryConfirmationRequired(true)}
      onSubmit={(runKey) => void handleRetest(runKey)}
    />
    </>
  );
};
