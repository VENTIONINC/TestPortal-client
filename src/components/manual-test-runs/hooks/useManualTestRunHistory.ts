// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import {
  useGetApiV2ManualTestRunsQuery,
  useGetApiV2TestScenariosByScenarioIdManualRunsQuery,
} from '@/redux/apis/extendedApi';
import type { ManualTestRunPageRead, ManualTestRunStatus } from '@/redux/apis/generatedApi';

import {
  calendarDateToManualTestRunBoundary,
  DEFAULT_MANUAL_TEST_RUN_HISTORY_FILTERS,
  getManualTestRunHistoryDateError,
  hasManualTestRunHistoryFilters,
  MANUAL_TEST_RUN_HISTORY_LIMIT,
  type ManualTestRunHistoryFilters,
} from '../utils/history';

interface ManualTestRunHistoryNavigationState {
  manualTestRunHistory?: { sourceTestScenarioId?: string };
}

export interface UseManualTestRunHistoryResult {
  data?: ManualTestRunPageRead;
  error?: unknown;
  isLoading: boolean;
  isFetching: boolean;
  isNotFound: boolean;
  filters: ManualTestRunHistoryFilters;
  page: number;
  dateError?: string;
  isFiltered: boolean;
  isProjectHistory: boolean;
  setStatus: (status: ManualTestRunStatus | '') => void;
  setSourceTestScenarioId: (sourceTestScenarioId: string) => void;
  setStartedOnOrAfter: (startedOnOrAfter: string) => void;
  setStartedOnOrBefore: (startedOnOrBefore: string) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;
  retry: () => unknown;
  goToProjectHistory: () => void;
}

const getErrorStatus = (error: unknown) => {
  if (error && typeof error === 'object' && 'status' in error) return (error as { status?: number }).status;
  return undefined;
};

export const useManualTestRunHistory = (projectId: string, scenarioId?: string): UseManualTestRunHistoryResult => {
  const location = useLocation();
  const navigate = useNavigate();
  const isProjectHistory = !scenarioId;
  const scopeKey = `${projectId}:${scenarioId ?? 'project'}`;
  const [filters, setFilters] = useState<ManualTestRunHistoryFilters>(DEFAULT_MANUAL_TEST_RUN_HISTORY_FILTERS);
  const [page, setPage] = useState(1);
  const dateError = useMemo(() => getManualTestRunHistoryDateError(filters), [filters]);

  useEffect(() => {
    setFilters(DEFAULT_MANUAL_TEST_RUN_HISTORY_FILTERS);
    setPage(1);
  }, [scopeKey]);

  useEffect(() => {
    const state = location.state as ManualTestRunHistoryNavigationState | null;
    const sourceTestScenarioId = state?.manualTestRunHistory?.sourceTestScenarioId?.trim();
    if (!isProjectHistory || !sourceTestScenarioId) return;

    setFilters((current) => ({ ...current, sourceTestScenarioId }));
    setPage(1);
    navigate(location.pathname, { replace: true, state: null });
  }, [isProjectHistory, location.key, location.pathname, location.state, navigate]);

  const projectArgs = {
    projectId,
    page,
    limit: MANUAL_TEST_RUN_HISTORY_LIMIT,
    startedFrom: calendarDateToManualTestRunBoundary(filters.startedOnOrAfter, 'from'),
    startedBefore: calendarDateToManualTestRunBoundary(filters.startedOnOrBefore, 'before'),
    testScenarioId: isProjectHistory ? filters.sourceTestScenarioId || undefined : undefined,
    status: filters.status || undefined,
  };
  const scenarioArgs = {
    projectId,
    scenarioId: scenarioId ?? '',
    page,
    limit: MANUAL_TEST_RUN_HISTORY_LIMIT,
    startedFrom: calendarDateToManualTestRunBoundary(filters.startedOnOrAfter, 'from'),
    startedBefore: calendarDateToManualTestRunBoundary(filters.startedOnOrBefore, 'before'),
    status: filters.status || undefined,
  };
  const projectQuery = useGetApiV2ManualTestRunsQuery(projectArgs, { skip: !isProjectHistory || Boolean(dateError) });
  const scenarioQuery = useGetApiV2TestScenariosByScenarioIdManualRunsQuery(scenarioArgs, {
    skip: isProjectHistory || Boolean(dateError),
  });
  const query = isProjectHistory ? projectQuery : scenarioQuery;

  const setFilter = useCallback(<K extends keyof ManualTestRunHistoryFilters>(key: K, value: ManualTestRunHistoryFilters[K]) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_MANUAL_TEST_RUN_HISTORY_FILTERS);
    setPage(1);
  }, []);

  const goToProjectHistory = useCallback(() => {
    navigate('/manual-test-runs', scenarioId
      ? { state: { manualTestRunHistory: { sourceTestScenarioId: scenarioId } } }
      : undefined);
  }, [navigate, scenarioId]);

  return {
    data: query.currentData,
    error: query.error,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isNotFound: getErrorStatus(query.error) === 404,
    filters,
    page,
    dateError,
    isFiltered: hasManualTestRunHistoryFilters(filters),
    isProjectHistory,
    setStatus: (status) => setFilter('status', status),
    setSourceTestScenarioId: (sourceTestScenarioId) => setFilter('sourceTestScenarioId', sourceTestScenarioId),
    setStartedOnOrAfter: (startedOnOrAfter) => setFilter('startedOnOrAfter', startedOnOrAfter),
    setStartedOnOrBefore: (startedOnOrBefore) => setFilter('startedOnOrBefore', startedOnOrBefore),
    clearFilters,
    setPage,
    retry: query.refetch,
    goToProjectHistory,
  };
};
