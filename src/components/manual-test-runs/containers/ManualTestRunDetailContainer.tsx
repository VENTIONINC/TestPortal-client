// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from 'react';
import { useNavigate } from 'react-router';

import { PATHS } from '@/types/paths';

import { ManualTestRunDetailStateView, ManualTestRunDetailsView } from '../components';
import { useManualTestRunDetail } from '../hooks/useManualTestRunDetail';

export interface ManualTestRunDetailContainerProps {
  projectId: string;
  runId: string;
}

export const ManualTestRunDetailContainer = ({ projectId, runId }: ManualTestRunDetailContainerProps) => {
  const navigate = useNavigate();
  const detail = useManualTestRunDetail(projectId, runId);
  const goToScenarios = useCallback(() => navigate(PATHS.TEST_SCENARIOS), [navigate]);

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
        />
      )}
    </ManualTestRunDetailStateView>
  );
};
