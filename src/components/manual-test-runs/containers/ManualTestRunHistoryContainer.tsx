// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from 'react';
import { useNavigate } from 'react-router';

import type { ManualTestRunSummaryRead } from '@/redux/apis/generatedApi';
import { PATHS } from '@/types/paths';

import { ManualTestRunHistoryView } from '../components/ManualTestRunHistoryView';
import { useManualTestRunHistory } from '../hooks/useManualTestRunHistory';

export interface ManualTestRunHistoryContainerProps {
  projectId: string;
  scenarioId?: string;
}

export const ManualTestRunHistoryContainer = ({ projectId, scenarioId }: ManualTestRunHistoryContainerProps) => {
  const navigate = useNavigate();
  const history = useManualTestRunHistory(projectId, scenarioId);
  const onSourceHistory = useCallback((run: ManualTestRunSummaryRead) => {
    navigate(PATHS.MANUAL_TEST_RUNS, {
      state: { manualTestRunHistory: { sourceTestScenarioId: run.sourceTestScenarioId } },
    });
  }, [navigate]);

  return (
    <ManualTestRunHistoryView
      data={history.data}
      error={history.error}
      isLoading={history.isLoading}
      isFetching={history.isFetching}
      isNotFound={history.isNotFound}
      filters={history.filters}
      dateError={history.dateError}
      isFiltered={history.isFiltered}
      isProjectHistory={history.isProjectHistory}
      onStatusChange={history.setStatus}
      onSourceChange={history.setSourceTestScenarioId}
      onStartDateChange={history.setStartedOnOrAfter}
      onEndDateChange={history.setStartedOnOrBefore}
      onClearFilters={history.clearFilters}
      onPageChange={history.setPage}
      onRetry={history.retry}
      onProjectHistory={history.goToProjectHistory}
      onSourceHistory={onSourceHistory}
    />
  );
};
