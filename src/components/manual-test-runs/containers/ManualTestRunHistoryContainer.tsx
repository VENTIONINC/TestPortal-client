// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from 'react';
import { useNavigate } from 'react-router';

import { PATHS } from '@/types/paths';
import { ManualTestRunWorkspace } from '@/components/manual-test-runs';

export interface ManualTestRunHistoryContainerProps {
  projectId: string;
  selectedRunId?: string;
}

export const ManualTestRunHistoryContainer = ({ projectId, selectedRunId }: ManualTestRunHistoryContainerProps) => {
  const navigate = useNavigate();
  const onSelectRun = useCallback((runId: string) => {
    navigate(PATHS.MANUAL_TEST_RUN_DETAILS.replace(':runId', encodeURIComponent(runId)), {
      state: { from: 'manual-test-run-history' },
    });
  }, [navigate]);
  return <ManualTestRunWorkspace projectId={projectId} selectedRunId={selectedRunId} onSelectRun={onSelectRun} />;
};
